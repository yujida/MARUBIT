// 현장 촬영 기법 도식 (SVG → PNG). 대부분 위에서 내려다본 평면도: 원 = 사람, 카메라 + 금색 화각.
// 한글은 넣지 않는다(라틴 글자 · 숫자만 Inter로).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const GOLD = "#D6A23C", LIGHT = "#E6EEE9", MID = "#3A4741", DIM = "#6E7A74", RED = "#B8473E", BLUE = "#3B6F97";
const FONT = `font-family="Inter" font-weight="700"`;

const defs = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26302C"/><stop offset="1" stop-color="#171D1A"/></linearGradient>
  <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${GOLD}"/></marker>
  <marker id="aw" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${LIGHT}"/></marker>
  <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b14"><feGaussianBlur stdDeviation="14"/></filter>
</defs>`;

// 카메라(위에서 본 모습) + 화각. a = 바라보는 방향(도, 0 = 오른쪽), fov = 화각(도)
function cam(x, y, a, { fov = 50, len = 330, ghost = false, color = GOLD } = {}) {
  const op = ghost ? 0.35 : 1;
  const t = Math.tan(((fov / 2) * Math.PI) / 180) * len;
  return `<g transform="translate(${x} ${y}) rotate(${a})" opacity="${op}">
    <polygon points="44,0 ${len},${-t} ${len},${t}" fill="${color}" fill-opacity="0.13"/>
    <line x1="44" y1="0" x2="${len}" y2="${-t}" stroke="${color}" stroke-opacity="0.5" stroke-width="3"/><line x1="44" y1="0" x2="${len}" y2="${t}" stroke="${color}" stroke-opacity="0.5" stroke-width="3"/>
    <rect x="-42" y="-30" width="66" height="60" rx="10" fill="${LIGHT}"/><rect x="22" y="-17" width="24" height="34" rx="4" fill="${LIGHT}"/>
    <circle cx="-10" cy="0" r="11" fill="${MID}"/></g>`;
}
// 사람(위에서 본 모습): 어깨 타원 + 머리. a = 바라보는 방향
function head(x, y, a = 90, { fill = LIGHT, s = 1, label } = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><ellipse cx="-6" cy="0" rx="26" ry="56" fill="${fill}" opacity="0.55"/><circle cx="0" cy="0" r="30" fill="${fill}"/><circle cx="26" cy="0" r="7" fill="${MID}"/></g>` +
    (label ? `<text x="${x}" y="${y + 92 * s}" ${FONT} font-size="34" fill="${LIGHT}" text-anchor="middle">${label}</text>` : "");
}
const arrow = (d, o = "") => `<path d="${d}" stroke="${GOLD}" stroke-width="8" fill="none" stroke-linecap="round" marker-end="url(#ah)" ${o}/>`;
const dashed = (d, col = GOLD, w = 6) => `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-dasharray="20 14" fill="none" stroke-linecap="round"/>`;
const tag = (x, y, t, col = GOLD) => `<circle cx="${x}" cy="${y}" r="26" fill="${col}"/><text x="${x}" y="${y + 11}" ${FONT} font-size="30" fill="#121816" text-anchor="middle">${t}</text>`;
const post = (x, y, r = 22, fill = MID) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

