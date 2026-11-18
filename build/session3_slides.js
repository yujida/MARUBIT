// 3회차 (11/19) 슬라이드 생성: node build/session3_slides.js [출력 경로]
// 내용 기준: build/session3/outline.md · 도식: build/lib/edit_diagrams.js
const path = require("path");
const { THEME, HEX, W, H, M, newDeck, makeKit } = require("./lib/deck");
const { prepare } = require("./lib/images");
const { render } = require("./lib/edit_diagrams");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "03", "3회차_CapCut완전정복_슬라이드.pptx");
const CW = W - 2 * M; // 본문 폭
const CACHE = path.join(__dirname, ".cache", "s3", "edit");
const TOTAL = 20; // 따라하기 사이클 수

// 표지 · 교시 구분 배경. 사진이 없으면 그라데이션으로 대신한다.
const IMAGE_SPECS = {
  img01: { kind: "photo", fallback: "gradient", seed: 0 },
  img02: { kind: "photo", fallback: "gradient", seed: 1 },
  img03: { kind: "photo", fallback: "gradient", seed: 2 },
  img04: { kind: "photo", fallback: "gradient", seed: 3 },
  img05: { kind: "photo", fallback: "gradient", seed: 1 },
  img06: { kind: "photo", fallback: "gradient", seed: 2 },
  img07: { kind: "photo", fallback: "gradient", seed: 0 },
  img08: { kind: "photo", fallback: "gradient", seed: 3 },
};

