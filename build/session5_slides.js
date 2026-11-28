// 5회차 (12/1) 슬라이드 생성: node build/session5_slides.js [출력 경로]
// 내용 기준: build/session5/outline.md
const path = require("path");
const { THEME, HEX, W, H, M, newDeck, makeKit } = require("./lib/deck");
const { prepare } = require("./lib/images");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "05", "5회차_카테고리AtoZ_말하는만드는영상_슬라이드.pptx");
const CW = W - 2 * M;
const TOTAL = 5; // 따라하기 수

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
  const img = await prepare("s5", IMAGE_SPECS);
  if (img.missing.length) console.log("이미지 없음(그라데이션으로 대체):", img.missing.join(", "));

  const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 5회차 — 카테고리 A to Z ② 말하는 · 만드는 영상";
  const { pres, C } = newDeck({ title: "촬영편집 5회차 — 카테고리 A to Z ②", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";
  let period = 0;
  let periodName = "시작";

  const content = (title, notes, part) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, (period ? `${period}교시 · ${periodName}` : "5회차 · 카테고리 A to Z ②") + (part ? `  ·  ${part}` : ""));
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
    s.addText("5회차\n카테고리 A to Z ②", { placeholder: "title" });
    s.addText("말하는 · 만드는 영상 — 그리고 나의 대표작", { placeholder: "body" });
    k.text(s, "2026. 12. 1 (화)  ·  1공학관", { x: M, y: 6.5, w: 8, h: 0.35, fontSize: 13, color: "C9D3CE" });
    s.addNotes(`[시작 전] CapCut 로그인 · 폰 배터리 확인. 대표작 재료(찍어 온 것 · 4회차 소스)를 노트북에 옮겨 두게 안내.
오늘은 남은 카테고리 셋(⑤ 토크 · 인터뷰, ⑥ 라이브커머스, ⑦ AI 영상)을 배우고, 4회차에 정한 "메인 스타일"로 대표작 1편을 만듭니다.`);
  }
  {
    const s = content("오늘의 흐름", `오늘 오전 · 점심 직후는 카테고리 셋을 A to Z로, 4교시는 끝까지 보게 하는 법과 채널 브랜딩, 5 · 6교시는 대표작. 교시 시각은 유동적.
각자 실습하되 막히면 옆자리와 서로 돕기.`);
    k.card(s, M, 1.8, 3.4, 4.75, { fill: C.text2 });
    k.text(s, "오늘 남는 것", { x: M + 0.35, y: 2.05, w: 2.9, h: 0.4, fontSize: 14, bold: true, color: C.accent6 });
    k.text(s, "대표작 1편\n+ 숏폼 1편", { x: M + 0.35, y: 2.5, w: 2.9, h: 1.4, fontSize: 26, bold: true, color: C.accent1 });
    k.text(s, "내 메인 스타일로\n6회차 상영작 후보\n+ 채널 브랜딩 한 장", { x: M + 0.35, y: 4.0, w: 2.9, h: 1.3, fontSize: 14, color: C.background1 });
    k.text(s, "카테고리 3개 × A to Z", { x: M + 0.35, y: 5.7, w: 2.9, h: 0.5, fontSize: 13, bold: true, color: C.accent6 });
    const rows = [["⑤ 토크 · 인터뷰", "30초 하이라이트"], ["⑥ 라이브 · 라이브커머스", "1분 하이라이트"], ["⑦ AI 영상", "20초 광고 초안"], ["끝까지 보게 하는 법 · 채널로 묶기", "브랜딩 한 장"], ["대표작 제작 ①", "가편집"], ["대표작 제작 ②", "완성 · 숏폼"], ["업로드 · 6회차 준비", "제작 노트"]];
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
    const s = content("4회차 → 5회차 · 메인 스타일에서 대표작으로", `지난 시간 마지막에 "내 콘텐츠의 메인 스타일"을 정했습니다. 오늘 배울 세 카테고리 중에 더 맞는 게 있으면 바꿔도 됩니다. 5 · 6교시에 그 스타일로 대표작을 만들고, 6회차(12/10)에 상영합니다.`);
    const v = [["FaVideo", "4회차 · 보여주는 영상", "① 브이로그 ② 정보성 · 리뷰 ③ 상품 이미지 ④ 공감 상황극"], ["FaMicrophone", "5회차 · 말하는 · 만드는 영상", "⑤ 토크 · 인터뷰 ⑥ 라이브커머스 ⑦ AI 영상"], ["FaStar", "대표작", "일곱 중 메인 스타일 하나 → 6회차 상영"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.4, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14, dark: i === 2 });
    k.card(s, M, 4.5, CW, 1.05, { fill: C.background2 });
    k.text(s, "워크북에 한 줄: \"제 메인 스타일은 ○번 ○○이고, 대표작은 ○○에 올릴 ○○입니다\"", { x: M + 0.3, y: 4.5, w: CW - 0.6, h: 1.05, fontSize: 17, bold: true, valign: "middle" });
    k.takeaway(s, "오늘 배우는 것이 더 맞으면 바꿔도 OK. 정하는 건 5교시 전까지", 5.85);
  }
  {
    const s = content("대표작 재료 점검", `대표작을 무엇으로 만들지 지금 정해 두면 5교시가 빨라집니다. 찍어 온 게 없어도 괜찮아요: 4회차 브이로그 · 상품 · 상황극 소스, 오늘 실습 결과물, AI 컷으로 만들 수 있습니다.`, "점검");
    pill(s, "점검", C.accent1, 1.3);
    const r = [["찍어 온 소스", "준비해 온 사람은 노트북에 폴더 하나로 옮기기"], ["4회차 결과물", "브이로그 · 상품 이미지 · 상황극 프로젝트를 다시 열어 다듬기"], ["오늘 실습 결과물", "토크 하이라이트 · 라이브 하이라이트 · AI 광고 초안"], ["AI 컷", "⑦ AI 영상 마스터 프롬프트로 부족한 장면 만들기"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.85 + i * 0.95, CW, 0.8, { n: i + 1, head: h, body: b, headW: 3.2 }));
    k.takeaway(s, "재료 폴더 하나 = 대표작 프로젝트 하나. 원본은 옮기지 않기 (미디어 없음 방지)", 5.85);
  }

  // ───────────────────────── 1교시 ─────────────────────────
  divider(1, "⑤ 토크 · 인터뷰", "사람을 보러 오는 영상 — 말이 내용이 된다", "img02", `목표: A 정의 → B 레퍼런스 → C 키워드 메모 · 질문지 → D 세팅(눈높이 · 시선 · 두 카메라 · 마이크) → E 군말 지우기 · 두 카메라 컷 · 강조 → F 인용 제목 · 챕터 → G 체크 → 실습 30초 하이라이트.`);
  {
    const s = content("토크 · 인터뷰란", `사람들은 정보보다 "이 사람"을 보러 옵니다. 그래서 말투 · 표정 · 경험이 내용. 강사 진로, 취업 포트폴리오(자기소개), 가게 사장 · 고객 이야기에 바로 쓰입니다. 얼굴이 부담이면 손 · 뒷모습 · 오디오(팟캐스트) 형식도.`, "정의");
    step(s, "A");
    const v = [["FaComments", "1인 토크", "카메라를 보고 내 이야기 · 노하우"], ["FaMicrophone", "인터뷰", "질문하고 듣기 · 사장님 · 고객 · 전문가"], ["FaUsers", "대담 · 팟캐스트", "두 사람이 주고받기 · 오디오 중심도 OK"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.table(s, [["", "유튜브 롱폼", "숏폼"], ["길이", "5~30분 (대담은 더 길게)", "20~40초, 센 한 문장"], ["모양", "소개 → 질문 → 이야기 → 한마디", "인용 자막 + 표정 클로즈업"]], { x: M, y: 4.2, w: CW, colW: [1.8, (CW - 1.8) / 2, (CW - 1.8) / 2], rowH: 0.5, fontSize: 14, align: "left" });
    k.takeaway(s, "토크의 내용 = 사람. 편집은 그 사람이 가장 잘 보이게", 6.0);
  }
  reference("토크 · 인터뷰 레퍼런스 해부", `[강사] 레퍼런스 영상을 골라 왼쪽에 캡처 · 링크. 처음 2분만 틀고 질문 · 답 · 컷 바뀜을 타임라인에 그리기. 분석이 있으면 워크북 레퍼런스 해부 쪽에 정리.`, ["처음 30초에 이 사람이 누구인지 알게 되나", "질문은 몇 초, 답은 몇 초?", "같은 화면이 몇 초마다 바뀌나 (카메라 · B롤)", "가장 센 한마디는 어디에?"]);
  {
    const s = content("토크 · 인터뷰 구조", `1인 토크는 대본을 통째로 읽지 말고 키워드 메모 5줄. 인터뷰는 "예/아니요"로 끝나지 않는 열린 질문 5개 + 꼬리 질문("그때 어떤 기분이었어요?").`, "기획");
    step(s, "C");
    structure(s, [["누구인지", "이름 · 하는 일\n오늘 이야기 한 줄", 0.8], ["질문 1", "시작 계기\n처음의 기억", 1.3], ["질문 2", "가장 힘들었던 순간\n어떻게 넘었나", 1.5], ["질문 3", "지금 · 노하우\n보는 사람에게 팁", 1.3], ["한마디", "가장 센 문장\n다음 이야기 예고", 0.8]], 2.1, 1.1, "3분 인터뷰 예: 15초 · 45초 · 60초 · 45초 · 15초");
    k.takeaway(s, "좋은 인터뷰는 좋은 질문에서. 꼬리 질문이 진짜 이야기를 끌어낸다", 5.6);
  }
  {
    const s = content("토크 · 인터뷰 세팅", `1회차 구도 · 빛이 그대로. 소리는 화면보다 중요합니다: 조용한 곳, 폰을 입에서 한 뼘. 두 대로 찍으면 편집에서 화면을 바꿀 수 있어요.`, "촬영");
    step(s, "D");
    const r = [["눈높이 · 삼분할", "카메라를 눈높이에, 얼굴은 위 1/3 선에"], ["시선", "1인 토크는 렌즈, 인터뷰는 진행자 쪽(렌즈 옆)"], ["두 카메라", "폰 한 대는 와이드(상반신), 한 대는 클로즈업(얼굴)"], ["소리", "조용한 곳 · 폰이나 핀마이크는 입에서 한 뼘 · 박수 한 번(싱크 맞추기)"], ["빛 · 배경", "창을 얼굴 앞쪽에 · 배경은 정리하고 의미 있는 소품 하나"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.8 }));
    k.takeaway(s, "화면이 흔들려도 보지만, 소리가 나쁘면 끕니다", 6.15);
  }
  {
    const s = content("토크 · 인터뷰 편집 핵심 셋", `말이 많은 영상은 "빈 곳"을 줄이는 게 반. 3회차 자동 자막 기능(군말 찾기 · 대본으로 편집)과 4회차 L컷을 그대로 씁니다.`, "편집");
    step(s, "E");
    const v = [["FaCut", "군말 · 공백 지우기", "\"음, 어\" · 긴 침묵을 지우면 1.5배 빨라진 느낌. 자동 캡션 → 군말 찾기"], ["FaLayerGroup", "두 카메라 컷", "와이드 · 클로즈업을 위아래 트랙에, 말하는 사람 · 감정에 따라 바꾸기"], ["FaSearch", "센 문장 강조", "강조 자막 + 천천히 줌인 + 그 말 위에 B롤 (L컷)"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "다 지우지 말기: 생각하는 한 박자는 진짜처럼 보이게 남겨 두기", 5.3);
  }
  follow(1, "군말 · 공백 지우기", ["토크 클립 선택 → 텍스트(또는 캡션) → 자동 캡션 → 한국어", "옵션에서 '군말 찾기' 켜기 (있으면)", "자막 목록에서 \"음 · 어 · 그\" 표시된 곳 확인 → 지우기", "긴 침묵은 파형이 평평한 곳 → Ctrl + B로 자르고 지우기", "처음부터 다시 보며 너무 빨라진 곳은 되돌리기 (Ctrl + Z)"], "말이 끊기지 않고 빈 곳 없이 이어짐", `군말 찾기 · 대본으로 편집은 버전 · 플랜에 따라 이름과 위치가 다르거나 없을 수 있음(3회차 자동 자막 기능). 없으면 파형을 보고 손으로 지우기.
PC 소리가 안 나므로 파형과 자막으로 확인, 마지막엔 폰으로 들어 보기.`);
  follow(2, "두 카메라로 화면 바꾸기", ["와이드 클립은 메인 트랙, 클로즈업 클립은 바로 위 트랙에", "박수 소리(파형의 뾰족한 곳)를 두 클립에서 같은 위치로 맞추기", "클로즈업 클립의 소리는 음소거 (소리는 와이드 하나만)", "감정이 커지는 곳 · 센 문장에서만 클로즈업이 보이게 나머지는 잘라내기", "센 문장 위에 강조 자막 하나"], "소리는 끊기지 않고 화면만 와이드 ↔ 클로즈업", `카메라가 한 대뿐이면: 같은 클립을 위 트랙에 복사해 크기 130%로 키우면 가짜 클로즈업이 됩니다(해상도가 충분할 때).
3회차 레이어 원리(위 트랙이 앞)와 같습니다.`);
  {
    const s = content("토크 · 인터뷰 발행", `사람 영상은 썸네일과 제목에 "그 사람의 한마디"가 들어가야 클릭됩니다. 긴 인터뷰는 질문마다 챕터, 센 문장마다 숏폼.`, "발행");
    step(s, "F");
    const r = [["제목", "사람 + 인용 한 문장: \"15년 차 미용사가 말하는 '다듬기만요'의 진실\""], ["썸네일", "표정 클로즈업 + 인용 3~5단어"], ["챕터", "질문 = 챕터 (00:00 소개 / 01:10 시작 계기 …)"], ["숏폼", "센 문장 하나 = 숏폼 하나, 첫 1초에 그 문장"], ["동의 · 사실", "출연자 동의, 이름 · 숫자 · 사실 확인"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "롱폼 인터뷰 하나에서 숏폼 세 개가 나온다", 6.15);
  }
  checkCard("토크 · 인터뷰 체크 · 카테고리 카드 ⑤", `워크북 카테고리 카드 ⑤에 정리.`, ["첫 30초에 이 사람이 누구인지", "소리가 깨끗함 (파형 · 폰으로 확인)", "같은 화면이 1분 넘게 가지 않음", "출연자 동의", "이름 · 숫자 · 사실 확인"], [["A", "사람을 보러 · 롱폼 5~30분 / 숏폼 20~40초"], ["C", "누구 → 질문 1·2·3 → 센 한마디"], ["D", "눈높이 · 시선 · 두 카메라 · 소리"], ["E", "군말 지우기 · 두 카메라 · 강조"], ["F", "인용 제목 · 표정 썸네일 · 챕터"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("실습 · 30초 하이라이트", `둘 중 하나. 혼자 하면 셀프 토크, 옆자리와 하면 서로 인터뷰(3분씩, 폰 두 대). 촬영 10분 → 편집 15분. 대표작이 토크 · 인터뷰라면 이게 바로 대표작 재료.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const st = [["고르기", "A 셀프 토크 1분: \"제 메인 스타일과 이유\" / B 옆자리 인터뷰 3분"], ["메모", "키워드 5줄 또는 질문 5개 (워크북)"], ["촬영", "눈높이 · 조용한 곳 · 폰 입에서 한 뼘 · 박수 한 번"], ["편집", "군말 지우기 → (두 카메라) → 센 문장 강조 → 30초"], ["보기", "옆자리에게 보여 주고 \"가장 센 한마디\" 듣기"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.0 }));
    k.takeaway(s, "얼굴이 부담이면 손 · 뒷모습 · 화면 + 목소리로", 6.15);
  }

  // ───────────────────────── 2교시 ─────────────────────────
  divider(2, "⑥ 라이브 · 라이브커머스", "지금 같이 있는 영상 — 큐시트로 준비하고, 하이라이트로 남긴다", "img03", `목표: A 정의 → B 레퍼런스 → C 큐시트 · 판매 멘트 → D 세팅 → E 하이라이트 찾기 · 숏폼 · 정보 카드 → F 예고 · 다시보기 · 표시 → G 체크 → 실습 3분 리허설 → 1분 하이라이트.`);
  {
    const s = content("라이브 · 라이브커머스란", `라이브는 편집이 없는 대신 "준비"가 편집입니다. 끝나면 다시보기와 하이라이트 숏폼이 남아서 두 번 일합니다. 사업 홍보 · 판매에 가장 직접적인 카테고리.`, "정의");
    step(s, "A");
    const v = [["FaComments", "소통 라이브", "질문 받기 · 작업 과정 공개 · 같이 보기"], ["FaShoppingBag", "라이브커머스", "상품을 보여 주며 실시간 판매 · 혜택"], ["FaCut", "하이라이트", "라이브 다시보기에서 잘라 낸 숏폼"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.table(s, [["플랫폼", "특징 (기능 · 조건은 바뀔 수 있으니 확인)"], ["쇼핑 플랫폼 라이브", "스토어와 연결된 판매 방송 · 예약 · 알림"], ["유튜브 · 인스타 · 틱톡 라이브", "구독자 · 팔로워와 소통, 다시보기로 남김"]], { x: M, y: 4.2, w: CW, colW: [3.6, CW - 3.6], rowH: 0.5, fontSize: 14, align: "left" });
    k.takeaway(s, "라이브 한 번 = 다시보기 1 + 하이라이트 숏폼 3", 6.0);
  }
  reference("라이브커머스 레퍼런스 해부", `[강사] 라이브커머스 다시보기 한 편(소상공인 방송이면 더 좋음)을 골라 넣기. 처음 3분과 마감 3분을 비교.`, ["처음 1분에 무엇을 말하나 (인사 · 혜택 · 상품)", "상품을 어떻게 보여 주나 (손 · 클로즈업 · 비교)", "혜택 · 가격은 몇 번 말하나", "마감 멘트는 어떻게 하나"]);
  {
    const s = content("큐시트 · 판매 멘트 구조", `큐시트 = 라이브의 대본 겸 스토리보드. 시간 · 내용 · 화면 · 멘트 · 준비물을 한 줄씩. 판매 멘트는 "왜 필요한지"에서 시작해 "왜 지금인지"로 끝냅니다.`, "기획");
    step(s, "C");
    structure(s, [["오프닝", "인사 · 오늘 혜택\n한 줄 예고", 0.8], ["문제", "이런 적 있죠?\n공감", 0.9], ["보여 주기", "상품 · 손 · 클로즈업\n써 보기", 1.5], ["증거", "후기 · 비교 · 과정", 1.1], ["혜택", "가격 · 사은품\n오늘만", 1.0], ["질문 · 마감", "질문 받기\n지금 사야 하는 이유", 1.0]], 2.1, 1.1, "30분 라이브라면 이 흐름을 두세 번 반복 (새로 들어온 사람을 위해)");
    k.takeaway(s, "혜택은 여러 번 말하기 — 라이브는 중간에 들어오는 사람이 많다", 5.6);
  }
  {
    const s = content("라이브 세팅", `라이브는 다시 찍을 수 없으니 세팅이 전부. 시작 10분 전 리허설로 소리 · 빛 · 상품 자리를 확인.`, "촬영");
    step(s, "D");
    const r = [["폰 고정", "거치대 · 세로/가로 정하기 · 화면 꺼짐 방지 · 알림 끄기"], ["빛 하나", "얼굴 앞 조명 또는 창가 · 상품 클로즈업용 작은 조명"], ["상품 자리", "카메라 앞 표시된 자리 · 꺼낼 순서대로 정리"], ["두 번째 화면", "채팅 보는 폰 · 태블릿 (질문 놓치지 않기)"], ["소리 · 리허설", "조용한 곳 · 마이크 테스트 · 10분 전 혼자 리허설"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.6 }));
    k.takeaway(s, "큐시트 · 상품 · 조명 · 채팅 화면이 손 닿는 곳에", 6.15);
  }
  {
    const s = content("라이브 편집 핵심 셋 · 다시보기에서 숏폼으로", `라이브 자체는 편집하지 않지만, 끝난 뒤 다시보기에서 하이라이트를 잘라 숏폼으로 다시 씁니다. 긴 녹화본에서 장면을 찾을 때 자동 캡션이 지도 역할.`, "편집");
    step(s, "E");
    const v = [["FaSearch", "하이라이트 찾기", "자동 캡션 → 자막 목록에서 \"오늘만\" \"직접 써 보면\" 같은 말 찾기"], ["FaMobileAlt", "숏폼으로", "하이라이트 3개를 9:16으로, 첫 1초에 가장 센 장면"], ["FaTags", "정보 카드", "가격 · 혜택 · 기간 카드 (4회차 따라하기 04처럼 같은 디자인)"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "숏폼 끝에 \"다음 라이브 ○일 ○시\" 한 줄", 5.3);
  }
  follow(3, "녹화본에서 하이라이트 1분", ["리허설 녹화본을 16:9(또는 9:16) 프로젝트에", "자동 캡션 → 자막 목록을 훑어 '보여 주기 · 혜택' 문장 찾기", "그 문장 앞뒤로 Ctrl + B, 하이라이트 3구간만 남기기", "9:16으로 바꾸고 상품이 가운데 오게 위치 조정 (배경 흐림)", "가격 · 혜택 정보 카드 하나 → 1분 안팎으로 내보내기"], "3구간 · 1분 · 상품이 가운데 · 정보 카드", `자막 목록에서 문장을 클릭하면 그 위치로 이동하는 기능은 버전마다 다를 수 있음. 없으면 파형 · 재생헤드로 찾기.
녹화본이 가로면 9:16에서 잘리므로 상품 위치를 꼭 다시 맞추기(3회차 사이클 5).`);
  {
    const s = content("라이브 발행 · 표시와 개인정보", `라이브는 "언제 하는지"를 알리는 것부터 발행. 판매 방송은 광고 · 협찬 표시, 가격 · 혜택 표기를 정확히. 다시보기 · 하이라이트에 시청자 닉네임 · 얼굴이 나오면 가리기.`, "발행");
    step(s, "F");
    const r = [["예고", "날짜 · 시간 · 혜택 한 줄 + 예고 숏폼 · 썸네일"], ["다시보기", "제목 · 챕터(상품별) · 설명에 상품 링크"], ["하이라이트", "숏폼 3편, 끝에 다음 라이브 일정"], ["표시", "광고 · 협찬 · 제공 표시, 가격 · 혜택 · 기간 정확히"], ["개인정보", "채팅 닉네임 · 주문 정보 · 다른 사람 얼굴 가리기"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "알리고 → 방송하고 → 잘라서 다시 쓰기", 6.15);
  }
  checkCard("라이브 체크 · 카테고리 카드 ⑥", `워크북 카테고리 카드 ⑥에 정리.`, ["큐시트대로 흘러갔나", "가격 · 혜택 · 기간 정확히", "광고 · 협찬 표시", "채팅 닉네임 · 개인정보 가림", "소리 테스트 · 리허설"], [["A", "지금 같이 · 라이브 + 하이라이트 숏폼"], ["C", "오프닝→문제→보여주기→증거→혜택→마감"], ["D", "폰 고정 · 빛 하나 · 상품 자리 · 채팅 화면"], ["E", "자막으로 하이라이트 · 9:16 · 정보 카드"], ["F", "예고 · 다시보기 챕터 · 표시 · 개인정보"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("실습 · 3분 라이브 리허설 → 1분 하이라이트", `혼자 폰 앞에서 내 상품(없으면 소지품 하나)을 3분 동안 판매하듯 말하기. 실제로 방송하지 않고 녹화만. 옆자리는 시청자처럼 질문 하나 던져 주기.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const st = [["큐시트", "오프닝 · 문제 · 보여 주기 · 혜택 · 마감 5줄 (워크북, 5분)"], ["세팅", "폰 고정 · 빛 · 상품 자리 · 조용한 곳"], ["녹화", "3분 리허설 (옆자리 질문 하나 받기)"], ["편집", "자동 캡션으로 하이라이트 3구간 → 9:16 1분"], ["보기", "옆자리에게 \"사고 싶어진 순간\" 듣기"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.0 }));
    k.takeaway(s, "실제 라이브는 집에서 한 번 — 오늘은 준비와 하이라이트까지", 6.15);
  }
  statement("점심 시간", "오후는 ⑦ AI 영상 → 끝까지 보게 하는 법 · 채널로 묶기 → 대표작", `점심 전에 대표작 재료 폴더 확인. AI 영상 실습에 쓸 내 상품 사진 한 장 준비(폰으로).`);

  // ───────────────────────── 3교시 ─────────────────────────
  divider(3, "⑦ AI 영상", "찍을 수 없는 장면을 만드는 영상 — 이야기는 사람이, 장면은 AI가", "img04", `목표: A 정의(상황극과 차이) → B 한강 단풍 메이킹 + 레퍼런스 → C 20~30초 광고 구조 6컷 → D 일관성 · 카메라 말 · 프롬프트 공식 → E 잇기 · 내레이션 · 엔딩 → 마스터 프롬프트 → F 표시 · 금지 → G 체크 → 자동화 시연 → 실습 20초 광고 초안.`);
  {
    const s = content("AI 영상이란", `찍기 어렵거나 불가능한 장면(과거 · 상상 · 큰 세트)을 만드는 영상. 오늘은 수강생 설문에서 가장 많이 원한 "AI 숏드라마 광고"를 만듭니다. 4회차 ④ 공감 상황극은 한 편으로 끝나는 공감, ⑦은 이야기 안에 제품 · 브랜드가 들어갑니다.`, "정의");
    step(s, "A");
    const v = [["FaFilm", "AI 숏드라마 광고", "짧은 이야기 + 제품 · 가게 · 서비스"], ["FaImage", "브랜드 필름", "말보다 분위기 · 세계관 (4회차 상품 영상의 확장)"], ["FaMagic", "AI 단편 · 설명", "상상 장면 · 과정 설명 · 뮤직비디오"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.2, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.table(s, [["", "④ 공감 상황극", "⑦ AI 숏드라마 광고"], ["목적", "공감 · 공유", "제품 · 가게를 기억하게"], ["끝", "반전 한마디", "제품이 해결 → 엔딩 카드"], ["화면", "일러스트 4컷 + 말풍선", "실사풍 6컷 + 내레이션"]], { x: M, y: 4.3, w: CW, colW: [1.6, (CW - 1.6) / 2, (CW - 1.6) / 2], rowH: 0.42, fontSize: 13.5, align: "left" });
    k.takeaway(s, "이야기 · 기획 · 검수는 사람, 장면 · 목소리는 AI", 6.15);
  }
  {
    const s = content("메이킹 해부 · 3회차 한강 단풍 샘플", `3회차에 편집한 공통 샘플이 이렇게 만들어졌습니다. 오늘 실습도 같은 순서. 대본 · 스토리보드 문서는 단톡방에.`, "레퍼런스");
    step(s, "B");
    const st = [["대본", "장면 순서 · 내레이션"], ["스토리보드", "컷마다 화면 · 카메라 · 길이"], ["기준 이미지", "인물 · 장소 먼저 고정"], ["이미지 → 영상", "움직임만 프롬프트로"], ["목소리 · 편집", "Fish Audio · CapCut"]];
    const sw = (CW - 4 * 0.25) / 5;
    st.forEach(([h, b], i) => {
      const x = M + i * (sw + 0.25);
      k.card(s, x, 2.0, sw, 2.3, { fill: i === 2 ? C.text2 : C.background2 });
      k.text(s, String(i + 1), { x: x + 0.2, y: 2.12, w: 1, h: 0.6, fontSize: 26, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.2, y: 2.75, w: sw - 0.4, h: 0.5, fontSize: 17, bold: true, color: i === 2 ? C.background1 : C.text1 });
      k.text(s, b, { x: x + 0.2, y: 3.3, w: sw - 0.4, h: 0.9, fontSize: 13, color: i === 2 ? "C9D3CE" : C.accent5 });
    });
    s.addShape(S.roundRect, { x: M, y: 4.6, w: CW, h: 1.1, rectRadius: 0.1, fill: { color: "F4F6F5" }, line: { color: "B9C6BF", width: 1.25, dashType: "dash" } });
    k.text(s, "레퍼런스 AI 광고 · 숏드라마 캡처 · 링크 (강사가 골라 넣기)", { x: M, y: 4.6, w: CW, h: 1.1, fontSize: 15, bold: true, color: C.accent5, align: "center", valign: "middle" });
    k.takeaway(s, "가장 중요한 단계는 3번: 기준 이미지가 흔들리면 모든 컷이 흔들린다", 5.95);
  }
  {
    const s = content("20~30초 AI 광고 구조 · 6컷", `광고는 짧은 이야기. 시청자가 "나도 저래"(상황 · 문제) → "저거 좋네"(제품 · 변화) 순서로 따라오게. 컷당 3~5초.`, "기획");
    step(s, "C");
    structure(s, [["상황", "누가 · 어디서\n평범한 하루", 1], ["문제", "불편 · 고민\n표정으로", 1], ["제품 등장", "손 · 클로즈업\n가장 예쁜 순간", 1.1], ["변화", "써 본 뒤\n달라진 모습", 1.1], ["감정", "웃음 · 여유\n한 장면", 0.9], ["엔딩 카드", "제품명 · 한 줄\n어디서", 0.8]], 2.1, 1.1, "24초 예: 4초 × 6컷");
    k.takeaway(s, "제품이 문제를 해결하는 순간이 이야기의 중심", 5.6);
  }
  {
    const s = content("AI 장면 만들기 · 일관성이 전부", `3회차 프롬프트 공식(누가 · 어디서 · 동작 · 카메라 · 빛 · 하지 말 것)에 1회차 촬영 용어를 영어로. 인물과 제품은 기준 이미지 한 장으로 고정하고, 컷마다 그 이미지를 참고로 넣기.`, "생성");
    step(s, "D");
    const r = [["기준 인물 1장", "얼굴 · 머리 · 옷 고정. 모든 컷에 참고 이미지로"], ["제품은 내 사진", "제품 모양 · 라벨은 사진 그대로 (4회차 상품 프롬프트 규칙)"], ["카메라를 말로", "close-up · wide shot · low angle · slow push-in (1회차 용어)"], ["움직임은 하나", "한 컷에 동작 하나 · 카메라 움직임 하나"], ["2~3번 만들고 고르기", "손 · 얼굴 · 글자가 이상하면 다시"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.8 }));
    k.takeaway(s, "같은 인물 · 같은 제품 · 같은 빛 = 한 편의 광고", 6.15);
  }
  {
    const s = content("AI 숏드라마 광고 마스터 프롬프트", `4회차 상품 영상 프롬프트의 이야기 버전. 제품 사진 한 장 + 이야기 한 줄을 넣으면 인물 기준 이미지 → 6컷 이미지 → 영상 프롬프트 → 내레이션 대본 → CapCut 편집표까지 단계별로. 한 장짜리 배포물 · 원문 파일은 단톡방에.`, "생성");
    step(s, "D");
    const st = [["① 이야기 한 줄", "[누가] [어떤 문제] → [제품으로] [어떻게 달라짐]"], ["② 인물 기준 이미지", "얼굴 · 옷 · 분위기 고정"], ["③ 6컷 이미지", "한 장씩, 제품은 사진 그대로"], ["④ 영상 프롬프트", "컷마다 5초, 움직임 하나"], ["⑤ 내레이션 · 자막", "Fish Audio용 대본 · 엔딩 카드"], ["⑥ 편집표", "순서 · 초 · 효과 · 음악"]];
    st.forEach(([h, b], i) => {
      const col = i % 2, r = Math.floor(i / 2), bw = (CW - 0.3) / 2;
      const x = M + col * (bw + 0.3), y = 1.8 + r * 1.2;
      k.card(s, x, y, bw, 1.05, { fill: r % 2 ? "FFFFFF" : C.background2, line: r % 2 ? "DDE4E0" : undefined });
      k.text(s, h, { x: x + 0.3, y: y + 0.1, w: bw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
      k.text(s, b, { x: x + 0.3, y: y + 0.55, w: bw - 0.6, h: 0.42, fontSize: 13.5, color: C.accent5 });
    });
    k.takeaway(s, "프롬프트는 이야기를 대신 만들어 주지 않는다 — 이야기 한 줄은 내가", 5.6);
  }
  {
    const s = content("AI 영상 편집 핵심 셋", `AI 컷은 하나하나는 예뻐도 붙이면 따로 노는 경우가 많습니다. 색 · 소리 · 글자로 "한 편"으로 묶는 게 편집의 일.`, "편집");
    step(s, "E");
    const v = [["FaPalette", "잇기 · 색 통일", "컷 순서대로 붙이고 필터 · 조정 하나로 같은 톤 (3회차 사이클 7)"], ["FaMicrophone", "내레이션 · 효과음", "Fish Audio 내레이션 + 장면마다 효과음 하나 + 잔잔한 음악 (덕킹)"], ["FaPen", "자막 · 엔딩 카드", "내레이션 자동 캡션 → 강조 단어 하나 → 제품명 · 한 줄 · 어디서"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.1, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "이상한 손 · 얼굴이 보이는 프레임은 잘라 내기 (0.5초라도)", 5.3);
  }
  follow(4, "AI 6컷 → 20초 광고 잇기", ["9:16 새 프로젝트 → AI 영상 6컷을 순서대로 메인 트랙 (컷당 3~4초)", "이상한 프레임(손 · 얼굴 · 글자) 있는 부분은 Q · W로 잘라 내기", "조정으로 밝기 · 색온도 맞추고 전체에 복사 (같은 톤)", "내레이션 mp3 → 오디오 트랙 → 자동 캡션 → 강조 단어 하나", "음악 −20dB + 엔딩 카드(제품명 · 한 줄 · 어디서)"], "6컷이 한 톤으로 이어지고 내레이션 · 자막 · 엔딩 카드까지 20초", `내레이션은 3회차 Fish Audio(또는 CapCut 텍스트 읽기). AI 영상 클립이 없으면 이미지 6장 + 키프레임 줌으로도 같은 연습(4회차 상황극 방식).
업로드 때 AI 생성 표시.`);
  {
    const s = content("AI 영상 발행 · 지킬 선", `AI 광고는 "진짜처럼 보이는 것"이 장점이자 위험. 실제와 다른 효과 · 후기 · 인물로 오해하게 만들면 과장 · 기만 광고가 됩니다.`, "발행");
    step(s, "F");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.8, { fill: C.text2 });
    k.text(s, "꼭 할 것", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["플랫폼의 AI 생성 표시 켜기", "제품 모양 · 색 · 크기는 실물대로", "광고 · 협찬이면 표시", "쓴 도구 · 음원 이용 조건 확인"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 2.9, fontSize: 15, color: C.background1, paraSpaceAfter: 10 });
    const x2 = M + hw + 0.3;
    k.card(s, x2, 1.8, hw, 3.8, { fill: C.background2 });
    k.text(s, "하지 않을 것", { x: x2 + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
    k.checklist(s, ["실존 인물 · 유명인 닮은 얼굴 · 목소리", "남의 상표 · 캐릭터 · 작품", "없는 효과 · 가짜 후기 · 가짜 전문가", "실제 고객인 척하는 AI 인물"], { x: x2 + 0.3, y: 2.5, w: hw - 0.6, h: 2.9, fontSize: 15, paraSpaceAfter: 10 });
    k.takeaway(s, "AI로 만들었다고 밝혀도, 거짓 정보는 거짓 정보", 5.95);
  }
  checkCard("AI 영상 체크 · 카테고리 카드 ⑦", `워크북 카테고리 카드 ⑦에 정리.`, ["인물이 컷마다 같은 사람", "손 · 얼굴 · 글자 오류 없음", "이야기가 한 줄로 설명됨", "AI 생성 표시 켬", "실존 인물 · 남의 상표 · 거짓 효과 없음"], [["A", "찍을 수 없는 장면 · 숏드라마 광고 20~30초"], ["C", "상황→문제→제품→변화→감정→엔딩"], ["D", "기준 이미지 · 내 제품 사진 · 카메라를 말로"], ["E", "잇기 · 색 · 내레이션 · 자막 · 엔딩 카드"], ["F", "AI 표시 · 실물대로 · 하지 않을 것"], ["G", "왼쪽 다섯 개"]]);
  {
    const s = content("자동화 맛보기 · 어디까지 맡기나", `[강사 시연] 기획 → 프롬프트 → 이미지 · 영상 생성 → 편집까지를 AI 도구로 잇는 흐름. 실습 없이 보기만. 중요한 건 "사람이 꼭 보는 지점".`, "시연");
    pill(s, "시연", C.text2, 1.3);
    const st = [["기획", "사람", true], ["대본 · 프롬프트", "AI 초안 → 사람 검수", false], ["이미지 · 영상", "AI", false], ["고르기 · 검수", "사람", true], ["편집 · 자막", "AI 도움 → 사람 마무리", false], ["올리기 · 표시", "사람", true]];
    const sw = (CW - 5 * 0.2) / 6;
    st.forEach(([h, who, human], i) => {
      const x = M + i * (sw + 0.2);
      k.card(s, x, 2.1, sw, 2.2, { fill: human ? C.text2 : C.background2 });
      k.text(s, h, { x: x + 0.15, y: 2.3, w: sw - 0.3, h: 0.9, fontSize: 15, bold: true, color: human ? C.background1 : C.text1 });
      k.text(s, who, { x: x + 0.15, y: 3.3, w: sw - 0.3, h: 0.8, fontSize: 13, bold: true, color: human ? C.accent1 : C.accent5 });
    });
    k.takeaway(s, "어두운 칸 = 사람이 꼭 하는 일: 기획 · 검수 · 책임", 4.75);
  }
  {
    const s = content("실습 · 20초 AI 광고 초안", `내 상품 사진 한 장 + 이야기 한 줄로 마스터 프롬프트 실행. 시간 안에 6컷이 어려우면 4컷도 OK. 이미지만 만들고 키프레임으로 움직여도 됩니다.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const st = [["이야기 한 줄", "[누가] [어떤 문제] → [제품으로] [어떻게] (워크북)"], ["마스터 프롬프트", "사진 첨부 + 프롬프트 붙여 넣기 → 인물 기준 이미지"], ["6컷", "이미지 → (가능하면) 영상, 컷마다 2~3번"], ["편집", "따라하기 04: 잇기 · 색 · 내레이션 · 엔딩"], ["보기", "옆자리에게 \"무슨 광고인지 한 줄로\" 들어 보기"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.6 }));
    k.takeaway(s, "대표작이 AI 영상이면 이 초안을 5 · 6교시에 완성", 6.15);
  }

  // ───────────────────────── 4교시 ─────────────────────────
  divider(4, "끝까지 보게 하는 법 · 채널로 묶기", "한 편을 잘 만드는 것에서, 계속 보게 만드는 것으로", "img05", `목표: 훅 공식 다섯 → 이탈 막기 → 성공 채널 해부(개인) → 채널 브랜딩 한 장 → 유튜브 · 인스타 역할 → 수익화 경로 지도. 마케팅실무와 겹치지 않게 "콘텐츠 안에서"만.`);
  {
    const s = content("훅 공식 다섯", `숏폼은 첫 3초, 롱폼은 첫 30초. 2회차 훅을 카테고리별로 다시. 대표작의 첫 문장 · 첫 장면을 이 다섯 중 하나로 바꿔 보기.`);
    const r = [["질문", "\"이거 나만 그래요?\" · \"왜 다들 ○○할까?\""], ["결과 먼저", "완성된 모습 · 비포 애프터를 첫 장면에"], ["반전", "예상과 다른 한마디 · 장면 (④ 상황극)"], ["숫자", "\"3가지만\" · \"15년 차\" · \"10분 만에\""], ["공감", "\"월요일 아침 직장인\" — 내 얘기 같은 상황"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.4 }));
    k.takeaway(s, "훅은 약속. 약속한 것을 영상 안에서 반드시 지키기", 6.15);
  }
  {
    const s = content("끝까지 보게 하는 장치", `시청자는 "다음이 궁금할 때" 남습니다. 4회차 롱폼 문법(약속 · 챕터 · 열린 고리 · B롤)을 대표작에 다시.`);
    const v = [["FaRoute", "열린 고리", "\"마지막에 ○○도 보여 드릴게요\""], ["FaSyncAlt", "장면 바꾸기", "같은 화면 10초 이상 X · B롤 · 줌 · 각도"], ["FaListOl", "챕터", "롱폼은 구간 나누기, 숏폼은 한 메시지"], ["FaRedo", "다음 편", "끝에 시리즈 다음 편 · 관련 영상"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 2.9, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 13.5 });
    k.takeaway(s, "끝까지 본 사람이 다음 영상을 누른다 = 채널이 자란다", 5.1);
  }
  reference("성공 채널 해부 · 내 메인 스타일과 같은 카테고리", `[강사] 예시 채널 한 곳을 같이 본 뒤, 각자 내 메인 스타일과 같은 카테고리의 채널 하나를 찾아 10분 해부(워크북). 가져올 것 하나만.`, ["채널 소개 한 줄은?", "썸네일 · 커버에 반복되는 규칙은?", "시리즈 이름 · 업로드 주기는?", "내가 가져올 것 하나는?"]);
  {
    const s = content("채널 브랜딩 한 장", `채널 = 브랜드. 매번 같은 얼굴(썸네일 · 커버 규칙)과 같은 말투로 보이면 사람들이 기억합니다. 워크북 한 장에 채우고 7교시에 채널 소개에 반영.`, "실습");
    pill(s, "실습", C.accent1, 1.3);
    const rows = [["이름", "기억하기 쉽게 / 무엇을 하는지 보이게"], ["소개 한 줄", "누구에게 · 무엇을 · 어떻게"], ["썸네일 · 커버 규칙", "색 2개 · 글꼴 1개 · 글자 위치 · 얼굴/제품 위치"], ["시리즈", "반복되는 코너 이름 (예: \"사장님의 월요일\")"], ["업로드 주기", "지킬 수 있는 만큼 (주 1회 롱폼 + 숏폼 2)"]];
    rows.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 3.0 }));
    k.takeaway(s, "규칙이 있으면 다음 영상이 빨라진다", 6.15);
  }
  {
    const s = content("유튜브 · 인스타 같이 쓰기", `둘 다 할 때는 역할을 나누기. 한 번 찍고 여러 번 쓰기(4회차)를 플랫폼별로.`);
    const hw = (CW - 0.3) / 2;
    await k.featureCard(s, M, 1.8, hw, 3.0, { icon: "FaYoutube", head: "유튜브", body: "깊이 · 검색 · 쌓이는 영상\n롱폼 1편 + 쇼츠로 연결\n채널 = 나의 포트폴리오", bodySize: 15 });
    await k.featureCard(s, M + hw + 0.3, 1.8, hw, 3.0, { icon: "FaInstagram", head: "인스타그램", body: "브랜드 · 소식 · 단골\n릴스 + 피드 + 스토리\n프로필 링크 · 위치 · DM", bodySize: 15, dark: true });
    k.takeaway(s, "롱폼 1 → 숏폼 3: 유튜브에 원본, 릴스 · 쇼츠에 조각", 5.2);
  }
  {
    const s = content("수익화 경로 지도", `콘텐츠로 돈이 되는 길은 여러 개. 광고 집행 · 예산은 마케팅실무에서, 이 수업은 "콘텐츠 안에서" 무엇을 할지만. 조건 · 기준은 플랫폼마다 바뀌니 확인.`);
    k.table(s, [
      ["경로", "어떻게", "콘텐츠에서 할 일"],
      ["플랫폼 광고 수익", "조건을 채우면 영상에 광고", "꾸준한 업로드 · 시청 시간"],
      ["협찬 · 브랜디드", "브랜드가 제작 의뢰", "광고 · 협찬 표시 (뒷광고 금지)"],
      ["제휴 마케팅", "링크로 판매되면 수수료", "링크 고지 · 솔직한 리뷰"],
      ["내 사업 판매", "가게 · 상품 · 예약으로 연결", "상품 영상 · 라이브 · 위치 · 링크"],
      ["강의 · 디지털 상품", "노하우를 강의 · 자료로", "정보성 · 토크로 신뢰 쌓기"],
      ["제작 대행 · 프리랜서", "남의 영상 · AI 영상 제작", "포트폴리오 = 내 채널"],
    ], { x: M, y: 1.75, w: CW, colW: [2.8, 4.4, CW - 7.2], rowH: 0.56, fontSize: 13.5, align: "left" });
    k.takeaway(s, "내 메인 스타일에 맞는 경로 하나를 워크북에 동그라미", 6.05);
  }

  // ───────────────────────── 5 · 6교시 ─────────────────────────
  divider(5, "대표작 제작 ①", "메인 스타일 카테고리 카드를 따라 가편집까지", "img06", `목표: 대표작 형식 정하기 → 카테고리 카드 C로 구조 → 재료 정리 → 가편집. 강사는 입문자 먼저 순회. 막히면 해당 카테고리의 따라하기 슬라이드(4 · 5회차)로 돌아가기.`);
  {
    const s = content("대표작 · 세 가지 형식 중 하나", `6회차 상영 시간은 1인 3분 안팎. 그 안에 보여 줄 수 있게.`, "제작");
    pill(s, "제작", C.accent1, 1.3);
    const v = [["FaVideo", "롱폼 1편", "16:9 · 2~4분\n브이로그 · 정보성 · 리뷰 · 토크\n+ 숏폼 1편"], ["FaMobileAlt", "숏폼 시리즈 3편", "9:16 · 15~30초 × 3\n상품 이미지 · 상황극 · 정보 카드\n같은 시리즈 이름"], ["FaRobot", "AI 영상 1편", "9:16 또는 16:9 · 30초~1분\nAI 숏드라마 광고 · 브랜드 필름"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: v[i][0], head: v[i][1], body: v[i][2], bodySize: 14 });
    k.takeaway(s, "형식은 메인 스타일이 정한다. 망설여지면 숏폼 시리즈가 가장 빠름", 5.4);
  }
  {
    const s = content("대표작 순서 · 카테고리 카드대로", `4 · 5회차 카테고리 카드 한 장이 그대로 제작 순서. C(구조)를 먼저 워크북에 쓰고 편집에 들어가면 헤매지 않습니다.`, "제작");
    pill(s, "제작", C.accent1, 1.3);
    const st = [["C 구조", "카드의 구조 막대에 내 장면 넣기 (5분)"], ["재료 정리", "한 폴더 · 가져오기 · 안 쓸 컷 빼기"], ["가편집", "구조 순서대로 · 길이 먼저 맞추기"], ["E 편집", "카드의 핵심 기법 2~3개만"], ["F · G", "제목 · 썸네일 · 커버 · 체크 다섯"]];
    st.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.2 }));
    k.takeaway(s, "5교시 끝 = 가편집 완료. 6교시 = 다듬기 · 숏폼 · 썸네일", 6.15);
  }
  divider(6, "대표작 제작 ②", "시리즈 첫 편처럼 다듬고, 숏폼 하나 더", "img07", `목표: 인트로 · 엔딩 · 자막 스타일을 시리즈처럼 → 소리 확인 → 숏폼 1편 → 썸네일 · 커버. 막히면 옆자리와 서로 돕기.`);
  follow(5, "시리즈처럼 · 인트로 · 엔딩 고정", ["대표작 처음 2초에 시리즈 이름 텍스트 + 등장 애니메이션 하나", "끝 2초에 엔딩 카드: 채널 이름 · 다음 편 한 줄 · (구독)", "자막 하나를 브랜딩 한 장의 색 · 글꼴로 꾸미고 전체에 적용", "인트로 · 엔딩 · 자막 클립을 한꺼번에 선택 → 복사해 두기", "다음 영상에 붙여넣기만 하면 같은 시리즈가 됨"], "처음 · 끝 · 자막이 브랜딩 한 장의 규칙대로", `다음 영상부터는 복사 · 붙여넣기로 같은 시리즈가 됩니다. 템플릿 저장 기능은 버전마다 다를 수 있으니, 이 프로젝트를 복사해 두는 방법이 가장 확실.`);
  {
    const s = content("대표작 · 꼭 넣을 것", `기본을 먼저 채우고 도전. 소리는 여전히 파형 · dB · 폰으로.`, "제작");
    pill(s, "제작", C.accent1, 1.3);
    const base = [["훅", "첫 3초 · 첫 30초 (훅 공식 하나)"], ["구조", "카테고리 카드 C대로"], ["카테고리 핵심 기법", "카드 E에서 2개 이상"], ["자막 · 소리", "자막 · 말 0dB · 음악 −15 ~ −20dB"], ["시리즈 인트로 · 엔딩", "따라하기 05"], ["체크 다섯", "카드 G"]];
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
    [["숏폼 1편 더", "대표작에서 센 장면 · 9:16"], ["썸네일 · 커버 3안", "옆자리 1초 테스트"], ["보이스오버", "내 목소리 또는 TTS"]].forEach(([h, b], i) => {
      const y = 2.5 + i * 0.95;
      k.text(s, `☐  ${h}`, { x: rx + 0.3, y, w: rw - 0.6, h: 0.42, fontSize: 17, bold: true, color: C.background1 });
      k.text(s, b, { x: rx + 0.75, y: y + 0.42, w: rw - 1.0, h: 0.4, fontSize: 12.5, color: "C9D3CE" });
    });
    k.takeaway(s, "완벽보다 완성. 6회차에 보여 줄 수 있는 한 편", 5.75);
  }

  // ───────────────────────── 7교시 ─────────────────────────
  divider(7, "업로드 · 6회차 준비", "올리고, 채널을 정리하고, 상영을 준비한다", "img08", `목표: 대표작 · 숏폼 업로드 → 채널 소개에 브랜딩 한 장 반영 → 6회차 상영작 · 파일 제출 · 제작 노트 → 6회차 예고.`);
  {
    const s = content("업로드 · 채널 정리", `4회차 업로드 체크(제목 · 설명 · 챕터 · 썸네일 · 표시)를 그대로. 그리고 채널 소개 · 프로필을 오늘 만든 브랜딩 한 장으로 바꾸기. 링크는 공용 폴더(또는 폼)에.`, "업로드");
    const r = [["대표작 업로드", "제목 · 설명 첫 두 줄 · 챕터 · 썸네일 · AI · 협찬 표시"], ["숏폼 업로드", "커버 · 첫 1초 · 음원은 앱 안에서 · 해시태그"], ["채널 소개", "소개 한 줄 · 프로필 사진 · 배너(선택)"], ["재생목록 · 시리즈", "시리즈 이름으로 재생목록 하나"], ["링크 제출", "대표작 · 숏폼 링크를 공용 폴더(또는 폼)에"]];
    r.forEach(([h, b], i) => k.row(s, M, 1.8 + i * 0.85, CW, 0.72, { n: i + 1, head: h, body: b, headW: 2.8 }));
    k.takeaway(s, "채널을 처음 보는 사람이 10초 안에 무슨 채널인지 알게", 6.15);
  }
  {
    const s = content("6회차 상영 준비 · 제작 노트", `6회차(12/10)는 우리끼리 보고 듣고 나누는 날. 1인 3분 안팎: 대표작 + 한마디. 파일은 당일 정해진 시간까지 드라이브 한 폴더로.`, "준비");
    pill(s, "준비", C.accent1, 1.3);
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 3.9, { fill: C.background2 });
    k.text(s, "상영 준비", { x: M + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent2 });
    k.checklist(s, ["상영작 하나 정하기 (대표작 또는 올린 영상)", "파일 이름: 이름_제목.mp4", "드라이브 상영 폴더에 제출", "한마디 30초 준비 (무엇을 · 왜)"], { x: M + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 14.5, paraSpaceAfter: 10 });
    const x2 = M + hw + 0.3;
    k.card(s, x2, 1.8, hw, 3.9, { fill: C.text2 });
    k.text(s, "제작 노트", { x: x2 + 0.3, y: 1.95, w: hw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
    k.checklist(s, ["사람이 한 것 3줄", "AI가 도운 것 3줄", "가져온 채널 · 레퍼런스", "처음과 지금 달라진 것 한 줄"], { x: x2 + 0.3, y: 2.5, w: hw - 0.6, h: 3.0, fontSize: 14.5, color: C.background1, paraSpaceAfter: 10 });
    k.takeaway(s, "제작 노트는 워크북 마지막 쪽 · 6회차에 가져오기", 6.0);
  }
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    s.addText("한 편에서\n채널로", { placeholder: "title" });
    s.addText("다음 시간, 트리에 불을 켭니다 — 6회차 상영회", { placeholder: "body" });
    s.addNotes(`마무리. 링크 제출 확인, 6회차 상영 파일 제출 방법 · 마감 다시 안내.
수업 후: 단톡방에 핸드북 5장 · 워크북 · AI 숏드라마 광고 프롬프트 · 상영 안내 공지.`);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