const W1 = 1200, H1 = 800;
const D = {
  dolly: () => `${head(930, 400, 180)}${cam(330, 400, 0, { ghost: true, len: 560 })}${cam(620, 400, 0, { len: 280 })}
    ${arrow("M 360 520 L 600 520")}${arrow("M 600 580 L 360 580", 'stroke-opacity="0.45"')}`,
  truck: () => `${[180, 420, 660, 900].map((x) => post(x, 150, 26, DIM)).join("")}${head(600, 260, 90)}
    ${post(560, 470, 34, "#556159")}
    ${cam(300, 660, -90, { ghost: true, len: 460 })}${cam(880, 660, -90, { len: 460 })}${arrow("M 380 740 L 800 740")}`,
  pedestal: () => `<line x1="80" y1="700" x2="1120" y2="700" stroke="${DIM}" stroke-width="6"/>
    <g fill="${LIGHT}"><circle cx="880" cy="330" r="48"/><rect x="835" y="390" width="90" height="310" rx="40"/></g>
    <g transform="translate(330 560)" opacity="0.35">${camSide()}</g><g transform="translate(330 220)">${camSide(18)}</g>
    ${arrow("M 200 540 L 200 250")}
    <line x1="330" y1="610" x2="330" y2="700" stroke="${DIM}" stroke-width="8"/>`,
  arc: () => `<circle cx="600" cy="400" r="290" stroke="${DIM}" stroke-width="3" stroke-dasharray="10 12" fill="none"/>${head(600, 400, 90)}
    ${cam(600 + 290 * Math.cos(Math.PI * 0.85), 400 + 290 * Math.sin(Math.PI * 0.85), -27, { ghost: true, len: 260 })}
    ${cam(600 + 290 * Math.cos(Math.PI * 0.35), 400 + 290 * Math.sin(Math.PI * 0.35), 243, { len: 260 })}
    <path d="M ${600 + 340 * Math.cos(Math.PI * 0.8)} ${400 + 340 * Math.sin(Math.PI * 0.8)} A 340 340 0 0 0 ${600 + 340 * Math.cos(Math.PI * 0.42)} ${400 + 340 * Math.sin(Math.PI * 0.42)}" stroke="${GOLD}" stroke-width="8" fill="none" marker-end="url(#ah)"/>`,
  reveal: () => `${head(900, 260, 180)}<rect x="500" y="330" width="150" height="220" rx="12" fill="#556159"/>
    ${cam(300, 650, -38, { ghost: true, len: 300 })}${cam(300, 300, -2, { len: 560, fov: 40 })}${arrow("M 190 620 L 190 340")}`,
  whip: () => `${head(220, 180, 90)}${head(980, 180, 90)}
    ${cam(600, 600, -125, { ghost: true, len: 420, fov: 40 })}${cam(600, 600, -55, { len: 420, fov: 40 })}
    ${[300, 340, 380].map((r, i) => `<path d="M ${600 + r * Math.cos(-2.05)} ${600 + r * Math.sin(-2.05)} A ${r} ${r} 0 0 1 ${600 + r * Math.cos(-1.1)} ${600 + r * Math.sin(-1.1)}" stroke="${GOLD}" stroke-opacity="${0.35 + i * 0.3}" stroke-width="${5 + i * 2}" fill="none" ${i === 2 ? 'marker-end="url(#ah)"' : ""}/>`).join("")}`,
  dollyzoom: () => {
    const sx = 760, wall = 1120, r = 70;
    const cone = (cx, col, op) => {
      const k = r / (sx - cx), y1 = 400 - k * (wall - cx), y2 = 400 + k * (wall - cx);
      return `<polygon points="${cx + 40},400 ${wall},${y1} ${wall},${y2}" fill="${col}" fill-opacity="${op}"/>
        <line x1="${cx + 40}" y1="400" x2="${wall}" y2="${y1}" stroke="${col}" stroke-width="3"/><line x1="${cx + 40}" y1="400" x2="${wall}" y2="${y2}" stroke="${col}" stroke-width="3"/>
        <line x1="${wall + 22}" y1="${y1}" x2="${wall + 22}" y2="${y2}" stroke="${col}" stroke-width="10"/>`;
    };
    return `<rect x="${wall}" y="60" width="18" height="680" fill="${DIM}"/>${cone(180, LIGHT, 0.06)}${cone(480, GOLD, 0.14)}
      ${cam(180, 400, 0, { len: 1, ghost: true })}${cam(480, 400, 0, { len: 1 })}${head(sx, 400, 180)}
      ${arrow("M 450 560 L 220 560")}<text x="335" y="630" ${FONT} font-size="34" fill="${LIGHT}" text-anchor="middle">ZOOM IN</text>`;
  },
  oner: () => `<g stroke="${DIM}" stroke-width="10" fill="none"><rect x="80" y="80" width="420" height="300"/><rect x="500" y="80" width="620" height="300"/><rect x="80" y="380" width="1040" height="340"/></g>
    <g stroke="url(#bg)" stroke-width="16"><line x1="420" y1="380" x2="490" y2="380" stroke="#1E2622"/><line x1="500" y1="200" x2="500" y2="270" stroke="#1E2622"/></g>
    ${dashed("M 180 620 C 400 640, 470 520, 455 400 C 440 300, 380 230, 520 230 C 700 230, 760 160, 960 170")}
    ${head(1010, 175, 0, { s: 0.8 })}${cam(900, 175, 0, { len: 90, fov: 50 })}${post(180, 620, 14, GOLD)}`,
  coverage: () => {
    const A = [440, 330], B = [760, 330];
    return `<line x1="80" y1="330" x2="1120" y2="330" stroke="${RED}" stroke-width="5" stroke-dasharray="22 14"/>
      ${head(A[0], A[1], 0, { label: "A" })}${head(B[0], B[1], 180, { label: "B" })}
      ${cam(600, 720, -90, { len: 330, fov: 70 })}${tag(600, 790 - 10, "1")}
      ${cam(930, 560, -146, { len: 330, fov: 34 })}${tag(1000, 610, "2")}
      ${cam(270, 560, -34, { len: 330, fov: 34 })}${tag(200, 610, "3")}
      ${cam(660, 520, -128, { len: 150, fov: 26, color: LIGHT })}${tag(720, 590, "4", LIGHT)}
      ${cam(540, 520, -52, { len: 150, fov: 26, color: LIGHT })}${tag(480, 590, "5", LIGHT)}`;
  },
  interview: () => `<rect x="80" y="60" width="1040" height="20" fill="${DIM}"/>${dashed("M 600 100 L 600 250", LIGHT, 4)}
    ${head(600, 300, 140, { label: "" })}${head(360, 560, -40, { fill: DIM })}
    ${cam(450, 640, -62, { len: 330, fov: 52 })}${tag(400, 720, "A")}
    ${cam(860, 600, -122, { len: 300, fov: 24, color: LIGHT })}${tag(930, 670, "B", LIGHT)}
    <g transform="translate(220 230)"><rect x="-40" y="-40" width="80" height="80" rx="10" fill="${GOLD}" fill-opacity="0.85"/></g>
    <line x1="270" y1="250" x2="540" y2="290" stroke="${GOLD}" stroke-width="4" stroke-dasharray="8 10"/>`,
};

