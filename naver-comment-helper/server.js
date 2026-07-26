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

const SYSTEM_PROMPT = `당신은 네이버 블로그 댓글 작성을 돕는 한국어 카피라이터입니다.
주어진 블로그 글(또는 주제)을 읽고, 그 글에 달기 좋은 자연스러운 댓글 초안을 만듭니다.

규칙:
- 각 댓글은 반드시 3줄에서 5줄 사이 (줄바꿈 포함, 너무 길지 않게)
- 진심이 느껴지고 사람이 직접 쓴 것처럼 자연스러운 한국어
- 어울리는 이모지를 1~3개 자연스럽게 포함 (과하지 않게)
- 광고·홍보·스팸·URL·복붙 티가 나는 표현 금지
- 글쓴이를 존중하는 정중한 반말 또는 존댓말 (글 분위기에 맞춤)
- 서로 다른 문장 구성의 초안 3개를 생성 (내용이 겹치지 않도록)
- 요청받은 톤을 충실히 반영`;

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
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
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
          content: `아래 블로그 글(또는 주제)에 달 댓글 초안 3개를 만들어 주세요.

[요청 톤]
${toneDesc}

[블로그 글 / 주제]
${text}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              comments: {
                type: "array",
                items: { type: "string" },
              },
            },
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
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "서버 API 키가 설정되지 않았거나 잘못되었습니다. (ANTHROPIC_API_KEY 확인)" });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    console.error(err);
    res.status(500).json({ error: "댓글 생성 중 오류가 발생했습니다." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 네이버 댓글 도우미 실행 중 → http://localhost:${PORT}`);
  console.log(`   사용 모델: ${MODEL}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }
});
