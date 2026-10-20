// Shared theme, layouts and drawing helpers for the 촬영편집 decks (one deck per 회차).
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
    dk1: "1C2420", // ink
    lt1: "FFFFFF",
    dk2: "173A2B", // pine
    lt2: "EEF3F0", // mist
    accent1: "E0A526", // gold (star)
    accent2: "2E7D57", // green (tree)
    accent3: "C8423B", // red ornament
    accent4: "2F6E9E", // blue ornament
    accent5: "7A8C83", // sage gray
    accent6: "F3DFA2", // pale gold
    hlink: "2F6E9E",
    folHlink: "7A4E9E",
  },
};
const HEX = THEME.colors;

const W = 13.333;
const H = 7.5;

function newDeck({ title, footer }) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = title;
  pres.author = "촬영편집 강사";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "TITLE",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.9, y: 2.2, w: 11.5, h: 1.5, fontSize: 44, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.9, y: 3.85, w: 11.5, h: 0.8, fontSize: 24, color: C.accent1, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "SECTION",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 3.0, y: 2.55, w: 9.6, h: 1.3, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 3.0, y: 3.95, w: 9.6, h: 1.2, fontSize: 18, color: C.accent6, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: HEX.lt1 },
    margin: [0.5, 0.6, 0.7, 0.6],
    slideNumber: { x: 12.2, y: 6.98, w: 0.6, h: 0.3, fontSize: 10, color: HEX.accent5, align: "right" },
    objects: [
      { text: { text: footer, options: { x: 0.6, y: 6.98, w: 8, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontSize: 30, bold: true, color: C.text2, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "STATEMENT",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 1.2, y: 2.2, w: 10.9, h: 2.0, fontSize: 40, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 1.2, y: 4.35, w: 10.9, h: 1.2, fontSize: 18, color: C.accent6, align: "center", valign: "top", margin: 0 }, text: "" } },
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

// Drawing helpers. Every helper takes the slide first and positions in inches.
function makeKit(pres, C) {
  const S = pres.ShapeType;
  const kit = {
    S,
    C,
    text(slide, text, o) {
      slide.addText(text, { isTextBox: true, margin: 0, color: C.text1, fontSize: 16, valign: "top", ...o });
    },
    card(slide, x, y, w, h, o = {}) {
      slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: o.fill || C.background2 }, line: o.line ? { color: o.line, width: o.lineW || 1.25 } : { type: "none" }, objectName: o.name });
    },
    // A filled circle: the deck's "ornament" motif. Content is text or an icon image.
    async ornament(slide, x, y, d, color, content, o = {}) {
      slide.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color }, line: { type: "none" }, objectName: o.name });
      if (o.icon) {
        const pad = d * 0.27;
        slide.addImage({ data: await icon(o.icon, o.iconHex || "FFFFFF"), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, altText: o.alt || o.icon });
      } else if (content !== undefined && content !== null) {
        slide.addText(String(content), { isTextBox: true, x, y, w: d, h: d, align: "center", valign: "middle", margin: 0, fontSize: o.fontSize || Math.round(d * 22), bold: true, color: o.textColor || C.background1 });
      }
    },
    // Icon + bold heading + body text inside a tinted card.
    async iconCard(slide, x, y, w, h, { icon: ic, color, head, body, headSize = 18, bodySize = 14, fill }) {
      kit.card(slide, x, y, w, h, { fill: fill || C.background2 });
      const d = 0.62;
      await kit.ornament(slide, x + 0.25, y + 0.25, d, color || C.accent2, null, { icon: ic });
      kit.text(slide, head, { x: x + 0.25, y: y + 0.25 + d + 0.15, w: w - 0.5, h: 0.45, fontSize: headSize, bold: true, color: C.text2 });
      if (body) kit.text(slide, body, { x: x + 0.25, y: y + 0.25 + d + 0.62, w: w - 0.5, h: h - (0.25 + d + 0.62) - 0.2, fontSize: bodySize, color: C.text1 });
    },
    // Numbered step card: ornament number on the left, heading + body on the right.
    async stepRow(slide, x, y, w, h, { n, color, head, body, headSize = 17, bodySize = 14 }) {
      kit.card(slide, x, y, w, h);
      const d = Math.min(0.62, h - 0.3);
      await kit.ornament(slide, x + 0.2, y + (h - d) / 2, d, color || C.accent2, n, { fontSize: 18 });
      kit.text(slide, head, { x: x + 0.2 + d + 0.25, y: y + 0.14, w: w - d - 0.7, h: 0.42, fontSize: headSize, bold: true, color: C.text2, valign: "middle" });
      if (body) kit.text(slide, body, { x: x + 0.2 + d + 0.25, y: y + 0.56, w: w - d - 0.7, h: h - 0.66, fontSize: bodySize });
    },
    bullets(slide, items, o) {
      const runs = items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1 } }));
      slide.addText(runs, { isTextBox: true, margin: 0, fontSize: 16, color: C.text1, paraSpaceAfter: 8, valign: "top", ...o });
    },
    checklist(slide, items, o) {
      const runs = items.map((t, i) => ({ text: "□  " + t, options: { breakLine: i < items.length - 1 } }));
      slide.addText(runs, { isTextBox: true, margin: 0, fontSize: 16, color: C.text1, paraSpaceAfter: 9, valign: "top", ...o });
    },
    // A highlighted takeaway line at the bottom of a content slide.
    note(slide, text, o = {}) {
      const y = o.y || 6.25;
      slide.addShape(S.roundRect, { x: 0.6, y, w: 12.1, h: 0.55, rectRadius: 0.1, fill: { color: C.accent6 }, line: { type: "none" } });
      slide.addText(text, { isTextBox: true, x: 0.85, y, w: 11.6, h: 0.55, fontSize: 15, bold: true, color: C.text2, valign: "middle", margin: 0 });
    },
    table(slide, rows, o) {
      const head = rows[0].map((t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
      const body = rows.slice(1).map((r, i) => r.map((t) => ({ text: t, options: { fill: { color: i % 2 ? C.background1 : C.background2 } } })));
      slide.addTable([head, ...body], { fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.5, color: "D5DED9" }, margin: [0.06, 0.1, 0.06, 0.1], valign: "middle", ...o });
    },
    arrowRight(slide, x, y, w) {
      slide.addShape(S.line, { x, y, w, h: 0, line: { color: C.accent5, width: 1.5, endArrowType: "triangle" } });
    },
  };
  return kit;
}

module.exports = { THEME, HEX, W, H, newDeck, makeKit, icon };
