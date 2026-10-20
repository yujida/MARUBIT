// 촬영편집 덱 공통 디자인 시스템: 테마, 레이아웃, 그리기 도우미.
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const THEME = {
  name: "Crew Tree",
  headFontFace: "Malgun Gothic",
  bodyFontFace: "Malgun Gothic",
  colors: {
    dk1: "1B211E", // 본문 글자
    lt1: "FFFFFF",
    dk2: "121816", // 잉크(어두운 배경)
    lt2: "F3F6F4", // 카드 바탕
    accent1: "D6A23C", // 골드
    accent2: "1F5A43", // 파인 그린
    accent3: "B8473E", // 레드
    accent4: "3B6F97", // 블루
    accent5: "6E7A74", // 회색 글자
    accent6: "F2E3B8", // 옅은 골드
    hlink: "3B6F97",
    folHlink: "6E4E8E",
  },
};
const HEX = { ...THEME.colors, line: "DDE4E0", tint: "E6EEE9" };

const W = 13.333;
const H = 7.5;
const M = 0.75; // 좌우 여백

function newDeck({ title, footer }) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = title;
  pres.author = "촬영편집 강사";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "COVER",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.55, w: 7.6, h: 1.9, fontSize: 48, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 4.6, w: 7.2, h: 0.9, fontSize: 20, color: C.accent6, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "DIVIDER",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 3.55, w: 8.4, h: 1.2, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 4.9, w: 7.8, h: 1.0, fontSize: 16, color: C.accent6, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: HEX.lt1 },
    margin: [0.5, M, 0.7, M],
    slideNumber: { x: W - M - 0.6, y: 7.0, w: 0.6, h: 0.25, fontSize: 9, color: HEX.accent5, align: "right" },
    objects: [
      { text: { text: footer, options: { x: M, y: 7.0, w: 8, h: 0.25, fontSize: 9, color: C.accent5, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.78, w: 10.4, h: 0.72, fontSize: 28, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "STATEMENT",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 1.3, y: 2.3, w: 10.7, h: 1.9, fontSize: 40, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 1.3, y: 4.35, w: 10.7, h: 1.0, fontSize: 18, color: C.accent6, align: "center", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  return { pres, C };
}

const iconCache = new Map();
async function icon(name, hex, px = 256) {
  const key = `${name}:${hex}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const Comp = fa[name];
  if (!Comp) throw new Error(`unknown icon ${name}`);
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = "image/png;base64," + buf.toString("base64");
  iconCache.set(key, data);
  return data;
}

function makeKit(pres, C) {
  const S = pres.ShapeType;
  const kit = {
    S,
    C,
    text(slide, text, o) {
      slide.addText(text, { isTextBox: true, margin: 0, color: C.text1, fontSize: 15, valign: "top", ...o });
    },
    // 제목 위의 작은 머리말 (어느 교시인지)
    kicker(slide, text) {
      kit.text(slide, text, { x: M, y: 0.48, w: 8, h: 0.28, fontSize: 11, bold: true, color: C.accent2, charSpacing: 1 });
    },
    // 오른쪽 위 교시 진행 표시 (1~7)
    progress(slide, current, total = 7) {
      const d = 0.13, gap = 0.1;
      const x0 = W - M - total * (d + gap) + gap;
      for (let i = 1; i <= total; i++) {
        slide.addShape(S.ellipse, { x: x0 + (i - 1) * (d + gap), y: 0.55, w: d, h: d, fill: { color: i === current ? C.accent1 : i < current ? C.accent2 : "DDE4E0" }, line: { type: "none" } });
      }
    },
    card(slide, x, y, w, h, o = {}) {
      const opts = { x, y, w, h, rectRadius: 0.08, fill: { color: o.fill || C.background2 }, line: o.line ? { color: o.line, width: o.lineW || 0.75 } : { type: "none" }, objectName: o.name };
      if (o.shadow) opts.shadow = { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 2, angle: 90 };
      slide.addShape(S.roundRect, opts);
    },
    // 아이콘 칩: 옅은 원 안에 진한 아이콘
    async chip(slide, x, y, d, iconName, o = {}) {
      slide.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || HEX.tint }, line: { type: "none" } });
      const pad = d * 0.26;
      slide.addImage({ data: await icon(iconName, o.iconHex || HEX.accent2), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, altText: o.alt || iconName });
    },
    // 숫자 배지 (진한 원 + 골드 숫자)
    badge(slide, x, y, d, label, o = {}) {
      slide.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || C.text2 }, line: { type: "none" } });
      slide.addText(String(label), { isTextBox: true, x, y, w: d, h: d, margin: 0, align: "center", valign: "middle", fontSize: o.fontSize || Math.max(10, Math.round(d * 26)), bold: true, color: o.color || C.accent1 });
    },
    // 큰 번호 + 제목 + 설명 카드
    async featureCard(slide, x, y, w, h, { icon: ic, head, body, num, headSize = 17, bodySize = 13, fill, dark }) {
      kit.card(slide, x, y, w, h, { fill: fill || (dark ? C.text2 : C.background2) });
      let ty = y + 0.3;
      if (ic) {
        await kit.chip(slide, x + 0.3, y + 0.3, 0.62, ic, dark ? { fill: "26302C", iconHex: HEX.accent1 } : {});
        ty = y + 1.08;
      } else if (num !== undefined) {
        kit.text(slide, String(num).padStart(2, "0"), { x: x + 0.3, y: y + 0.22, w: 1.5, h: 0.6, fontSize: 26, bold: true, color: C.accent1 });
        ty = y + 0.9;
      }
      kit.text(slide, head, { x: x + 0.3, y: ty, w: w - 0.6, h: 0.42, fontSize: headSize, bold: true, color: dark ? C.background1 : C.text1 });
      if (body) kit.text(slide, body, { x: x + 0.3, y: ty + 0.47, w: w - 0.6, h: y + h - (ty + 0.47) - 0.2, fontSize: bodySize, color: dark ? "C9D3CE" : C.accent5 });
    },
    // 가로 한 줄 항목: 배지 + 제목 + 설명
    row(slide, x, y, w, h, { n, head, body, headW = 3.2, fill }) {
      kit.card(slide, x, y, w, h, { fill: fill || C.background2 });
      kit.badge(slide, x + 0.22, y + (h - 0.5) / 2, 0.5, n, { fontSize: 13 });
      kit.text(slide, head, { x: x + 0.95, y, w: headW, h, fontSize: 16, bold: true, valign: "middle" });
      if (body) kit.text(slide, body, { x: x + 0.95 + headW, y, w: w - headW - 1.15, h, fontSize: 14, color: C.accent5, valign: "middle" });
    },
    bullets(slide, items, o) {
      const runs = items.map((t, i) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1 } }));
      slide.addText(runs, { isTextBox: true, margin: 0, fontSize: 15, color: C.text1, paraSpaceAfter: 8, valign: "top", ...o });
    },
    checklist(slide, items, o) {
      const runs = items.map((t, i) => ({ text: "☐  " + t, options: { breakLine: i < items.length - 1 } }));
      slide.addText(runs, { isTextBox: true, margin: 0, fontSize: 15, color: C.text1, paraSpaceAfter: 9, valign: "top", ...o });
    },
    // 아래쪽 핵심 문장 (옅은 골드 바탕)
    takeaway(slide, text, y = 6.2) {
      slide.addShape(S.roundRect, { x: M, y, w: W - 2 * M, h: 0.56, rectRadius: 0.08, fill: { color: C.accent6 }, line: { type: "none" } });
      slide.addText(text, { isTextBox: true, x: M + 0.3, y, w: W - 2 * M - 0.6, h: 0.56, fontSize: 14, bold: true, color: C.text1, valign: "middle", margin: 0 });
    },
    // 프롬프트 카드 (복사해 쓰기)
    prompt(slide, x, y, w, h, text, label = "ChatGPT에 이렇게") {
      slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: C.accent4, width: 1, dashType: "dash" } });
      kit.text(slide, label, { x: x + 0.25, y: y + 0.18, w: w - 0.5, h: 0.3, fontSize: 11, bold: true, color: C.accent4 });
      kit.text(slide, text, { x: x + 0.25, y: y + 0.52, w: w - 0.5, h: h - 0.7, fontSize: 13.5 });
    },
    source(slide, text) {
      kit.text(slide, text, { x: M, y: 6.72, w: 11, h: 0.24, fontSize: 9, color: C.accent5 });
    },
    // 사진 (cover로 채움) + 선택적 캡션
    photo(slide, file, x, y, w, h, o = {}) {
      slide.addImage({ path: file, x, y, w, h, sizing: { type: "cover", w, h }, altText: o.alt || "" , rounding: false });
      if (o.caption) {
        kit.text(slide, o.caption, { x, y: y + h + 0.1, w, h: 0.3, fontSize: 13, bold: true, align: o.align || "left" });
        if (o.sub) kit.text(slide, o.sub, { x, y: y + h + 0.4, w, h: 0.5, fontSize: 11.5, color: C.accent5, align: o.align || "left" });
      }
    },
    table(slide, rows, o) {
      const head = rows[0].map((t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
      const body = rows.slice(1).map((r, i) => r.map((t) => ({ text: t, options: { fill: { color: i % 2 ? C.background1 : C.background2 } } })));
      slide.addTable([head, ...body], { fontSize: 13, color: C.text1, border: { type: "solid", pt: 0.5, color: HEX.line }, margin: [0.07, 0.12, 0.07, 0.12], valign: "middle", ...o });
    },
    arrow(slide, x, y, w) {
      slide.addShape(S.line, { x, y, w, h: 0, line: { color: C.accent5, width: 1.25, endArrowType: "triangle" } });
    },
  };
  return kit;
}

module.exports = { THEME, HEX, W, H, M, newDeck, makeKit, icon };
