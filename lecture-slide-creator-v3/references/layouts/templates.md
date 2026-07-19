# 레이아웃 코드 템플릿 (pptxgenjs)

> 7종 SimpleP 레이아웃을 pptxgenjs 호출로 즉시 사용할 수 있는 스니펫.
> 슬라이드 사이즈: 16:9 (13.33" × 7.5")

## 공통 토큰

```javascript
const COLORS = {
  ink: "000000",
  inkSoft: "2D2D2D",
  paper: "FFFFFF",
  cream: "F5F0E8",
  rule: "E5E5E5",
  muted: "8A8A8A",
  body: "1A1A1A",
  gold: "C9A961"  // 옵션 액센트
};

const FONT = "Pretendard";  // 없으면 Noto Sans KR
const PAGE_W = 13.33;
const PAGE_H = 7.5;

// 페이지 번호 추가 (재사용)
function addPageNumber(slide, n) {
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.7, y: 0.3, w: 0.5, h: 0.3,
    fontSize: 11, fontFace: FONT, color: COLORS.muted,
    align: "right"
  });
}
```

## L1. 타이틀 (Title)

```javascript
function layoutTitle(slide, { line1, line2, sub }) {
  slide.background = { color: COLORS.paper };
  slide.addText(line1, {
    x: 0.8, y: 2.2, w: 12, h: 1.6,
    fontSize: 96, fontFace: FONT, bold: true,
    color: COLORS.ink, align: "left", lineSpacingMultiple: 0.95
  });
  slide.addText(line2, {
    x: 0.8, y: 3.8, w: 12, h: 1.6,
    fontSize: 96, fontFace: FONT, bold: true,
    color: COLORS.ink, align: "left", lineSpacingMultiple: 0.95
  });
  slide.addText(sub, {
    x: 0.8, y: 6.5, w: 12, h: 0.4,
    fontSize: 14, fontFace: FONT, color: COLORS.muted
  });
}
```

## L2. Overview (좌 헤딩 + 검정 원형 + 우 3단 비교)

```javascript
function layoutOverview(slide, { headLine1, headLine2, circleWord, asis, tobe, goal, page }) {
  slide.background = { color: COLORS.paper };
  // 좌측 분할 헤딩
  slide.addText(headLine1, { x: 0.8, y: 1.2, w: 5, h: 1.4, fontSize: 88, bold: true, fontFace: FONT, color: COLORS.ink, lineSpacingMultiple: 0.95 });
  slide.addText(headLine2, { x: 0.8, y: 2.6, w: 5, h: 1.4, fontSize: 88, bold: true, fontFace: FONT, color: COLORS.ink, lineSpacingMultiple: 0.95 });
  // 중앙 검정 원형
  slide.addShape("ellipse", { x: 6.5, y: 1.8, w: 2.2, h: 2.2, fill: { color: COLORS.ink }, line: { color: COLORS.ink } });
  slide.addText(circleWord, { x: 6.5, y: 1.8, w: 2.2, h: 2.2, fontSize: 24, bold: true, fontFace: FONT, color: COLORS.paper, align: "center", valign: "middle" });
  // 우측 3단 비교
  const labels = ["AS-IS", "TO-BE", "GOAL"];
  const values = [asis, tobe, goal];
  labels.forEach((label, i) => {
    const x = 9.2 + i * 1.3;
    slide.addText(label, { x, y: 4.5, w: 1.3, h: 0.3, fontSize: 10, bold: true, fontFace: FONT, color: COLORS.muted });
    slide.addShape("rect", { x, y: 4.85, w: 1.2, h: 1.6, fill: { color: COLORS.paper }, line: { color: COLORS.rule, width: 1, dashType: "dash" } });
    slide.addText(values[i], { x: x + 0.1, y: 4.95, w: 1.0, h: 1.4, fontSize: 11, fontFace: FONT, color: COLORS.body, valign: "top" });
  });
  addPageNumber(slide, page);
}
```

## L3. 개념 설명 (Single Message)

```javascript
function layoutConcept(slide, { title, lead, body, page }) {
  slide.background = { color: COLORS.paper };
  slide.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.7, fontSize: 18, fontFace: FONT, color: COLORS.muted });
  slide.addText(lead, { x: 0.8, y: 2.0, w: 11.7, h: 1.8, fontSize: 54, bold: true, fontFace: FONT, color: COLORS.ink, lineSpacingMultiple: 1.1 });
  slide.addText(body, { x: 0.8, y: 4.5, w: 11.7, h: 2, fontSize: 18, fontFace: FONT, color: COLORS.body, lineSpacingMultiple: 1.5 });
  addPageNumber(slide, page);
}
```

## L4. 3단 비교 (Comparison)

