// 3회차 편집 도식 (SVG → PNG). CapCut PC 화면을 그대로 캡처한 것이 아니라 구조를 설명하는 그림이다.
// 한글 글꼴: Pretendard가 시스템에 설치돼 있어야 한다(build/assets/fonts의 woff2를 OTF로 바꿔 ~/.fonts에).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const GOLD = "#D6A23C", INK = "#121816", PINE = "#1F5A43", RED = "#B8473E", BLUE = "#3B6F97", LIGHT = "#E6EEE9";
const UI = { bg: "#17191B", panel: "#202326", line: "#2E3236", text: "#C9CED2", dim: "#7C848B", clip: "#3D6E8F", clip2: "#5E7F62", txt: "#7A5AA6", aud: "#2F8F6B", play: "#F2F2F2" };
const F = `font-family="Pretendard"`;
const t = (x, y, s, size = 26, fill = UI.text, w = 600, anchor = "start") => `<text x="${x}" y="${y}" ${F} font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const badge = (x, y, n, r = 26) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}"/><text x="${x}" y="${y + r * 0.38}" ${F} font-size="${r * 1.1}" font-weight="800" fill="${INK}" text-anchor="middle">${n}</text>`;
const defs = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F9AB3"/><stop offset="1" stop-color="#C9B88E"/></linearGradient>
  <linearGradient id="sky2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F5A4A"/><stop offset="1" stop-color="#8FB08A"/></linearGradient>
  <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A5A3A"/><stop offset="1" stop-color="#E0B070"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
  <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${GOLD}"/></marker>
</defs>`;
// 장면 그림(사진 대신): 하늘 + 땅 + 사람
const scene = (x, y, w, h, kind = "sky", person = true) => {
  const g = kind === "sky" ? "url(#sky)" : kind === "warm" ? "url(#warm)" : "url(#sky2)";
  const pr = Math.min(w, h);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${g}"/>
    <rect x="${x}" y="${y + h * 0.68}" width="${w}" height="${h * 0.32}" fill="#3E5A44" opacity="0.85"/>` +
    (person ? `<circle cx="${x + w * 0.5}" cy="${y + h * 0.45}" r="${pr * 0.08}" fill="${INK}" opacity="0.85"/>
    <rect x="${x + w * 0.5 - pr * 0.1}" y="${y + h * 0.53}" width="${pr * 0.2}" height="${h * 0.35}" rx="${pr * 0.07}" fill="${INK}" opacity="0.85"/>` : "");
};
const phone = (x, y, h, inner) => {
  const w = h * 9 / 16;
  return `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="26" fill="#0E1110"/>
    <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><rect width="${w}" height="${h}" fill="#000"/>${inner(w, h)}</svg>`;
};

