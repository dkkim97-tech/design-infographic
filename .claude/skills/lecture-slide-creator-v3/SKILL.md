---
name: lecture-slide-creator-v3
description: SimpleP 미니멀 디자인 시스템 기반 강의·발표·교육 슬라이드 제작 전문 스킬 v3. v1·v2 대비 (1) 모노크롬(블랙·화이트·크림) 미니멀 컬러 시스템, (2) 단어 분할 헤딩(예 "Over/view", "개/요"), (3) 검정 원형 강조 모티프, (4) AS-IS/TO-BE/GOAL 3단 비교 레이아웃, (5) 풀블랙 클로징 브랜딩, (6) 페이지 번호 자동 부여, (7) 7종 표준 레이아웃 코드 템플릿(타이틀·Overview·개념·3단비교·원형강조·스탯·클로징)을 포함한다. 트리거 - 미니멀 슬라이드, 모노크롬 슬라이드, 흑백 슬라이드, SimpleP 스타일, 심플 PPT, 미니멀 PPT, 모던 미니멀 슬라이드, 화이트스페이스 강조 PPT, 단어 분할 헤딩, 검정 원형 강조, AS-IS TO-BE GOAL, 클로징 브랜드 슬라이드, 절제된 디자인 슬라이드, 미니멀 강의 슬라이드, v3 슬라이드, lecture-slide-creator v3, minimalist slides, monochrome deck, simple presentation, premium minimalist PPT. 모노크롬·미니멀·SimpleP 키워드가 하나라도 등장하면 v1·v2 대신 이 스킬을 우선 사용한다. 일반 강의 슬라이드는 lecture-slide-creator(v1), 교육학·발표용 슬라이드는 lecture-slide-creator-v2, 디자인 분석만 필요한 경우는 ppt-style-analyzer를 사용한다.
---

# Lecture Slide Creator v3 — SimpleP 미니멀 에디션

업로드된 SimpleP_PowerPoint 디자인을 정밀 분석해 표준화한 **미니멀 강의 슬라이드 전문 스킬**. v1·v2의 한계를 다음 7가지로 보완한다.

| 보완 항목 | v1/v2 | v3 |
|---|---|---|
| 컬러 | 6가지 청중별 팔레트 | 모노크롬 1팔레트 + 옵션 액센트 |
| 헤딩 | 일반 텍스트 | 단어 분할(Over/view) |
| 강조 | 색상 강조 | 검정 원형 모티프 |
| 비교 | 표 형식 | AS-IS/TO-BE/GOAL 3단 박스 |
| 클로징 | 일반 마무리 | 풀블랙 브랜딩 슬라이드 |
| 페이지 번호 | 미정의 | 우상단 자동 |
| 레이아웃 코드 | 가이드만 | pptxgenjs 7종 스니펫 |

## 워크플로우 (5단계)

### 1단계: 강의 정보 수집

다음 6개 항목을 1회 질문으로 묶어 받는다. 누락 시 기본값 사용.

```
📚 주제: [필수]
🎯 학습 목표: [필수]
👥 대상: [필수 - 40-60대 비전문가가 기본 대상]
⏱️ 강의 시간: [기본 60분]
📊 슬라이드 수: [기본 15장 - 60분 기준]
🎨 액센트 컬러: [기본 없음 / 골드 #C9A961 옵션]
```

### 2단계: 슬라이드 구조 설계

15장 기준 표준 시퀀스:

| # | 레이아웃 | 슬라이드 역할 |
|---|---|---|
| 1 | L1 타이틀 | 강의 제목 + 강사 |
| 2 | L2 Overview | 개요 + 3단 비교(AS-IS/TO-BE/GOAL) |
| 3-4 | L3 개념 | 핵심 정의 1·2 |
| 5 | L5 원형강조 | 단일 키워드 강조 |
| 6-8 | L3 개념 | 본문 전개 |
| 9 | L6 스탯 | 데이터 임팩트 |
| 10 | L4 3단비교 | 사례·옵션 비교 |
| 11-13 | L3 개념 | 실행 가이드 |
| 14 | L3 개념 | 핵심 요약 |
| 15 | L7 클로징 | 브랜드 마무리 |

분량 조정 규칙:
- 30분: 8장 (1·2·3·5·6·9·14·15)
- 60분: 15장 (위 표준)
- 90분: 22장 (L3 추가)

### 3단계: 디자인 시스템 적용

