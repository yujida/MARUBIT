// 슬라이드 이미지 준비: 원본(build/assets/images/<회차>/imgNN.*)이 있으면 칸을 잘라 쓰고,
// 없으면 같은 비율의 자리 표시 이미지를 만든다. 결과는 build/.cache/<회차>/ 아래에 둔다.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INK = "#121816";
const PINE = "#1F5A43";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function svgPng(svg, out) {
  await sharp(Buffer.from(svg)).png().toFile(out);
  return out;
}

// 원본 파일 찾기 (png/jpg/jpeg/webp)
function findSource(dir, key) {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const p = path.join(dir, `${key}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 흰 여백(거의 흰 줄) 사이의 구간을 찾아 n개로 나눈다. 못 찾으면 균등 분할.
function splitRuns(profile, n, len) {
  const white = profile.map((v) => v > 0.97);
  const segs = [];
  let start = null;
  for (let i = 0; i < len; i++) {
    if (!white[i] && start === null) start = i;
    if ((white[i] || i === len - 1) && start !== null) {
      const end = white[i] ? i : i + 1;
      if (end - start > len * 0.04) segs.push([start, end]);
      start = null;
    }
  }
  if (segs.length === n) return segs;
  const step = len / n;
  return Array.from({ length: n }, (_, i) => [Math.round(i * step), Math.round((i + 1) * step)]);
}

async function profiles(file) {
  const { data, info } = await sharp(file).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const col = new Array(W).fill(0);
  const row = new Array(H).fill(0);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const w = data[y * W + x] > 232 ? 1 : 0;
      col[x] += w;
      row[y] += w;
    }
  }
  return { W, H, col: col.map((c) => c / H), row: row.map((r) => r / W) };
}

async function cropPanels(src, cols, rows, outBase) {
  const { W, H, col, row } = await profiles(src);
  const xs = splitRuns(col, cols, W);
  const ys = splitRuns(row, rows, H);
  const outs = [];
  let i = 0;
  for (const [y0, y1] of ys) {
    for (const [x0, x1] of xs) {
      const inset = 2;
      const out = `${outBase}_${++i}.png`;
      await sharp(src).extract({ left: x0 + inset, top: y0 + inset, width: x1 - x0 - 2 * inset, height: y1 - y0 - 2 * inset }).png().toFile(out);
      outs.push(out);
    }
  }
  return outs;
}

function placeholderSvg(w, h, label, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26302C"/><stop offset="1" stop-color="#1A221F"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="${w * 0.04}" y="${h * 0.04}" width="${w * 0.92}" height="${h * 0.92}" fill="none" stroke="#4A5752" stroke-width="2" stroke-dasharray="10 8"/>
  <text x="${w / 2}" y="${h / 2 - 6}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(Math.min(w, h) * 0.075)}" font-weight="700" fill="#D6A23C">${esc(label)}</text>
  <text x="${w / 2}" y="${h / 2 + Math.min(w, h) * 0.08}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(Math.min(w, h) * 0.05)}" fill="#9AA7A1">${esc(sub)}</text>
</svg>`;
}

// 교시 구분·표지용 배경: 사진이 없을 때 쓰는 그라데이션
function gradientSvg(seed) {
  const hues = [["#0F1513", "#1F5A43"], ["#101614", "#2A4F63"], ["#121816", "#5A4520"], ["#0F1513", "#3B2F4A"]];
  const [a, b] = hues[seed % hues.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="r" cx="0.82" cy="0.25" r="0.7"><stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#g)"/><rect width="1920" height="1080" fill="url(#r)"/>
</svg>`;
}

// 사진 위에 글자를 올릴 때 쓰는 왼쪽→오른쪽 어두운 그라데이션
function overlaySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity="0.94"/><stop offset="0.55" stop-color="${INK}" stop-opacity="0.72"/><stop offset="1" stop-color="${INK}" stop-opacity="0.15"/></linearGradient></defs>
  <rect width="1920" height="1080" fill="url(#g)"/>
</svg>`;
}

// specs: { key: { kind: "photo" | "panels", cols, rows, ratio: [w,h], label } }
async function prepare(session, specs) {
  const root = path.join(__dirname, "..");
  const srcDir = path.join(root, "assets", "images", session);
  const cache = path.join(root, ".cache", session);
  fs.mkdirSync(cache, { recursive: true });
  const out = { missing: [] };

  for (const [key, spec] of Object.entries(specs)) {
    const src = findSource(srcDir, key);
    if (!src) out.missing.push(key);
    if (spec.kind === "panels") {
      const n = spec.cols * spec.rows;
      if (src) out[key] = await cropPanels(src, spec.cols, spec.rows, path.join(cache, key));
      else {
        const [pw, ph] = spec.panelRatio || [600, 800];
        out[key] = [];
        for (let i = 1; i <= n; i++) out[key].push(await svgPng(placeholderSvg(pw, ph, `${key} · ${i}/${n}`, spec.label), path.join(cache, `${key}_${i}_ph.png`)));
      }
    } else if (spec.kind === "photo") {
      if (src) {
        const p = path.join(cache, `${key}.png`);
        await sharp(src).png().toFile(p);
        out[key] = p;
      } else if (spec.fallback === "gradient") {
        out[key] = await svgPng(gradientSvg(spec.seed || 0), path.join(cache, `${key}_grad.png`));
        out[`${key}_isFallback`] = true;
      } else {
        const [w, h] = spec.ratio || [1536, 1024];
        out[key] = await svgPng(placeholderSvg(w, h, key, spec.label), path.join(cache, `${key}_ph.png`));
      }
    }
  }
  out.overlay = await svgPng(overlaySvg(), path.join(cache, "overlay.png"));
  return out;
}

// 화이트밸런스 시연: 기준 사진 하나로 따뜻한·중립·차가운 버전을 만든다.
async function whiteBalanceSet(srcPng, cacheDir) {
  const mats = {
    warm: [[1.08, 0, 0], [0, 0.97, 0], [0, 0, 0.72]],
    neutral: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    cool: [[0.82, 0, 0], [0, 0.96, 0], [0, 0, 1.12]],
  };
  const out = {};
  for (const [k, m] of Object.entries(mats)) {
    const p = path.join(cacheDir, `wb_${k}.png`);
    await sharp(srcPng).recomb(m).png().toFile(p);
    out[k] = p;
  }
  return out;
}

module.exports = { prepare, whiteBalanceSet };