// CapCut PC 화면 구조. hi = 강조할 구역 번호(1~5), 없으면 전체
function ui(hi) {
  const W = 1600, H = 900;
  const zones = { 1: [0, 50, 520, 490], 2: [520, 50, 560, 490], 3: [1080, 50, 520, 490], 4: [0, 540, 1600, 360], 5: [1360, 6, 230, 40] };
  let s = `<rect width="${W}" height="${H}" fill="${UI.bg}"/>`;
  // 위쪽 막대
  s += `<rect width="${W}" height="50" fill="#121416"/>` + t(30, 33, "CapCut", 22, UI.dim, 700) + t(800, 33, "3회차_내이름", 20, UI.dim, 600, "middle");
  s += `<rect x="1460" y="10" width="120" height="32" rx="8" fill="#2D8CFF"/>` + t(1520, 33, "내보내기", 18, "#fff", 700, "middle");
  // ① 도구 탭 + 자료 창
  s += `<rect x="0" y="50" width="520" height="490" fill="${UI.panel}"/>`;
  ["미디어", "오디오", "텍스트", "스티커", "효과", "전환", "필터", "조정"].forEach((n, i) => {
    const x = 14 + i * 63;
    s += `<rect x="${x + 14}" y="62" width="34" height="30" rx="6" fill="${i === 0 ? "#2D8CFF" : UI.line}"/>` + t(x + 31, 112, n, 14, i === 0 ? "#fff" : UI.dim, 600, "middle");
  });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = 30 + c * 160, y = 140 + r * 128;
    s += `<svg x="${x}" y="${y}" width="140" height="100">${scene(0, 0, 140, 100, ["sky", "warm", "green"][(r + c) % 3], (r + c) % 2 === 0)}</svg>`;
  }
  // ② 재생 화면
  s += `<rect x="520" y="50" width="560" height="490" fill="#101214"/>`;
  s += phone(722, 72, 400, (w, h) => scene(0, 0, w, h, "sky"));
  s += `<rect x="560" y="500" width="480" height="4" rx="2" fill="${UI.line}"/><circle cx="700" cy="502" r="8" fill="${UI.play}"/>` + t(1040, 528, "9:16", 16, UI.dim, 700, "end");
  // ③ 속성 패널
  s += `<rect x="1080" y="50" width="520" height="490" fill="${UI.panel}"/>`;
  ["비디오", "오디오", "속도", "애니메이션", "조정"].forEach((n, i) => { s += t(1110 + i * 95, 88, n, 17, i === 0 ? "#fff" : UI.dim, 700); });
  s += `<rect x="1100" y="98" width="70" height="3" fill="#2D8CFF"/>`;
  ["위치", "크기", "회전", "불투명도", "혼합", "마스크", "컷아웃"].forEach((n, i) => {
    const y = 140 + i * 52;
    s += t(1110, y + 8, n, 17, UI.text, 600) + `<rect x="1240" y="${y - 2}" width="250" height="5" rx="2" fill="${UI.line}"/><circle cx="${1300 + (i * 37) % 160}" cy="${y}" r="9" fill="${UI.text}"/>`;
    if (i < 4) s += `<path d="M1540 ${y - 10} L1550 ${y} L1540 ${y + 10} L1530 ${y} Z" fill="none" stroke="${UI.dim}" stroke-width="2.5"/>`;
  });
  // ④ 타임라인
  s += `<rect x="0" y="540" width="${W}" height="360" fill="#141618"/><rect x="0" y="540" width="${W}" height="44" fill="#1A1C1F"/>`;
  ["↶", "↷", "✂", "⎘", "🗑"].forEach((n, i) => { s += t(30 + i * 46, 570, n, 20, UI.dim, 600); });
  for (let k = 0; k < 16; k++) s += t(150 + k * 90, 604, `${String(k).padStart(2, "0")}:00`, 12, UI.dim, 500);
  s += `<rect x="150" y="625" width="420" height="42" rx="6" fill="${UI.txt}"/>` + t(165, 653, "제목 텍스트", 16, "#fff", 700);
  s += `<rect x="560" y="680" width="380" height="54" rx="6" fill="${UI.clip2}"/>` + t(575, 713, "위 트랙 영상", 16, "#fff", 700);
  [[150, 260], [415, 210], [630, 300], [935, 240], [1180, 290]].forEach(([x, w], i) => {
    s += `<rect x="${x}" y="748" width="${w - 6}" height="64" rx="6" fill="${UI.clip}"/>` + t(x + 12, 786, `컷 ${i + 1}`, 16, "#fff", 700);
  });
  s += `<rect x="150" y="826" width="1320" height="44" rx="6" fill="${UI.aud}"/>`;
  for (let k = 0; k < 130; k++) { const hh = 6 + 14 * Math.abs(Math.sin(k * 0.7)); s += `<rect x="${160 + k * 10}" y="${848 - hh / 2}" width="4" height="${hh}" fill="#BFE7D6" opacity="0.8"/>`; }
  s += `<line x1="700" y1="590" x2="700" y2="890" stroke="${UI.play}" stroke-width="3"/><path d="M688 590 L712 590 L700 606 Z" fill="${UI.play}"/>`;
  // 강조
  if (hi) {
    const [zx, zy, zw, zh] = zones[hi];
    s += `<path d="M0 0 H${W} V${H} H0 Z M${zx} ${zy} V${zy + zh} H${zx + zw} V${zy} Z" fill="#000" fill-opacity="0.62" fill-rule="evenodd"/>`;
    s += `<rect x="${zx + 2}" y="${zy + 2}" width="${zw - 4}" height="${zh - 4}" fill="none" stroke="${GOLD}" stroke-width="5"/>`;
  } else {
    const pos = { 1: [36, 140], 2: [560, 100], 3: [1120, 140], 4: [100, 640], 5: [1425, 26] };
    Object.entries(pos).forEach(([n, [x, y]]) => { s += badge(x, y, n, 28); });
  }
  return { W, H, s };
}