`references/design-system/simplep-minimal.md`를 읽어 컬러·타이포·여백·시그니처 모티프를 그대로 적용한다.

핵심 토큰만 본 문서에 요약:

```javascript
const COLORS = {
  ink: "000000", inkSoft: "2D2D2D", paper: "FFFFFF",
  cream: "F5F0E8", rule: "E5E5E5", muted: "8A8A8A",
  body: "1A1A1A", gold: "C9A961"
};
const FONT = "Pretendard";  // 미설치 시 Noto Sans KR
```

### 4단계: PPTX 빌드

`references/layouts/templates.md`의 7종 함수(layoutTitle / layoutOverview / layoutConcept / layout3Col / layoutCircle / layoutStat / layoutClosing)를 사용한다.

기본 워크플로우:

```bash
# 1. /home/claude/build/ 작업 폴더 생성
mkdir -p /home/claude/build && cd /home/claude/build

# 2. pptxgenjs 설치 확인
npm list -g pptxgenjs || npm install -g pptxgenjs

# 3. build.js 작성 (templates.md 함수 + 슬라이드 호출)
# 4. node build.js 실행
node build.js

# 5. 검증
extract-text output.pptx
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

### 5단계: 시각 QA (필수)

빌드 후 슬라이드 이미지를 view 도구로 확인하고, `references/design-system/simplep-minimal.md` 의 **자가 검수 체크리스트 7항목**을 모두 통과해야 한다.

체크리스트 (요약):
- [ ] 블랙·화이트·크림 + 1액센트 이내인가
- [ ] 본문 left-align인가
- [ ] 페이지 번호 우상단 부착했는가
- [ ] 검정 원형 / 단어 분할 / 점선 박스 중 1개 이상 사용했는가
- [ ] 결론형 제목인가
- [ ] 폰트 1-2종 이내인가
- [ ] 한 슬라이드 한 메시지 원칙을 지켰는가

문제 발견 시: 1회 수정 → 재빌드 → 재검증. **2회 이상 반복 금지**(과조정 방지).

## 한글 폰트 폴백

Pretendard 미설치 환경에서는 다음 순서로 폴백:

1. Pretendard
2. Noto Sans KR
3. 맑은 고딕(Malgun Gothic)
4. 나눔고딕(NanumGothic)

영문은 모두 Pretendard 단일 폰트로 처리(영문도 한글체로 렌더링되어도 시각적 일관성이 유지된다).

## 산출물

기본 출력 3종:
1. **output.pptx** — 완성 슬라이드 (필수)
2. **outline.md** — 슬라이드 개요 (선택)
3. **presenter-notes.md** — 발표자 노트 (선택, 요청 시)

## 청중별 톤 조정 (40-60대 비전문가 기본값)

이 스킬의 주 대상이 40-60대 비전문가 수강생이므로 다음 톤이 기본:

- 외래어 최소화, 사용 시 한글(영문) 병기
- 결론형 제목: "AI는 도구가 아니다", "Claude로 1시간 줄인다"
- 본문 문장 25자 이내
- 추상 개념보다 구체적 사례·숫자

## 의존성

- `npm install -g pptxgenjs`
- LibreOffice(`soffice`) — PDF 변환
- Poppler(`pdftoppm`) — 이미지 변환

## 참조 파일

| 파일 | 용도 |
|---|---|
| `references/design-system/simplep-minimal.md` | 컬러·타이포·여백·체크리스트 상세 |
| `references/layouts/templates.md` | 7종 레이아웃 pptxgenjs 코드 스니펫 |

빌드 직전 두 파일을 모두 읽어 토큰값을 정확히 사용한다.

## 트러블슈팅

| 문제 | 해결 |
|---|---|
| 한글 깨짐 | Noto Sans KR 또는 맑은 고딕으로 폰트 변경 |
| 헤딩이 한 줄로 표시됨 | 줄바꿈 `\n` 대신 textbox 2개 분리 |
| 검정 원형 비율 깨짐 | w/h 동일 값 사용(2.2 × 2.2 등) |
| 페이지 번호 누락 | addPageNumber 함수 모든 슬라이드에 호출 확인 |
| 텍스트 박스 오버플로 | 폰트 크기 -4pt 또는 슬라이드 분할 |

## 버전

- v3.0.0 (2026-05) — SimpleP 미니멀 에디션 신규 출시
- 호환: Claude Code, Claude.ai, Cowork