async function main() {
  const img = await prepare("s3", IMAGE_SPECS);
  if (img.missing.length) console.log("이미지 없음(그라데이션으로 대체):", img.missing.join(", "));
  const dg = {};
  for (const key of ["ui", "ui1", "ui3", "timeline", "cuts", "fit", "color", "audio", "layers", "masks", "textbehind", "keyframe", "reveal", "split", "exportbox"]) dg[key] = await render(key, CACHE);

  const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 3회차 — CapCut 완전정복";
  const { pres, C } = newDeck({ title: "촬영편집 3회차 — CapCut 완전정복", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";
  let period = 0;
  let periodName = "시작";

  const content = (title, notes, part) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, (period ? `${period}교시 · ${periodName}` : "3회차 · CapCut 완전정복") + (part ? `  ·  ${part}` : ""));
    if (period) k.progress(s, period);
    s.addText(title, { placeholder: "title" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  // 가로 사진은 화면 가득 + 왼쪽 어둡게, 세로 사진은 오른쪽에 세워 두고 왼쪽 가장자리를 배경에 녹인다
  const fullBleed = (s, key) => {
    const a = img.aspect[key];
    if (a && a < 1.2) {
      const w = Math.min(H * a, 4.3), x = W - w;
      s.addImage({ path: img[key], x, y: 0, w, h: H, sizing: { type: "cover", w, h: H } });
      s.addImage({ path: img.edge, x: x - 0.02, y: 0, w: 1.6, h: H });
      return;
    }
    s.addImage({ path: img[key], x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
    s.addImage({ path: img.overlay, x: 0, y: 0, w: W, h: H });
  };
  const divider = (n, title, sub, imgKey, notes) => {
    period = n;
    periodName = title;
    sec = `${n}교시 ${title}`;
    pres.addSection({ title: sec });
    const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: sec });
    fullBleed(s, imgKey);
    k.text(s, String(n).padStart(2, "0"), { x: M, y: 1.45, w: 4, h: 1.9, fontSize: 110, bold: true, color: C.accent1, valign: "bottom" });
    k.text(s, `${n}교시`, { x: M + 0.08, y: 1.15, w: 3, h: 0.35, fontSize: 14, bold: true, color: C.accent6, charSpacing: 2 });
    s.addText(title, { placeholder: "title" });
    s.addText(sub, { placeholder: "body" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  const statement = (title, body, notes) => {
    const s = pres.addSlide({ masterName: "STATEMENT", sectionTitle: sec });
    s.addText(title, { placeholder: "title" });
    if (body) s.addText(body, { placeholder: "body" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  const cols = (n, gap = 0.3) => ({ w: (CW - (n - 1) * gap) / n, x: (i) => M + i * ((CW - (n - 1) * gap) / n + gap) });
  const pill = (s, text, fill = C.accent2, w = 1.9) => {
    s.addShape(S.roundRect, { x: W - M - w, y: 0.95, w, h: 0.38, rectRadius: 0.19, fill: { color: fill }, line: { type: "none" } });
    k.text(s, text, { x: W - M - w, y: 0.95, w, h: 0.38, fontSize: 12, bold: true, color: fill === C.accent1 ? C.text1 : C.background1, align: "center", valign: "middle" });
  };
  const pic = (s, key, x, y, w) => {
    const h = w / dg[key].ratio;
    s.addImage({ path: dg[key].path, x, y, w, h, altText: key });
    return h;
  };
  // 설명 슬라이드: 왼쪽 도식, 오른쪽 핵심 줄
  const explain = (title, notes, key, points, take, opt = {}) => {
    const s = content(title, notes, "설명");
    pill(s, "설명", C.text2, 1.3);
    const iw = opt.iw || 7.2;
    const ih = pic(s, key, M, 1.75, iw);
    const rx = M + iw + 0.35, rw = W - M - rx;
    points.forEach(([h, b], i) => {
      const y = 1.75 + i * (opt.rowH || 1.0);
      k.text(s, h, { x: rx, y, w: rw, h: 0.36, fontSize: 16, bold: true, color: i === 0 ? C.accent2 : C.text1 });
      k.text(s, b, { x: rx, y: y + 0.36, w: rw, h: (opt.rowH || 1.0) - 0.4, fontSize: 12.5, color: C.accent5 });
    });
    if (take) k.takeaway(s, take, Math.max(1.75 + ih + 0.2, 6.15));
    return s;
  };
  // 따라하기 슬라이드: 왼쪽 클릭 순서, 오른쪽 도식 + 확인 카드
  const follow = (n, title, steps, check, notes, key) => {
    const s = content(`따라하기 ${String(n).padStart(2, "0")} · ${title}`, notes, `사이클 ${n} / ${TOTAL}`);
    pill(s, `사이클 ${String(n).padStart(2, "0")} / ${TOTAL}`, C.accent1, 2.1);
    const lw = key ? 6.85 : 7.6;
    const rh = Math.min(0.72, 4.45 / steps.length);
    steps.forEach((st, i) => {
      const y = 1.72 + i * rh;
      k.card(s, M, y, lw, rh - 0.1, { fill: i % 2 ? "FFFFFF" : C.background2, line: i % 2 ? "DDE4E0" : undefined });
      k.badge(s, M + 0.18, y + (rh - 0.1 - 0.44) / 2, 0.44, i + 1, { fontSize: 13 });
      k.text(s, st, { x: M + 0.8, y, w: lw - 1.0, h: rh - 0.1, fontSize: 14, valign: "middle" });
    });
    const rx = M + lw + 0.3, rw = W - M - rx;
    let cy = 1.72;
    if (key) {
      // 세로로 긴 도식은 높이를 2.9인치로 묶어 확인 칸 자리를 남긴다
      const w = Math.min(rw, 2.9 * dg[key].ratio);
      cy += pic(s, key, rx + (rw - w) / 2, 1.72, w) + 0.2;
    }
    const ch = 6.2 - cy;
    k.card(s, rx, cy, rw, ch, { fill: C.text2 });
    k.text(s, "확인", { x: rx + 0.3, y: cy + 0.15, w: rw - 0.6, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, check, { x: rx + 0.3, y: cy + 0.5, w: rw - 0.6, h: ch - 1.05, fontSize: key ? 14.5 : 18, bold: true, color: C.background1, valign: "top" });
    k.text(s, "크루 전원이 되면 완료 카드", { x: rx + 0.3, y: cy + ch - 0.5, w: rw - 0.6, h: 0.35, fontSize: 11.5, color: C.accent6 });
    return s;
  };

  // ───────────────────────── 시작 ─────────────────────────
  pres.addSection({ title: sec });
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    k.text(s, "AI콘텐츠 크리에이터 실무 · 촬영편집", { x: M, y: 1.7, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.accent1, charSpacing: 1 });
    s.addText("3회차\nCapCut 완전정복", { placeholder: "title" });
    s.addText("편집의 기초부터 레이어 · 마스크 · 키프레임까지", { placeholder: "body" });
    k.text(s, "2026. 11. 19 (목)  ·  1공학관", { x: M, y: 6.5, w: 8, h: 0.35, fontSize: 13, color: "C9D3CE" });
    s.addNotes(`[시작 전] 노트북마다 CapCut PC 실행 · 유료 계정 로그인 확인. 화면에는 입장 안내(QR)를 띄워 두고, 드라이브 "3회차 공통 샘플" · "3회차 추가 샘플" 폴더 안내.
오늘은 1회차 촬영, 2회차 기획에 이어 편집. 4 · 5회차 장르별 실습을 위해 기능을 하나씩 손에 익히는 날입니다.`);
  }
  {
    const s = content("오늘의 흐름", `오늘은 사이클 20개. 한 사이클 = 설명 한 장 → 따라하기 한 장 → 확인. 교시가 바뀌어도 이 리듬은 같습니다.
사이클 1~18은 모두 같은 공통 샘플로 연습(서로 화면을 비교하기 쉽게). 7교시에는 배운 기능으로 "나만의 한 편"을 하나 더: 준비해 온 내 영상이 있으면 내 영상, 없으면 추가 샘플.
끝나면 공통 샘플 연습본 1편 + 나만의 한 편 1편이 남고, 나만의 한 편을 채널에 올립니다 = 트리의 첫 오너먼트.`);
    k.card(s, M, 1.8, 3.4, 4.75, { fill: C.text2 });
    k.text(s, "오늘 남는 것", { x: M + 0.35, y: 2.05, w: 2.9, h: 0.4, fontSize: 14, bold: true, color: C.accent6 });
    k.text(s, "연습본 1편\n+ 나만의 한 편", { x: M + 0.35, y: 2.5, w: 2.9, h: 1.4, fontSize: 24, bold: true, color: C.accent1 });
    k.text(s, "연습본: 공통 샘플\n한 편: 내 영상 또는 추가 샘플\n업로드 = 첫 오너먼트", { x: M + 0.35, y: 4.0, w: 2.9, h: 1.3, fontSize: 15, color: C.background1 });
    k.text(s, "사이클 20개를 하나씩", { x: M + 0.35, y: 5.7, w: 2.9, h: 0.5, fontSize: 13, bold: true, color: C.accent6 });
    const rows = [["편집의 기초와 CapCut 첫 만남", "사이클 1"], ["컷 편집: 타임라인 기본기", "사이클 2–4"], ["화면 다듬기: 크기 · 속도 · 색", "사이클 5–7"], ["소리와 자막", "사이클 8–10"], ["레이어 쌓기", "사이클 11–13"], ["마스크와 키프레임", "사이클 14–18"], ["나만의 한 편 · 내보내기 · 첫 오너먼트", "사이클 19–20"]];
    const x0 = M + 3.7, rw = CW - 3.7, rh = 0.6, gap = 0.08;
    rows.forEach(([what, out], i) => {
      const y = 1.8 + i * (rh + gap);
      k.card(s, x0, y, rw, rh, { fill: i % 2 ? "FFFFFF" : C.background2 });
      k.text(s, `${i + 1}교시`, { x: x0 + 0.25, y, w: 1.0, h: rh, fontSize: 14, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, what, { x: x0 + 1.3, y, w: 5.3, h: rh, fontSize: 15, bold: true, valign: "middle" });
      k.text(s, out, { x: x0 + 6.6, y, w: rw - 6.8, h: rh, fontSize: 13, color: C.accent5, valign: "middle", align: "right" });
    });
  }
  {
    const s = content("오늘의 방식 · 설명 → 따라하기 → 확인", `지난 방식(한꺼번에 설명하고 "해 보세요")을 버립니다. 작은 기능 하나씩: 강사가 한 번 보여 주고, 다 같이 따라 하고, 화면이 같아졌는지 확인.
규칙: 모두의 화면이 같아질 때까지 다음으로 넘어가지 않기. 크루 전원 완료 카드가 서면 다음 사이클. 먼저 끝난 사람은 옆 사람을 돕기.`);
    const steps = [["설명", "강사 화면으로 한 번 보기\n왜 쓰는지 · 어디에 있는지", C.background2, C.text1], ["따라하기", "번호 순서대로 다 같이\n모두 같은 공통 샘플로", C.text2, C.background1], ["확인", "화면이 이렇게 됐으면 성공\n크루 전원 완료 카드", C.accent6, C.text1]];
    const c = cols(3, 0.6);
    steps.forEach(([h, b, fill, col], i) => {
      k.card(s, c.x(i), 1.9, c.w, 2.6, { fill });
      k.text(s, String(i + 1).padStart(2, "0"), { x: c.x(i) + 0.35, y: 2.05, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.accent1 });
      k.text(s, h, { x: c.x(i) + 0.35, y: 2.7, w: c.w - 0.7, h: 0.55, fontSize: 24, bold: true, color: col });
      k.text(s, b, { x: c.x(i) + 0.35, y: 3.35, w: c.w - 0.7, h: 1.0, fontSize: 14.5, color: col === C.text1 ? C.accent5 : "C9D3CE" });
      if (i < 2) k.text(s, "→", { x: c.x(i) + c.w, y: 2.9, w: 0.6, h: 0.6, fontSize: 28, bold: true, color: C.accent1, align: "center" });
    });
    k.text(s, "막히면", { x: M, y: 4.85, w: 1.2, h: 0.5, fontSize: 15, bold: true, color: C.accent2, valign: "middle" });
    [["1", "옆 사람"], ["2", "크루 안에서"], ["3", "강사 호출 카드"]].forEach(([n, t], i) => {
      const x = M + 1.4 + i * 3.4;
      k.badge(s, x, 4.85, 0.5, n, { fontSize: 13 });
      k.text(s, t, { x: x + 0.6, y: 4.85, w: 2.4, h: 0.5, fontSize: 16, bold: true, valign: "middle" });
    });
    k.takeaway(s, "모두의 화면이 같아질 때까지. 크루 전원 완료 카드가 서면 다음 사이클", 5.75);
  }
  {
    const s = content("크루 체크인 · 오늘의 재료", `크루 안에서 3주 과제로 찍어 온 컷(또는 생성한 영상)을 1분씩 보여 주기. 2회차에 연 채널의 첫 영상도 서로 확인.
연습은 모두 드라이브 "3회차 공통 샘플"로. 크루장이 확인할 것: ① 전원이 공통 샘플 폴더를 노트북에 받았는지 ② 나만의 한 편 길 A(내 영상) ○명 / B(추가 샘플) ○명. B는 "3회차 추가 샘플" 폴더도 미리 받기.`, "크루");
    pill(s, "크루", C.accent2, 1.3);
    const st = [["1분씩", "찍어 온 것 보여 주기", "3주 과제 컷 · 생성 영상 · 채널 첫 영상, 서로 구독"], ["전원", "공통 샘플 받기", "드라이브 \"3회차 공통 샘플\" 폴더를 노트북에 (영상 9 · 음악 · 로고)"], ["크루장", "나만의 한 편 길 확인", "A 내 영상 ○명 / B 추가 샘플 ○명 (B는 그 폴더도 받기)"]];
    st.forEach(([t, h, b], i) => k.row(s, M, 1.85 + i * 1.2, CW, 1.0, { n: i + 1, head: `${h} · ${t}`, body: b, headW: 4.2 }));
    k.takeaway(s, "연습은 모두 같은 샘플로, 마지막 한 편은 각자. 찍어 온 게 없어도 추가 샘플로 똑같이", 5.75);
  }

  // ───────────────────────── 1교시 ─────────────────────────
  divider(1, "편집의 기초와 CapCut 첫 만남", "편집은 고르고, 자르고, 붙이고, 다듬는 일", "img02", `목표: 편집의 정의와 순서 → CapCut 화면 다섯 구역 → 사이클 1(새 프로젝트).`);
  {
    const s = content("편집은 네 가지 동작", `1회차 제작 공정 7단계 중 4 · 5단계. 편집 프로그램이 달라도 하는 일은 이 네 가지뿐입니다. 오늘 배우는 기능은 모두 이 넷 중 하나를 더 잘하기 위한 것.`);
    const v = [["FaCheckCircle", "고르기", "찍은 것 중 쓸 컷만. 버리는 용기"], ["FaCut", "자르기", "컷마다 가장 좋은 2~4초만"], ["FaLayerGroup", "붙이기", "순서와 리듬. 훅이 맨 앞"], ["FaMagic", "다듬기", "색 · 소리 · 자막 · 효과"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14, dark: i === 1 });
    k.takeaway(s, "편집 시간의 대부분은 \"고르기 · 자르기\". 효과는 마지막에 조금", 5.4);
  }
  {
    const s = content("편집은 이 순서로", `순서를 지키면 덜 헤맵니다. 특히 가편집 전에 효과 · 자막부터 넣으면 컷을 바꿀 때마다 다시 해야 해요.`);
    const st = ["정리", "가편집", "본편집", "마스터링", "내보내기"], sub = ["컷 모으기 · 이름", "순서대로 붙이기", "리듬 · 소리 · 자막 · 색", "음량 · 오탈자 · 규격", "파일로 · 업로드"];
    const sw = (CW - 4 * 0.35) / 5;
    st.forEach((t, i) => {
      const x = M + i * (sw + 0.35);
      k.card(s, x, 2.0, sw, 2.2, { fill: i === 1 ? C.text2 : C.background2 });
      k.text(s, String(i + 1), { x: x + 0.25, y: 2.15, w: 1, h: 0.6, fontSize: 26, bold: true, color: C.accent1 });
      k.text(s, t, { x: x + 0.25, y: 2.8, w: sw - 0.5, h: 0.5, fontSize: 20, bold: true, color: i === 1 ? C.background1 : C.text1 });
      k.text(s, sub[i], { x: x + 0.25, y: 3.35, w: sw - 0.5, h: 0.7, fontSize: 13, color: i === 1 ? "C9D3CE" : C.accent5 });
      if (i < 4) k.text(s, "→", { x: x + sw, y: 2.8, w: 0.35, h: 0.5, fontSize: 20, bold: true, color: C.accent1, align: "center" });
    });
    k.card(s, M, 4.55, CW, 1.1, { fill: C.background2 });
    k.text(s, "편집자의 세 질문", { x: M + 0.3, y: 4.55, w: 2.6, h: 1.1, fontSize: 15, bold: true, color: C.accent2, valign: "middle" });
    k.text(s, "① 3초 안에 무슨 영상인지 아나?   ② 지루한 곳이 없나?   ③ 소리 없이 봐도 이해되나?", { x: M + 2.9, y: 4.55, w: CW - 3.2, h: 1.1, fontSize: 16, bold: true, valign: "middle" });
    k.takeaway(s, "가편집 전에 효과부터 넣지 않기. 순서를 바꾸면 처음부터 다시 해야 합니다", 5.95);
  }
  explain("CapCut 화면은 다섯 구역", `강사 화면을 띄우고 구역마다 손으로 가리키기. 그림은 구조를 설명하는 도식이고, 실제 화면 배치는 버전마다 조금 다를 수 있습니다.
특히 ③ 오른쪽 속성 패널은 "선택한 클립"의 설정이라, 아무것도 선택하지 않으면 비어 있다는 점을 강조.`, "ui", [["① 도구 탭 + 자료 창", "미디어 · 오디오 · 텍스트 · 스티커 · 효과 · 전환 · 필터 · 조정"], ["② 재생 화면", "지금 만든 영상 미리 보기, 비율 버튼"], ["③ 속성 패널", "선택한 클립의 설정 (크기 · 속도 · 색 · 마스크 · 키프레임)"], ["④ 타임라인", "클립을 놓고 자르고 쌓는 곳"], ["⑤ 내보내기", "완성 파일 만들기 (오른쪽 위)"]], "③은 클립을 선택해야 나타납니다. \"설정이 안 보여요\" = 클립부터 클릭", { rowH: 0.82, iw: 7.3 });
  follow(1, "새 프로젝트 만들기", ["CapCut 실행 → 유료 계정으로 로그인됐는지 확인", "'프로젝트 만들기'(Create project) 누르기", "왼쪽 자료 창에 \"3회차 공통 샘플\" 폴더를 끌어다 놓기 (또는 가져오기)", "재생 화면 아래 비율 버튼에서 9:16 고르기", "위쪽 프로젝트 이름을 \"3회차_연습_내이름\"으로"], "세로 캔버스 + 자료 창에 샘플 9개 · 음악 · 로고", `파일 정리 원칙: 원본은 한 폴더에 모으고 옮기지 않기(옮기면 "미디어 없음"). 프로젝트는 자동 저장.
비율 버튼 위치는 버전마다 다를 수 있음(플레이어 아래 또는 프로젝트 설정). 강사가 먼저 보여 주기.`, "ui1");

  // ───────────────────────── 2교시 ─────────────────────────
  divider(2, "컷 편집: 타임라인 기본기", "올리고, 움직이고, 자르고, 이어 붙이기", "img03", `목표: 타임라인 읽기 → 사이클 2(올리고 움직이기) → 자르는 네 가지 → 사이클 3(15초 가편집) → 컷 리듬 → 사이클 4(동작 연결).`);
  explain("타임라인 읽는 법", `타임라인은 왼쪽에서 오른쪽으로 흐르는 시간. 세로선(재생헤드)이 지금 화면에 보이는 위치.
메인 트랙(맨 아래 영상 줄)은 자석처럼 붙어서 빈틈이 생기지 않습니다. 그 위 트랙들은 자유롭게 놓을 수 있어요(5교시 레이어).`, "timeline", [["재생헤드", "세로선. 지금 보이는 순간"], ["트랙", "가로줄. 위로 쌓을수록 화면 앞"], ["메인 트랙", "맨 아래 영상 줄. 자르면 뒤가 자동으로 붙음"], ["클립", "타임라인 위 블록 하나 = 컷 하나"], ["오디오 트랙", "음악 · 효과음 줄"]], "위 트랙일수록 화면 앞. 오늘 내내 쓰는 원리입니다", { rowH: 0.82, iw: 7.3 });
  follow(2, "올리고 움직이기", ["샘플 02 · 03 · 04 · 01 · 05를 메인 트랙에 끌어다 놓기", "클립을 끌어 순서 바꾸기 (01_훅_슬로를 맨 앞으로)", "Space로 재생 · 정지", "Ctrl + 마우스 휠로 타임라인 확대 · 축소", "실수하면 Ctrl + Z (되돌리기)"], "5컷이 빈틈없이 한 줄, 01_훅_슬로가 맨 앞", `일부러 순서를 섞어 올린 뒤 01을 앞으로 옮기는 연습. 단축키는 CapCut 안의 키보드 아이콘에서 확인 · 변경할 수 있습니다(버전에 따라 다름).`, "timeline");
  explain("자르는 네 가지 방법", `가장 많이 쓰는 건 Q · W. 재생헤드를 놓고 Q를 누르면 재생헤드 왼쪽이, W를 누르면 오른쪽이 지워지고 메인 트랙은 자동으로 붙습니다.
Ctrl + B는 두 조각으로 나누기만 합니다(지우기는 따로).`, "cuts", [["분할 · Ctrl + B", "재생헤드 위치에서 두 조각으로"], ["왼쪽 삭제 · Q", "재생헤드 왼쪽을 지우고 당기기"], ["오른쪽 삭제 · W", "재생헤드 오른쪽을 지우기"], ["끝 끌기 (트림)", "클립 가장자리를 잡고 끌기"]], "재생헤드 놓고 Q · W. 이 두 키가 편집 시간을 절반으로 줄입니다", { rowH: 1.0, iw: 7.3 });
  follow(3, "15초 가편집", ["재생하며 컷마다 쓸 부분의 시작에 재생헤드 놓기", "Q로 앞부분 지우기", "쓸 부분 끝에 재생헤드 → W로 뒷부분 지우기", "긴 컷은 Ctrl + B로 나눠 가운데 버리기", "클립 끝을 끌어 미세하게 맞추기"], "전체 15초 안팎, 첫 3초에 훅", `컷마다 가장 좋은 2~4초만. 쇼츠의 한 컷 평균은 1.5~3초.
2회차 스토리보드의 훅 장면이 맨 앞에 와야 합니다.`, "cuts");
  {
    const s = content("컷의 리듬 · 1회차 컷의 문법을 편집에서", `1회차 6교시에서 촬영할 때 배운 규칙을 이번엔 편집에서 확인합니다. 찍을 때 지킨 사람은 편집이 쉬워요.`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const r = [["FaLayerGroup", "동작 연결", "같은 동작을 다른 크기(와이드 → 클로즈업)로, 동작 중간에서 이어 붙이면 컷이 안 보임"], ["FaRedo", "점프컷 피하기", "같은 크기 · 같은 각도 연속은 화면이 튐. 크기를 바꾸거나 B롤로 덮기"], ["FaFilm", "B롤로 덮기", "말이 길거나 잘린 곳에 손 · 소품 · 공간 컷을 위 트랙에"], ["FaClock", "쇼츠 리듬", "한 컷 평균 1.5~3초. 3초 넘게 같은 화면이면 지루함"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.4, { icon: r[i][0], head: r[i][1], body: r[i][2], bodySize: 13.5 });
    k.takeaway(s, "리듬이 지루하면 컷을 짧게, 튀면 크기를 바꾸거나 B롤로", 5.6);
  }
  follow(4, "동작 연결 컷", ["02_동작_와이드 바로 뒤에 03_동작_클로즈업 (같은 동작)", "첫 컷에서 동작이 시작되는 순간에 재생헤드 → W", "둘째 컷에서 같은 동작의 순간 찾기 → Q", "이음새를 여러 번 재생하며 클립 끝을 조금씩 끌어 맞추기"], "컷이 바뀌어도 동작이 하나로 이어져 보임", `공통 샘플 02 · 03은 같은 동작을 두 크기로 찍은 컷. 1회차 5샷 시퀀스의 "와이드 → 클로즈업"을 편집에서 잇는 연습. 나만의 한 편에서도 같은 동작 컷이 있으면 써 보기.`);

  // ───────────────────────── 3교시 ─────────────────────────
  divider(3, "화면 다듬기: 크기 · 속도 · 색", "세로에 맞추고, 느리게 멈추고, 한 영상처럼", "img04", `목표: 크기 · 위치와 세로 맞추기 → 사이클 5 → 속도 → 사이클 6 → 색 맞추기 → 사이클 7.`);
  explain("가로 컷을 세로 화면에", `가로로 찍은 컷을 9:16에 넣으면 위아래가 빕니다. 세 가지 중 고르기.
크기 · 위치 · 회전은 오른쪽 패널 '비디오'의 기본 값이나 재생 화면에서 직접 끌어서. 배경 흐림은 캔버스 · 배경(Background) 항목(위치는 버전마다 다를 수 있음).`, "fit", [["그대로", "위아래 검은 띠. 가장 아마추어처럼 보임"], ["크게 키우기", "양옆이 잘림. 인물이 가운데면 가장 깔끔"], ["배경 흐림 채우기", "위아래를 같은 영상의 흐린 버전으로"]], "세로 영상에 검은 띠는 남기지 않기", { rowH: 1.1, iw: 7.3 });
  follow(5, "세로로 맞추기", ["04_가로컷을 타임라인에 올리고 선택", "재생 화면에서 모서리를 끌어 키우기 (또는 오른쪽 패널 '비디오'의 크기 값)", "잘리는 게 싫으면: 오른쪽 패널의 캔버스 · 배경(Background)에서 흐림", "인물이 가운데 오도록 위치 다시 맞추기"], "화면에 검은 띠가 없음", `클립을 선택해야 오른쪽 패널에 설정이 나타납니다.`, "fit");
  {
    const s = content("속도 네 가지", `속도는 감정을 바꿉니다. 훅의 슬로는 "중요한 순간", 2배속은 "과정 줄이기". 1회차: 60fps로 찍은 컷이 0.5x에서 가장 부드럽습니다.
메뉴: 클립 선택 → 오른쪽 패널 '속도'. 곡선 속도(Curve) · 정지 프레임(Freeze) · 역재생(Reverse) 위치는 버전마다 다를 수 있음(우클릭 메뉴 또는 타임라인 도구).`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const r = [["FaClock", "일반 속도", "0.5x 슬로 · 2x 빠르게. 과정은 빠르게, 결과는 느리게"], ["FaChartLine", "곡선 속도", "빨라졌다 느려졌다. 장면 전환에 리듬감"], ["FaPause", "정지 프레임", "한 장면을 멈춰 1초. 결과 · 표정 강조"], ["FaRedo", "역재생", "거꾸로. 쏟은 물이 컵으로 돌아가는 재미"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: r[i][0], head: r[i][1], body: r[i][2], bodySize: 13.5 });
    k.takeaway(s, "60fps로 찍은 컷을 0.5x로. 30fps 컷은 0.5x에서 뚝뚝 끊길 수 있어요", 5.4);
  }
  follow(6, "훅은 슬로, 마지막은 정지", ["01_훅_슬로 선택 → 오른쪽 패널 '속도'", "일반 속도를 0.5x로", "마지막 컷 끝 1초 전에 재생헤드", "정지 프레임(Freeze) 만들기 (클립 우클릭 또는 타임라인 도구)", "정지 프레임 길이를 1초로"], "첫 3초가 부드럽게 느려지고, 마지막 장면이 멈춤", `01은 60fps로 찍어 0.5x로 늦춰도 부드럽습니다(30fps 컷은 뚝뚝 끊김: 나만의 한 편에서 확인). 정지 프레임 위치는 버전마다 다를 수 있으니 강사 화면으로 먼저.`, "ui3");
  explain("한 영상처럼 · 색 맞추기", `1회차 화이트밸런스 연결: 컷마다 색이 다르면 한 영상처럼 보이지 않습니다. 기준 컷을 정하고 나머지를 맞추기.
'조정'(Adjust)의 밝기 · 대비 · 채도 · 색온도. 필터는 약하게(강도를 낮춰서). 같은 설정은 복사 · 붙여넣기, 또는 조정 레이어로 전체 적용.`, "color", [["기준 컷", "가장 잘 나온 컷 하나"], ["밝기 · 대비", "어둡고 밝은 정도부터"], ["색온도", "노랗고 파란 정도 맞추기"], ["필터는 약하게", "강도를 낮춰 전체에 한 가지만"]], "필터보다 먼저 밝기와 색온도. 필터는 마지막에 약하게", { rowH: 0.9, iw: 7.6 });
  follow(7, "컷마다 색 맞추기", ["가장 잘 나온 컷을 기준 컷으로 정하기", "다른 컷 선택 → 오른쪽 패널 '조정'(Adjust)", "밝기로 기준 컷과 비슷하게", "색온도로 노랗고 파란 정도 맞추기", "같은 설정은 복사 · 붙여넣기 (우클릭)"], "샘플 컷들이 같은 날 같은 빛에서 찍은 것처럼", `기준 컷과 나란히 비교하며. 완벽보다 "튀지 않게"가 목표.`, "color");
  statement("점심 시간", "오후는 소리 · 자막 → 레이어 → 마스크 · 키프레임", `점심 전에 프로젝트가 자동 저장됐는지 확인(CapCut 첫 화면 프로젝트 목록).`);

  // ───────────────────────── 4교시 ─────────────────────────
  divider(4, "소리와 자막", "흐린 화면은 참아도 안 들리는 소리는 못 참는다", "img05", `목표: 소리 네 층 · 저작권 → 사이클 8(음악) → 자막 원칙 → 사이클 9(자막) → 사이클 10(제목 텍스트).`);
  explain("소리는 네 층", `1회차 소리 이론을 편집에서. 말이 들리게 음악은 낮게. 영상 원본 소리가 시끄러우면 음소거하거나 소음 제거(Reduce noise).
볼륨 · 페이드는 클립 선택 → 오른쪽 패널(오디오). 비트 표시가 있으면 컷 바뀌는 곳을 박자에.`, "audio", [["말 (목소리)", "가장 크게. 모든 소리의 기준"], ["현장음", "장면을 진짜로. 낮게 깔기"], ["음악", "말보다 낮게, 끝은 페이드 아웃"], ["효과음", "강조할 때만 짧게"]], "말이 들리는지, 음악은 낮은지. 이어폰으로 한 번 확인", { rowH: 0.9, iw: 7.6 });
  {
    const s = content("음악 저작권 · 올리기 전에 꼭", `CapCut 음악 라이브러리 곡이라도 유튜브 · 상업적 사용 가능 여부는 곡마다 다를 수 있습니다. 사업 홍보 채널은 특히 주의.
가장 안전한 선택: 유튜브 오디오 보관함(YouTube Studio) · 직접 녹음 · 사용 조건이 명확한 음원.`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const r = [["FaCheckCircle", "안전", "유튜브 오디오 보관함 · 직접 녹음 · 현장음", C.accent2], ["FaQuestion", "확인 필요", "CapCut 음악 · 무료 음원 사이트: 상업적 사용 · 유튜브 조건 읽기", C.accent1], ["FaBolt", "피하기", "가요 · 드라마 OST · 남의 영상 소리 그대로", C.accent3]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: r[i][0], head: r[i][1], body: r[i][2], bodySize: 14.5, dark: i === 2 });
    k.takeaway(s, "사업 홍보 채널은 \"상업적 사용 가능\"이 확인된 음원만", 5.4);
  }
  follow(8, "음악 깔기", ["자료 창의 음악_배경 (또는 '오디오' 탭에서 음악 고르기)", "오디오 트랙에 끌어다 놓기", "영상 원본 소리가 시끄러우면 영상 클립 볼륨 낮추기 · 음소거", "음악 클립 선택 → 볼륨 낮추고 끝에 페이드 아웃 2초", "음악 끝을 영상 끝에 맞춰 Ctrl + B로 자르기"], "영상 끝에서 음악이 자연스럽게 줄어듦", `말이 있는 영상이면 음악 볼륨을 많이 낮추기(말 > 음악). 비트 표시 기능이 있으면 컷 바뀌는 곳을 박자에 맞춰 보기(도전).`, "audio");
  {
    const s = content("자막은 소리 없이 보는 사람을 위해", `많은 사람이 소리를 끄고 쇼츠를 봅니다. 자동 캡션(Auto captions)으로 말을 자막으로 만든 뒤 반드시 고치기. 위치는 1회차 세로 안전 영역(위 · 아래 · 오른쪽은 버튼 · 캡션 자리).
자동 캡션 위치는 버전마다 다를 수 있음(텍스트 탭 또는 캡션 메뉴).`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const px = M + 0.3, py = 1.75, pw = 2.75, ph = 4.85;
    s.addShape(S.roundRect, { x: px, y: py, w: pw, h: ph, rectRadius: 0.22, fill: { color: "0E1110" }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + 0.1, y: py + 0.1, w: pw - 0.2, h: ph * 0.14, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + 0.1, y: py + ph * 0.76, w: pw - 0.2, h: ph * 0.23, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + pw * 0.83, y: py + ph * 0.42, w: pw * 0.15, h: ph * 0.34, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    s.addShape(S.roundRect, { x: px + 0.3, y: py + ph * 0.6, w: pw - 0.75, h: 0.42, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { type: "none" } });
    k.text(s, "자막은 여기", { x: px + 0.3, y: py + ph * 0.6, w: pw - 0.75, h: 0.42, fontSize: 12, bold: true, align: "center", valign: "middle" });
    k.text(s, "빨간 곳 = 버튼 · 캡션 자리", { x: px - 0.2, y: py + ph + 0.05, w: pw + 0.4, h: 0.3, fontSize: 11.5, bold: true, color: C.accent3, align: "center" });
    const items = [["1", "자동으로 만들고 꼭 고치기", "이름 · 숫자 · 전문 용어를 자주 틀림"], ["2", "한 줄 15자 안팎", "길면 둘로 나누기"], ["3", "스타일 하나로 통일", "글꼴 · 크기 · 색을 전체에"], ["4", "가운데 아래쪽", "버튼 · 캡션 자리 피하기"]];
    items.forEach(([n, h, b], i) => k.row(s, 4.4, 1.75 + i * 1.2, CW - 3.65, 1.05, { n, head: h, body: b, headW: 3.3 }));
  }
  follow(9, "자막 달기", ["06_인터뷰_말하기를 타임라인에 → 텍스트 탭(또는 캡션)에서 자동 캡션(Auto captions) → 한국어 → 만들기", "하나씩 재생하며 오탈자 고치기", "하나를 골라 글꼴 · 크기 · 색 정하고 전체에 적용", "위치는 화면 가운데 아래쪽 (버튼 자리 피하기)", "말이 없는 영상은 텍스트로 한 줄씩 직접"], "소리를 끄고 봐도 무슨 내용인지 앎", `자동 캡션 위치는 버전마다 다를 수 있음. 강사 화면으로 먼저 찾기.`);
  follow(10, "제목 텍스트 + 등장 애니메이션", ["'텍스트' 탭 → 기본 텍스트를 첫 컷 위 트랙에", "제목 한 줄 입력 (15자 안팎)", "크기 키우고 위쪽 1/3에 놓기", "오른쪽 패널 '애니메이션' → 등장(In) 하나 고르기", "텍스트 길이를 3초로"], "3초 안에 무슨 영상인지 알 수 있음", `연습본 제목은 샘플 내용으로 자유롭게. 나만의 한 편에서는 2회차 기획안의 제목 · 훅 문장을 쓰면 됩니다. 애니메이션은 하나만.`);

  // ───────────────────────── 5교시 ─────────────────────────
  divider(5, "레이어 쌓기", "투명 필름을 겹치듯, 위로 쌓을수록 앞으로", "img06", `목표: 레이어 개념 → 사이클 11(PiP) → 불투명도 · 혼합 → 사이클 12(세 겹) → 배경 제거 · 크로마 키 → 사이클 13(누끼 인트로) → 전환은 아껴서.`);
  explain("레이어 = 투명 필름 겹치기", `레이어는 오늘 오후의 핵심 원리. 위 트랙일수록 화면 앞에 보입니다. 메인 트랙(바닥) 위에 영상 · 사진 · 텍스트 · 스티커를 쌓아요.
순서를 바꾸고 싶으면 클립을 위아래 트랙으로 끌어 옮기기.`, "layers", [["맨 아래 · 메인 트랙", "배경이 되는 영상"], ["가운데 · 위 트랙", "인물 · 사진 · 화면 속 화면"], ["맨 위 · 텍스트", "제목 · 자막 · 스티커"], ["순서 바꾸기", "클립을 위아래 트랙으로 끌기"]], "위 트랙일수록 앞. 가려지면 트랙 순서부터 확인", { rowH: 0.9, iw: 7.3 });
  follow(11, "화면 속 화면 (PiP)", ["메인 트랙 09_다른장소 위로 아무 샘플 하나를 끌어올리기", "재생 화면에서 크기를 1/3쯤으로 줄이기", "모서리로 옮기기 (버튼 자리 피해서)", "메인 트랙 클립과 길이 맞추기"], "큰 화면 위에 작은 화면이 보임", `리액션 · 비교 · 설명 영상에서 자주 쓰는 구성(4회차 스트리머형 · 정보성).`, "timeline");
  {
    const s = content("불투명도 · 혼합 · 투명 PNG", `위 레이어를 반투명하게(불투명도), 또는 혼합 모드(Blend)로 빛 · 질감을 겹칩니다. 로고 · 워터마크는 배경이 투명한 PNG 이미지로.
혼합 모드 위치는 버전마다 다를 수 있음(오른쪽 패널 '비디오' 안).`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const r = [["FaAdjust", "불투명도", "100%면 아래가 안 보이고, 낮출수록 비침. 로고는 70% 정도"], ["FaLayerGroup", "혼합 모드", "화면 · 곱하기 · 오버레이: 빛 번짐 · 질감 · 필름 느낌 겹치기"], ["FaImage", "투명 PNG", "로고 · 아이콘은 배경 없는 PNG. ChatGPT 이미지로 만들 때 \"transparent background\""]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: r[i][0], head: r[i][1], body: r[i][2], bodySize: 14 });
    k.takeaway(s, "로고는 투명 PNG + 불투명도 70%, 버튼 자리를 피해 모서리에", 5.4);
  }
  follow(12, "세 겹 쌓기", ["메인 트랙에 배경 영상 (09_다른장소)", "위 트랙에 로고.png (없으면 스티커)", "그 위 트랙에 텍스트", "트랙 순서를 바꿔 보며 무엇이 가려지는지 확인", "로고 불투명도를 70%로"], "위 트랙이 앞에 보이는 원리를 직접 확인", `로고 PNG가 없으면 스티커로. 순서 바꾸기를 꼭 직접 해 보게 하기(원리 이해).`, "layers");
  {
    const s = content("배경 지우기 · 자동 컷아웃과 크로마 키", `확인된 메뉴(공개 자료 기준): 클립 선택 → 오른쪽 패널 '비디오' → '컷아웃'(Cutout).
자동 컷아웃: 체크만 하면 인물을 배경에서 분리(상반신 인물에 잘 됨). 크로마 키: 초록 · 파랑 배경을 스포이드로 찍어 지우고 '강도' · '그림자'로 다듬기.`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const hw = (CW - 0.3) / 2;
    [["자동 컷아웃", ["'비디오' → '컷아웃' → '자동 컷아웃' 체크", "처리 시간이 걸림, 기다리기", "상반신 · 배경과 색이 다른 인물에 잘 됨"], C.background2, C.text1], ["크로마 키", ["같은 '컷아웃' 탭에서 크로마 키", "스포이드로 초록 배경 찍기", "'강도' · '그림자'로 가장자리 다듬기"], C.text2, C.background1]].forEach(([h, bs, fill, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.6, { fill });
      k.text(s, h, { x: x + 0.4, y: 2.0, w: hw - 0.8, h: 0.5, fontSize: 22, bold: true, color: i ? C.accent1 : C.accent2 });
      k.checklist(s, bs, { x: x + 0.4, y: 2.7, w: hw - 0.8, h: 2.5, fontSize: 15.5, color: col, paraSpaceAfter: 10 });
    });
    k.takeaway(s, "누끼가 지저분하면 배경과 옷 색이 비슷해서. 찍을 때 배경을 단순하게", 5.75);
  }
  follow(13, "썸네일형 인트로", ["06_인터뷰_말하기를 위 트랙에, 아래 메인 트랙에 09_다른장소", "인물 클립 선택 → 오른쪽 패널 '비디오' → '컷아웃' → '자동 컷아웃' 체크", "처리가 끝날 때까지 기다리기", "그 위 트랙에 큰 제목 텍스트", "초록 배경이면 크로마 키: 스포이드 → '강도' · '그림자'"], "인물만 떠 있는 첫 화면 + 큰 제목", `이 첫 화면이 쇼츠의 첫 장면 겸 썸네일 역할. 2회차 "발행 전 다섯 가지"의 첫 화면과 연결.`, "layers");
  statement("전환은 아껴서", "대부분의 컷은 그냥 컷.  장소 · 시간이 바뀔 때만 짧게, 효과는 한 영상에 한두 번", `전환(Transition) 탭에는 화려한 효과가 많지만, 프로 영상의 대부분은 그냥 컷입니다. 컷 사이에 전환을 끌어다 놓으면 적용, 길이는 짧게.`);

  // ───────────────────────── 6교시 ─────────────────────────
  divider(6, "마스크와 키프레임", "보이는 곳을 정하고, 움직임을 두 점으로", "img07", `목표: 마스크 → 사이클 14(분할 화면) · 15(글자 뒤 사람) → 키프레임 → 사이클 16(줌인) · 17(날아오는 글자) · 18(마스크 리빌).
마스크 탭 위치와 모양 이름은 버전마다 다를 수 있으니 수업 전에 강사 PC에서 확인.`);
  explain("마스크 = 보이는 곳의 모양", `마스크는 클립의 어느 부분만 보이게 하는 "구멍". 아래 트랙과 겹칠 때 힘을 발휘합니다(분할 화면 · 원형 리빌).
클립 선택 → 오른쪽 패널에서 마스크(Mask). 모양 이름은 버전마다 다를 수 있음. 위치 · 크기 · 회전 · 가장자리 흐림(페더) · 반전을 조절.`, "masks", [["선형 · 미러", "화면을 반으로, 띠 모양으로"], ["원 · 사각형", "동그랗게 · 네모나게 보이기"], ["하트 · 별", "재미 요소, 가끔만"], ["페더 · 반전", "가장자리 흐림 / 보이는 곳 뒤집기"]], "마스크는 아래 트랙과 겹칠 때 쓸모가 생깁니다", { rowH: 0.9, iw: 7.3 });
  follow(14, "분할 화면 (비포 · 애프터)", ["07_비포는 위 트랙, 08_애프터는 메인 트랙에 같은 시간으로 겹치기", "위 클립 선택 → 오른쪽 패널에서 마스크(Mask) → 선형", "선을 화면 가운데로, 각도 0°(위아래) 또는 90°(좌우)", "가장자리 흐림(페더)을 조금", "보이는 쪽이 반대면 반전"], "반반 화면, 경계가 부드러움", `정리수납 · 요리 · 뷰티처럼 비포 · 애프터가 있는 아이템에 바로 쓰기.`, "split");
  follow(15, "글자 뒤로 지나가는 사람", ["메인 트랙에 05_지나가는사람", "위 트랙에 큰 글자 텍스트", "영상 클립 복사(Ctrl + C) → 맨 위 트랙에 붙여넣기(Ctrl + V), 시간 맞추기", "맨 위 클립 → '비디오' → '컷아웃' → '자동 컷아웃'", "재생해 확인"], "사람이 글자 앞을 지나감", `레이어 원리 + 컷아웃의 응용. 맨 위 = 사람만, 가운데 = 글자, 맨 아래 = 원본. 사람이 화면을 가로지르는 컷일수록 잘 보입니다.`, "textbehind");
  explain("키프레임 = 두 점만 찍기", `키프레임은 "시작 모습"과 "끝 모습"을 두 점으로 찍으면 그 사이를 CapCut이 자동으로 채우는 기능. 순서가 전부입니다.
◇(다이아몬드)는 클립을 선택했을 때 오른쪽 패널 '비디오'의 위치 · 크기 · 회전 · 불투명도 옆에 있습니다(공개 자료 기준).`, "keyframe", [["① 재생헤드를 시작 위치로", "움직임이 시작될 곳"], ["② ◇ 누르기", "지금 모습이 첫 점으로 기록"], ["③ 재생헤드를 끝 위치로", "예: 3초 뒤"], ["④ 값 바꾸기", "두 번째 점이 자동으로 생김"]], "◇가 안 보이면 클립부터 선택. 처음엔 두 점만", { rowH: 0.9, iw: 7.6 });
  follow(16, "천천히 다가가는 줌인", ["줌인할 클립 선택", "재생헤드를 클립 시작으로", "오른쪽 패널 '비디오'의 크기 옆 ◇ 누르기 (첫 점)", "재생헤드를 3초 뒤로", "크기를 120%로 바꾸기 (두 번째 점 자동)"], "화면이 천천히 다가감", `1회차 "줌 말고 달리"를 편집으로 흉내 내는 방법(켄 번스 효과). 사진 한 장으로도 움직이는 영상을 만들 수 있어요.`, "keyframe");
  follow(17, "날아와서 멈추는 글자", ["제목 텍스트 선택 → 재생헤드를 텍스트 시작 0.5초 뒤로", "위치 · 불투명도 옆 ◇ (멈출 모습을 먼저 기록)", "재생헤드를 텍스트 시작으로", "위치를 화면 왼쪽 밖으로, 불투명도 0 (점 자동)", "재생해 확인"], "글자가 미끄러져 들어와 멈춤", `요령: "끝 모습을 먼저 찍고, 시작으로 돌아가 바꾸기". 텍스트 애니메이션(사이클 10)과 비교해 보기.`, "keyframe");
  follow(18, "원 마스크로 다음 장면 열기", ["장면 A(아무 샘플)는 메인 트랙, 장면 B(09_다른장소)는 위 트랙 (A 끝에 겹치게)", "B 클립 선택 → 마스크(Mask) → 원", "재생헤드를 B 시작으로 → 마스크 크기를 아주 작게 → 마스크 크기 옆 ◇", "재생헤드 1초 뒤 → 마스크 크기를 화면 가득", "가장자리 흐림(페더) 조금"], "원이 커지며 다음 장면이 열림", `1회차 "리빌"의 편집 버전. 마스크 키프레임 위치는 버전마다 다를 수 있음(마스크 설정 옆 ◇). 어려우면 도전 과제로.`, "reveal");
  {
    const s = content("키프레임이 안 될 때", `가장 흔한 실수 네 가지. 크루 안에서 서로 화면을 보며 해결.`, "설명");
    pill(s, "설명", C.text2, 1.3);
    const r = [["◇가 안 보임", "클립을 먼저 선택. 그룹 클립 · 일부 템플릿은 안 될 수 있음"], ["움직이지 않음", "두 점의 값이 같음. 두 번째 위치에서 값을 바꿨는지 확인"], ["너무 빠름 · 느림", "두 점 사이 거리가 시간. 점을 끌어 간격 조절"], ["엉뚱하게 움직임", "점이 세 개 이상. 지우고 두 점부터 다시"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 1.0, CW, 0.85, { n: i + 1, head: h, body: b, headW: 3.2 }));
    k.takeaway(s, "처음엔 두 점만. 익숙해지면 점을 늘려 더 복잡한 움직임", 6.0);
  }

  // ───────────────────────── 7교시 ─────────────────────────
  divider(7, "나만의 한 편 · 내보내기 · 첫 오너먼트", "배운 기능으로 한 편 더, 파일로 만들어 채널에 올리기", "img08", `목표: 나만의 한 편(A 내 영상 / B 추가 샘플) → 마스터링 체크 7 → 사이클 19(내보내기) → 사이클 20(업로드) → 크루 상영회 → 첫 오너먼트 → 4 · 5회차 예고 · 과제.`);
  {
    const s = content("나만의 한 편 · 두 갈래", `공통 샘플로 배운 기능을 이제 각자 한 편에. 체크인 때 크루장이 확인한 A · B대로.
A: 3주 과제로 찍어 온 컷 · 생성 영상. B: 드라이브 "3회차 추가 샘플"(공통 샘플과 다른 주제 6~8컷). 어느 쪽이든 할 일은 같습니다.
새 프로젝트로 시작(연습 프로젝트 위에 덮어쓰지 않기). 연습본에서 쓴 자막 스타일은 복사해 오면 빠름.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const c = cols(2, 0.4);
    const r = [["A", "준비해 온 내 영상이 있다", ["3주 과제 컷 · 생성 영상 · 1회차 5샷", "새 프로젝트 \"3회차_나만의한편_내이름\"", "고르기부터: 쓸 컷 6~10개"], C.text2, C.background1, "C9D3CE"], ["B", "내 영상이 없다 · 모자라다", ["드라이브 \"3회차 추가 샘플\" 폴더", "새 프로젝트 \"3회차_나만의한편_내이름\"", "다음 회차엔 꼭 내 영상으로"], C.background2, C.text1, C.accent5]];
    r.forEach(([t, h, items, fill, col, sub], i) => {
      k.card(s, c.x(i), 1.8, c.w, 3.55, { fill });
      k.badge(s, c.x(i) + 0.35, 2.05, 0.7, t, { fontSize: 22 });
      k.text(s, h, { x: c.x(i) + 1.25, y: 2.05, w: c.w - 1.5, h: 0.7, fontSize: 21, bold: true, color: col, valign: "middle" });
      items.forEach((it, j) => k.text(s, `·  ${it}`, { x: c.x(i) + 0.4, y: 3.05 + j * 0.68, w: c.w - 0.7, h: 0.6, fontSize: 15.5, color: j === 2 ? (i ? C.accent2 : C.accent1) : sub, bold: j === 2, valign: "middle" }));
    });
    k.takeaway(s, "길은 둘, 할 일은 같다. 15~30초 한 편을 처음부터 끝까지 혼자", 5.75);
  }
  {
    const s = content("나만의 한 편 · 꼭 넣을 것", `순서는 1교시 "편집은 이 순서로" 그대로: 정리 → 가편집 → 본편집 → 마스터링 → 내보내기. 막히면 해당 사이클 슬라이드로 돌아가 보기(워크북 사이클 번호).
강사는 돌아다니며 "기본 여섯"이 다 들어갔는지 먼저 확인, 그다음 도전 하나.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const base = [["15~30초 가편집", "사이클 2–4"], ["세로 9:16", "사이클 5"], ["색 맞추기", "사이클 7"], ["음악", "사이클 8"], ["자막", "사이클 9"], ["제목", "사이클 10"]];
    k.text(s, "기본 여섯 · 모두", { x: M, y: 1.75, w: 7.2, h: 0.4, fontSize: 15, bold: true, color: C.accent2 });
    base.forEach(([h, b], i) => {
      const col = i % 2, r = Math.floor(i / 2), bw = 3.5;
      const x = M + col * (bw + 0.2), y = 2.25 + r * 1.05;
      k.card(s, x, y, bw, 0.92, { fill: r % 2 ? "FFFFFF" : C.background2, line: r % 2 ? "DDE4E0" : undefined });
      k.text(s, "☐", { x: x + 0.2, y, w: 0.4, h: 0.92, fontSize: 18, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, h, { x: x + 0.6, y: y + 0.08, w: bw - 0.75, h: 0.4, fontSize: 15.5, bold: true, valign: "middle" });
      k.text(s, b, { x: x + 0.6, y: y + 0.5, w: bw - 0.75, h: 0.3, fontSize: 11.5, color: C.accent5 });
    });
    const rx = M + 7.6, rw = CW - 7.6;
    k.card(s, rx, 1.75, rw, 3.7, { fill: C.text2 });
    k.text(s, "+ 하나 이상 골라 넣기", { x: rx + 0.3, y: 1.95, w: rw - 0.6, h: 0.4, fontSize: 15, bold: true, color: C.accent1 });
    [["레이어", "PiP · 로고 · 컷아웃 (사이클 11–13)"], ["마스크", "분할 화면 · 글자 뒤 (사이클 14–15)"], ["키프레임", "줌인 · 날아오는 글자 · 원 리빌 (사이클 16–18)"]].forEach(([h, b], i) => {
      const y = 2.5 + i * 0.95;
      k.text(s, `☐  ${h}`, { x: rx + 0.3, y, w: rw - 0.6, h: 0.42, fontSize: 17, bold: true, color: C.background1 });
      k.text(s, b, { x: rx + 0.75, y: y + 0.42, w: rw - 1.0, h: 0.4, fontSize: 12.5, color: "C9D3CE" });
    });
    k.takeaway(s, "기본 여섯을 먼저 다 채우고, 남은 시간에 도전 하나. 다 되면 마스터링으로", 5.75);
  }
  {
    const s = content("마스터링 · 내보내기 전 일곱 가지", `1회차 제작 공정의 5단계. 강사가 공통 샘플 연습본으로 체크를 한 번 시연한 뒤 각자 나만의 한 편으로.`);
    const p = [["소리 켜고 한 번 · 끄고 한 번", "자막만으로도 이해되나"], ["음량", "말이 음악보다 크게"], ["자막 오탈자", "이름 · 숫자 · 맞춤법"], ["컷마다 색", "튀는 컷 없나"], ["첫 3초", "무슨 영상인지 바로 아나"], ["마지막 1초", "정지 · 로고 · 다음 행동"], ["세로 안전 영역", "버튼 자리에 글자 없나"]];
    const hw = (CW - 0.3) / 2;
    p.forEach(([h, b], i) => {
      const col = i < 4 ? 0 : 1, r = i < 4 ? i : i - 4;
      k.row(s, M + col * (hw + 0.3), 1.75 + r * 0.98, hw, 0.84, { n: i + 1, head: h, body: b, headW: 3.0 });
    });
    k.card(s, M + hw + 0.3, 1.75 + 3 * 0.98, hw, 0.84, { fill: C.accent6 });
    k.text(s, "워크북에 체크하고 내보내기로", { x: M + hw + 0.6, y: 1.75 + 3 * 0.98, w: hw - 0.6, h: 0.84, fontSize: 15, bold: true, valign: "middle" });
  }
  follow(19, "내보내기", ["오른쪽 위 '내보내기'", "이름: 날짜_채널_제목 (예: 1119_내채널_첫빵)", "해상도 1080p · 프레임 속도 30fps(촬영과 같게) · 형식 MP4 · 코덱 H.264", "저장 위치 확인 → 내보내기", "폰으로 옮겨 한 번 재생"], "폰에서 끊김 없이 재생됨", `나만의 한 편을 내보내기(연습본도 원하면 같은 방법으로). H.264가 가장 호환성이 좋습니다. HEVC(H.265)는 파일이 작지만 일부 기기 · 편집기에서 안 열릴 수 있음. 창 모양은 버전마다 다름.`, "exportbox");
  follow(20, "쇼츠로 올리기", ["폰 유튜브 앱 → + → 동영상 올리기 (또는 PC 유튜브 스튜디오)", "제목 · 설명 첫 두 줄 (2회차 발행 전 다섯 가지)", "공개 범위 고르기 (일부 공개도 OK)", "사실처럼 보이는 합성 · 변경 콘텐츠면 AI 표시", "크루장에게 링크 보내기"], "내 채널에 나만의 한 편이 올라감 = 첫 오너먼트", `2회차에 연 채널로. 얼굴 공개가 부담이면 일부 공개. B(추가 샘플)로 만든 사람도 올려도 됩니다: 추가 샘플은 강사가 찍었거나 상업 이용이 되는 무료 스톡이라 채널 업로드 가능. 공통 샘플 연습본은 올리지 않아도 됩니다.`);
  {
    const s = content("크루 상영회 · 첫 오너먼트", `크루 안에서 한 사람씩 나만의 한 편 재생 → 모두가 칭찬 1 + 제안 1. 크루장은 전원 업로드를 확인하고 크루 트리 현황판에 첫 오너먼트 스티커.
시간이 되면 크루마다 한 편씩 전체 화면으로.`, "크루");
    pill(s, "크루", C.accent2, 1.3);
    k.card(s, M, 1.8, CW, 1.5, { fill: C.text2 });
    k.text(s, "한 사람씩 재생 → 모두가 \"칭찬 하나 + 제안 하나\"", { x: M, y: 1.8, w: CW, h: 1.5, fontSize: 26, bold: true, color: C.background1, align: "center", valign: "middle" });
    const t = [["FaHeart", "칭찬 하나", "구체적으로: \"훅 슬로가 좋았어요\""], ["FaRegLightbulb", "제안 하나", "고칠 것 하나만: \"자막이 버튼에 가려요\""], ["FaTree", "첫 오너먼트", "올린 사람 칸에 스티커, 크루 전원이면 별"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 3.55, c.w, 2.1, { icon: t[i][0], head: t[i][1], body: t[i][2], bodySize: 13.5, headSize: 16 });
    k.takeaway(s, "오늘 우리 트리에 첫 오너먼트가 달렸습니다", 5.85);
  }
  {
    const s = content("다음 두 번 · 장르별 실습", `4 · 5회차는 오늘 익힌 기능을 장르마다 다시 쓰는 시간. 장르를 하나 골라 촬영 소스를 모아 오기. 오늘 B(추가 샘플)로 한 사람은 다음엔 꼭 내 영상으로.`);
    const g = [["FaBolt", "숏폼", "훅 · 빠른 컷 · 자막"], ["FaVideo", "브이로그", "현장음 · 음악 · 컷 리듬"], ["FaListOl", "정보성", "자막 · PiP · 키프레임 강조"], ["FaComments", "스트리머형", "리액션 PiP · 라이브"], ["FaMagic", "AI 영상", "생성 영상 + CapCut 편집"]];
    const c = cols(5, 0.22);
    for (let i = 0; i < 5; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.6, { icon: g[i][0], head: g[i][1], body: g[i][2], bodySize: 13, headSize: 16 });
    k.card(s, M, 4.7, CW, 1.1, { fill: C.accent6 });
    k.text(s, "과제", { x: M + 0.3, y: 4.7, w: 1.2, h: 1.1, fontSize: 16, bold: true, valign: "middle" });
    k.text(s, "① 나만의 한 편 다듬어 채널에 올리기   ② 다음 회차 장르 하나 고르고 내 영상 찍어 오기 (오늘 B로 한 사람은 꼭)", { x: M + 1.4, y: 4.7, w: CW - 1.7, h: 1.1, fontSize: 16, bold: true, valign: "middle" });
  }
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    s.addText("찍고, 기획하고,\n이제 편집까지", { placeholder: "title" });
    s.addText("오늘 단 첫 오너먼트 위에, 다음 두 번 장르별 오너먼트를 답니다", { placeholder: "body" });
    s.addNotes(`마무리. 크루장은 크루원 업로드 링크를 크루 폴더에 정리.
수업 후: 단톡방에 핸드북 3장 · 워크북 · 단축키 치트시트 · 과제 공지.`);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
