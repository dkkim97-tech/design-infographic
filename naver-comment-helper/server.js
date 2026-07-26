import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "public")));

const client = new Anthropic(); // ANTHROPIC_API_KEY는 환경변수에서 읽음 (서버에만 보관)

// 생성 모델 — 기본 claude-opus-5. 더 빠르고 저렴한 응답을 원하면
// 환경변수로 COMMENT_MODEL=claude-haiku-4-5 등으로 바꿀 수 있음.
const MODEL = process.env.COMMENT_MODEL || "claude-opus-5";

// 톤별 안내 문구
const TONE_GUIDE = {
  empathy: "공감형 — 글쓴이의 감정이나 상황에 진심으로 공감하고 따뜻하게 반응",
  question: "질문형 — 글 내용과 관련해 자연스럽고 예의 바른 질문을 곁들임",
  cheer: "응원형 — 글쓴이를 밝고 긍정적으로 응원하고 격려",
  info: "정보 추가형 — 글 주제에 관련된 짧고 유용한 경험이나 팁을 보탬",
};

const COMMENT_RULES = `규칙:
- 각 댓글은 반드시 3줄에서 5줄 사이 (줄바꿈 포함, 너무 길지 않게)
- 진심이 느껴지고 사람이 직접 쓴 것처럼 자연스러운 한국어
- 어울리는 이모지를 1~3개 자연스럽게 포함 (과하지 않게)
- 광고·홍보·스팸·URL·복붙 티가 나는 표현 금지
- 글쓴이를 존중하는 정중한 반말 또는 존댓말 (글 분위기에 맞춤)`;

const SYSTEM_PROMPT = `당신은 네이버 블로그 댓글 작성을 돕는 한국어 카피라이터입니다.
주어진 블로그 글(또는 주제)을 읽고, 그 글에 달기 좋은 자연스러운 댓글 초안을 만듭니다.

${COMMENT_RULES}
- 서로 다른 문장 구성의 초안 3개를 생성 (내용이 겹치지 않도록)
- 요청받은 톤을 충실히 반영`;

// ── 단일 글 댓글 초안 (기존 기능) ──────────────────────────────
app.post("/api/generate", async (req, res) => {
  try {
    const { content = "", tone = "empathy" } = req.body ?? {};
    const text = String(content).trim();

    if (!text) {
      return res.status(400).json({ error: "블로그 글 내용이나 주제를 입력해 주세요." });
    }
    if (text.length > 8000) {
      return res.status(400).json({ error: "내용이 너무 깁니다. 8000자 이내로 줄여 주세요." });
    }
    if (!hasApiKey()) {
      return res.status(500).json({ error: "서버에 API 키가 설정되지 않았습니다. ANTHROPIC_API_KEY 환경변수를 설정해 주세요." });
    }

    const toneDesc = TONE_GUIDE[tone] || TONE_GUIDE.empathy;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `아래 블로그 글(또는 주제)에 달 댓글 초안 3개를 만들어 주세요.\n\n[요청 톤]\n${toneDesc}\n\n[블로그 글 / 주제]\n${text}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { comments: { type: "array", items: { type: "string" } } },
            required: ["comments"],
            additionalProperties: false,
          },
        },
      },
    });

    const block = response.content.find((b) => b.type === "text");
    const parsed = JSON.parse(block.text);
    const comments = Array.isArray(parsed.comments) ? parsed.comments.slice(0, 3) : [];

    if (comments.length === 0) {
      return res.status(502).json({ error: "댓글 생성에 실패했습니다. 다시 시도해 주세요." });
    }
    res.json({ comments });
  } catch (err) {
    sendError(res, err);
  }
});

// ── 답방 댓글 준비 (신규 기능) ─────────────────────────────────
// 댓글 단 사람들의 블로그 목록 → 각자의 최신 글 → 그 글에 맞는 댓글 초안 준비
app.post("/api/return-visit", async (req, res) => {
  try {
    const { blogs = [], tone = "empathy" } = req.body ?? {};

    // 입력 정규화: 줄바꿈/쉼표로 분리 → 블로그 ID 추출 → 중복 제거
    const ids = [];
    const seen = new Set();
    for (const raw of String(Array.isArray(blogs) ? blogs.join("\n") : blogs).split(/[\n,]+/)) {
      const id = extractBlogId(raw);
      if (id && !seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    if (ids.length === 0) {
      return res.status(400).json({ error: "블로그 주소나 아이디를 한 줄에 하나씩 입력해 주세요." });
    }
    if (ids.length > 20) {
      return res.status(400).json({ error: "한 번에 최대 20개까지 처리할 수 있습니다." });
    }
    if (!hasApiKey()) {
      return res.status(500).json({ error: "서버에 API 키가 설정되지 않았습니다. ANTHROPIC_API_KEY 환경변수를 설정해 주세요." });
    }

    // 각 블로그의 최신 글을 RSS로 병렬 조회
    const fetched = await Promise.all(ids.map(fetchLatestPost));

    const ok = fetched.filter((f) => !f.error);
    const failed = fetched.filter((f) => f.error);

    // 성공한 글들에 대해 한 번의 API 호출로 댓글 일괄 생성
    let commentsById = {};
    if (ok.length > 0) {
      commentsById = await generateReturnVisitComments(ok, tone);
    }

    const results = fetched.map((f) => ({
      blogId: f.blogId,
      blogUrl: `https://blog.naver.com/${f.blogId}`,
      postTitle: f.postTitle || null,
      postUrl: f.postUrl || null,
      postDate: f.postDate || null,
      comment: commentsById[f.blogId] || null,
      error: f.error || null,
    }));

    res.json({ results, summary: { total: ids.length, ok: ok.length, failed: failed.length } });
  } catch (err) {
    sendError(res, err);
  }
});