// 타임라인 확대: 재생헤드 · 트랙 · 메인 트랙 · 클립 · 오디오
function timeline() {
  const W = 1600, H = 760;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  for (let k = 0; k < 14; k++) s += t(250 + k * 100, 40, `${String(k).padStart(2, "0")}:00`, 15, UI.dim, 500);
  const rows = [["텍스트 트랙", 110, UI.txt, [[300, 420, "제목"]]], ["위 트랙", 230, UI.clip2, [[620, 380, "화면 속 화면"]]], ["메인 트랙", 350, UI.clip, [[250, 260, "컷 1"], [516, 220, "컷 2"], [742, 300, "컷 3"], [1048, 250, "컷 4"], [1304, 260, "컷 5"]]], ["오디오", 480, UI.aud, [[250, 1310, "음악"]]]];
  rows.forEach(([n, y, col, clips]) => {
    s += t(40, y + 48, n, 22, n === "메인 트랙" ? GOLD : UI.text, 800);
    s += `<rect x="240" y="${y}" width="1330" height="90" fill="#1A1C1F"/>`;
    clips.forEach(([x, w, l]) => { s += `<rect x="${x}" y="${y + 8}" width="${w - 6}" height="74" rx="8" fill="${col}"/>` + t(x + 16, y + 55, l, 20, "#fff", 700); });
  });
  for (let k = 0; k < 128; k++) { const hh = 8 + 26 * Math.abs(Math.sin(k * 0.6)); s += `<rect x="${262 + k * 10}" y="${525 - hh / 2}" width="4" height="${hh}" fill="#BFE7D6" opacity="0.8"/>`; }
  s += `<line x1="820" y1="60" x2="820" y2="600" stroke="${UI.play}" stroke-width="4"/><path d="M804 60 L836 60 L820 82 Z" fill="${UI.play}"/>`;
  s += `<rect x="760" y="615" width="120" height="40" rx="8" fill="${GOLD}"/>` + t(820, 643, "재생헤드", 20, INK, 800, "middle");
  s += `<path d="M1585 520 L1585 140" stroke="${GOLD}" stroke-width="6" marker-end="url(#ah)"/>` + t(1560, 700, "위 트랙일수록 화면 앞", 22, GOLD, 800, "end");
  return { W, H, s };
}

// 자르는 네 가지 방법
function cuts() {
  const W = 1600, H = 900;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const box = (ox, oy, title, key, mode) => {
    let b = `<rect x="${ox}" y="${oy}" width="760" height="410" rx="18" fill="#1D2023"/>` + t(ox + 30, oy + 52, title, 30, "#fff", 800);
    b += `<rect x="${ox + 560}" y="${oy + 20}" width="170" height="46" rx="10" fill="${GOLD}"/>` + t(ox + 645, oy + 52, key, 24, INK, 800, "middle");
    const y1 = oy + 130, y2 = oy + 280, cx = ox + 380;
    b += t(ox + 30, y1 - 14, "전", 18, UI.dim, 700) + `<rect x="${ox + 60}" y="${y1}" width="640" height="70" rx="8" fill="${UI.clip}"/>`;
    b += `<line x1="${cx}" y1="${y1 - 20}" x2="${cx}" y2="${y1 + 90}" stroke="${UI.play}" stroke-width="4"/>`;
    b += t(ox + 30, y2 - 14, "후", 18, UI.dim, 700);
    if (mode === "split") b += `<rect x="${ox + 60}" y="${y2}" width="${cx - ox - 64}" height="70" rx="8" fill="${UI.clip}"/><rect x="${cx + 4}" y="${y2}" width="${ox + 700 - cx - 4}" height="70" rx="8" fill="${UI.clip}"/>` + t(cx, y2 + 115, "두 조각으로", 20, GOLD, 700, "middle");
    if (mode === "left") b += `<rect x="${ox + 60}" y="${y2}" width="${ox + 700 - cx}" height="70" rx="8" fill="${UI.clip}"/>` + t(ox + 380, y2 + 115, "왼쪽이 사라지고 앞으로 당겨짐", 20, GOLD, 700, "middle");
    if (mode === "right") b += `<rect x="${ox + 60}" y="${y2}" width="${cx - ox - 60}" height="70" rx="8" fill="${UI.clip}"/>` + t(ox + 380, y2 + 115, "오른쪽이 사라짐", 20, GOLD, 700, "middle");
    if (mode === "trim") b += `<rect x="${ox + 60}" y="${y2}" width="470" height="70" rx="8" fill="${UI.clip}"/><rect x="${ox + 522}" y="${y2}" width="10" height="70" rx="3" fill="${GOLD}"/><path d="M${ox + 690} ${y2 + 35} L${ox + 560} ${y2 + 35}" stroke="${GOLD}" stroke-width="5" marker-end="url(#ah)"/>` + t(ox + 380, y2 + 115, "끝을 잡고 끌기", 20, GOLD, 700, "middle");
    return b;
  };
  s += box(30, 30, "분할", "Ctrl + B", "split") + box(810, 30, "왼쪽 삭제", "Q", "left") + box(30, 460, "오른쪽 삭제", "W", "right") + box(810, 460, "끝 끌기 (트림)", "드래그", "trim");
  return { W, H, s };
}

