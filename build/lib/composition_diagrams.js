// 구도 도식 (SVG → PNG). scene=true면 장면 + 구도선, false면 사진 위에 얹을 구도선만(투명 배경).
// 글자는 넣지 않는다(이름 · 설명은 슬라이드에서).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const VW = 1500, VH = 1000;
const GOLD = "#D6A23C", LIGHT = "#E6EEE9", MID = "#3A4741", GROUND = "#26302B", DARK = "#151B18";

const bg = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26302C"/><stop offset="1" stop-color="#171D1A"/></linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F4A40"/><stop offset="1" stop-color="#5B6E63"/></linearGradient>
  <linearGradient id="lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EBD6"/><stop offset="1" stop-color="#D9CDB0"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>
  <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${GOLD}"/></marker>
</defs>`;

const person = (cx, foot, h, fill = LIGHT) => {
  const r = h * 0.11, top = foot - h, bw = h * 0.3;
  return `<circle cx="${cx}" cy="${top + r}" r="${r}" fill="${fill}"/>
  <rect x="${cx - bw / 2}" y="${top + r * 2.25}" width="${bw}" height="${foot - top - r * 2.25}" rx="${bw * 0.38}" fill="${fill}"/>`;
};
const gridLines = (op = 0.4) =>
  [1, 2].map((t) => `<line x1="${(VW * t) / 3}" y1="0" x2="${(VW * t) / 3}" y2="${VH}" stroke="#fff" stroke-opacity="${op}" stroke-width="3"/>
  <line x1="0" y1="${(VH * t) / 3}" x2="${VW}" y2="${(VH * t) / 3}" stroke="#fff" stroke-opacity="${op}" stroke-width="3"/>`).join("");
const dash = `stroke="${GOLD}" stroke-width="7" stroke-dasharray="22 14" fill="none" stroke-linecap="round"`;
const solid = `stroke="${GOLD}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

// 황금나선: 황금 사각형을 왼→위→오른→아래 순으로 정사각형으로 잘라 가며 4분원을 잇는다.
function goldenSpiral(x, y, w, h, n = 9) {
  let d = "";
  let r = { x, y, w, h };
  for (let i = 0; i < n; i++) {
    const dir = i % 4;
    let s, a, b, c;
    if (dir === 0) { s = r.h; a = [r.x, r.y + s]; b = [r.x + s, r.y]; c = [r.x + s, r.y + s]; r = { x: r.x + s, y: r.y, w: r.w - s, h: r.h }; }
    else if (dir === 1) { s = r.w; a = [r.x, r.y]; b = [r.x + s, r.y + s]; c = [r.x, r.y + s]; r = { x: r.x, y: r.y + s, w: r.w, h: r.h - s }; }
    else if (dir === 2) { s = r.h; a = [r.x + r.w, r.y]; b = [r.x + r.w - s, r.y + s]; c = [r.x + r.w - s, r.y]; r = { x: r.x, y: r.y, w: r.w - s, h: r.h }; }
    else { s = r.w; a = [r.x + s, r.y + r.h]; b = [r.x, r.y + r.h - s]; c = [r.x + s, r.y + r.h - s]; r = { x: r.x, y: r.y, w: r.w, h: r.h - s }; }
    d += (i === 0 ? `M${a[0]} ${a[1]} ` : "") + `A${s} ${s} 0 0 1 ${b[0]} ${b[1]} `;
  }
  return { d, eye: [r.x + r.w / 2, r.y + r.h / 2] };
}

// 원근 있는 S자 길: 중심선(3차 베지어)을 따라 폭이 줄어드는 다각형
function sRoad() {
  const P = [[520, 1300], [1700, 820], [-80, 560], [820, 330]];
  const bz = (t, i) => (1 - t) ** 3 * P[0][i] + 3 * (1 - t) ** 2 * t * P[1][i] + 3 * (1 - t) * t ** 2 * P[2][i] + t ** 3 * P[3][i];
  const L = [], R = [], C = [];
  for (let k = 0; k <= 60; k++) {
    const t = k / 60, x = bz(t, 0), y = bz(t, 1);
    const t2 = Math.min(1, t + 0.01), dx = bz(t2, 0) - x || 1e-6, dy = bz(t2, 1) - y;
    const len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = 135 * (1 - t) ** 1.2 + 12;
    L.push(`${x + nx * w},${y + ny * w}`); R.unshift(`${x - nx * w},${y - ny * w}`); C.push(`${x},${y}`);
  }
  return { poly: [...L, ...R].join(" "), center: C.join(" "), end: P[3] };
}