// ── 헬퍼 ──────────────────────────────────────────────────────

function hasApiKey() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function sendError(res, err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return res.status(500).json({ error: "서버 API 키가 잘못되었습니다. (ANTHROPIC_API_KEY 확인)" });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return res.status(429).json({ error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." });
  }
  console.error(err);
  res.status(500).json({ error: "처리 중 오류가 발생했습니다." });
}

// 다양한 형태의 입력에서 네이버 블로그 ID를 추출
// 예) https://blog.naver.com/abc123/224...  → abc123
//     m.blog.naver.com/abc123               → abc123
//     abc123                                → abc123
function extractBlogId(raw) {
  const s = String(raw).trim();
  if (!s) return null;
  const m = s.match(/blog\.naver\.com\/([A-Za-z0-9_-]+)/i);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]+$/.test(s)) return s;
  return null;
}

// 네이버 블로그 공개 RSS에서 최신 글 1건을 파싱
async function fetchLatestPost(blogId) {
  const url = `https://rss.blog.naver.com/${encodeURIComponent(blogId)}.xml`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (NaverCommentHelper)" },
    });
    clearTimeout(timer);

    if (!resp.ok) {
      return { blogId, error: `블로그를 찾을 수 없습니다 (HTTP ${resp.status}).` };
    }
    const xml = await resp.text();
    const item = xml.match(/<item>([\s\S]*?)<\/item>/i);
    if (!item) {
      return { blogId, error: "최신 글을 가져올 수 없습니다 (RSS 미지원이거나 비공개일 수 있음)." };
    }
    const chunk = item[1];
    const postTitle = cleanText(pickTag(chunk, "title"));
    const postUrl = cleanText(pickTag(chunk, "link"));
    const postDate = cleanText(pickTag(chunk, "pubDate"));
    const snippet = cleanText(pickTag(chunk, "description")).slice(0, 600);

    if (!postTitle && !snippet) {
      return { blogId, error: "글 내용을 읽을 수 없습니다." };
    }
    return { blogId, postTitle, postUrl, postDate, snippet };
  } catch (err) {
    if (err.name === "AbortError") {
      return { blogId, error: "블로그 응답이 느려 시간 초과되었습니다." };
    }
    return { blogId, error: "블로그에 접속할 수 없습니다." };
  }
}

function pickTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

// CDATA 제거 → HTML 태그 제거 → 엔티티 디코드 → 공백 정리
function cleanText(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// 여러 글에 대한 댓글을 한 번의 API 호출로 생성 (blogId → comment 매핑 반환)
async function generateReturnVisitComments(posts, tone) {
  const toneDesc = TONE_GUIDE[tone] || TONE_GUIDE.empathy;
  const list = posts
    .map(
      (p, i) =>
        `[${i}] 블로그아이디: ${p.blogId}\n제목: ${p.postTitle}\n내용요약: ${p.snippet || "(요약 없음)"}`
    )
    .join("\n\n");

  const system = `당신은 네이버 블로그 "답방 댓글"을 돕는 한국어 카피라이터입니다.
여러 블로거의 최신 글이 주어지면, 각 글에 달기 좋은 댓글을 글마다 하나씩 만듭니다.

${COMMENT_RULES}
- 각 글의 제목/내용에 맞춰 개별적으로 작성 (글마다 내용이 달라야 함)
- 요청받은 톤을 충실히 반영`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system,
    messages: [
      {
        role: "user",
        content: `아래 각 블로그 최신 글에 달 댓글을 글마다 하나씩 만들어 주세요.\n\n[요청 톤]\n${toneDesc}\n\n[글 목록]\n${list}`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer" },
                  comment: { type: "string" },
                },
                required: ["index", "comment"],
                additionalProperties: false,
              },
            },
          },
          required: ["results"],
          additionalProperties: false,
        },
      },
    },
  });

  const block = response.content.find((b) => b.type === "text");
  const parsed = JSON.parse(block.text);
  const map = {};
  for (const r of parsed.results || []) {
    const p = posts[r.index];
    if (p) map[p.blogId] = r.comment;
  }
  return map;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 네이버 댓글 도우미 실행 중 → http://localhost:${PORT}`);
  console.log(`   사용 모델: ${MODEL}`);
  if (!hasApiKey()) {
    console.warn("⚠️  ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }
});