// 가로 컷을 세로 화면에
function fit() {
  const W = 1600, H = 900;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const ph = 660, pw = ph * 9 / 16;
  const opts = [["그대로", "위아래 검은 띠", (w, h) => `<svg x="0" y="${(h - w * 9 / 16) / 2}" width="${w}" height="${w * 9 / 16}">${scene(0, 0, w, w * 9 / 16, "sky")}</svg>`],
    ["크게 키우기", "양옆이 잘림", (w, h) => `<svg x="${-(h * 16 / 9 - w) / 2}" y="0" width="${h * 16 / 9}" height="${h}">${scene(0, 0, h * 16 / 9, h, "sky")}</svg>`],
    ["배경 흐림 채우기", "위아래를 흐린 같은 영상으로", (w, h) => `<g filter="url(#blur)"><svg x="${-(h * 16 / 9 - w) / 2}" y="0" width="${h * 16 / 9}" height="${h}">${scene(0, 0, h * 16 / 9, h, "sky")}</svg></g><svg x="0" y="${(h - w * 9 / 16) / 2}" width="${w}" height="${w * 9 / 16}">${scene(0, 0, w, w * 9 / 16, "sky")}</svg>`]];
  opts.forEach(([h1, h2, inner], i) => {
    const x = 180 + i * 470;
    s += phone(x, 60, ph, inner) + t(x + pw / 2, 790, h1, 32, i === 2 ? GOLD : "#fff", 800, "middle") + t(x + pw / 2, 835, h2, 22, UI.dim, 600, "middle");
  });
  return { W, H, s };
}

// 색 맞추기: 전(컷마다 다른 색) / 후(같은 색)
function color() {
  const W = 1600, H = 720;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const tints = ["#F4C07A", "#7FA6D8", "#FFFFFF", "#E39A9A", "#B8E0A8"];
  ["전 · 컷마다 색이 다름", "후 · 기준 컷에 맞춤"].forEach((lab, r) => {
    s += t(40, 70 + r * 340, lab, 28, r ? GOLD : "#fff", 800);
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 310, y = 95 + r * 340;
      s += `<svg x="${x}" y="${y}" width="290" height="200">${scene(0, 0, 290, 200, "sky", i % 2 === 0)}<rect width="290" height="200" fill="${r ? "#F2D8A8" : tints[i]}" opacity="${r ? 0.18 : 0.38}" style="mix-blend-mode:multiply"/></svg>`;
      if (r && i === 2) s += `<rect x="${x - 4}" y="${y - 4}" width="298" height="208" fill="none" stroke="${GOLD}" stroke-width="6"/>` + t(x + 145, y + 240, "기준 컷", 22, GOLD, 800, "middle");
    }
  });
  return { W, H, s };
}