// 옆에서 본 카메라
function camSide(tilt = 0) {
  return `<g transform="rotate(${tilt})"><polygon points="60,0 640,-150 640,150" fill="${GOLD}" fill-opacity="0.12"/>
    <rect x="-55" y="-40" width="100" height="80" rx="12" fill="${LIGHT}"/><rect x="40" y="-24" width="34" height="48" rx="5" fill="${LIGHT}"/></g>`;
}

// 렌즈 3칸: 같은 크기의 인물, 화각에 따라 배경 크기가 달라진다
function lens() {
  const panel = (i, bgScale, distort) => {
    const x0 = i * 510, w = 480, h = 450;
    const bh = 120 * bgScale, bw = 90 * bgScale;
    return `<g transform="translate(${x0} 0)"><rect width="${w}" height="${h}" fill="url(#bg)"/>
      <rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="#26302B"/>
      ${[-1, 0, 1].map((k) => `<rect x="${w / 2 + k * bw * 1.25 - bw / 2}" y="${h * 0.7 - bh}" width="${bw}" height="${bh}" fill="#5B6E63"/>`).join("")}
      <g fill="${LIGHT}"><ellipse cx="${w / 2}" cy="215" rx="${62 * distort}" ry="70"/><rect x="${w / 2 - 95}" y="295" width="190" height="260" rx="80"/></g></g>`;
  };
  return { w: 1500, h: 450, body: panel(0, 0.55, 1.12) + panel(1, 1.2, 1) + panel(2, 2.6, 0.96) };
}
// 초점 이동 2칸
function rack() {
  const panel = (i, frontSharp) => {
    const x0 = i * 760, w = 720, h = 600;
    const front = `<g fill="${LIGHT}"><circle cx="250" cy="300" r="80"/><rect x="140" y="390" width="220" height="260" rx="90"/></g>`;
    const back = `<g fill="#AAB8B1"><circle cx="530" cy="250" r="44"/><rect x="470" y="300" width="120" height="200" rx="50"/></g>`;
    return `<g transform="translate(${x0} 0)"><rect width="${w}" height="${h}" fill="url(#bg)"/>
      <g ${frontSharp ? 'filter="url(#b14)"' : ""}>${back}</g><g ${frontSharp ? "" : 'filter="url(#b14)"'}>${front}</g>
      <rect x="${frontSharp ? 130 : 455}" y="${frontSharp ? 200 : 190}" width="${frontSharp ? 240 : 150}" height="${frontSharp ? 220 : 130}" fill="none" stroke="${GOLD}" stroke-width="6"/></g>`;
  };
  return { w: 1480, h: 600, body: panel(0, true) + panel(1, false) + `<path d="M 690 300 L 790 300" stroke="${GOLD}" stroke-width="10" marker-end="url(#ah)"/>` };
}

async function render(key, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  let w = W1, h = H1, body;
  if (key === "lens") ({ w, h, body } = lens());
  else if (key === "rack") ({ w, h, body } = rack());
  else body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>` + D[key]();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;
  const out = path.join(outDir, `film_${key}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
  return out;
}

module.exports = { render, KEYS: [...Object.keys(D), "lens", "rack"] };
