# design-infographic

인포그래픽·PPT 슬라이드 제작용 저장소.

## PPT 스킬 라우팅 규칙

PPT·슬라이드·발표자료 제작 요청 시 `.claude/skills/`의 스킬을 아래 우선순위로 적용한다:

| 요청 키워드 | 적용 스킬 |
|---|---|
| 별도 스타일 지정 없음 | `pptx-master-skills` (Claude Brand — 크림 캔버스 × 코랄 × 다크 네이비) |
| "미니멀", "모노크롬", "심플", "SimpleP" | `lecture-slide-creator-v3` (블랙·화이트·크림 미니멀) |
| "ppt Design_1", "플랫 벡터", "Flat Vector" | `ppt-design-1` (순백 배경 + 포인트 컬러 4종) |
| 강의자료·교육·워크숍·세미나 | `lecture-slide-creator` (교육학적 구성 + 발표자 노트) |

## HTML 슬라이드 스킬

"HTML 슬라이드", "웹 슬라이드", "브라우저 발표", "애니메이션 슬라이드" 요청 또는 .pptx의 웹 변환 요청 시 `frontend-slides` 스킬을 사용한다 (GitHub ⭐25k+ 1위 슬라이드 스킬, 의존성 없는 단일 HTML 덱 + 볼드 템플릿 34종 + PDF 내보내기 — MIT 라이선스, [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)). 편집 가능한 .pptx 파일이 필요한 요청은 기존 PPT 스킬 라우팅을 따른다.

## UI/UX 디자인 스킬

웹·앱 UI, 랜딩 페이지, 대시보드, 인포그래픽 HTML 등 화면 디자인 작업 시 `ui-ux-pro-max` 스킬을 사용한다 (UI 스타일 84종, 컬러 팔레트 192종, 폰트 페어링 74종, 업종별 디자인 룰, 차트 룰 25종 데이터베이스 — MIT 라이선스, [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)). PPT 슬라이드에 차트·컬러 시스템이 필요할 때도 근거 있는 팔레트·차트 선택을 위해 참조할 수 있다.

공통 사항:

- 실제 PPTX 파일 생성은 Anthropic 공식 내장 `pptx` 스킬로 빌드한다
- 제작 프로세스(목차 우선 설계 → 빌드 → 이미지 슬롯 → Canva 후편집)는 `claude-code-ppt` 스킬을 따른다
- 한 덱을 여러 파트로 나눠 만들 때는 처음 적용한 스킬의 디자인 토큰을 끝까지 유지한다
