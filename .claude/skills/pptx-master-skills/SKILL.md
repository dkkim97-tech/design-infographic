---
name: pptx-master-skills
description: Claude Brand 디자인 시스템(크림 캔버스 × 코랄 × 다크 네이비, 세리프 400 제목) 기반 프리젠테이션 자동 생성 마스터 스킬. 사용자가 (1) 주제·내용 텍스트, (2) 보고서 파일(PDF·DOCX·MD·이미지 슬라이드), (3) 개요·목차 중 하나만 제공하면 스토리 구조 설계 → 표준 레이아웃 9종(L1~L9) 매핑 → 편집 가능 네이티브 차트 삽입 → pptxgenjs 빌드 → 시각 QA까지 전 과정을 수행해 완성된 PPTX를 산출한다. 트리거 — pptx-master, 마스터 스킬, Claude 브랜드 PPT, 클로드 스타일 슬라이드, 크림 코랄 슬라이드, 이 디자인 시스템으로 PPT, 보고서를 PPT로, 보고서 기반 프리젠테이션, 투자 심의 덱, IR 덱, 경영진 보고 PPT, C-Level 보고 슬라이드, 사업 타당성 발표자료, 전략 보고 덱, 편집 가능 차트 PPT, 데이터 수정 가능한 차트, editable chart deck, cream coral presentation, Claude brand deck. 사용자가 주제나 보고서 파일과 함께 프리젠테이션·PPT·슬라이드·덱 제작을 요청하면 별도 스타일 지정이 없는 한 이 스킬을 우선 사용한다. 미니멀 모노크롬 요청은 lecture-slide-creator-v3, 일반 강의용은 lecture-slide-creator를 사용한다.
---

# PPTX Master Skills — Claude Brand Edition

주제 텍스트 또는 보고서 파일만 받아 Claude Brand 디자인 시스템 덱을 완성하는 엔드투엔드 스킬.
SiN 투자심의 30장 덱으로 실전 검증된 토큰·레이아웃·차트 레시피를 그대로 재사용한다.

## 번들 리소스

| 파일 | 내용 | 읽는 시점 |
|---|---|---|
| `references/design-system.md` | 컬러·타이포·서피스 리듬·Do/Don't 전체 규격 | 항상 (빌드 전 필독) |
| `references/layouts.md` | L1~L9 레이아웃 코드 + 보조 패턴(타임라인·밸류체인·쿼드런트) | 구조 설계 후 |
| `references/charts.md` | 편집 가능 네이티브 차트 5종 레시피(다크/크림/콤보) | 차트 슬라이드 존재 시 |
| `scripts/tokens.js` | 컬러·폰트·여백 토큰 모듈 — 수정 없이 require | 빌드 시 |
| `scripts/helpers.js` | header/card/rows/statCard/divider/spike 헬퍼 — 수정 없이 require | 빌드 시 |

## 워크플로우 (6단계)

### 1단계: 입력 수집

입력 유형별 처리:
- **보고서 파일(PDF/DOCX/MD)**: 전체를 읽고 핵심 주장·수치·비교·프로세스를 추출. 이미지 슬라이드 PDF는 각 페이지의 제목·데이터를 텍스트화
- **주제·내용 텍스트**: 부족한 수치는 web_search로 보강하되 출처를 발표자 노트에 기록
- **개요만 제공**: 장수·대상 청중을 확인 후 진행

기본값(미지정 시): 15장 · 청중 경영진(C-Level) · 한국어 · 16:9.
장수 배분: 15장 = 타이틀1 + 디바이더2 + 콘텐츠10 + 코랄1 + 클로징1 / 30장 = 디바이더4 + 콘텐츠22 + 코랄1~2.

### 2단계: 스토리 구조 설계

보고서형 표준 4막 구성: ① 기회/배경 → ② 현황/경쟁 분석 → ③ 핵심 검토(기술·재무) → ④ 실행 플랜/CTA.
각 슬라이드에 레이아웃 코드(L1~L9)를 배정한 목차 표를 먼저 작성한다.

**서피스 페이싱 규칙 (필수)**:
- 오프닝 크림(L1), 클로징 다크(L9) 고정
- 같은 서피스 3연속 금지, 다크는 전체의 15~25%(데이터·차트 슬라이드에 배치)
- 코랄 풀블리드(L8)는 덱당 1~2장 — 스토리 전환점(결론·기회 선언)에만

### 3단계: 디자인 시스템 적용

`references/design-system.md`를 읽고 다음을 엄수:
- 배경은 FAF9F5 / 181715 / CC785C 3종만. 순백·쿨그레이·파랑 금지
- 제목은 세리프 400 + 음수 자간, **어디에도 볼드 세리프 금지**. 강조는 크기로
- 액센트 라인·엣지 스트라이프·그림자 금지. 깊이는 색면 대비로
- 폰트: Noto Serif CJK KR + Noto Sans CJK KR (컨테이너 QA 정합). 사외 배포 언급 시 폰트 포함 저장 안내

### 4단계: 차트 설계 (편집 가능 필수)

수치 데이터가 있으면 반드시 `addChart()` 네이티브 차트로 — 이미지 렌더 금지.
`references/charts.md`의 레시피(AREA/DOUGHNUT/BAR/PIE/콤보)를 그대로 사용.
비연동 오버레이(도넛 중앙 텍스트 등)를 쓴 경우 최종 응답에서 사용자에게 고지.

### 5단계: 빌드

```bash
mkdir -p /home/claude/build && cd /home/claude/build
cp <skill>/scripts/tokens.js <skill>/scripts/helpers.js .
export NODE_PATH=$(npm root -g)
node gen.js                                   # 레이아웃은 layouts.md 코드 재사용
python /mnt/skills/public/pptx/scripts/rezip.py output.pptx
```

gen.js 작성 시 유의:
- hex에 # 금지, 8자리 hex 금지, 옵션 객체 재사용 금지(pptxgenjs가 in-place 변환)
- 유니코드 불릿 금지 — 필요 시 `bullet: true`
- 본문 텍스트 40자/행 이내로 요약해 오버플로 예방 (rows rowH: 4행 1.03 / 5행 0.88 / 6행 0.74)

### 6단계: 시각 QA (필수)

```bash
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf output.pptx
rm -f slide-*.jpg && pdftoppm -jpeg -r 100 output.pdf slide
```

체크리스트: ① 텍스트 오버플로/잘림 ② 배경 3색 외 색 사용 ③ 볼드 세리프 오염 ④ 서피스 3연속 ⑤ 코랄 ≤2장 ⑥ 다크 위 텍스트가 FAF9F5(순백 아님) ⑦ 차트 배경=컨테이너 색 일치 ⑧ 페이지 번호.
발견 결함 수정 → 해당 슬라이드만 재검증 → 1사이클 후 종료. `extract-text`로 placeholder/오탈자 grep.

### 산출

완성 파일을 `/mnt/user-data/outputs/`에 한국어 파일명으로 복사 후 present_files.
최종 응답에 ① 섹션 구조 요약 ② 편집 가능 차트 목록과 수정 방법 ③ 폰트 대체 안내를 포함한다.

## 옵션 파라미터 (사용자 요청 시)

- **장수**: 8 / 15 / 30 (기본 15)
- **발표자 노트**: `addNotes()`로 슬라이드별 스크립트 추가
- **영문 덱**: 텍스트만 영문화, 토큰·레이아웃 동일
- **요약본 재구성**: 기존 덱에서 L2 디바이더 유지 + 섹션당 핵심 2~3장 선별