```javascript
function layout3Col(slide, { title, cols, page }) {
  // cols = [{label, content}, ...] × 3
  slide.background = { color: COLORS.paper };
  slide.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.7, fontSize: 32, bold: true, fontFace: FONT, color: COLORS.ink });
  cols.forEach((c, i) => {
    const x = 0.8 + i * 4.1;
    slide.addText(c.label, { x, y: 2.2, w: 3.8, h: 0.4, fontSize: 12, bold: true, fontFace: FONT, color: COLORS.muted });
    slide.addShape("rect", { x, y: 2.7, w: 3.8, h: 3.8, fill: { color: COLORS.paper }, line: { color: COLORS.rule, width: 1, dashType: "dash" } });
    slide.addText(c.content, { x: x + 0.2, y: 2.9, w: 3.4, h: 3.4, fontSize: 14, fontFace: FONT, color: COLORS.body, valign: "top", lineSpacingMultiple: 1.4 });
  });
  addPageNumber(slide, page);
}
```

## L5. 원형 강조 (Circle Emphasis)

```javascript
function layoutCircle(slide, { title, body, circleWord, page }) {
  slide.background = { color: COLORS.paper };
  slide.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.7, fontSize: 32, bold: true, fontFace: FONT, color: COLORS.ink });
  slide.addText(body, { x: 0.8, y: 2.0, w: 7, h: 4.5, fontSize: 18, fontFace: FONT, color: COLORS.body, lineSpacingMultiple: 1.5, valign: "top" });
  slide.addShape("ellipse", { x: 9, y: 2.5, w: 3.2, h: 3.2, fill: { color: COLORS.ink }, line: { color: COLORS.ink } });
  slide.addText(circleWord, { x: 9, y: 2.5, w: 3.2, h: 3.2, fontSize: 36, bold: true, fontFace: FONT, color: COLORS.paper, align: "center", valign: "middle" });
  addPageNumber(slide, page);
}
```

## L6. 스탯 (Stat Callout)

```javascript
function layoutStat(slide, { title, stat, label, source, page }) {
  slide.background = { color: COLORS.paper };
  slide.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.7, fontSize: 18, fontFace: FONT, color: COLORS.muted });
  slide.addText(stat, { x: 0.8, y: 2.0, w: 11.7, h: 3, fontSize: 200, bold: true, fontFace: FONT, color: COLORS.ink, lineSpacingMultiple: 0.95 });
  slide.addText(label, { x: 0.8, y: 5.2, w: 11.7, h: 0.8, fontSize: 24, fontFace: FONT, color: COLORS.body });
  slide.addText(source, { x: 0.8, y: 6.8, w: 11.7, h: 0.3, fontSize: 9, fontFace: FONT, color: COLORS.muted, italic: false });
  addPageNumber(slide, page);
}
```

## L7. 클로징 (Brand Closing)

```javascript
function layoutClosing(slide, { brand, location, contact }) {
  // 상단 80% 풀블랙
  slide.background = { color: COLORS.paper };
  slide.addShape("rect", { x: 0, y: 0, w: PAGE_W, h: 6, fill: { color: COLORS.ink }, line: { color: COLORS.ink } });
  // 중앙 원형 + 브랜드
  slide.addShape("ellipse", { x: 5.5, y: 2.2, w: 2.3, h: 1.6, fill: { color: COLORS.inkSoft }, line: { color: COLORS.inkSoft } });
  slide.addText(brand, { x: 5.5, y: 2.2, w: 2.3, h: 1.6, fontSize: 18, bold: true, fontFace: FONT, color: COLORS.paper, align: "center", valign: "middle" });
  // 하단 화이트 LOCATION / CONTACT
  slide.addText("LOCATION", { x: 1.5, y: 6.4, w: 2, h: 0.3, fontSize: 10, bold: true, fontFace: FONT, color: COLORS.muted });
  slide.addText(location, { x: 1.5, y: 6.75, w: 5, h: 0.5, fontSize: 11, fontFace: FONT, color: COLORS.body });
  slide.addText("CONTACT", { x: 7.5, y: 6.4, w: 2, h: 0.3, fontSize: 10, bold: true, fontFace: FONT, color: COLORS.muted });
  slide.addText(contact, { x: 7.5, y: 6.75, w: 5, h: 0.5, fontSize: 11, fontFace: FONT, color: COLORS.body });
}
```

## 호출 순서 예시

```javascript
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";  // 13.33 x 7.5
pptx.defineLayout({ name: "WIDE", width: PAGE_W, height: PAGE_H });

const s1 = pptx.addSlide();
layoutTitle(s1, { line1: "Claude AI", line2: "강의", sub: "김진수 · 2026.05" });

const s2 = pptx.addSlide();
layoutOverview(s2, {
  headLine1: "개", headLine2: "요",
  circleWord: "Simple",
  asis: "AI가 어렵다", tobe: "AI를 쓴다", goal: "AI로 일한다",
  page: 2
});

// ... 이하 반복
await pptx.writeFile({ fileName: "output.pptx" });
```
