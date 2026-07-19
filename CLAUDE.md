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

공통 사항:

- 실제 PPTX 파일 생성은 Anthropic 공식 내장 `pptx` 스킬로 빌드한다
- 제작 프로세스(목차 우선 설계 → 빌드 → 이미지 슬롯 → Canva 후편집)는 `claude-code-ppt` 스킬을 따른다
- 한 덱을 여러 파트로 나눠 만들 때는 처음 적용한 스킬의 디자인 토큰을 끝까지 유지한다