// 소리 네 층
function audio() {
  const W = 1600, H = 720;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const rows = [["말 (목소리)", "#E6C36A", 1.0, 0], ["현장음", "#8FB0C9", 0.45, 0], ["음악", "#6FC1A0", 0.35, 1], ["효과음", "#D98A7A", 0.9, 2]];
  rows.forEach(([n, col, vol, kind], i) => {
    const y = 60 + i * 160;
    s += t(40, y + 70, n, 26, "#fff", 800) + `<rect x="300" y="${y}" width="1260" height="120" rx="10" fill="#1D2023"/>`;
    for (let k = 0; k < 120; k++) {
      let on = kind === 2 ? (k % 40 < 4) : kind === 0 && i === 0 ? (Math.sin(k * 0.21) > -0.2) : true;
      let a = vol * (kind === 1 && k > 100 ? (120 - k) / 20 : 1);
      const hh = on ? (10 + 80 * Math.abs(Math.sin(k * 0.9 + i)) * a) : 0;
      if (hh) s += `<rect x="${310 + k * 10.4}" y="${y + 60 - hh / 2}" width="5" height="${hh}" fill="${col}"/>`;
    }
    const ly = y + 120 - vol * 100;
    s += kind === 1 ? `<polyline points="300,${ly} 1350,${ly} 1560,${y + 115}" fill="none" stroke="#fff" stroke-width="4"/>` + t(1450, y - 8, "페이드 아웃", 20, GOLD, 800, "middle")
      : `<line x1="300" y1="${ly}" x2="1560" y2="${ly}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" opacity="0.7"/>`;
  });
  s += t(1560, 700, "흰 선 = 볼륨. 말이 가장 크게, 음악은 낮게", 22, GOLD, 800, "end");
  return { W, H, s };
}

// 레이어 쌓기 (투명 필름 펼친 그림)
function layers() {
  const W = 1600, H = 900;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const sheet = (y, inner, label, sub) => {
    const tr = `matrix(1 0 -0.55 0.45 ${520} ${y})`;
    return `<g transform="${tr}"><rect x="0" y="0" width="560" height="560" rx="10" fill="#000" opacity="0.25"/>${inner}<rect x="0" y="0" width="560" height="560" rx="10" fill="none" stroke="${GOLD}" stroke-width="4"/></g>` +
      t(980, y + 150, label, 30, "#fff", 800) + t(980, y + 190, sub, 22, UI.dim, 600);
  };
  s += sheet(560, scene(0, 0, 560, 560, "sky2", false), "맨 아래 · 메인 트랙", "배경 영상");
  s += sheet(320, `<circle cx="280" cy="250" r="60" fill="${LIGHT}"/><rect x="215" y="310" width="130" height="220" rx="50" fill="${LIGHT}"/>`, "가운데 · 위 트랙", "배경을 지운 인물 (자동 컷아웃)");
  s += sheet(80, `<text x="280" y="140" ${F} font-size="110" font-weight="800" fill="#fff" text-anchor="middle">첫 빵</text>`, "맨 위 · 텍스트 트랙", "제목 글자");
  s += `<path d="M160 820 L160 120" stroke="${GOLD}" stroke-width="7" marker-end="url(#ah)"/>` + t(190, 480, "위로 갈수록", 26, GOLD, 800) + t(190, 516, "화면 앞", 26, GOLD, 800);
  return { W, H, s };
}

// 마스크 모양 여섯 가지
function masks() {
  const W = 1600, H = 820;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const shapes = [["선형", (w, h) => `<rect x="0" y="0" width="${w}" height="${h * 0.55}"/>`], ["미러", (w, h) => `<rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.4}"/>`], ["원", (w, h) => `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.3}" ry="${h * 0.38}"/>`], ["사각형", (w, h) => `<rect x="${w * 0.2}" y="${h * 0.18}" width="${w * 0.6}" height="${h * 0.64}" rx="14"/>`],
    ["하트", (w, h) => `<path d="M${w / 2} ${h * 0.82} C ${w * 0.05} ${h * 0.5}, ${w * 0.18} ${h * 0.1}, ${w / 2} ${h * 0.32} C ${w * 0.82} ${h * 0.1}, ${w * 0.95} ${h * 0.5}, ${w / 2} ${h * 0.82} Z"/>`],
    ["별", (w, h) => { const pts = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.17 : 0.4, a = -Math.PI / 2 + k * Math.PI / 5; pts.push(`${w / 2 + Math.cos(a) * w * r * 1.1},${h / 2 + Math.sin(a) * h * r}`); } return `<polygon points="${pts.join(" ")}"/>`; }]];
  shapes.forEach(([n, shp], i) => {
    const x = 40 + (i % 3) * 520, y = 30 + Math.floor(i / 3) * 400, w = 480, h = 300;
    s += `<svg x="${x}" y="${y}" width="${w}" height="${h}"><defs><clipPath id="m${i}">${shp(w, h)}</clipPath></defs>${scene(0, 0, w, h, "warm", false)}<rect width="${w}" height="${h}" fill="#000" opacity="0.72"/><g clip-path="url(#m${i})">${scene(0, 0, w, h, "sky")}</g></svg>`;
    s += t(x + w / 2, y + h + 50, n, 30, "#fff", 800, "middle");
  });
  return { W, H, s };
}

