// 4회차 (11/26) 슬라이드 생성: node build/session4_slides.js [출력 경로]
// 내용 기준: build/session4/outline.md
const path = require("path");
const { THEME, HEX, W, H, M, newDeck, makeKit } = require("./lib/deck");
const { prepare } = require("./lib/images");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "04", "4회차_카테고리AtoZ_보여주는영상_슬라이드.pptx");
const CW = W - 2 * M;
const TOTAL = 8; // 따라하기 수

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
  const img = await prepare("s4", IMAGE_SPECS);
  if (img.missing.length) console.log("이미지 없음(그라데이션으로 대체):", img.missing.join(", "));

  const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 4회차 — 카테고리 A to Z ① 보여주는 영상";
  const { pres, C } = newDeck({ title: "촬영편집 4회차 — 카테고리 A to Z ①", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";
  let period = 0;
  let periodName = "시작";

  const content = (title, notes, part) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, (period ? `${period}교시 · ${periodName}` : "4회차 · 카테고리 A to Z ①") + (part ? `  ·  ${part}` : ""));
    if (period) k.progress(s, period);
    s.addText(title, { placeholder: "title" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
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
  // 단계 표시 (A~G)
  const STEP = { A: "A 정의", B: "B 레퍼런스", C: "C 기획", D: "D 촬영", E: "E 편집", F: "F 발행", G: "G 체크" };
  const step = (s, key) => pill(s, STEP[key], key === "E" ? C.accent1 : C.text2, 1.7);

  // 따라하기: 왼쪽 클릭 순서, 오른쪽 확인 카드
  const follow = (n, title, steps, check, notes) => {
    const s = content(`따라하기 ${String(n).padStart(2, "0")} · ${title}`, notes, `따라하기 ${n} / ${TOTAL}`);
    pill(s, `따라하기 ${String(n).padStart(2, "0")} / ${TOTAL}`, C.accent1, 2.2);
    const lw = 7.6;
    const rh = Math.min(0.72, 4.45 / steps.length);
    steps.forEach((st, i) => {
      const y = 1.72 + i * rh;
      k.card(s, M, y, lw, rh - 0.1, { fill: i % 2 ? "FFFFFF" : C.background2, line: i % 2 ? "DDE4E0" : undefined });
      k.badge(s, M + 0.18, y + (rh - 0.1 - 0.44) / 2, 0.44, i + 1, { fontSize: 13 });
      k.text(s, st, { x: M + 0.8, y, w: lw - 1.0, h: rh - 0.1, fontSize: 14, valign: "middle" });
    });
    const rx = M + lw + 0.3, rw = W - M - rx, cy = 1.72, ch = 6.2 - cy;
    k.card(s, rx, cy, rw, ch, { fill: C.text2 });
    k.text(s, "확인", { x: rx + 0.3, y: cy + 0.15, w: rw - 0.6, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, check, { x: rx + 0.3, y: cy + 0.5, w: rw - 0.6, h: ch - 1.05, fontSize: 18, bold: true, color: C.background1, valign: "top" });
    k.text(s, "크루 전원이 되면 완료 카드", { x: rx + 0.3, y: cy + ch - 0.5, w: rw - 0.6, h: 0.35, fontSize: 11.5, color: C.accent6 });
    return s;
  };

  // 구조 타임라인: segs = [[이름, 설명, 비율]]
  const structure = (s, segs, y = 2.0, h = 1.15, total) => {
    h = 2.3;
    const sum = segs.reduce((a, b) => a + b[2], 0);
    const palette = [C.text2, C.accent2, "3E6B57", C.accent1, "6E8F7E", "B9A26A"];
    let x = M;
    segs.forEach(([name, sub, wgt], i) => {
      const w = (CW * wgt) / sum;
      const fill = palette[i % palette.length];
      const col = fill === C.accent1 ? C.text1 : C.background1;
      s.addShape(S.rect, { x, y, w: w - 0.05, h, fill: { color: fill }, line: { type: "none" } });
      k.text(s, name, { x: x + 0.14, y: y + 0.16, w: w - 0.3, h: 0.5, fontSize: w < 1.6 ? 14 : 17, bold: true, color: col });
      k.text(s, sub, { x: x + 0.14, y: y + 0.75, w: w - 0.28, h: h - 0.9, fontSize: w < 1.6 ? 11.5 : 13, color: col, valign: "top" });
      x += w;
    });
    if (total) k.text(s, total, { x: M, y: y - 0.42, w: CW, h: 0.35, fontSize: 12, bold: true, color: C.accent2, align: "right" });
  };

  // 레퍼런스 해부 슬라이드 (영상은 강사가 넣기)
  const reference = (title, notes, look) => {
    const s = content(title, notes, "레퍼런스");
    step(s, "B");
    const bw = 6.6, bh = 3.6;
    s.addShape(S.roundRect, { x: M, y: 1.7, w: bw, h: bh, rectRadius: 0.12, fill: { color: "F4F6F5" }, line: { color: "B9C6BF", width: 1.25, dashType: "dash" } });
    k.text(s, "레퍼런스 영상 캡처 · 링크\n(강사가 골라 넣기)", { x: M, y: 1.7, w: bw, h: bh, fontSize: 16, bold: true, color: C.accent5, align: "center", valign: "middle" });
    const rx = M + bw + 0.35, rw = W - M - rx;
    k.text(s, "보면서 찾을 것", { x: rx, y: 1.7, w: rw, h: 0.4, fontSize: 15, bold: true, color: C.accent2 });
    look.forEach((t, i) => k.row(s, rx, 2.2 + i * 0.8, rw, 0.68, { n: i + 1, head: t, body: "", headW: rw - 0.9 }));
    // 빈 타임라인
    const ty = 5.6;
    s.addShape(S.rect, { x: M, y: ty, w: CW, h: 0.38, fill: { color: "FFFFFF" }, line: { color: "B9C6BF", width: 1 } });
    for (let i = 1; i < 10; i++) s.addShape(S.line, { x: M + (CW * i) / 10, y: ty, w: 0, h: 0.38, line: { color: "DDE4E0", width: 0.75 } });
    k.text(s, "0초", { x: M, y: ty + 0.42, w: 1, h: 0.3, fontSize: 10.5, color: C.accent5 });
    k.text(s, "끝", { x: W - M - 1, y: ty + 0.42, w: 1, h: 0.3, fontSize: 10.5, color: C.accent5, align: "right" });
    k.text(s, "타임라인에 구간을 그려 보기 (몇 초에 무엇이)", { x: M + 2, y: ty + 0.42, w: CW - 4, h: 0.3, fontSize: 10.5, color: C.accent5, align: "center" });
    return s;
  };

  // G 체크 + 카테고리 카드 요약
  const checkCard = (title, notes, checks, card) => {
    const s = content(title, notes, "체크");
    step(s, "G");
    const lw = 6.4;
    checks.forEach((t, i) => {
      const y = 1.75 + i * 0.86;
      k.card(s, M, y, lw, 0.74, { fill: i % 2 ? "FFFFFF" : C.background2, line: i % 2 ? "DDE4E0" : undefined });
      k.text(s, "☐", { x: M + 0.2, y, w: 0.45, h: 0.74, fontSize: 18, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, t, { x: M + 0.7, y, w: lw - 0.9, h: 0.74, fontSize: 14.5, valign: "middle" });
    });
    const rx = M + lw + 0.3, rw = W - M - rx;
    k.card(s, rx, 1.75, rw, 4.3, { fill: C.text2 });
    k.text(s, "카테고리 카드 한 장 요약", { x: rx + 0.3, y: 1.9, w: rw - 0.6, h: 0.38, fontSize: 14, bold: true, color: C.accent1 });
    card.forEach(([h, b], i) => {
      const y = 2.35 + i * 0.6;
      k.text(s, h, { x: rx + 0.3, y, w: 0.5, h: 0.5, fontSize: 15, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, b, { x: rx + 0.8, y, w: rw - 1.1, h: 0.5, fontSize: 12.5, color: C.background1, valign: "middle" });
    });
    return s;
  };

  // ───────────────────────── 시작 ─────────────────────────
  pres.addSection({ title: sec });
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    k.text(s, "AI콘텐츠 크리에이터 실무 · 촬영편집", { x: M, y: 1.7, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.accent1, charSpacing: 1 });
    s.addText("4회차\n카테고리 A to Z ①", { placeholder: "title" });
    s.addText("보여주는 영상 — 유튜브 롱폼과 릴스 · 쇼츠 · 틱톡", { placeholder: "body" });
    k.text(s, "2026. 11. 26 (목)  ·  1공학관", { x: M, y: 6.5, w: 8, h: 0.35, fontSize: 13, color: "C9D3CE" });
    s.addNotes(`[시작 전] CapCut 로그인 확인. 수업 시작과 동시에 "오늘 하루 브이로그" 촬영을 시작하므로 폰 배터리 · 저장 공간 확인 안내.
오늘부터는 기술이 아니라 "카테고리"로 배웁니다. 롱폼(유튜브)과 숏폼(릴스 · 쇼츠 · 틱톡) 두 갈래.`);
  }
  {
    const s = content("오늘의 흐름", `오늘은 카테고리 네 개를 A부터 G까지 한 번씩. 끝나면 롱폼 1편 + 숏폼 1편 = 오너먼트 두 개.
교시 시각은 유동적. 크루 진도에 맞춰 조절.`);
    k.card(s, M, 1.8, 3.4, 4.75, { fill: C.text2 });
    k.text(s, "오늘 남는 것", { x: M + 0.35, y: 2.05, w: 2.9, h: 0.4, fontSize: 14, bold: true, color: C.accent6 });
    k.text(s, "롱폼 1편\n+ 숏폼 1편", { x: M + 0.35, y: 2.5, w: 2.9, h: 1.4, fontSize: 26, bold: true, color: C.accent1 });
    k.text(s, "수업 날 브이로그 (16:9)\n상품 이미지 또는 챌린지 (9:16)\n= 오너먼트 두 개", { x: M + 0.35, y: 4.0, w: 2.9, h: 1.3, fontSize: 14, color: C.background1 });
    k.text(s, "카테고리 4개 × A to Z", { x: M + 0.35, y: 5.7, w: 2.9, h: 0.5, fontSize: 13, bold: true, color: C.accent6 });
    const rows = [["플랫폼 지도 · 카테고리 지도", "촬영 시작"], ["① 브이로그", "롱폼 + 하루 1초"], ["② 정보성 · 리뷰", "기획 시트"], ["③ 상품 이미지 영상", "10컷 → 15초"], ["④ 챌린지 · 트렌드 숏폼", "크루 챌린지"], ["제작: 브이로그 롱폼", "2분 안팎"], ["플랫폼별 업로드 · 5회차 준비", "오너먼트 두 개"]];
    const x0 = M + 3.7, rw = CW - 3.7, rh = 0.6, gap = 0.08;
    rows.forEach(([what, out], i) => {
      const y = 1.8 + i * (rh + gap);
      k.card(s, x0, y, rw, rh, { fill: i % 2 ? "FFFFFF" : C.background2 });
      k.text(s, `${i + 1}교시`, { x: x0 + 0.25, y, w: 1.0, h: rh, fontSize: 14, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, what, { x: x0 + 1.3, y, w: 5.1, h: rh, fontSize: 15, bold: true, valign: "middle" });
      k.text(s, out, { x: x0 + 6.4, y, w: rw - 6.6, h: rh, fontSize: 13, color: C.accent5, valign: "middle", align: "right" });
    });
  }
  {
    const s = content("기술 세 가지 → 이제 카테고리로", `1회차 촬영(보는 눈), 2회차 기획(아이템 · 기획안), 3회차 편집(CapCut 사이클 23개). 세 기술을 다 배웠으니, 오늘부터는 "어떤 영상을 만들까"를 카테고리로 묶어 처음부터 끝까지 한 번씩 돌립니다.`);
    const v = [["FaCamera", "1회차 · 촬영", "구도 · 빛 · 샷 크기 · 카메라 움직임"], ["FaRegLightbulb", "2회차 · 기획", "아이템 · 레퍼런스 · 기획안 · 대본"], ["FaCut", "3회차 · 편집", "컷 · 자막 · 레이어 · 전환 · 키프레임"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.2, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.card(s, M, 4.3, CW, 1.25, { fill: C.text2 });
    k.text(s, "오늘부터: 카테고리마다 A 정의 → B 레퍼런스 → C 기획 → D 촬영 → E 편집 → F 발행 → G 체크", { x: M + 0.3, y: 4.3, w: CW - 0.6, h: 1.25, fontSize: 18, bold: true, color: C.background1, valign: "middle" });
    k.takeaway(s, "같은 기술을 카테고리에 맞게 고르고 묶는 법을 배우는 날", 5.85);
  }
  {
    const s = content("지금부터 오늘 하루를 찍습니다", `6교시에 편집할 "수업 날 브이로그" 재료. 지금부터 7교시까지 틈틈이 찍기. 폰을 가로로(16:9). 숏폼으로 쓸 컷은 세로로 따로 몇 개.
촬영 동의: 다른 사람 얼굴이 나오면 미리 물어보기, 원치 않는 사람은 빼기. 손 · 화면 · 뒷모습 위주면 편함.`, "촬영");
    pill(s, "촬영 시작", C.accent1, 1.9);
    const items = [["가로 16:9", "브이로그 롱폼용. 세로 컷은 따로 몇 개"], ["장소마다 와이드 1 + 디테일 3", "건물 · 교실 · 책상 · 손 · 화면"], ["셀프캠 3번", "아침 한마디 · 점심 · 끝나고 소감"], ["현장음 그대로", "말소리 · 키보드 · 웃음 = 분위기"], ["동의 먼저", "얼굴이 나오면 물어보기"]];
    items.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.82, CW, 0.7, { n: i + 1, head: h, body: b, headW: 4.0 }));
    k.takeaway(s, "점심 · 쉬는 시간 · 실습 장면까지 7교시 전에 20컷 이상", 6.05);
  }

  // ───────────────────────── 1교시 ─────────────────────────
  divider(1, "플랫폼 지도와 카테고리 지도", "같은 영상도 어디에 올리느냐에 따라 문법이 다르다", "img02", `목표: 롱폼 vs 숏폼 → 릴스 · 쇼츠 · 틱톡 → 롱폼 문법 5 · 숏폼 문법 5 → 한 번 찍고 여러 번 쓰기 → 카테고리 지도 7 → A to Z 7단계 → 내 카테고리 고르기.`);
  {
    const s = content("플랫폼 두 갈래", `유튜브 롱폼은 검색 · 추천으로 와서 "끝까지" 보는 영상, 숏폼은 스크롤하다 "멈추는" 영상. 같은 촬영으로 둘 다 만들 수 있지만 편집 문법이 다릅니다.
길이 제한 · 기능은 플랫폼이 자주 바꾸므로 업로드 화면에서 확인.`);
    k.table(s, [
      ["", "유튜브 롱폼", "숏폼 (릴스 · 쇼츠 · 틱톡)"],
      ["비율 · 길이", "16:9 · 2~10분 이상", "9:16 · 7~60초가 중심"],
      ["어떻게 오나", "검색 · 추천 · 구독 · TV", "스크롤 · 추천 피드"],
      ["승부처", "첫 30초 약속 + 끝까지 보기", "첫 1초 멈춤 + 반복 재생"],
      ["얼굴", "썸네일 + 제목", "커버 + 첫 장면"],
      ["소리", "내 음악 · 내레이션", "트렌드 음원 (앱 안에서)"],
      ["찾아지는 법", "제목 · 설명 · 챕터", "캡션 · 해시태그 · 음원"],
    ], { x: M, y: 1.75, w: CW, colW: [2.3, (CW - 2.3) / 2, (CW - 2.3) / 2], rowH: 0.56, fontSize: 14, align: "left" });
    k.takeaway(s, "롱폼은 '끝까지', 숏폼은 '멈추게'. 무엇을 노리는지가 편집을 바꾼다", 6.0);
  }
  {
    const s = content("릴스 · 쇼츠 · 틱톡, 같은 세로인데 다르다", `같은 9:16이지만 사람들이 보러 오는 이유가 다릅니다. 처음엔 하나만 정해서 꾸준히. 사업 홍보는 인스타, 유튜브 채널을 키우려면 쇼츠, 트렌드 · 챌린지는 틱톡이 강합니다.
인스타 피드 미리보기는 세로 영상의 가운데가 잘려 보이므로 커버의 핵심은 가운데에.`);
    const v = [["FaInstagram", "인스타그램 릴스", "브랜드 · 감성 · 가게 홍보\n피드 · 프로필과 함께 보임\n커버 · 위치 태그 · 링크"], ["FaYoutube", "유튜브 쇼츠", "유튜브 채널로 연결\n롱폼 하이라이트 · 예고\n관련 롱폼 연결"], ["FaTiktok", "틱톡", "트렌드 · 음원 · 챌린지\n빠른 반응 · 짧은 유행\n트렌드 찾기 도구"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.4, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.takeaway(s, "처음엔 하나만. 내 목적(홍보 · 채널 · 트렌드)에 맞는 곳부터", 5.6);
  }
  {
    const s = content("롱폼 문법 다섯", `롱폼은 "끝까지 보게" 하는 장치가 핵심. 2회차 기획의 훅을 롱폼에서는 첫 30초로 늘린다고 생각하면 됩니다.`);
    const r = [["첫 30초 약속", "이 영상을 보면 무엇을 얻는지 말로 · 화면으로"], ["챕터", "구간을 나누고 설명란에 00:00 타임스탬프"], ["열린 고리", "\"마지막에 ○○도 보여 드릴게요\" — 뒤를 예고"], ["B롤 비율", "말하는 얼굴만 1분 넘게 X. 보여 주는 화면을 섞기"], ["썸네일 + 제목 짝", "썸네일은 그림, 제목은 말. 같은 말을 두 번 하지 않기"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 3.4 }));
    k.takeaway(s, "롱폼은 약속 → 구간 → 예고 → 보여 주기", 6.15);
  }
  {
    const s = content("숏폼 문법 다섯", `숏폼은 "멈추게" 하고 "다시 보게" 하는 장치가 핵심. 3회차 사이클 16(비트) · 11(제목)과 연결.`);
    const r = [["첫 1초", "움직임 · 큰 글자 · 결과부터. 로고 · 인사로 시작 X"], ["한 영상 한 메시지", "하나만 말하고 끝내기"], ["비트에 맞춘 컷", "음악 박자 위에서 바뀌면 리듬이 생긴다"], ["루프", "끝 장면이 첫 장면으로 이어지면 한 번 더 본다"], ["음원은 앱 안에서", "트렌드 음원은 업로드할 때 앱에서 고르기"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 3.4 }));
    k.takeaway(s, "숏폼은 멈춤 → 한 메시지 → 리듬 → 반복", 6.15);
  }
  {
    const s = content("한 번 찍고 여러 번 쓰기", `실무에서는 촬영 한 번으로 롱폼 1편과 숏폼 여러 편을 만듭니다. 오늘 브이로그도 롱폼으로 만들고, 하이라이트를 세로로 하나 더 내보낼 수 있어요(도전).`);
    k.card(s, M, 2.0, 3.2, 2.6, { fill: C.text2 });
    k.text(s, "촬영 한 번", { x: M + 0.3, y: 2.2, w: 2.6, h: 0.5, fontSize: 20, bold: true, color: C.accent1 });
    k.text(s, "가로로 넉넉히\n+ 세로 컷 몇 개", { x: M + 0.3, y: 2.8, w: 2.6, h: 1.2, fontSize: 15, color: C.background1 });
    k.text(s, "→", { x: M + 3.25, y: 2.9, w: 0.6, h: 0.7, fontSize: 30, bold: true, color: C.accent1, align: "center" });
    k.card(s, M + 3.9, 2.0, 3.6, 2.6, { fill: C.background2 });
    k.text(s, "롱폼 1편", { x: M + 4.2, y: 2.2, w: 3.0, h: 0.5, fontSize: 20, bold: true });
    k.text(s, "유튜브 16:9\n챕터 · 썸네일", { x: M + 4.2, y: 2.8, w: 3.0, h: 1.2, fontSize: 15, color: C.accent5 });
    k.text(s, "→", { x: M + 7.55, y: 2.9, w: 0.6, h: 0.7, fontSize: 30, bold: true, color: C.accent1, align: "center" });
    const c3 = ["하이라이트", "핵심 한 가지", "비하인드"];
    c3.forEach((t, i) => {
      const y = 2.0 + i * 0.9;
      k.card(s, M + 8.2, y, CW - 8.2, 0.78, { fill: i % 2 ? "FFFFFF" : C.background2, line: "DDE4E0" });
      k.text(s, `숏폼 ${i + 1} · ${t}`, { x: M + 8.45, y, w: CW - 8.6, h: 0.78, fontSize: 15, bold: true, valign: "middle" });
    });
    k.takeaway(s, "롱폼 1 → 숏폼 3. 세로로 다시 내보낼 땐 인물을 가운데로 다시 맞추기", 5.2);
  }
  {
    const s = content("카테고리 지도 · 4회차와 5회차", `설문에서 원한 결과물(사업 홍보 · 취업 포트폴리오 · 강사 · 개인 채널 · AI 광고)에 맞춰 일곱 개를 골랐습니다. 오늘은 ①~④, 5회차는 ⑤~⑦.`);
    const cats = [["①", "브이로그", "개인 채널 · 사장 · 직무 일상", "롱폼 · 숏폼"], ["②", "정보성 · 리뷰", "강사 · 직무 · 가게 노하우 · 제품", "롱폼 중심"], ["③", "상품 이미지 영상", "뷰티 · 디저트 · 가게 홍보", "릴스 중심"], ["④", "챌린지 · 트렌드", "개인 채널 · 브랜드 참여", "틱톡 · 릴스 · 쇼츠"], ["⑤", "토크 · 인터뷰", "강사 · 자기소개 · 고객 인터뷰", "5회차"], ["⑥", "라이브 · 라이브커머스", "판매 · 소통", "5회차"], ["⑦", "AI 영상", "AI 광고 · 숏드라마", "5회차"]];
    cats.forEach(([n, name, who, where], i) => {
      const col = i < 4 ? 0 : 1, r = i < 4 ? i : i - 4, cw = (CW - 0.3) / 2;
      const x = M + col * (cw + 0.3), y = 1.75 + r * 1.0;
      k.card(s, x, y, cw, 0.86, { fill: col ? "FFFFFF" : C.background2, line: col ? "DDE4E0" : undefined });
      k.text(s, n, { x: x + 0.2, y, w: 0.5, h: 0.86, fontSize: 20, bold: true, color: col ? C.accent5 : C.accent1, valign: "middle" });
      k.text(s, name, { x: x + 0.75, y: y + 0.08, w: cw - 2.4, h: 0.4, fontSize: 16, bold: true });
      k.text(s, who, { x: x + 0.75, y: y + 0.46, w: cw - 2.4, h: 0.34, fontSize: 11.5, color: C.accent5 });
      k.text(s, where, { x: x + cw - 1.7, y, w: 1.55, h: 0.86, fontSize: 12, bold: true, color: col ? C.accent5 : C.accent2, align: "right", valign: "middle" });
    });
    k.card(s, M + (CW - 0.3) / 2 + 0.3, 1.75 + 3 * 1.0, (CW - 0.3) / 2, 0.86, { fill: C.accent6 });
    k.text(s, "5회차 대표작은 이 일곱 중 하나로", { x: M + (CW - 0.3) / 2 + 0.6, y: 1.75 + 3 * 1.0, w: (CW - 0.3) / 2 - 0.6, h: 0.86, fontSize: 15, bold: true, valign: "middle" });
  }
  {
    const s = content("카테고리 A to Z · 일곱 단계", `오늘 모든 카테고리를 이 순서로 봅니다. 워크북의 "카테고리 카드"가 이 일곱 칸. 다 모으면 나만의 제작 매뉴얼이 됩니다.`);
    const st = [["A", "정의", "무엇 · 어디에 · 누가 보나"], ["B", "레퍼런스", "잘된 영상 해부"], ["C", "기획", "구조 템플릿"], ["D", "촬영", "샷 리스트 · 세팅"], ["E", "편집", "CapCut 핵심 2~3"], ["F", "발행", "제목 · 썸네일 · 커버"], ["G", "체크", "올리기 전 5개"]];
    const sw = (CW - 6 * 0.15) / 7;
    st.forEach(([l, h, b], i) => {
      const x = M + i * (sw + 0.15), y = 2.0 + (6 - i) * 0.25;
      k.card(s, x, y, sw, 2.4, { fill: i === 4 ? C.text2 : C.background2 });
      k.text(s, l, { x: x + 0.15, y: y + 0.15, w: sw - 0.3, h: 0.7, fontSize: 32, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.15, y: y + 0.9, w: sw - 0.3, h: 0.45, fontSize: 17, bold: true, color: i === 4 ? C.background1 : C.text1 });
      k.text(s, b, { x: x + 0.15, y: y + 1.38, w: sw - 0.3, h: 0.9, fontSize: 11.5, color: i === 4 ? "C9D3CE" : C.accent5 });
    });
    k.takeaway(s, "E 편집은 3회차 기능 중에서 이 카테고리에 맞는 것만 골라 쓰기", 6.1);
  }
  {
    const s = content("내 카테고리 고르기", `워크북에 내 아이템과 목적을 적고, 일곱 개 중 "5회차 대표작으로 하고 싶은 것" 하나에 동그라미. 크루 안에서 30초씩 말하기. 오늘 배우는 카테고리가 아니어도 괜찮아요.`, "크루");
    pill(s, "크루", C.accent2, 1.3);
    const rows = [["내 아이템", "2회차 기획안의 아이템 (가게 · 직무 · 취미)"], ["목적", "홍보 · 포트폴리오 · 채널 키우기 · 판매"], ["플랫폼", "유튜브 롱폼 / 릴스 / 쇼츠 / 틱톡 중 주력 하나"], ["대표작 카테고리", "①~⑦ 중 하나 (나중에 바꿔도 OK)"]];
    rows.forEach(([h, b], i) => k.row(s, M, 1.85 + i * 0.95, CW, 0.8, { n: i + 1, head: h, body: b, headW: 3.4 }));
    k.takeaway(s, "크루 안에서 30초씩: \"저는 ○○을 ○○에 올리려고, ○번 카테고리로 해 보고 싶어요\"", 5.85);
  }

  // ───────────────────────── 2교시 ─────────────────────────
  divider(2, "① 브이로그", "하루를 같이 사는 느낌을 만드는 영상", "img03", `목표: A 정의 → B 레퍼런스 → C 구조 → D 촬영 → E 편집(J컷 · L컷 · 덕킹 · 압축과 색) → F 발행 → G 체크. 따라하기 1 · 2.`);
  {
    const s = content("브이로그란", `브이로그의 힘은 "정보"가 아니라 "같이 있는 느낌". 그래서 큰 사건이 없어도 됩니다. 리듬 · 소리 · 분위기가 내용.`, "정의");
    step(s, "A");
    const v = [["FaSun", "일상 브이로그", "하루 · 주말 · 루틴"], ["FaRoute", "여행 · 나들이", "장소 · 이동 · 먹기"], ["FaShoppingBag", "사장 · 작업 브이로그", "가게 오픈 준비 · 만드는 과정 · 직무의 하루"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.table(s, [["", "유튜브 롱폼", "릴스 · 쇼츠"], ["길이", "3~10분", "15~30초"], ["모양", "인트로 → 흐름 → 하이라이트 → 아웃트로", "\"하루를 1초씩\" 빠른 컷 + 음악"]], { x: M, y: 4.2, w: CW, colW: [1.8, (CW - 1.8) / 2, (CW - 1.8) / 2], rowH: 0.5, fontSize: 14, align: "left" });
    k.takeaway(s, "브이로그 = 정보보다 분위기. 리듬과 소리가 내용이다", 6.0);
  }
  reference("브이로그 레퍼런스 해부", `[강사] 레퍼런스 영상을 골라 왼쪽에 캡처 · 링크를 넣기. 처음 2분만 틀고 타임라인에 구간을 그리며 함께 해부.`, ["인트로는 몇 초? 무엇으로 시작?", "장면이 몇 개, 한 장면 몇 초?", "말 · 자막 · 음악 중 무엇으로 끌고 가나", "끝을 어떻게 맺나"]);
  {
    const s = content("브이로그 구조", `시간 순으로 3~5장면. 인트로에서 "오늘 무엇을 하는지" 한 문장. 하이라이트는 오늘의 한 장면(가장 웃긴 · 예쁜 · 맛있는).`, "기획");
    step(s, "C");
    structure(s, [["인트로", "오늘 무엇을 하는지 한 문장\n+ 하이라이트 1초 미리보기", 1], ["흐름 ①", "시간 순 장면\n와이드 → 디테일", 2], ["흐름 ②", "이동은 빠르게 압축", 2], ["하이라이트", "오늘의 한 장면\n음악 · 속도로 강조", 1.6], ["아웃트로", "소감 한마디\n다음 예고", 1]], 2.1, 1.1, "2분 브이로그 예: 10초 · 40초 · 40초 · 20초 · 10초");
    k.takeaway(s, "인트로에서 약속하고, 하이라이트에서 지키고, 아웃트로에서 다음을 예고", 5.6);
  }
  {
    const s = content("브이로그 촬영", `1회차 "와이드 · 미디엄 · 클로즈업"이 그대로. B롤은 말하지 않는 화면(손 · 물건 · 풍경). 말하는 화면 1에 B롤 3 정도면 지루하지 않습니다.`, "촬영");
    step(s, "D");
    const r = [["셀프캠", "팔 길이 · 눈높이 · 렌즈를 보며. 가로로"], ["B롤 3 : 1", "말하는 화면 하나에 보여 주는 화면 셋"], ["장소마다 와이드 1 + 디테일 3", "어디인지 → 무엇이 있는지"], ["현장음 살리기", "발소리 · 커피 내리는 소리 · 웃음. 음악보다 진짜 같다"], ["보이스오버는 나중에", "찍을 땐 장면만. 말은 편집하며 녹음(또는 TTS)"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 3.8 }));
    k.takeaway(s, "\"어디인지 · 무엇을 · 어떤 기분인지\"가 화면으로 보이게", 6.15);
  }
  {
    const s = content("J컷 · L컷 = 소리가 화면보다 먼저, 나중에", `J컷: 다음 장면의 소리가 먼저 들리고 화면이 따라온다(타임라인 모양이 J). L컷: 앞 장면의 소리가 다음 화면까지 이어진다(L 모양). 장면이 바뀌어도 끊기지 않고 흐르는 느낌 — 브이로그 · 인터뷰의 기본.`, "편집");
    step(s, "E");
    // 도식: 두 트랙
    const tx = M, tw = 7.6, y1 = 2.1;
    const drawCut = (y, label, aOff) => {
      k.text(s, label, { x: tx, y: y - 0.45, w: 4, h: 0.4, fontSize: 15, bold: true, color: C.accent2 });
      s.addShape(S.rect, { x: tx, y, w: tw * 0.5, h: 0.55, fill: { color: "3D6E8F" }, line: { type: "none" } });
      s.addShape(S.rect, { x: tx + tw * 0.5 + 0.04, y, w: tw * 0.5 - 0.04, h: 0.55, fill: { color: "5E7F62" }, line: { type: "none" } });
      k.text(s, "화면 A", { x: tx + 0.15, y, w: 2, h: 0.55, fontSize: 12, bold: true, color: "FFFFFF", valign: "middle" });
      k.text(s, "화면 B", { x: tx + tw * 0.5 + 0.2, y, w: 2, h: 0.55, fontSize: 12, bold: true, color: "FFFFFF", valign: "middle" });
      const split = tw * 0.5 + aOff;
      s.addShape(S.rect, { x: tx, y: y + 0.62, w: split, h: 0.45, fill: { color: "9CC3D9" }, line: { type: "none" } });
      s.addShape(S.rect, { x: tx + split + 0.04, y: y + 0.62, w: tw - split - 0.04, h: 0.45, fill: { color: "B7D3B9" }, line: { type: "none" } });
      k.text(s, "소리 A", { x: tx + 0.15, y: y + 0.62, w: 2, h: 0.45, fontSize: 11, bold: true, valign: "middle" });
      k.text(s, "소리 B", { x: tx + split + 0.2, y: y + 0.62, w: 2, h: 0.45, fontSize: 11, bold: true, valign: "middle" });
    };
    drawCut(y1, "J컷 · 다음 소리가 먼저", -1.4);
    drawCut(y1 + 2.0, "L컷 · 앞 소리가 이어짐", 1.4);
    const rx = M + 8.0, rw = W - M - rx;
    [["J컷", "다음 장면 소리(물소리 · 말)가 먼저 → 궁금하게"], ["L컷", "말이 끝나기 전에 B롤로 → 얼굴만 계속 X"], ["어디에", "장소가 바뀔 때 · 인터뷰 답 위에 B롤"]].forEach(([h, b], i) => {
      k.text(s, h, { x: rx, y: 1.75 + i * 1.15, w: rw, h: 0.4, fontSize: 16, bold: true, color: i === 0 ? C.accent2 : C.text1 });
      k.text(s, b, { x: rx, y: 2.15 + i * 1.15, w: rw, h: 0.7, fontSize: 12.5, color: C.accent5 });
    });
    k.takeaway(s, "화면과 소리를 다른 곳에서 자르면, 장면이 바뀌어도 이야기는 흐른다", 6.15);
  }
  follow(1, "L컷 만들기", ["말하는 셀프캠 클립 다음에 B롤 클립 놓기", "셀프캠 클립 우클릭 → 오디오 분리(Separate audio)", "B롤 클립을 위 트랙으로 올려 셀프캠 끝부분 위에 겹치기", "분리된 셀프캠 소리는 그대로, 화면만 B롤로 바뀌는지 재생", "J컷: 다음 장면 소리 클립의 시작을 앞으로 1초 당기기"], "말은 이어지고 화면만 B롤로 바뀜", `메뉴 이름은 버전마다 다를 수 있음(오디오 분리 · 오디오 추출). 3회차 레이어 원리(위 트랙이 앞에 보임)를 그대로 씁니다.
PC 소리가 안 나므로 파형으로 확인: 말 파형이 B롤 아래에서도 이어지면 성공.`);
  {
    const s = content("음악은 구간으로, 말할 땐 낮추기", `브이로그 음악은 한 곡을 처음부터 끝까지 깔지 말고 장면마다 바꾸거나 쉬어 가기. 말할 때는 음악을 내리고(덕킹), 말이 끝나면 다시 올리기. 이동 구간은 속도 · 타임랩스로 압축, 색은 하나로 통일.`, "편집");
    step(s, "E");
    const v = [["FaMusic", "음악 구간", "인트로 · 흐름 · 하이라이트마다 곡 또는 분위기 바꾸기. 말하는 셀프캠 구간은 음악 쉬기"], ["FaTachometerAlt", "이동은 압축", "걷기 · 운전 · 줄 서기는 2~4배속이나 타임랩스, 또는 3컷으로 점프"], ["FaPalette", "색 하나로", "필터 · 조정을 약하게 한 가지. 모든 클립에 같은 설정 (3회차 사이클 7)"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.0, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "볼륨 기준(3회차): 말 0dB · 음악은 말 있을 때 −15 ~ −20dB", 5.2);
  }
  follow(2, "말할 때 음악 낮추기 (덕킹)", ["음악 클립 선택 → 오른쪽 오디오 패널", "셀프캠이 시작되기 0.5초 전에 재생헤드 → 볼륨 옆 ◇", "셀프캠 시작 지점으로 → 볼륨을 −18dB 정도로 (두 번째 점)", "셀프캠 끝 → ◇ 그대로, 0.5초 뒤 → 볼륨을 원래대로", "파형으로 확인: 말 구간에서 음악 파형이 낮아짐"], "말할 때만 음악이 내려갔다 다시 올라옴", `3회차 키프레임(사이클 19)을 볼륨에 쓰는 것. 버전에 따라 자동으로 음악을 낮추는 기능이 있을 수 있으니 강사 PC에서 확인(오디오 패널).
소리 확인은 폰으로(내보내기 또는 클라우드 → 폰 앱).`);
  {
    const s = content("브이로그 발행", `롱폼은 제목 · 썸네일 · 챕터, 숏폼 버전은 "하루를 1초씩" 컷 + 음원. 같은 촬영으로 두 개.`, "발행");
    step(s, "F");
    const hw = (CW - 0.3) / 2;
    [["유튜브 롱폼", ["제목: 누가 · 어디서 · 무엇을 (\"수족관 사장의 월요일 오픈 준비\")", "썸네일: 표정 + 장소 + 3단어", "챕터: 00:00 인트로 · 장면별", "설명 첫 두 줄: 오늘 무엇을 · 다음 영상"], C.background2, C.text1], ["릴스 · 쇼츠 버전", ["하루를 1초씩 15~20컷", "첫 컷 = 하이라이트", "음원은 앱 안에서", "캡션 한 줄 + 해시태그 3~5"], C.text2, C.background1]].forEach(([h, items, fill, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.9, { fill });
      k.text(s, h, { x: x + 0.35, y: 2.0, w: hw - 0.7, h: 0.5, fontSize: 20, bold: true, color: i ? C.accent1 : C.accent2 });
      k.checklist(s, items, { x: x + 0.35, y: 2.65, w: hw - 0.7, h: 2.9, fontSize: 14.5, color: col, paraSpaceAfter: 10 });
    });
    k.takeaway(s, "롱폼 1편 찍으면 숏폼 하나는 덤", 6.0);
  }
  checkCard("브이로그 체크 · 카테고리 카드 ①", `워크북 카테고리 카드 ①에 정리. 이 카드가 5회차 대표작 · 나중의 내 브이로그 매뉴얼.`, ["첫 30초에 오늘의 약속(무엇을 하는지)", "말하는 화면만 1분 넘게 가지 않음 (B롤)", "음악이 말을 덮지 않음 (덕킹)", "얼굴이 나온 사람에게 동의", "숏폼 버전 하나 따로 (도전)"], [["A", "같이 사는 느낌 · 3~10분 / 15~30초"], ["C", "인트로 → 흐름 → 하이라이트 → 아웃트로"], ["D", "셀프캠 · B롤 3:1 · 와이드1+디테일3"], ["E", "J컷 · L컷 · 덕킹 · 압축 · 색 하나"], ["F", "누가·어디서·무엇을 · 챕터 · 하루 1초"], ["G", "왼쪽 다섯 개"]]);
  statement("점심 미션 · 브이로그 컷 모으기", "구내식당 · 학교 · 친구와 이야기. 와이드 1 + 디테일 3, 셀프캠 한마디, 현장음 그대로", `점심시간에 브이로그 재료를 모으는 시간. 얼굴이 나오면 동의 먼저. 숏폼용 세로 컷도 몇 개.`);

  // ───────────────────────── 3교시 ─────────────────────────
  divider(3, "② 정보성 · 리뷰", "보여 주고 설명하는 영상 — 보고 나면 할 수 있게, 사기 전에 알 수 있게", "img04", `목표: 정보성과 리뷰를 함께(구조가 닮음). A 정의 → B 레퍼런스 → C 구조 둘 → D A롤 · B롤 · 화면 녹화 → E 편집(확대 · 정보 카드) → F 발행 · 광고 표시 → G 체크 → 내 아이템 기획 시트.`);
  {
    const s = content("정보성과 리뷰", `둘 다 "보여 주고 설명"하지만 시청자의 질문이 다릅니다. 정보성 = "어떻게 해요?", 리뷰 = "사도 돼요? 가도 돼요?"`, "정의");
    step(s, "A");
    const hw = (CW - 0.3) / 2;
    await k.featureCard(s, M, 1.8, hw, 3.3, { icon: "FaListOl", head: "정보성 · 하우투", body: "보고 나면 할 수 있게 되는 영상\n하우투 · ○가지 리스트 · 비교 · 왜?\n강사 진로 · 직무 포트폴리오 · 가게 노하우", bodySize: 14.5 });
    await k.featureCard(s, M + hw + 0.3, 1.8, hw, 3.3, { icon: "FaStar", head: "리뷰 · 소개", body: "사기 전에, 가기 전에 보는 영상\n제품 · 언박싱 · 가게 · 맛집 · 장소\n내 가게 · 내 상품 소개", bodySize: 14.5, dark: true });
    k.takeaway(s, "롱폼에서 가장 많이 검색되는 두 카테고리. 숏폼은 핵심 하나씩 잘라서", 5.5);
  }
  reference("정보성 · 리뷰 레퍼런스 해부", `[강사] 정보성 1편 · 리뷰 1편을 골라 넣기(시간이 없으면 한 편만). 정보성은 문제 제기가 몇 초에 끝나는지, 리뷰는 결론을 처음에 말하는지 끝에 말하는지.`, ["문제 제기 · 결론이 몇 초에?", "핵심(장면)이 몇 개?", "말하는 화면 vs 보여 주는 화면 비율", "마지막에 무엇을 하라고 하나"]);
  {
    const s = content("정보성 구조", `"이런 적 있죠?"로 시작해서 "오늘 ○가지"로 약속. 핵심마다 설명 + 예시 + 보여 주는 화면. 약속한 개수와 실제 개수가 같아야 신뢰가 생깁니다.`, "기획");
    step(s, "C");
    structure(s, [["문제", "이런 적 있죠?\n공감 한 문장", 0.8], ["약속", "오늘 ○가지\n끝까지 보면 ○○", 0.8], ["핵심 1", "설명 + 예시 + 화면", 1.5], ["핵심 2", "설명 + 예시 + 화면", 1.5], ["핵심 3", "설명 + 예시 + 화면", 1.5], ["요약 · 행동", "한 줄 요약\n댓글 · 다음 영상", 1]], 2.1, 1.1, "3분 정보성 예: 10초 · 10초 · 50초 · 50초 · 50초 · 10초");
    k.takeaway(s, "대본 초안은 AI로, 사실 · 숫자 확인은 사람이", 5.6);
  }
  {
    const s = content("리뷰 · 소개 구조", `결론을 처음에 한 줄로 말하면 끝까지 보는 사람이 오히려 많아집니다("결론부터: 이 가격이면 삽니다"). 아쉬운 점을 말해야 좋은 점도 믿습니다.`, "기획");
    step(s, "C");
    structure(s, [["한 줄 결론", "첫인상 · 결론부터", 0.8], ["겉모습 · 디테일", "포장 · 크기 · 질감", 1.2], ["써 보기", "먹어 보기 · 가 보기", 1.6], ["장단점", "좋은 점 2 · 아쉬운 점 1", 1.1], ["누구에게", "이런 분께 추천", 0.8], ["정보", "가격 · 위치 · 링크", 0.7]], 2.1, 1.1, "2~4분 리뷰 · 가게 소개는 입구 → 내부 → 메뉴 · 상품 → 사람");
    k.takeaway(s, "결론부터, 아쉬운 점도. 그래야 믿고 산다", 5.6);
  }
  {
    const s = content("말하는 화면 + 보여 주는 화면", `A롤 = 말하는 사람, B롤 = 보여 주는 화면. 정보성 · 리뷰는 B롤이 내용입니다. 화면 녹화는 PC · 폰 기본 기능으로 충분.`, "촬영");
    step(s, "D");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.9, { fill: C.background2 });
    k.text(s, "B롤 종류", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
    k.checklist(s, ["손 클로즈업 (하는 과정)", "탑뷰 (책상 위 · 음식 · 제품)", "매크로 (질감 · 글자 · 디테일)", "화면 녹화 (앱 · 사이트 · 문서)", "자료 화면 (사진 · 표 · 그래프)"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 14.5, paraSpaceAfter: 9 });
    const x2 = M + hw + 0.3;
    k.card(s, x2, 1.8, hw, 3.9, { fill: C.text2 });
    k.text(s, "화면 녹화 방법", { x: x2 + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["Windows 11: 캡처 도구 → 녹화 (Win + Shift + S)", "Windows: Xbox Game Bar (Win + Alt + R, 앱 창)", "Mac: Cmd + Shift + 5", "iPhone: 제어 센터 → 화면 기록", "Android: 빠른 설정 → 화면 녹화"], { x: x2 + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 13.5, color: C.background1, paraSpaceAfter: 9 });
    k.takeaway(s, "말 한 문장마다 보여 줄 화면 하나를 미리 정해 두기", 6.0);
  }
  {
    const s = content("정보성 · 리뷰 편집 핵심 셋", `3회차 기능을 정보 전달에 맞게 씁니다. 번호 · 정보 카드는 한 번 디자인하면 계속 복사해 쓰기(채널의 얼굴이 됨).`, "편집");
    step(s, "E");
    const v = [["FaSearch", "확대해서 보여 주기", "화면 녹화 위에 크기 · 위치 키프레임으로 보여 줄 곳을 확대 (3회차 사이클 19)"], ["FaListOl", "번호 · 정보 카드", "\"핵심 1\" 카드, 가격 · 위치 카드를 같은 디자인으로. 복사해 재사용"], ["FaLayerGroup", "화면 속 화면 · 분할", "말하는 사람 + 자료 동시에, 비교는 반반 화면 (사이클 12 · 17)"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "내레이션이 부담되면 TTS(3회차) · 자막 중심도 OK", 5.3);
  }
  follow(3, "화면 녹화에서 보여 줄 곳 확대", ["화면 녹화 클립을 메인 트랙에, 16:9 프로젝트", "설명이 시작되는 곳에 재생헤드 → 크기 · 위치 옆 ◇", "1초 뒤로 → 크기 150%, 보여 줄 곳이 가운데 오게 위치 이동", "설명이 끝나는 곳 ◇ 그대로, 1초 뒤 → 크기 100%로", "확대된 곳에 강조 박스(스티커 · 도형) 하나"], "보여 줄 곳으로 다가갔다가 다시 전체로 돌아옴", `3회차 키프레임 줌인의 응용. 너무 자주 확대하면 어지러우니 핵심 장면에서만. 글자가 깨지면 녹화 해상도를 높이기.`);
  follow(4, "번호 · 정보 카드 만들고 재사용", ["텍스트 트랙에 \"핵심 1\" 텍스트 → 글꼴 · 색 · 배경(박스) 정하기", "위치는 왼쪽 위, 등장 애니메이션 하나", "카드 클립 복사(Ctrl + C) → 핵심 2 위치에 붙여넣기(Ctrl + V) → 글자만 바꾸기", "리뷰는 같은 방법으로 가격 · 위치 카드", "모든 카드의 위치 · 크기가 같은지 확인"], "카드가 모두 같은 디자인 · 같은 자리", `디자인 전공자는 브랜드 색을 미리 정해 두면 좋음(5회차 브랜딩과 연결). 텍스트 템플릿을 써도 되지만 너무 화려한 것은 피하기.`);
  {
    const s = content("정보성 · 리뷰 발행 · 광고 표시", `협찬 · 제공 · 할인 등 대가를 받았다면 영상 처음 · 제목 등 잘 보이는 곳에 "광고" "협찬" 표시(공정위 추천 · 보증 지침). 내 가게 홍보도 내 가게임을 밝히기. 플랫폼의 유료 광고 표시 기능도 함께.`, "발행");
    step(s, "F");
    const r = [["제목", "숫자 · 결과 · 대상: \"초보 사장님이 꼭 알아야 할 포장 3가지\""], ["썸네일", "정보성은 결과 비포 · 애프터, 리뷰는 제품 크게 + 한 단어"], ["챕터", "핵심 1 · 2 · 3 = 챕터 1 · 2 · 3 (00:00부터, 3개 이상)"], ["숏폼으로", "핵심 하나 = 숏폼 하나, \"저장하고 싶은\" 정보 카드"], ["광고 표시", "협찬 · 제공은 처음에 분명히 (뒷광고 금지)"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "검색되는 제목 + 저장되는 숏폼 + 숨기지 않는 광고 표시", 6.15);
  }
  checkCard("정보성 · 리뷰 체크 · 카테고리 카드 ②", `워크북 카테고리 카드 ②.`, ["첫 30초에 무엇을 얻는지 약속", "약속한 개수 = 핵심 개수", "사실 · 숫자 · 가격은 출처 확인", "리뷰는 아쉬운 점도 하나", "협찬 · 제공이면 처음에 표시"], [["A", "할 수 있게 / 사기 전에 · 2~10분"], ["C", "문제→약속→핵심3→요약 / 결론→디테일→장단점"], ["D", "A롤 + B롤(손·탑뷰·매크로·화면 녹화)"], ["E", "확대 키프레임 · 정보 카드 · PiP · 분할"], ["F", "숫자 제목 · 챕터 · 숏폼 하나씩 · 광고 표시"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("실습 · 내 아이템 기획 시트", `워크북 기획 시트에 내 아이템으로 정보성 또는 리뷰 하나. 2회차 기획 코치 GPT에 아래처럼 물어 초안을 받고, 사실은 내가 확인. 크루 안에서 제목만 돌아가며 읽어 주기.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const rows = [["제목", "숫자 · 결과 · 대상이 들어간 한 줄"], ["약속", "끝까지 보면 무엇을 얻나"], ["핵심 3", "각각 보여 줄 화면 하나씩"], ["행동", "댓글 · 저장 · 다음 영상 · 방문"]];
    rows.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.8, 6.6, 0.68, { n: i + 1, head: h, body: b, headW: 1.6 }));
    k.prompt(s, M + 6.9, 1.8, CW - 6.9, 3.1, "내 아이템은 [ ○○ ]이고 시청자는 [ ○○ ]야.\n유튜브 정보성(또는 리뷰) 영상 기획을 도와줘.\n제목 후보 5개, 약속 한 문장, 핵심 3개와 각 핵심에서 보여 줄 화면, 마지막 행동 한 가지를 표로.", "기획 코치 GPT에");
    k.takeaway(s, "5회차 대표작이 정보성 · 리뷰라면 이 시트가 바로 대본의 뼈대", 5.4);
  }

  // ───────────────────────── 4교시 ─────────────────────────
  divider(4, "③ 상품 이미지 영상", "말 없이, 컷과 음악만으로 갖고 싶게 만드는 영상", "img05", `목표: 요즘 상품 영상은 퀄리티 기준이 높아져서 "원하는 컷신 + 편집"이 전부. A 정의 → B 레퍼런스 → C 컷 리스트 → D 빛 · 배경 · 움직임 → E 비트 컷 · 스피드 램프 · 색 → AI 컷 섞기 → F 커버 · 음원 → G 체크 → 실습 10컷 → 15초.`);
  {
    const s = content("상품 이미지 영상이란", `대사 없이 10~20초. 제품 · 메뉴 · 시술 · 작업 과정을 "가장 예쁜 순간"만 모아 음악에 맞춰 보여 줌. 릴스가 주무대, 피드용 4:5 · 1:1도. 뷰티샵 · 디저트 · 수족관 · 인쇄 같은 사업 홍보에 바로 쓰입니다.`, "정의");
    step(s, "A");
    const v = [["FaBoxOpen", "신제품 · 티저", "공개 전 기대감, 디테일만 살짝"], ["FaMagic", "메뉴 · 시술 · 작업 과정", "만드는 손 · 변하는 순간"], ["FaImage", "브랜드 무드", "제품보다 분위기 · 색 · 공간"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.table(s, [["길이", "비율", "소리", "글자"], ["10~20초 · 컷 12~20개", "9:16 릴스 · 4:5 / 1:1 피드", "음악만 (+ 효과음)", "엔딩 카드만 (이름 · 가격 · 어디서)"]], { x: M, y: 4.2, w: CW, rowH: 0.5, fontSize: 14, align: "center" });
    k.takeaway(s, "말 대신 컷이 설명한다. 그래서 컷 하나하나의 완성도가 전부", 5.75);
  }
  reference("상품 이미지 영상 레퍼런스 해부", `[강사] 브랜드 계정 1편 + 수강생 업종과 비슷한 작은 가게 릴스 1편을 넣기. 무음으로 틀어도 됩니다(컷 수 · 리듬을 눈으로).`, ["컷이 몇 개, 한 컷 몇 초?", "첫 1초에 무엇이 움직이나", "컷이 바뀌는 곳 = 음악 박자?", "색이 한 톤인가, 글자는 어디에만?"]);
  {
    const s = content("컷 리스트 구조 · 다섯 블록", `컷 12~20개를 다섯 블록에 나눠 찍기. 블록마다 2~5컷. 훅 컷은 가장 예쁘고 움직임이 큰 순간(붓기 · 떨어뜨리기 · 펼치기).`, "기획");
    step(s, "C");
    structure(s, [["훅", "가장 예쁜 순간\n움직임 큰 컷", 1], ["디테일", "질감 · 매크로\n글자 · 재료", 1.4], ["쓰는 장면", "손 · 사람 · 사용\n바르기 · 먹기", 1.4], ["히어로 샷", "제품 정면\n로고 · 전체", 1], ["엔딩 카드", "이름 · 가격\n어디서", 0.7]], 2.1, 1.1, "15초 예: 2초 · 4초 · 4초 · 3초 · 2초");
    k.takeaway(s, "찍기 전에 컷 리스트 15줄. 현장에서 생각하면 같은 컷만 찍게 된다", 5.6);
  }
  {
    const s = content("컷신 촬영 ① 빛과 배경", `1회차 빛 · 구도가 그대로. 폰으로도 "빛 + 배경 + 거리"만 잡으면 광고처럼 나옵니다. 흰 종이 한 장이 반사판이자 배경.`, "촬영");
    step(s, "D");
    const v = [["FaSun", "창가 역광 · 옆빛", "제품 뒤나 옆에서 빛. 정면 형광등 X, 플래시 X"], ["FaImage", "깨끗한 배경", "흰 종이 · 단색 천 · 나무 판. 소품은 색 1~2개만"], ["FaHandPaper", "반사판 = 흰 종이", "그림자 쪽에 대면 어두운 면이 밝아짐"], ["FaCamera", "가까이 · 매크로", "폰 기본 카메라 접사 · 2배 줌으로 배경 흐림"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "노출 고정(화면 길게 누르기) · 화이트밸런스 한 번 맞추고 끝까지 같게", 5.4);
  }
  {
    const s = content("컷신 촬영 ② 움직임 만들기", `상품 영상의 "움직임"은 카메라 또는 손이 만듭니다. 같은 동작을 3~5번 찍어 가장 좋은 것을 고르기. 슬로로 쓸 컷은 60fps(1회차).`, "촬영");
    step(s, "D");
    const r = [["손으로", "들어 올리기 · 돌리기 · 뚜껑 열기 · 펼치기 · 바르기"], ["떨어뜨리기 · 붓기", "재료 · 시럽 · 물 · 가루 (슬로 60fps)"], ["카메라 밀기", "천천히 다가가기 · 옆으로 지나가기 (몸을 움직이기)"], ["돌림판", "회전판 · 돌아가는 접시 위 제품 (없으면 손으로 천천히)"], ["가리기 · 지나가기", "손 · 물건이 렌즈를 가렸다 지나감 → 전환 재료"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 3.0 }));
    k.takeaway(s, "한 컷 = 한 동작 · 3~5초. 같은 동작을 여러 번", 6.15);
  }
  {
    const s = content("상품 영상 편집 핵심 셋", `글자 없이 리듬과 속도와 색으로 만드는 편집. 3회차 비트 표시(사이클 16)와 속도(사이클 6)를 깊게 씁니다.`, "편집");
    step(s, "E");
    const v = [["FaMusic", "비트에 맞춘 컷", "비트 표시 → 컷이 바뀌는 곳을 점 위에. 훅 · 히어로는 큰 박자에"], ["FaTachometerAlt", "스피드 램프", "빠르게 → 갑자기 느리게 → 다시 빠르게. 붓기 · 떨어뜨리기에서 \"와\" 하는 순간"], ["FaPalette", "색 하나 + 매치 컷", "모든 컷 같은 색 룩. 비슷한 모양 · 동작끼리 이어 붙이기, 가리기 전환"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "글자는 엔딩 카드에만. 컷이 말하게 둔다", 5.3);
  }
  follow(5, "스피드 램프 (곡선 속도)", ["붓기 · 떨어뜨리기 컷 선택 → 오른쪽 '속도'", "일반 대신 곡선(Curve) 탭", "빠르다 느려지는 프리셋 하나 고르기 (예: Hero · Bullet 계열)", "점을 끌어 '느려지는 구간'이 붓는 순간에 오게", "재생해 확인, 너무 길면 클립 끝 자르기"], "빠르게 가다가 \"와\" 하는 순간에 느려짐", `곡선 프리셋 이름은 버전 · 언어마다 다름. 점(포인트)을 끌어 속도를 직접 그릴 수 있음. 60fps 컷이 훨씬 부드럽습니다(30fps는 느린 구간이 끊겨 보일 수 있음).`);
  {
    const s = content("AI 컷과 섞기 · 지킬 선", `직접 찍기 어려운 배경 · 분위기 컷(가을 숲 · 바다 · 우주)은 AI로(3회차 프롬프트 공식). 하지만 제품 자체는 실제 촬영. 실물과 다르게 보이면 과장 광고가 됩니다.`, "편집");
    step(s, "E");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.6, { fill: C.background2 });
    k.text(s, "AI로 해도 좋은 것", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
    k.checklist(s, ["배경 · 분위기 · 계절 컷", "재료가 쏟아지는 상상 장면", "제품 뒤 공간 확장", "엔딩 카드 배경"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 2.6, fontSize: 15, paraSpaceAfter: 10 });
    const x2 = M + hw + 0.3;
    k.card(s, x2, 1.8, hw, 3.6, { fill: C.text2 });
    k.text(s, "직접 찍어야 하는 것", { x: x2 + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["제품 · 메뉴 · 시술 결과 자체", "크기 · 색 · 양이 보이는 컷", "실제 가게 · 실제 사람", "가격 · 효과를 보여 주는 장면"], { x: x2 + 0.3, y: 2.5, w: hw - 0.6, h: 2.6, fontSize: 15, color: C.background1, paraSpaceAfter: 10 });
    k.takeaway(s, "AI는 무대, 주인공은 실물. AI를 썼으면 AI 표시", 5.75);
  }
  {
    const s = content("상품 영상 발행 · 릴스", `릴스는 커버와 첫 1초가 얼굴. 프로필 링크 · 위치 태그로 "어디서 사나"까지 이어지게. 음원은 앱 안 음원 또는 상업 이용 가능 음원(사업 계정은 쓸 수 있는 음원이 제한될 수 있음).`, "발행");
    step(s, "F");
    const r = [["커버", "제품 정면 · 가운데 · 글자 3단어 이하 (피드에서 가운데가 보임)"], ["첫 1초", "움직임 있는 훅 컷부터 (로고 · 인사 X)"], ["음원", "앱 안 음원 · 상업 이용 가능 음원 확인"], ["캡션 · 해시태그", "한 줄 + 해시태그 3~5 (업종 · 지역 · 제품)"], ["연결", "프로필 링크 · 위치 태그 · 협업 계정 태그"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.8 }));
    k.takeaway(s, "멈추게 하는 커버 · 첫 1초, 찾아오게 하는 링크 · 위치", 6.15);
  }
  checkCard("상품 이미지 영상 체크 · 카테고리 카드 ③", `워크북 카테고리 카드 ③.`, ["첫 1초에 제품 + 움직임", "컷이 바뀌는 곳이 박자 위", "모든 컷이 한 색 톤", "실물과 다르게 보이지 않음 (AI · 보정 과장 X)", "음원 이용 조건 확인"], [["A", "말 없이 컷+음악 · 10~20초 · 릴스"], ["C", "훅→디테일→쓰는 장면→히어로→엔딩"], ["D", "역광 · 흰 종이 · 매크로 · 손 · 슬로"], ["E", "비트 컷 · 스피드 램프 · 색 · 매치 컷"], ["F", "커버 · 첫 1초 · 음원 · 해시태그 · 링크"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("실습 · 상품 컷신 10컷 → 15초", `각자 가져온 물건(내 상품 · 메뉴 · 소지품 · 교실 소품)으로. 크루가 서로 손 모델 · 흰 종이 반사판 들어 주기. 촬영 15분 → 편집 15분. 세로 9:16 새 프로젝트.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const st = [["컷 리스트", "다섯 블록에 10줄 (워크북)"], ["촬영", "흰 종이 배경 · 창가 빛 · 같은 동작 3번"], ["편집", "9:16 새 프로젝트 → 비트 컷 → 스피드 램프 1번 → 색 하나"], ["엔딩 카드", "이름 · 한 줄 · (가격)"], ["크루 보기", "무음으로 틀고 \"갖고 싶다\" 순간 손들기"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "오늘 숏폼 오너먼트 후보 ①. 사업이 있는 사람은 바로 계정에 올릴 수 있게", 6.15);
  }

  // ───────────────────────── 5교시 ─────────────────────────
  divider(5, "④ 챌린지 · 트렌드 숏폼", "따라 하고 싶게 만드는 영상 — 트렌드 틀에 나만의 비틀기", "img06", `목표: 트렌드는 매주 바뀌므로 "찾는 법 + 틀 + 비틀기"를 배운다. A 정의 → B 레퍼런스(고전 + 이번 주) → C 한 줄 기획 → D 같은 구도 두 번 → E 비트 점프 · 글자 타이밍 · 루프 → F 음원은 앱 안에서 → G 안전 → 크루 챌린지.`);
  {
    const s = content("챌린지 · 트렌드 숏폼이란", `틀(음원 · 동작 · 글자 형식)이 반복되고, 사람마다 비튼 부분이 다른 영상. 틀 덕분에 쉽게 이해되고, 비틀기 덕분에 내 영상이 됩니다. 7~20초.`, "정의");
    step(s, "A");
    const v = [["FaMusic", "음원 챌린지", "같은 음원 + 같은 동작 · 춤"], ["FaSyncAlt", "전환 챌린지", "손 가리기 · 점프 · 옷 바꾸기 순간 전환"], ["FaComments", "포맷 밈", "○○하는 사람 특징 · POV · 비포 · 애프터"], ["FaBullhorn", "브랜드 챌린지", "가게 · 제품으로 참여 · 직접 만들기"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.9, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "트렌드 틀 + 나만의 비틀기 = 챌린지", 5.1);
  }
  {
    const s = content("챌린지 레퍼런스 · 고전과 이번 주", `고전: 지코 "아무노래" 챌린지(2020, 틱톡) — 쉬운 동작 · 15초 · 지인부터 참여로 퍼짐. 이번 주 트렌드는 강사가 수업 전날 확인해서 오른쪽에 넣기.
트렌드 찾는 곳: 틱톡 Creative Center(트렌드 음원 · 해시태그, 지역별), 인스타 릴스 음원 옆 "트렌드" 표시, 쇼츠 리믹스 · 인기 음원. 이름 · 위치는 바뀔 수 있음.`, "레퍼런스");
    step(s, "B");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.9, { fill: C.text2 });
    k.text(s, "고전 · 아무노래 챌린지 (2020)", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["누구나 따라 할 쉬운 동작", "15초 안팎", "아는 사람부터 참여 → 확산", "노래 자체가 다시 인기"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 2.8, fontSize: 15, color: C.background1, paraSpaceAfter: 10 });
    s.addShape(S.roundRect, { x: M + hw + 0.3, y: 1.8, w: hw, h: 3.9, rectRadius: 0.12, fill: { color: "F4F6F5" }, line: { color: "B9C6BF", width: 1.25, dashType: "dash" } });
    k.text(s, "이번 주 트렌드 2~3개\n(강사가 수업 전날 넣기)\n\n틱톡 Creative Center · 릴스 트렌드 음원", { x: M + hw + 0.3, y: 1.8, w: hw, h: 3.9, fontSize: 15, bold: true, color: C.accent5, align: "center", valign: "middle" });
    k.takeaway(s, "무엇이 반복되고(틀), 무엇이 사람마다 다른가(비틀기)", 6.0);
  }
  {
    const s = content("한 줄로 기획하기 · 틀 + 비틀기", `챌린지 기획은 한 줄이면 충분. "[트렌드 틀]을 [내 아이템 · 직업 · 가게]로". 억지로 끼우면 어색하니, 내 일상과 닮은 틀을 고르기.`, "기획");
    step(s, "C");
    k.card(s, M, 1.8, CW, 1.0, { fill: C.text2 });
    k.text(s, "[ 트렌드 틀 ]  +  [ 내 아이템 · 직업 · 가게 ]  =  내 챌린지", { x: M, y: 1.8, w: CW, h: 1.0, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle" });
    const ex = [["비포 · 애프터 전환", "뷰티샵: 시술 전 → 손 가리기 → 시술 후"], ["○○하는 사람 특징", "인쇄소 사장이 매일 듣는 말 3가지"], ["POV", "POV: 디저트 가게 첫 손님이 됐다"], ["음원 + 동작", "크루 다섯 명이 같은 동작, 마지막만 다르게"]];
    ex.forEach(([h, b], i) => k.row(s, M, 3.05 + i * 0.75, CW, 0.64, { n: i + 1, head: h, body: b, headW: 3.4 }));
    k.takeaway(s, "트렌드는 빨리 지나간다. 기획은 짧게, 올리는 건 빨리", 6.15);
  }
  {
    const s = content("챌린지 촬영 · 같은 구도에서 두 번", `전환 챌린지의 비밀은 "카메라를 움직이지 않는 것". 삼각대(없으면 책 · 컵에 기대기) 고정 → 같은 자리 · 같은 구도에서 바꾸기 전 · 후를 찍고 편집에서 잇습니다.`, "촬영");
    step(s, "D");
    const r = [["카메라 고정", "삼각대 · 거치대. 구도 · 줌 · 노출을 처음과 똑같이"], ["같은 자리 표시", "바닥에 테이프로 서는 자리 표시"], ["전환 동작", "손으로 렌즈 가리기 · 점프 · 돌기 · 박수"], ["비트 맞추기", "음원을 틀어 놓고 박자에 동작 (편집에서 소리는 빼기)"], ["여러 번", "전환 순간은 5번 이상 찍어 고르기"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.8 }));
    k.takeaway(s, "카메라는 그대로, 사람과 물건만 바뀐다", 6.15);
  }
  {
    const s = content("챌린지 편집 핵심 셋", `3회차 비트(사이클 16)와 텍스트 · 레이어를 숏폼 리듬에 맞게. CapCut 템플릿(남이 만든 편집 틀)을 써도 되지만, 오늘은 직접 만들어 보기.`, "편집");
    step(s, "E");
    const v = [["FaCut", "비트 위치 점프 컷", "전환 동작의 가장 큰 순간에서 잘라 다음 컷으로 — 박자 점 위에"], ["FaPen", "글자 타이밍", "가사 · 말풍선 · \"POV\" 글자를 박자에 맞춰 나타나게"], ["FaRedo", "루프 엔딩", "마지막 장면이 첫 장면과 이어지게 → 한 번 더 보게"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.0, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "CapCut 안에서 음악은 '박자 맞추기용'으로만. 내보낼 땐 끄기 →", 5.2);
  }
  follow(6, "손 가리기 전환 + 루프", ["같은 구도의 '전' · '후' 두 클립을 메인 트랙에", "참고 음원을 넣고 비트 표시 → 손이 렌즈를 가장 가린 순간을 비트 점에", "'전' 클립은 손이 다 가린 순간에서 W, '후' 클립은 손이 떠나기 시작하는 순간부터 Q", "끝 장면이 첫 장면과 이어지게 마지막 클립 길이 맞추기", "참고 음원 음소거(또는 삭제) → 무음으로 내보내기"], "손이 지나가는 순간 장면이 바뀌고, 끝이 처음으로 이어짐", `음원은 업로드할 때 앱(틱톡 · 릴스 · 쇼츠) 안에서 같은 음원을 붙이기. CapCut에 넣은 음원으로 내보내면 음소거 · 저작권 표시가 될 수 있음(플랫폼 정책은 바뀔 수 있으니 확인).
비트 표시 위치는 3회차 사이클 16과 같음.`);
  {
    const s = content("챌린지 발행 · 음원은 앱 안에서", `트렌드 음원의 권리는 플랫폼 안에서 쓰라고 허락된 경우가 많습니다. 그래서 편집은 CapCut에서, 음원은 업로드할 때 앱에서. 사업 계정은 쓸 수 있는 음원이 더 적을 수 있음.`, "발행");
    step(s, "F");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.9, { fill: C.text2 });
    k.text(s, "올리는 순서", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["CapCut: 무음(또는 원본 소리)으로 내보내기", "앱에서 영상 올리기", "앱 음원 검색 → 같은 트렌드 음원", "음원 시작 위치를 동작에 맞추기", "캡션 한 줄 · 해시태그 · 올리기"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 14.5, color: C.background1, paraSpaceAfter: 9 });
    const x2 = M + hw + 0.3;
    k.card(s, x2, 1.8, hw, 3.9, { fill: C.background2 });
    k.text(s, "언제 · 어떻게", { x: x2 + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
    k.checklist(s, ["트렌드는 빨리 — 찍은 날 올리기", "챌린지 해시태그 + 내 업종 · 지역 해시태그", "크루 · 친구 계정 태그(함께 퍼뜨리기)", "댓글에 다음 참여자 지목"], { x: x2 + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 14.5, paraSpaceAfter: 9 });
    k.takeaway(s, "편집은 CapCut, 음원은 앱. 트렌드는 속도", 6.0);
  }
  checkCard("챌린지 체크 · 카테고리 카드 ④", `워크북 카테고리 카드 ④. 아이 · 타인 얼굴, 위험한 동작은 하지 않기.`, ["트렌드 틀이 한눈에 보임", "내 것(아이템 · 직업 · 가게)이 들어감", "음원은 앱 안에서 붙임", "출연자 모두 동의 · 아이 · 타인 얼굴 주의", "위험하거나 남을 놀리는 동작 X"], [["A", "따라 하고 싶게 · 7~20초 · 틱톡·릴스·쇼츠"], ["C", "트렌드 틀 + 나만의 비틀기 한 줄"], ["D", "카메라 고정 · 같은 구도 두 번 · 여러 번"], ["E", "비트 점프 컷 · 글자 타이밍 · 루프"], ["F", "무음 내보내기 → 앱 음원 · 빨리 올리기"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("실습 · 크루 챌린지 1편", `크루 다섯 명이 함께 기획 · 촬영. 틀 하나를 고르고 각자 비틀기 한 컷씩. 편집은 각자(같은 소스 공유) 또는 크루장 계정으로 하나. 오늘 숏폼 오너먼트 후보 ②.`, "크루");
    pill(s, "크루", C.accent2, 1.3);
    const st = [["틀 고르기", "이번 주 트렌드 또는 전환 챌린지 하나 (5분)"], ["한 줄 기획", "[틀] + [크루 다섯 명 각자의 아이템]"], ["촬영", "폰 하나 고정, 같은 자리에서 한 사람씩 (10분)"], ["편집", "점프 컷 · 글자 · 루프 → 무음 내보내기 (10분)"], ["보기", "크루끼리 보고 가장 좋은 전환 하나 뽑기"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "숏폼 오너먼트는 상품 이미지 영상 또는 크루 챌린지 중 하나", 6.15);
  }

  // ───────────────────────── 6교시 ─────────────────────────
  divider(6, "제작 · 수업 날 브이로그", "오늘 하루를 2분 롱폼으로, 숏폼은 마무리", "img07", `목표: 아침부터 찍은 컷으로 16:9 브이로그 2분 안팎. 숏폼(상품 이미지 또는 챌린지)은 마무리해서 9:16으로 내보내기. 소리 확인은 3회차와 같음(파형 · dB · 폰).`);
  follow(7, "16:9 브이로그 프로젝트", ["새 프로젝트 → 비율 16:9 → 이름 \"4회차_브이로그_내이름\"", "오늘 찍은 컷 모두 가져오기 → 시간 순으로 메인 트랙", "인트로 · 흐름 · 하이라이트 · 아웃트로 네 구간으로 15초 · 40초 · 40초 · 20초 가편집", "세로로 찍은 컷은 배경 흐림으로 채우기 (3회차 사이클 5)", "셀프캠 소리 살리고 L컷 한 번"], "16:9 화면에 네 구간, 전체 2분 안팎", `3회차는 세로였지만 오늘은 가로. 비율 버튼 위치는 3회차와 같음. 세로 컷이 많으면 화면 속 화면으로 두 개를 나란히 두는 방법도.`);
  {
    const s = content("브이로그 · 꼭 넣을 것", `기본 여섯을 먼저 채우고 도전. 막히면 해당 따라하기 슬라이드로 돌아가기. 강사는 입문자 먼저 순회.`, "제작");
    pill(s, "제작", C.accent1, 1.3);
    const base = [["네 구간 구조", "인트로 · 흐름 · 하이라이트 · 아웃트로"], ["J컷 · L컷 한 번", "따라하기 01"], ["음악 + 덕킹", "따라하기 02"], ["자막", "셀프캠 말은 자동 캡션"], ["색 하나", "필터 · 조정 약하게"], ["챕터 2개 이상", "업로드 때 설명란"]];
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
    k.text(s, "+ 도전", { x: rx + 0.3, y: 1.95, w: rw - 0.6, h: 0.4, fontSize: 15, bold: true, color: C.accent1 });
    [["보이스오버", "내 목소리 또는 TTS"], ["하이라이트 숏폼", "프로젝트 복사 → 9:16 → 인물 가운데"], ["타임랩스 · 압축", "이동 구간 2~4배속"]].forEach(([h, b], i) => {
      const y = 2.5 + i * 0.95;
      k.text(s, `☐  ${h}`, { x: rx + 0.3, y, w: rw - 0.6, h: 0.42, fontSize: 17, bold: true, color: C.background1 });
      k.text(s, b, { x: rx + 0.75, y: y + 0.42, w: rw - 1.0, h: 0.4, fontSize: 12.5, color: "C9D3CE" });
    });
    k.takeaway(s, "숏폼(상품 이미지 또는 챌린지)도 9:16으로 내보내 두기", 5.75);
  }
  {
    const s = content("소리는 여전히 폰으로", `PC는 소리가 안 납니다(3회차와 같음). 덕킹 · J컷 · L컷은 파형으로 먼저 확인하고, 내보낸 뒤 폰으로 한 번 듣기.`, "제작");
    const r = [["파형", "말 구간에서 음악 파형이 낮아졌나 · L컷에서 말 파형이 이어지나"], ["숫자", "말 0dB · 음악은 말 있을 때 −15 ~ −20dB · 끝 페이드 아웃"], ["폰", "CapCut 클라우드 → 폰 앱, 또는 내보내기 → 드라이브 → 폰 (이어폰)"], ["마지막", "업로드한 영상을 폰 유튜브 · 인스타 앱으로"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.85 + i * 0.95, CW, 0.8, { n: i + 1, head: h, body: b, headW: 1.8 }));
    k.takeaway(s, "눈으로 맞추고, 귀로는 폰에서 확인", 5.85);
  }

  // ───────────────────────── 7교시 ─────────────────────────
  divider(7, "플랫폼별 업로드 · 5회차 준비", "썸네일 · 커버 · 챕터, 그리고 대표작 고르기", "img08", `목표: 썸네일 3안(크루 투표) → 롱폼 업로드(제목 · 설명 · 챕터) → 숏폼 업로드(릴스 · 쇼츠 · 틱톡) → 크루 상영 · 오너먼트 두 개 → 5회차 예고 · 과제.`);
  follow(8, "썸네일 만들기 (1280×720)", ["새 프로젝트 16:9 → 브이로그에서 표정 · 장면이 좋은 프레임 하나 (정지 프레임 또는 캡처)", "얼굴 · 대상을 화면의 1/3 이상 크게", "글자 3단어 이하, 굵은 글꼴 · 테두리 · 대비 색", "같은 방법으로 2안 더 (다른 장면 · 다른 문구)", "한 프레임 내보내기(이미지) 또는 캡처 → 크루가 3안 중 투표"], "작게 줄여 봐도 무엇인지 보이는 썸네일", `유튜브 권장 썸네일은 1280×720(16:9). 캔바로 만들어도 OK. 작게 봤을 때(폰 목록 크기) 읽히는지가 기준. 내보내기에서 프레임을 이미지로 저장하는 옵션은 버전마다 다를 수 있음.`);
  {
    const s = content("롱폼 업로드 · 유튜브", `2회차 "발행 전 다섯 가지"의 롱폼 버전. 챕터는 설명란에 타임스탬프를 적으면 자동으로 생김(00:00부터 시작, 3개 이상, 각 10초 이상).`, "업로드");
    const r = [["제목", "누가 · 어디서 · 무엇을 (검색될 말 앞쪽에)"], ["설명 첫 두 줄", "오늘 무엇을 · 다음 영상 · 링크"], ["챕터", "00:00 인트로 / 00:15 아침 / 01:00 점심 …"], ["썸네일", "크루가 고른 1안 (나머지는 나중에 바꿔 보기)"], ["표시 · 공개", "AI 사용 · 협찬 표시, 공개 범위 (일부 공개도 OK)"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.6 }));
    k.takeaway(s, "제목 · 썸네일 · 챕터 세 개가 롱폼의 얼굴", 6.15);
  }
  {
    const s = content("숏폼 업로드 · 어디에 올릴까", `계정이 없으면 하나만. 사업 홍보는 인스타 릴스, 유튜브 채널을 키우려면 쇼츠, 챌린지는 틱톡이나 릴스. 기능 · 길이는 바뀔 수 있으니 앱 화면에서 확인.`, "업로드");
    const v = [["FaInstagram", "릴스", "커버 고르기 · 음원 · 위치 태그 · 해시태그 3~5 · 프로필 링크"], ["FaYoutube", "쇼츠", "제목 · 관련 영상에 오늘 브이로그 연결 · 해시태그"], ["FaTiktok", "틱톡", "앱 음원 · 해시태그 · 커버 · 빠르게 올리기"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.takeaway(s, "AI 표시 · 협찬 표시는 숏폼도 똑같이", 5.3);
  }
  {
    const s = content("크루 상영 · 오너먼트 두 개", `크루 안에서 브이로그 한 사람씩 1분 + 숏폼. 칭찬 1 + 제안 1. 크루장은 업로드 링크를 확인하고 트리 현황판에 오너먼트 두 개(롱폼 · 숏폼).`, "크루");
    pill(s, "크루", C.accent2, 1.3);
    k.card(s, M, 1.8, CW, 1.4, { fill: C.text2 });
    k.text(s, "롱폼 1 + 숏폼 1 = 오늘의 오너먼트 두 개", { x: M, y: 1.8, w: CW, h: 1.4, fontSize: 26, bold: true, color: C.background1, align: "center", valign: "middle" });
    const t = [["FaHeart", "칭찬 하나", "\"L컷에서 넘어가는 게 자연스러웠어요\""], ["FaRegLightbulb", "제안 하나", "\"썸네일 글자가 작아요\""], ["FaTree", "오너먼트", "롱폼 · 숏폼 각각 스티커"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 3.45, c.w, 2.1, { icon: t[i][0], head: t[i][1], body: t[i][2], bodySize: 13.5, headSize: 16 });
    k.takeaway(s, "오늘 트리에 오너먼트 두 개가 더 달렸습니다", 5.85);
  }
  {
    const s = content("5회차 예고 · 과제", `5회차(12/1): ⑤ 토크 · 인터뷰 · ⑥ 라이브 · 라이브커머스 · ⑦ AI 영상 + 끝까지 보게 하는 법 · 채널로 묶기 + 대표작 제작. 대표작은 일곱 카테고리 중 하나.
준비해 올 수 있는 사람은 소스를 찍어 오고, 못 해도 5회차에 AI 컷 · 오늘 소스로 보충 가능.`);
    const g = [["FaMicrophone", "⑤ 토크 · 인터뷰", "사람을 보러 오는 영상"], ["FaShoppingBag", "⑥ 라이브커머스", "지금 같이 있는 영상"], ["FaRobot", "⑦ AI 영상", "찍을 수 없는 장면"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.2, { icon: g[i][0], head: g[i][1], body: g[i][2], bodySize: 13.5, headSize: 16 });
    k.card(s, M, 4.3, CW, 1.6, { fill: C.accent6 });
    k.text(s, "과제", { x: M + 0.3, y: 4.3, w: 1.2, h: 1.6, fontSize: 16, bold: true, valign: "middle" });
    k.text(s, "① 대표작 카테고리 하나 고르기 (①~⑦)\n② 카테고리 카드 C · D로 기획 시트 + 샷 리스트\n③ 준비되는 사람은 5일 동안 촬영 (AI 영상은 기준 이미지 · 프롬프트)", { x: M + 1.4, y: 4.3, w: CW - 1.7, h: 1.6, fontSize: 15, bold: true, valign: "middle" });
  }
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    s.addText("기술에서\n카테고리로", { placeholder: "title" });
    s.addText("롱폼 하나, 숏폼 하나. 다음 시간엔 내 대표작을 만듭니다", { placeholder: "body" });
    s.addNotes(`마무리. 크루장은 업로드 링크를 크루 폴더에 정리.
수업 후: 단톡방에 핸드북 4장 · 워크북 · 업로드 체크리스트 · 과제 공지.`);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