const D = {
  thirds: {
    scene: () => `<rect width="${VW}" height="667" fill="url(#sky)"/><rect y="667" width="${VW}" height="333" fill="${GROUND}"/>
      <ellipse cx="300" cy="667" rx="260" ry="70" fill="${MID}"/>${person(1000, 930, 620)}`,
    guides: () => gridLines(0.5) + `<circle cx="1000" cy="333" r="30" fill="${GOLD}"/><line x1="0" y1="667" x2="${VW}" y2="667" ${dash}/>`,
  },
  power: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="url(#sky)"/>
      <circle cx="500" cy="380" r="165" fill="${LIGHT}"/><rect x="230" y="580" width="540" height="480" rx="200" fill="${LIGHT}"/>
      <circle cx="560" cy="345" r="16" fill="${DARK}"/>`,
    guides: (scene) => gridLines(0.4) + [[500, 333], [1000, 333], [500, 667], [1000, 667]].map(([x, y], i) =>
      `<circle cx="${x}" cy="${y}" r="40" stroke="${GOLD}" stroke-width="7" fill="${i === 0 && scene ? GOLD : "none"}" fill-opacity="0.35"/>`).join("") +
      (scene ? `<line x1="720" y1="345" x2="1330" y2="345" ${dash} marker-end="url(#ah)"/>` : ""),
  },
  golden: (() => {
    const gw = VW, gh = VW / 1.618, gy = (VH - gh) / 2;
    const sp = goldenSpiral(0, gy, gw, gh);
    return {
      scene: () => `<rect width="${VW}" height="${VH}" fill="url(#bg)"/>
        <circle cx="${sp.eye[0]}" cy="${sp.eye[1]}" r="120" fill="${LIGHT}"/><circle cx="${sp.eye[0]}" cy="${sp.eye[1]}" r="62" fill="#C9B88E"/>
        <ellipse cx="380" cy="720" rx="190" ry="120" fill="${MID}"/>`,
      guides: () => [0.382, 0.618].map((t) => `<line x1="${VW * t}" y1="0" x2="${VW * t}" y2="${VH}" stroke="#fff" stroke-opacity="0.4" stroke-width="3"/>
        <line x1="0" y1="${VH * t}" x2="${VW}" y2="${VH * t}" stroke="#fff" stroke-opacity="0.4" stroke-width="3"/>`).join("") +
        `<path d="${sp.d}" ${solid}/>`,
    };
  })(),
  horizon: {
    scene: () => `<rect width="${VW}" height="667" fill="url(#sky)"/><rect y="667" width="${VW}" height="333" fill="${GROUND}"/>
      ${[230, 400, 1180].map((x, i) => `<rect x="${x - 14}" y="${[250, 330, 290][i]}" width="28" height="${667 - [250, 330, 290][i]}" fill="${LIGHT}" opacity="0.85"/>`).join("")}
      ${person(820, 720, 130)}`,
    guides: () => `<line x1="0" y1="667" x2="${VW}" y2="667" ${solid}/>
      ${[230, 400, 1180].map((x) => `<line x1="${x}" y1="120" x2="${x}" y2="880" ${dash}/>`).join("")}
      <g transform="translate(750 110)"><rect x="-150" y="-32" width="300" height="64" rx="32" stroke="${GOLD}" stroke-width="6" fill="none"/><circle cx="0" cy="0" r="18" fill="${GOLD}"/></g>`,
  },
  diagonal: {
    scene: () => {
      let steps = "";
      for (let i = 0; i < 9; i++) steps += `<rect x="${i * 170 - 20}" y="${860 - i * 95}" width="190" height="${200 + i * 95}" fill="${i % 2 ? MID : "#45534C"}"/>`;
      return `<rect width="${VW}" height="${VH}" fill="url(#sky)"/>${steps}${person(720, 485, 260)}`;
    },
    guides: () => `<line x1="90" y1="900" x2="1400" y2="110" ${dash} marker-end="url(#ah)"/>`,
  },
  triangle: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="url(#bg)"/><rect y="880" width="${VW}" height="120" fill="${GROUND}"/>
      ${person(470, 900, 420)}${person(1030, 900, 420)}${person(750, 890, 600)}`,
    guides: () => `<polygon points="750,250 300,930 1200,930" ${solid}/>`,
  },
  circle: {
    scene: () => {
      const items = [[0, 70, "#C9B88E"], [60, 50, "#B8473E"], [120, 62, LIGHT], [180, 46, "#3B6F97"], [240, 66, "#C9B88E"], [300, 52, LIGHT]];
      return `<rect width="${VW}" height="${VH}" fill="${DARK}"/><circle cx="750" cy="500" r="430" fill="#2E3833"/>
        <circle cx="750" cy="500" r="150" fill="${LIGHT}"/><circle cx="750" cy="500" r="95" fill="#D9CDB0"/>
        ${items.map(([a, r, c]) => `<circle cx="${750 + 290 * Math.cos((a * Math.PI) / 180)}" cy="${500 + 290 * Math.sin((a * Math.PI) / 180)}" r="${r}" fill="${c}"/>`).join("")}`;
    },
    guides: () => `<circle cx="750" cy="500" r="290" ${dash}/>
      <path d="M 750 145 A 355 355 0 0 1 1080 360" ${solid} marker-end="url(#ah)"/><path d="M 750 855 A 355 355 0 0 1 420 640" ${solid} marker-end="url(#ah)"/>`,
  },
  scurve: (() => {
    const r = sRoad();
    return {
      scene: () => `<rect width="${VW}" height="300" fill="url(#sky)"/><rect y="300" width="${VW}" height="700" fill="${GROUND}"/>
        <polygon points="${r.poly}" fill="#8A7A62"/>${person(r.end[0], r.end[1] + 5, 70)}`,
      guides: () => `<polyline points="${r.center}" ${dash}/>`,
    };
  })(),
  leading: {
    scene: () => {
      const vx = 900, vy = 420, b = [820, 340, 980, 500];
      return `<polygon points="0,0 ${VW},0 ${b[2]},${b[1]} ${b[0]},${b[1]}" fill="#19201D"/>
        <polygon points="0,${VH} ${VW},${VH} ${b[2]},${b[3]} ${b[0]},${b[3]}" fill="#36423C"/>
        <polygon points="0,0 ${b[0]},${b[1]} ${b[0]},${b[3]} 0,${VH}" fill="#222B27"/>
        <polygon points="${VW},0 ${b[2]},${b[1]} ${b[2]},${b[3]} ${VW},${VH}" fill="#1E2622"/>
        <rect x="${b[0]}" y="${b[1]}" width="160" height="160" fill="url(#lit)"/>
        ${person(vx, 492, 110, DARK)}`;
    },
    guides: () => [[0, 0], [VW, 0], [0, VH], [VW, VH], [450, VH], [1350, VH]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="900" y2="420" ${dash}/>`).join("") +
      `<circle cx="900" cy="420" r="26" fill="${GOLD}"/>`,
  },
  frame: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="#1A211E"/>
      <rect x="500" y="150" width="500" height="850" fill="url(#lit)"/><rect x="500" y="820" width="500" height="180" fill="#B5A88A"/>
      <rect x="470" y="130" width="560" height="870" fill="none" stroke="#2C3631" stroke-width="40"/>
      ${person(800, 850, 470, "#3A4741")}`,
    guides: () => `<rect x="500" y="150" width="500" height="850" ${solid}/><rect x="0" y="0" width="${VW}" height="${VH}" stroke="#fff" stroke-opacity="0.35" stroke-width="10" fill="none"/>`,
  },
  // 보너스 4가지
  symmetry: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="url(#bg)"/>
      ${[200, 1300].map((x) => `<rect x="${x - 70}" y="200" width="140" height="800" fill="${MID}"/>`).join("")}
      ${[460, 1040].map((x) => `<rect x="${x - 55}" y="300" width="110" height="700" fill="#45534C"/>`).join("")}
      <path d="M560 1000 L560 420 A190 190 0 0 1 940 420 L940 1000 Z" fill="url(#lit)"/>${person(750, 900, 300, "#3A4741")}`,
    guides: () => `<line x1="750" y1="40" x2="750" y2="960" ${dash}/>`,
  },
  negative: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="url(#sky)"/><rect y="860" width="${VW}" height="140" fill="${GROUND}"/>${person(1060, 875, 120)}`,
    guides: () => `<rect x="80" y="80" width="820" height="700" stroke="${GOLD}" stroke-width="6" stroke-dasharray="22 14" fill="${GOLD}" fill-opacity="0.08"/>`,
  },
  layers: {
    scene: () => `<rect width="${VW}" height="${VH}" fill="url(#sky)"/>
      <rect x="0" y="560" width="${VW}" height="440" fill="${GROUND}"/>
      ${[[1150, 350, 180, 300], [1350, 300, 120, 360]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#5B6E63"/>`).join("")}
      ${person(820, 820, 420)}
      <g filter="url(#blur)">${[[60, 980, 260, 150], [300, 1020, 220, 120], [-20, 700, 160, 220], [1480, 1000, 220, 140], [40, 80, 200, 150]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2F5A3F"/>`).join("")}</g>`,
    guides: () => `<rect x="690" y="370" width="260" height="480" rx="40" ${dash}/>`,
  },
  pattern: {
    scene: () => {
      let s = `<rect width="${VW}" height="${VH}" fill="${DARK}"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) s += `<circle cx="${180 + c * 190}" cy="${200 + r * 200}" r="66" fill="${r === 1 && c === 4 ? GOLD : MID}"/>`;
      return s;
    },
    guides: () => `<circle cx="${180 + 4 * 190}" cy="400" r="98" ${solid}/>`,
  },
};

async function render(key, outDir, { scene = true } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const d = D[key];
  const body = (scene ? d.scene() : "") + d.guides(scene);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}">${bg}${body}</svg>`;
  const out = path.join(outDir, `comp_${key}${scene ? "" : "_lines"}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
  return out;
}

module.exports = { render, KEYS: Object.keys(D) };