// 글자 뒤로 지나가는 사람
function textbehind() {
  const W = 1600, H = 820;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  const rows = [["3 · 맨 위", "같은 영상 복제 + 자동 컷아웃 (사람만)", UI.clip2], ["2 · 가운데", "큰 글자", UI.txt], ["1 · 메인", "원본 영상", UI.clip]];
  rows.forEach(([a, b, col], i) => { const y = 90 + i * 140; s += `<rect x="40" y="${y}" width="640" height="100" rx="12" fill="${col}"/>` + t(70, y + 45, a, 26, "#fff", 800) + t(70, y + 82, b, 20, "#EEF", 600); });
  s += t(360, 60, "타임라인 (위가 앞)", 24, GOLD, 800, "middle");
  s += `<path d="M720 320 L860 320" stroke="${GOLD}" stroke-width="7" marker-end="url(#ah)"/>`;
  s += phone(1000, 50, 700, (w, h) => scene(0, 0, w, h, "sky", false) + `<text x="${w / 2}" y="${h * 0.42}" ${F} font-size="${w * 0.32}" font-weight="800" fill="#fff" text-anchor="middle">SALE</text>` + `<circle cx="${w * 0.42}" cy="${h * 0.34}" r="${w * 0.09}" fill="${INK}"/><rect x="${w * 0.32}" y="${h * 0.4}" width="${w * 0.2}" height="${h * 0.5}" rx="${w * 0.08}" fill="${INK}"/>`);
  s += t(1197, 800, "사람이 글자 앞을 지나감", 24, GOLD, 800, "middle");
  return { W, H, s };
}

// 키프레임: 두 점과 그 사이
function keyframe() {
  const W = 1600, H = 900;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  [[1.0, "100%"], [1.1, "110% · CapCut이 채움"], [1.2, "120%"]].forEach(([k, lab], i) => {
    const x = 150 + i * 470, w = 360, h = 240;
    s += `<svg x="${x}" y="60" width="${w}" height="${h}" viewBox="${(w - w / k) / 2} ${(h - h / k) / 2} ${w / k} ${h / k}">${scene(0, 0, w, h, "sky")}</svg>`;
    s += `<rect x="${x}" y="60" width="${w}" height="${h}" fill="none" stroke="${i === 1 ? UI.dim : GOLD}" stroke-width="4" ${i === 1 ? 'stroke-dasharray="12 10"' : ""}/>` + t(x + w / 2, 345, lab, 24, i === 1 ? UI.dim : "#fff", 800, "middle");
  });
  s += `<rect x="100" y="470" width="1400" height="110" rx="12" fill="${UI.clip}"/>`;
  const dia = (x) => `<path d="M${x} 495 L${x + 30} 525 L${x} 555 L${x - 30} 525 Z" fill="${GOLD}" stroke="#fff" stroke-width="3"/>`;
  s += dia(300) + dia(1100) + `<line x1="335" y1="525" x2="1065" y2="525" stroke="#fff" stroke-width="5" stroke-dasharray="16 12"/>`;
  s += `<line x1="300" y1="430" x2="300" y2="610" stroke="${UI.play}" stroke-width="4"/>`;
  const step = (x, n, l1, l2) => badge(x, 680, n, 30) + t(x, 745, l1, 24, "#fff", 800, "middle") + t(x, 780, l2, 20, UI.dim, 600, "middle");
  s += step(220, 1, "재생헤드 시작", "시작 위치로") + step(520, 2, "◇ 누르기", "첫 점") + step(880, 3, "재생헤드 끝", "3초 뒤로") + step(1180, 4, "값 바꾸기", "두 번째 점 자동");
  s += t(700, 455, "두 점 사이는 CapCut이 자동으로 채움", 22, GOLD, 800, "middle");
  return { W, H, s };
}

// 원 마스크 리빌
function reveal() {
  const W = 1600, H = 620;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  [0.08, 0.35, 0.9].forEach((r, i) => {
    const x = 60 + i * 520, w = 460, h = 460;
    s += `<svg x="${x}" y="40" width="${w}" height="${h}"><defs><clipPath id="r${i}"><circle cx="${w / 2}" cy="${h / 2}" r="${w * r}"/></clipPath></defs>${scene(0, 0, w, h, "warm")}<g clip-path="url(#r${i})">${scene(0, 0, w, h, "sky2")}</g><circle cx="${w / 2}" cy="${h / 2}" r="${w * r}" fill="none" stroke="${GOLD}" stroke-width="5"/></svg>`;
    s += t(x + w / 2, 560, ["시작 · 작은 원", "키프레임으로 키우기", "끝 · 다음 장면 전체"][i], 26, "#fff", 800, "middle");
    if (i < 2) s += `<path d="M${x + w + 10} 270 L${x + w + 50} 270" stroke="${GOLD}" stroke-width="6" marker-end="url(#ah)"/>`;
  });
  return { W, H, s };
}

// 분할 화면 (선형 마스크)
function split() {
  const W = 1600, H = 820;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/>`;
  s += phone(560, 40, 720, (w, h) => `<svg width="${w}" height="${h / 2}">${scene(0, 0, w, h / 2, "warm")}</svg><svg y="${h / 2}" width="${w}" height="${h / 2}">${scene(0, 0, w, h / 2, "sky2")}</svg><line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="#fff" stroke-width="5"/>`);
  s += t(500, 230, "비포", 40, "#fff", 800, "end") + t(500, 590, "애프터", 40, GOLD, 800, "end");
  s += t(1000, 230, "위 트랙 클립 + 선형 마스크", 26, "#fff", 800) + t(1000, 590, "메인 트랙 클립", 26, "#fff", 800);
  return { W, H, s };
}

// 내보내기 창 예시
function exportbox() {
  const W = 1200, H = 900;
  let s = `<rect width="${W}" height="${H}" fill="#141618"/><rect x="100" y="60" width="1000" height="780" rx="18" fill="#22262A"/>`;
  s += t(150, 130, "내보내기", 34, "#fff", 800) + t(1050, 130, "실제 화면과 다를 수 있음", 18, UI.dim, 600, "end");
  [["이름", "1119_내채널_첫빵"], ["저장 위치", "바탕화면 > 3회차"], ["해상도", "1080p"], ["프레임 속도", "30fps (촬영과 같게)"], ["형식", "MP4"], ["코덱", "H.264 (호환성)"]].forEach(([k, v], i) => {
    const y = 200 + i * 95;
    s += t(150, y + 36, k, 26, UI.text, 700) + `<rect x="420" y="${y}" width="620" height="56" rx="10" fill="#15181B" stroke="${i > 1 ? GOLD : UI.line}" stroke-width="${i > 1 ? 3 : 2}"/>` + t(445, y + 37, v, 24, "#fff", 700);
  });
  s += `<rect x="840" y="760" width="200" height="56" rx="10" fill="#2D8CFF"/>` + t(940, 797, "내보내기", 24, "#fff", 800, "middle");
  return { W, H, s };
}

const D = { ui1: () => ui(1), ui2: () => ui(2), ui3: () => ui(3), ui4: () => ui(4), ui5: () => ui(5), ui: () => ui(), timeline, cuts, fit, color, audio, layers, masks, textbehind, keyframe, reveal, split, exportbox };

async function render(key, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const { W, H, s } = D[key]();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${s}</svg>`;
  const out = path.join(outDir, `edit_${key}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
  return { path: out, ratio: W / H };
}

module.exports = { render, KEYS: Object.keys(D) };
