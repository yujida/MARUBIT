// 2회차 (10/30) 슬라이드 생성: node build/session2_slides.js [출력 경로]
// 내용 기준: build/session2/outline.md
const path = require("path");
const { THEME, HEX, W, H, M, newDeck, makeKit } = require("./lib/deck");
const { prepare } = require("./lib/images");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "02", "2회차_기획하는머리_슬라이드.pptx");
const CW = W - 2 * M; // 본문 폭

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
  const img = await prepare("s2", IMAGE_SPECS);
  if (img.missing.length) console.log("이미지 없음(그라데이션으로 대체):", img.missing.join(", "));

  const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 2회차 — 기획하는 머리";
  const { pres, C } = newDeck({ title: "촬영편집 2회차 — 기획하는 머리", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";
  let period = 0;
  let periodName = "시작";

  const content = (title, notes, part) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, (period ? `${period}교시 · ${periodName}` : "2회차 · 기획하는 머리") + (part ? `  ·  ${part}` : ""));
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
  // 크루 활동 표시 (오른쪽 위 작은 띠)
  const crewTag = (s, text = "크루 활동") => {
    s.addShape(S.roundRect, { x: W - M - 1.75, y: 0.95, w: 1.75, h: 0.38, rectRadius: 0.19, fill: { color: C.accent2 }, line: { type: "none" } });
    k.text(s, text, { x: W - M - 1.75, y: 0.95, w: 1.75, h: 0.38, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" });
  };
  const cols = (n, gap = 0.3) => ({ w: (CW - (n - 1) * gap) / n, x: (i) => M + i * ((CW - (n - 1) * gap) / n + gap) });

  // ───────────────────────── 시작 ─────────────────────────
  pres.addSection({ title: sec });
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    k.text(s, "AI콘텐츠 크리에이터 실무 · 촬영편집", { x: M, y: 1.7, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.accent1, charSpacing: 1 });
    s.addText("2회차\n기획하는 머리", { placeholder: "title" });
    s.addText("아이템에서 채널 개설까지, 오늘 내 채널을 엽니다", { placeholder: "body" });
    k.text(s, "2026. 10. 30 (금)  ·  1공학관", { x: M, y: 6.5, w: 8, h: 0.35, fontSize: 13, color: "C9D3CE" });
    s.addNotes(`[시작 전] 입장하는 대로 "앉은 자리 그대로" 앉아 있게 둡니다. 크루는 자리 기준으로 바로 묶습니다.
화면에는 1회차 입장 안내(QR) 이미지를 띄워 두면 단톡방 · 드라이브에 못 들어온 사람이 정리됩니다.`);
  }
  {
    const s = content("오늘의 시간표", `오늘 흐름 30초. "오전엔 아이템을 찾고, 오후엔 기획안을 쓰고, 마지막 시간엔 진짜로 채널을 엽니다."`);
    k.card(s, M, 1.8, 3.4, 4.75, { fill: C.text2 });
    k.text(s, "오늘 남는 것", { x: M + 0.35, y: 2.05, w: 2.9, h: 0.4, fontSize: 14, bold: true, color: C.accent6 });
    k.text(s, "채널 1개", { x: M + 0.35, y: 2.5, w: 2.9, h: 0.7, fontSize: 34, bold: true, color: C.accent1 });
    k.text(s, "+ 첫 쇼츠\n+ 채널 콘셉트 한 장\n+ 기획안 · 대본 초안\n+ 스토리보드 3칸", { x: M + 0.35, y: 3.3, w: 2.9, h: 1.9, fontSize: 15, color: C.background1, paraSpaceAfter: 4 });
    k.text(s, "모든 실습은 내 아이템 하나로", { x: M + 0.35, y: 5.6, w: 2.9, h: 0.7, fontSize: 13, bold: true, color: C.accent6 });
    const rows = [
      ["기획이란 무엇인가 + 크루 다시 시작", "크루 시트"],
      ["아이템 찾기", "후보 30개 → 3개"],
      ["레퍼런스 찾기와 해부", "해부 시트 · 크루 발표"],
      ["아이템 발전시키기와 채널 콘셉트", "채널 콘셉트 한 장"],
      ["기획안과 대본", "기획안 · 대본 초안"],
      ["스토리보드와 촬영 계획", "스토리보드 3칸"],
      ["채널 열고 내놓기", "채널 + 첫 쇼츠"],
    ];
    const x0 = M + 3.7, rw = CW - 3.7, rh = 0.6, gap = 0.08;
    rows.forEach(([what, out], i) => {
      const y = 1.8 + i * (rh + gap);
      k.card(s, x0, y, rw, rh, { fill: i % 2 ? "FFFFFF" : C.background2 });
      k.text(s, `${i + 1}교시`, { x: x0 + 0.25, y, w: 1.0, h: rh, fontSize: 14, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, what, { x: x0 + 1.3, y, w: 5.2, h: rh, fontSize: 15, bold: true, valign: "middle" });
      k.text(s, out, { x: x0 + 6.5, y, w: rw - 6.7, h: rh, fontSize: 12.5, color: C.accent5, valign: "middle", align: "right" });
    });
  }
  statement("지난주엔 크루를 말로만 만들었어요.\n오늘은 앉은 자리 그대로 크루가 됩니다.", "그리고 첫 활동부터 크루로 합니다", `실패를 먼저 인정하고 시작합니다. 어른 학습자는 이 솔직함에 잘 따라옵니다.
"지난주엔 이론이 많아서 각자 실습만 했죠. 그래서 크루가 있는지도 몰랐을 거예요. 오늘부터는 자리 그대로, 의자만 돌려서 크루로 합니다."`);

  // ───────────────────────── 1교시 ─────────────────────────
  divider(1, "기획이란 무엇인가", "크루로 다시 모이고, 프로는 찍기 전에 무엇을 정하는지", "img02", `목표: 크루 재출발(자리 기준 4 × 5) + 크루 체크인으로 첫 크루 활동 + 기획의 정의와 윤성원 PD 사례.`);
  {
    const s = content("크루는 앉은 자리 그대로, 4크루 × 5명", `자리 이동은 없습니다. 지금 앉은 자리에서 가까운 5명이 한 크루.
강사가 손으로 구역을 나눠 주며 "여기부터 여기까지 크루 1"처럼 바로 묶습니다. 활동할 때는 의자만 돌려 앉기.
역할은 크루장 한 명만 정합니다. 나머지는 역할 없이 서로 도와서 진행합니다.`);
    // 자리 그림: 4구역 × 5자리
    const bx = M, by = 1.8, bw = 6.0, bh = 4.3;
    k.card(s, bx, by, bw, bh, { fill: C.background2 });
    k.text(s, "강사 · 화면", { x: bx, y: by + 0.15, w: bw, h: 0.3, fontSize: 11, bold: true, color: C.accent5, align: "center" });
    s.addShape(S.rect, { x: bx + 1.5, y: by + 0.48, w: bw - 3.0, h: 0.07, fill: { color: C.accent5 }, line: { type: "none" } });
    const crewCols = [C.accent1, C.accent2, C.accent3, C.accent4];
    [0, 1, 2, 3].forEach((c) => {
      const cx = bx + 0.35 + (c % 2) * 2.85, cy = by + 0.8 + Math.floor(c / 2) * 1.5;
      s.addShape(S.roundRect, { x: cx, y: cy, w: 2.6, h: 1.3, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: crewCols[c], width: 2 } });
      k.text(s, `크루 ${c + 1}`, { x: cx + 0.15, y: cy + 0.1, w: 2.3, h: 0.3, fontSize: 12, bold: true, color: crewCols[c] });
      for (let i = 0; i < 5; i++) s.addShape(S.ellipse, { x: cx + 0.2 + i * 0.46, y: cy + 0.6, w: 0.36, h: 0.36, fill: { color: crewCols[c] }, line: { type: "none" } });
    });
    k.text(s, "의자만 돌려 앉기", { x: bx, y: by + bh - 0.42, w: bw, h: 0.32, fontSize: 14, bold: true, color: C.accent2, align: "center" });
    const rx = 7.15, rw = W - M - rx;
    k.card(s, rx, 1.8, rw, 2.35, { fill: C.text2 });
    await k.chip(s, rx + 0.35, 2.05, 0.7, "FaFlag", { fill: "26302C", iconHex: HEX.accent1 });
    k.text(s, "크루장 한 명", { x: rx + 1.25, y: 2.1, w: rw - 1.5, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
    k.bullets(s, ["활동을 시작할 때 \"시작할게요\" 한마디", "전원이 끝났는지 확인하고 손 들기", "크루 시트 · 채널 주소를 크루 폴더에"], { x: rx + 0.4, y: 2.8, w: rw - 0.7, h: 1.3, fontSize: 14, color: C.background1, paraSpaceAfter: 4 });
    k.card(s, rx, 4.35, rw, 1.75);
    await k.chip(s, rx + 0.35, 4.6, 0.7, "FaUsers");
    k.text(s, "나머지는 모두", { x: rx + 1.25, y: 4.65, w: rw - 1.5, h: 0.5, fontSize: 22, bold: true });
    k.text(s, "역할 없이 서로 도와서. 먼저 끝난 사람이 옆 사람 돕기", { x: rx + 0.4, y: 5.3, w: rw - 0.7, h: 0.6, fontSize: 14, color: C.accent5 });
  }
  {
    const s = content("크루의 약속 세 가지", `매 교시 같은 순서를 반복합니다. 의식이 반복되면 크루가 자리 잡습니다.
막힘 규칙도 다시: 막히면 옆 사람 → 크루 안에서 같이 → 그래도 안 되면 강사 호출 카드.`);
    const items = [["01", "시작 체크인", "교시가 시작되면 크루장이 \"다 왔나, 준비됐나\" 확인하고 손을 듭니다"], ["02", "크루로 하는 활동", "교시마다 하나씩, 크루가 같이 해야 끝나는 활동이 있습니다"], ["03", "크루 전원 완료", "전원이 끝나면 크루 완료 카드를 세웁니다. 먼저 끝난 사람은 옆 사람을 돕기"]];
    const c = cols(3);
    items.forEach(([n, h, b], i) => {
      k.card(s, c.x(i), 1.8, c.w, 3.0, { fill: i === 1 ? C.text2 : C.background2 });
      k.text(s, n, { x: c.x(i) + 0.35, y: 2.0, w: 1.2, h: 0.7, fontSize: 32, bold: true, color: C.accent1 });
      k.text(s, h, { x: c.x(i) + 0.35, y: 2.8, w: c.w - 0.7, h: 0.45, fontSize: 20, bold: true, color: i === 1 ? C.background1 : C.text1 });
      k.text(s, b, { x: c.x(i) + 0.35, y: 3.35, w: c.w - 0.7, h: 1.3, fontSize: 14, color: i === 1 ? "C9D3CE" : C.accent5 });
    });
    const steps = [["1", "옆 사람에게"], ["2", "크루 안에서 같이"], ["3", "강사 호출 카드"]];
    k.text(s, "막힘 규칙", { x: M, y: 5.1, w: 2, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
    steps.forEach(([t, d], i) => {
      const x = M + 1.8 + i * 3.6;
      k.badge(s, x, 5.05, 0.5, t, { fontSize: 13 });
      k.text(s, d, { x: x + 0.6, y: 5.05, w: 2.5, h: 0.5, fontSize: 15, bold: true, valign: "middle" });
      if (i < 2) k.arrow(s, x + 2.6, 5.3, 0.7);
    });
    k.takeaway(s, "개인 순위는 없습니다. 매 교시 목표는 \"크루 전원 완료\"", 6.0);
  }
  {
    const s = content("크루 시트 쓰기", `워크북 2쪽. 크루가 직접 적습니다. 크루 이름은 임시여도 괜찮고 7교시에 바꿔도 됩니다.
강사는 돌면서 크루마다 크루장이 누구인지만 확인합니다.`, "크루 시트");
    crewTag(s);
    k.checklist(s, ["크루 번호와 크루 이름 (임시여도 OK)", "다섯 명 이름과 크루장 한 명", "각자 생각 중인 아이템 갈래 (사업 홍보 · 취업 · 전문가 · 개인)", "크루 단톡이 필요하면 크루장이 만들기 (선택)"], { x: M, y: 1.85, w: 6.4, h: 3.2, fontSize: 17, paraSpaceAfter: 12 });
    k.card(s, 7.55, 1.8, CW - 6.8, 3.6, { fill: C.text2 });
    k.text(s, "크루 이름 예시", { x: 7.85, y: 2.0, w: 4.5, h: 0.35, fontSize: 14, bold: true, color: C.accent6 });
    k.text(s, "트리 장식처럼\n별 · 종 · 방울 · 리본\n\n우리 크루답게\n\"아이디어 공장\" \"새벽 네 시\"", { x: 7.85, y: 2.45, w: CW - 7.4, h: 2.7, fontSize: 17, bold: true, color: C.background1 });
    k.takeaway(s, "크루 시트는 크루장이 사진 찍어 드라이브 크루 폴더에 올려 두기", 5.75);
  }
  {
    const s = content("크루 체크인 · 과제 1편씩 보여 주기", `1회차 과제(저장한 콘텐츠 10편)에서 "제일 좋았던 1편"을 1분씩. 크루장이 1분을 알려 줍니다.
다 보고 나면 크루가 "크루 대표 1편"을 고릅니다. 3교시에 이 영상을 크루가 함께 해부합니다.
과제를 못 해 온 사람은 지금 2분 안에 하나 찾아서 참여(탓하지 않기).`, "크루 체크인");
    crewTag(s);
    const steps = [["1분씩", "폰으로 보여 주기", "제일 좋았던 1편 + 좋은 이유 한 줄"], ["3분", "크루 대표 1편 고르기", "\"우리 모두가 끝까지 본 영상\""], ["1분", "적기", "워크북 크루 시트에 제목 · 채널 · 고른 이유"]];
    steps.forEach(([t, h, b], i) => k.row(s, M, 1.85 + i * 1.2, CW, 1.0, { n: i + 1, head: `${h} · ${t}`, body: b, headW: 4.2 }));
    k.takeaway(s, "크루 대표 1편은 3교시에 크루가 함께 해부합니다", 5.75);
  }
  statement("기획은 찍기 전에\n정하는 것", "누구에게 · 무엇을 · 왜 · 어떻게", `1회차에서 본 제작 공정 7단계의 첫 단계. "카메라를 들기 전에 이 네 가지가 정해져 있으면, 찍는 시간이 절반이 됩니다."`);
  {
    const s = content("기획의 네 질문", `1회차 카페 30초 릴스로 다시 보기. 네 질문에 한 줄씩 답할 수 있으면 기획이 된 것.
기획 = 시청자가 3초 안에 "이건 나를 위한 거다"라고 느끼게 만드는 설계.`);
    const q = [["FaUsers", "누구에게", "근처 직장인, 비 오는 날 점심 후"], ["FaFilm", "무엇을", "창가 자리와 시그니처 라떼"], ["FaHeart", "왜", "\"비 오는 날, 여기 창가 자리 하나면 충분해요\""], ["FaLayerGroup", "어떻게", "30초 세로 릴스, 우유가 퍼지는 슬로 3초 훅"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.4, { icon: q[i][0], head: q[i][1], body: q[i][2], bodySize: 14 });
    k.takeaway(s, "네 질문에 한 줄씩 답하면 기획이 됩니다. 오늘 내 아이템으로 이 네 줄을 채웁니다", 5.6);
  }
  {
    const s = content("사례 ① 안원잘부: 탈락한 기획안이 채널이 되기까지", `윤성원 PD(스튜디오 솔파). 공개 기사 · 인터뷰 기준(iMBC 연예 2026.7, 위버스 매거진).
"리센느 아는 사람?" 손 들기 → 몰라도 "곰" · "거제" 밈은 본 적 있는지. 기획이 출연자를 모르는 사람에게까지 닿게 한다.
수업 전 원본 영상 확인: "곰을 만났을 때 대처법", 사투리 편, 거제 편.`, "윤성원 PD 사례");
    const steps = [["제안", "외부 프로젝트에 원이를 호스트로 제안"], ["탈락", "기획안이 떨어짐"], ["직접", "\"이거 안 되면 내가 해야겠다\""], ["첫 영상", "\"연수 아저씨\"와 찍어 20만 회"], ["성장", "사투리 · 일본어 기획 → \"거제\" 밈"], ["확인", "성장 계기를 데이터로 확인"]];
    const sw = (CW - 5 * 0.15) / 6;
    steps.forEach(([h, b], i) => {
      const x = M + i * (sw + 0.15);
      k.card(s, x, 1.85, sw, 2.6, { fill: i === 2 ? C.text2 : C.background2 });
      k.text(s, String(i + 1).padStart(2, "0"), { x: x + 0.2, y: 2.0, w: 1, h: 0.45, fontSize: 18, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.2, y: 2.5, w: sw - 0.35, h: 0.45, fontSize: 18, bold: true, color: i === 2 ? C.background1 : C.text1 });
      k.text(s, b, { x: x + 0.2, y: 3.0, w: sw - 0.35, h: 1.3, fontSize: 12.5, color: i === 2 ? "C9D3CE" : C.accent5 });
    });
    k.card(s, M, 4.7, CW, 1.1, { fill: C.background2 });
    k.text(s, "제작 공정으로 보면", { x: M + 0.3, y: 4.85, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.accent2 });
    k.text(s, "기획 → 촬영 → 발행 → 분석 → 다시 기획.  탈락은 끝이 아니라 \"내 채널로 해 보자\"의 시작이었습니다", { x: M + 0.3, y: 5.15, w: CW - 0.6, h: 0.5, fontSize: 15, bold: true });
    k.source(s, "출처: iMBC 연예(2026.7), 위버스 매거진 인터뷰 · 공개 자료 기준");
  }
  {
    const s = content("사례 ② ③ 같은 사람도 새롭게, 타깃은 뒤집어서", `존이냐박이냐: 이미 유명한 가수도 콘셉트(걸그룹 노래 커버 "기우제", 베를린 클럽 도전기)로 새로워진다. "베를린 클럽을 아는 사람은 대한민국의 1%도 안 된다"는 전제로 기획(위버스).
ODG: 아이들이 나오지만 어른 시청자를 위한 채널. 어른의 어린 시절 회상을 건드린다(유튜브 공식 블로그 2022.5).
질문: "여러분 아이템에서 '뒤집을 수 있는 것'은 뭘까요?"`, "윤성원 PD 사례");
    const hw = (CW - 0.3) / 2;
    [["존이냐박이냐", "같은 사람, 새 콘셉트", ["이미 아는 가수도 \"기우제\" 커버 · 베를린 클럽 도전기로 새로워진다", "\"베를린 클럽을 아는 사람은 1%도 안 된다\" → 모르는 사람 기준으로 설명"], "내 아이템에 새 옷을 입히면?"],
      ["ODG", "타깃을 뒤집기", ["아이들이 나오지만 보는 사람은 어른", "어른의 어린 시절을 떠올리게 하는 기획"], "내 아이템을 뜻밖의 사람에게 보여 주면?"]].forEach(([n, h, bs, q], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.9, { fill: i ? C.text2 : C.background2 });
      k.text(s, n, { x: x + 0.4, y: 2.0, w: hw - 0.8, h: 0.35, fontSize: 13, bold: true, color: i ? C.accent6 : C.accent2 });
      k.text(s, h, { x: x + 0.4, y: 2.4, w: hw - 0.8, h: 0.55, fontSize: 24, bold: true, color: i ? C.background1 : C.text1 });
      k.bullets(s, bs, { x: x + 0.4, y: 3.15, w: hw - 0.8, h: 1.6, fontSize: 14.5, color: i ? "C9D3CE" : C.text1 });
      k.text(s, "→ " + q, { x: x + 0.4, y: 4.95, w: hw - 0.8, h: 0.4, fontSize: 14, bold: true, color: C.accent1 });
    });
    k.source(s, "출처: 위버스 매거진 인터뷰, 유튜브 공식 블로그(2022.5), 마리끌레르(2021.6) · 공개 자료 기준");
  }
  {
    const s = content("기획 원칙 일곱 가지", `공개 인터뷰에서 뽑은 원칙을 우리 과제 언어로. 다 외울 필요 없이, 오늘 실습마다 하나씩 다시 나옵니다.
2교시: 1 · 2 / 4교시: 6 · 7 / 6교시: 3 · 4 / 5 → 3회차 촬영.`, "윤성원 PD 사례");
    const p = [["나를 모르는 사람 기준", "이름 대신 \"사투리 쓰는 아이돌\"처럼 특징으로 소개"], ["팬덤보다 대중", "업계 용어 없이도 이해되게"], ["틀은 시작 · 끝 · 지점 몇 개", "나머지는 현장에서 자유롭게"], ["콘셉트는 놀이터", "배경 · 옷 · 소품까지 한 그림으로"], ["출연자 강점에 맞춘 연출", "나는 즉흥형인가, 설정형인가"], ["구독할 이유 설계", "\"구독하면 ○○한 느낌\" 한 줄"], ["채널명", "심플하게, 또는 대화 소재가 될 만큼 궁금하게"]];
    const hw = (CW - 0.3) / 2, rh = 0.84;
    p.forEach(([h, b], i) => {
      const col = i < 4 ? 0 : 1, r = i < 4 ? i : i - 4;
      k.row(s, M + col * (hw + 0.3), 1.75 + r * (rh + 0.12), hw, rh, { n: i + 1, head: h, body: b, headW: 2.55 });
    });
    k.card(s, M + hw + 0.3, 1.75 + 3 * (rh + 0.12), hw, rh, { fill: C.accent6 });
    k.text(s, "워크북 3쪽: 내 채널에 적용하면?", { x: M + hw + 0.6, y: 1.75 + 3 * (rh + 0.12), w: hw - 0.6, h: rh, fontSize: 15, bold: true, valign: "middle" });
  }
  {
    const s = content("기획자의 태도", `윤성원 PD 인터뷰에서 뽑은 태도 네 가지. 특히 "안 되면 내가 한다"는 오늘 7교시 채널 열기로 바로 이어집니다.
마무리 멘트: "오늘 우리도 '안 되면 내가 한다'로 갑니다. 마지막 시간에 진짜 채널을 엽니다."`, "윤성원 PD 사례");
    const a = [["FaRegLightbulb", "새로움은 감정이다", "완전히 새로운 것은 없다. 사람들이 \"새롭다고 느끼는\" 감정을 좇는다"], ["FaSearch", "비밀은 없다", "알고리즘에 비밀은 없다. 콘텐츠가 좋으면 된다. 흐름은 많이 보며 관찰한다"], ["FaBolt", "안 되면 내가 한다", "기획안이 거절되자 직접 채널을 열었다"], ["FaChartLine", "데이터로 확인한다", "무엇이 통했는지 숫자로 확인하고 다음 기획에"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.5, { icon: a[i][0], head: a[i][1], body: a[i][2], bodySize: 13.5, headSize: 16, dark: i === 2 });
    k.takeaway(s, "오늘 7교시, 우리도 \"안 되면 내가 한다\"로 채널을 엽니다", 5.65);
    k.source(s, "출처: 위버스 매거진 인터뷰, 유튜브 공식 블로그(2022.5), iMBC 연예(2026.7) · 공개 자료 기준");
  }

  // ───────────────────────── 2교시 ─────────────────────────
  divider(2, "아이템 찾기", "내 안에서, 그리고 시장에서. 후보 30개에서 3개로", "img03", `목표: 내 안 4칸 + 시장 4방법으로 후보를 넓히고, ChatGPT로 30개 → 5기준으로 3개 → 크루 투표.`);
  {
    const s = content("아이템은 두 곳에서 찾습니다", `내 안에만 있으면 나만 재미있고, 시장에만 있으면 남들과 똑같아요. 두 원이 겹치는 곳이 내 아이템.`);
    const cx = M + 2.2, cy = 1.9;
    s.addShape(S.ellipse, { x: cx, y: cy, w: 3.8, h: 3.8, fill: { color: C.accent2, transparency: 25 }, line: { type: "none" } });
    s.addShape(S.ellipse, { x: cx + 2.6, y: cy, w: 3.8, h: 3.8, fill: { color: C.accent1, transparency: 25 }, line: { type: "none" } });
    k.text(s, "내 안에서", { x: cx + 0.3, y: cy + 1.35, w: 2.2, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
    k.text(s, "경력 · 사업\n취미 · 의외의 모습", { x: cx + 0.3, y: cy + 1.9, w: 2.2, h: 0.8, fontSize: 13, color: C.background1 });
    k.text(s, "시장에서", { x: cx + 4.0, y: cy + 1.35, w: 2.2, h: 0.5, fontSize: 22, bold: true, color: C.text1, align: "right" });
    k.text(s, "검색 · 댓글\n저장 · 트렌드", { x: cx + 4.0, y: cy + 1.9, w: 2.2, h: 0.8, fontSize: 13, color: C.text1, align: "right" });
    k.text(s, "내\n아이템", { x: cx + 2.6, y: cy + 1.35, w: 1.2, h: 1.1, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
    k.text(s, "나만 재미있음", { x: cx - 0.2, y: cy + 3.95, w: 2.6, h: 0.35, fontSize: 12, color: C.accent5, align: "center" });
    k.text(s, "남들과 똑같음", { x: cx + 4.0, y: cy + 3.95, w: 2.6, h: 0.35, fontSize: 12, color: C.accent5, align: "center" });
    k.takeaway(s, "두 원이 겹치는 곳: 내가 계속 할 수 있고, 누군가 찾고 있는 것", 6.3);
  }
  {
    const s = content("내 안에서 찾는 네 칸", `워크북 4쪽. 칸마다 3개 이상, 생각나는 대로 적습니다. 4분 + 짝에게 "의외의 모습" 물어보기 3분.
"의외의 모습"은 내가 못 보는 칸이라 짝이 대신 찾아 줍니다.`);
    const q = [["FaBriefcase", "경력", "오래 한 일, 남들이 나에게 자주 묻는 것"], ["FaStore", "사업", "지금 하는 일, 하고 싶은 일, 팔고 싶은 것"], ["FaHeart", "취미", "돈과 시간을 써 가며 하는 것"], ["FaQuestion", "의외의 모습", "주변이 \"그걸 네가?\" 하고 놀라는 것"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.3, { icon: q[i][0], head: q[i][1], body: q[i][2], bodySize: 14, dark: i === 3 });
    k.takeaway(s, "\"의외의 모습\"은 짝이 찾아 줍니다: \"제가 뭘 하면 놀라세요?\"", 5.5);
  }
  {
    const s = content("시장에서 찾는 네 가지 방법", `사람들이 이미 찾고 있는 것을 확인하는 법. 메뉴 이름은 앱 버전마다 조금씩 다를 수 있어요.
시연: 유튜브 검색창에 "40대 이직" 같은 말을 치다 멈추고 자동완성 보여 주기.`);
    const m = [["FaSearch", "검색 자동완성", "유튜브 · 네이버 검색창에 아이템을 치다 멈추면 사람들이 많이 찾는 말이 나옵니다"], ["FaComments", "댓글 속 질문", "인기 영상 댓글의 \"이건 어떻게 해요?\"가 다음 영상 아이템"], ["FaStar", "저장 많은 주제", "조회수보다 저장 · 공유가 많은 영상이 진짜 필요한 정보"], ["FaChartLine", "데이터랩 · 트렌드", "네이버 데이터랩 · 구글 트렌드로 관심이 오르는지 내리는지"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.5, { icon: m[i][0], head: m[i][1], body: m[i][2], bodySize: 13.5 });
    k.takeaway(s, "검색창 · 댓글 · 저장 수는 시청자가 남긴 \"주문서\"입니다", 5.65);
  }
  {
    const s = content("네 갈래 중 내 길은?", `이 과정의 아이템은 네 갈래 중 하나. 예시는 모두 가상입니다(5교시에 예시 기획안 4종으로 다시 봅니다).
갈래마다 성공 기준이 다릅니다: 사업 홍보는 문의 · 방문, 취업은 면접에서 보여 줄 결과물, 전문가는 신뢰와 문의, 개인 채널은 꾸준함과 구독.`);
    const g = [["FaStore", "사업 홍보", "동네 빵집 \"오늘 첫 빵\"", "문의 · 방문"], ["FaBriefcase", "취업 포트폴리오", "마케터 지원자의 \"브랜드 1분 해부\"", "면접에서 보여 줄 결과물"], ["FaChalkboardTeacher", "전문가 · 강사", "20년 차 정리수납 강사의 \"버리기 전에 1분\"", "신뢰 · 강의 문의"], ["FaPaw", "개인 채널", "노견과 사는 \"느린 산책 일기\"", "꾸준함 · 구독"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) {
      await k.featureCard(s, c.x(i), 1.8, c.w, 3.5, { icon: g[i][0], head: g[i][1], body: g[i][2], bodySize: 14 });
      k.text(s, "성공 기준 · " + g[i][3], { x: c.x(i) + 0.3, y: 4.75, w: c.w - 0.6, h: 0.4, fontSize: 12, bold: true, color: C.accent2 });
    }
    k.takeaway(s, "예시는 모두 가상입니다. 내 갈래의 \"성공 기준\"부터 정하면 아이템이 좁혀집니다", 5.65);
  }
  {
    const s = content("실습 · ChatGPT로 후보 30개", `워크북 4쪽의 네 칸을 그대로 붙여 넣습니다. 30개 중 마음에 드는 것에 별표만.
AI는 후보를 많이 내는 데 강하고, 고르는 건 사람이 합니다.`, "실습");
    k.prompt(s, M, 1.8, 7.2, 3.9, "나는 [네 칸: 경력 · 사업 · 취미 · 의외의 모습]을 가진 사람이야.\n[갈래: 사업 홍보 / 취업 포트폴리오 / 전문가 · 강사 / 개인 채널]로 유튜브 쇼츠 채널을 만들고 싶어.\n\n내 네 칸을 섞어서 채널 아이템 후보 30개를 표로 줘.\n칸: 아이템 한 줄 · 누가 보면 좋을지 · 첫 영상 제목 예시.\n폰 하나로 찍을 수 있는 것만, 과장 없이.", "ChatGPT에 복사해 쓰기");
    k.card(s, M + 7.5, 1.8, CW - 7.5, 3.9, { fill: C.text2 });
    k.text(s, "잘 쓰는 법", { x: M + 7.8, y: 2.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.bullets(s, ["네 칸은 짧아도 구체적으로", "\"더 엉뚱하게 10개\"로 한 번 더", "마음에 드는 후보에 별표만", "고르는 건 다음 장의 기준으로"], { x: M + 7.8, y: 2.5, w: CW - 8.1, h: 3.0, fontSize: 15, color: C.background1 });
    k.takeaway(s, "AI는 후보를 많이, 고르는 건 내가", 5.95);
  }
  {
    const s = content("30개에서 3개로 · 다섯 가지 기준", `별표한 후보 중 5개를 골라 기준마다 1~3점. 합계 상위 3개가 내 후보.
가장 중요한 건 1번: 30편을 만들 수 있나. 3편 만들고 지치는 아이템은 채널이 못 됩니다.`);
    k.table(s, [
      ["기준", "질문", "1점", "3점"],
      ["계속 만들 수 있나", "이 주제로 30편을 찍을 수 있나?", "5편이면 끝", "30편도 가능"],
      ["보고 싶은 사람이 있나", "검색 · 댓글 · 저장으로 확인되나?", "나만 궁금", "찾는 사람 많음"],
      ["내가 할 이유가 있나", "왜 하필 내가 말하나?", "누구나 가능", "내 경험이 있음"],
      ["폰으로 찍을 수 있나", "장소 · 사람 · 장비가 되나?", "어려움", "바로 가능"],
      ["일 · 수익으로 이어지나", "내 갈래의 성공 기준에 닿나?", "상관없음", "바로 이어짐"],
    ], { x: M, y: 1.75, w: CW, colW: [2.9, 4.9, 2.0, CW - 9.8], fontSize: 14, rowH: 0.55 });
    k.takeaway(s, "합계 상위 3개가 내 후보. 동점이면 \"30편 만들 수 있나\"가 이깁니다", 5.6);
  }
  {
    const s = content("크루 활동 · 3개 중 하나 골라 주기", `한 사람당 2분: 후보 3개를 말하면 크루원 4명이 "제일 보고 싶은 것"에 손가락으로 투표. 크루장이 시간을 알려 줍니다.
투표는 참고일 뿐, 최종 결정은 본인. 3주 과제 1주차에 확정하면 됩니다.`, "크루 활동");
    crewTag(s);
    const steps = [["30초", "후보 3개 말하기", "한 줄씩: \"○○한 사람이 보는 ○○ 채널\""], ["30초", "크루원 투표", "\"제일 보고 싶은 것\"에 손가락 1 · 2 · 3"], ["1분", "크루원 한마디", "왜 그게 보고 싶은지 한 줄"]];
    steps.forEach(([t, h, b], i) => k.row(s, M, 1.85 + i * 1.2, CW, 1.0, { n: i + 1, head: `${h} · ${t}`, body: b, headW: 4.0 }));
    k.takeaway(s, "투표는 참고, 결정은 내가. 확정은 3주 과제 1주차(11/6)까지", 5.75);
  }
  statement("점심 시간", "오후 첫 시간은 크루 대표 1편을 함께 해부합니다", `점심 전에: 1교시에 고른 크루 대표 1편의 링크를 크루장이 단톡방이나 크루 폴더에 올려 두기.`);

  // ───────────────────────── 3교시 ─────────────────────────
  divider(3, "레퍼런스 찾기와 해부", "잘된 영상은 따라 할 대상이 아니라 해부할 대상", "img04", `목표: 플랫폼별 찾는 법 → 해부 6칸 + 구조 분석 → AI 1차 해부 후 직접 고치기 → 크루 대표 1편 크루 해부 · 발표.`);
  {
    const s = content("플랫폼마다 찾는 법이 다릅니다", `메뉴 이름 · 필터는 앱 버전마다 바뀔 수 있어요. "찾고 → 저장하고 → 모아 두기"가 핵심.
과제: 레퍼런스 10개를 플랫폼 상관없이 한 곳(내 저장 폴더 · 메모)에 모으기.`);
    const p = [["FaYoutube", "유튜브", "검색 후 필터로 업로드 날짜 · 길이 · Shorts 고르기. 채널에 들어가 \"인기\" 순으로 잘된 영상 보기"], ["FaInstagram", "인스타그램", "릴스 탭에서 검색, 마음에 드는 릴스는 저장 → 컬렉션으로 주제별 정리"], ["FaTiktok", "틱톡", "검색 후 필터로 기간 · 정렬 바꾸기, 즐겨찾기에 모으기"], ["FaSearch", "네이버", "클립 · 블로그 검색. 국내 소상공인 · 지역 아이템은 네이버에서 먼저"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.5, { icon: p[i][0], head: p[i][1], body: p[i][2], bodySize: 13.5 });
    k.takeaway(s, "찾고 → 저장하고 → 한 곳에 모으기. 과제는 레퍼런스 10개", 5.65);
  }
  {
    const s = content("해부 여섯 칸", `워크북 5쪽(해부 시트). 영상 한 편을 이 여섯 칸으로 쪼개면 "왜 잘됐는지"가 보입니다.
⑤ 왜 보나가 가장 어렵고 가장 중요합니다. 1교시 원칙 6 "구독할 이유".`);
    const cells = [["①", "누가", "채널 · 출연자는 어떤 사람?"], ["②", "누구에게", "보는 사람은 누구? 나이 · 상황"], ["③", "무엇을", "주제 한 줄"], ["④", "어떻게", "형식 · 길이 · 톤 · 촬영 방식"], ["⑤", "왜 보나", "구독할 이유, 얻는 느낌"], ["⑥", "가져올 것 · 버릴 것", "내 채널에 쓸 것 하나, 안 쓸 것 하나"]];
    const c = cols(3, 0.25);
    cells.forEach(([n, h, b], i) => {
      const x = c.x(i % 3), y = 1.8 + Math.floor(i / 3) * 1.95;
      k.card(s, x, y, c.w, 1.75, { fill: i === 4 ? C.text2 : C.background2 });
      k.text(s, n, { x: x + 0.3, y: y + 0.2, w: 0.6, h: 0.5, fontSize: 24, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.95, y: y + 0.25, w: c.w - 1.2, h: 0.45, fontSize: 19, bold: true, color: i === 4 ? C.background1 : C.text1 });
      k.text(s, b, { x: x + 0.3, y: y + 0.9, w: c.w - 0.6, h: 0.6, fontSize: 14, color: i === 4 ? "C9D3CE" : C.accent5 });
    });
    k.takeaway(s, "⑤ \"왜 보나\"가 답해지면 해부는 끝난 것", 5.85);
  }
  {
    const s = content("구조 분석 · 숫자로 세어 보기", `해부 6칸이 "무엇"이라면 구조 분석은 "어떻게 만들었나". 직접 세어 봐야 보입니다.
30초 쇼츠의 컷 수를 세어 보면 보통 생각보다 많습니다. 1회차 "컷의 문법"과 연결.`);
    const items = [["첫 3초", "무엇이 보이고 들리나? 3초 안에 무슨 영상인지 알 수 있나"], ["컷 수", "30초에 몇 컷? 한 컷은 평균 몇 초"], ["자막", "크기 · 위치 · 색 · 말투. 소리 없이 봐도 이해되나"], ["소리", "음악 · 효과음 · 내레이션 · 현장음"], ["제목", "어떤 단어가 앞에 오나, 숫자 · 질문이 있나"], ["썸네일 · 첫 화면", "글자 몇 개, 얼굴이 있나, 색"]];
    const hw = (CW - 0.3) / 2;
    items.forEach(([h, b], i) => {
      const col = i % 2, r = Math.floor(i / 2);
      k.row(s, M + col * (hw + 0.3), 1.8 + r * 1.2, hw, 1.0, { n: i + 1, head: h, body: b, headW: 1.9 });
    });
    k.takeaway(s, "느낌 말고 숫자로: \"빠르다\" 대신 \"30초에 14컷\"", 5.6);
  }
  {
    const s = content("AI로 1차 해부, 그리고 내 눈으로 고치기", `시연: 크루 하나의 대표 영상으로 강사가 직접. 주의: 링크만 주면 AI가 영상을 실제로 보지 못하고 그럴듯하게 지어낼 수 있습니다.
제목 · 설명 · 자막(스크립트) · 화면 캡처를 주고 6칸 초안을 받은 뒤, 영상을 직접 보며 틀린 칸을 고칩니다.`);
    k.prompt(s, M, 1.8, 7.3, 3.7, "아래 영상 정보를 보고 \"해부 6칸\"으로 정리해 줘.\n① 누가 ② 누구에게 ③ 무엇을 ④ 어떻게 ⑤ 왜 보나 ⑥ 내 채널에 가져올 것 · 버릴 것\n내 채널은 [내 아이템 한 줄]이야.\n\n제목: [  ]\n설명: [  ]\n자막 · 대본: [  ]  (화면 캡처 2~3장 첨부)\n모르는 칸은 지어내지 말고 \"확인 필요\"라고 써 줘.", "ChatGPT에 복사해 쓰기");
    k.card(s, M + 7.6, 1.8, CW - 7.6, 3.7, { fill: C.text2 });
    k.text(s, "AI의 몫 / 사람의 몫", { x: M + 7.9, y: 2.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, "AI: 빠른 초안, 놓친 칸 채우기\n\n사람: 영상을 직접 보고 첫 3초 · 컷 수 확인, \"확인 필요\" 칸 채우기, ⑥은 반드시 내가", { x: M + 7.9, y: 2.5, w: CW - 8.2, h: 2.8, fontSize: 15, color: C.background1 });
    k.takeaway(s, "링크만 주면 AI가 지어낼 수 있어요. 정보를 주고, 내 눈으로 확인하기", 5.8);
  }
  {
    const s = content("크루 활동 · 크루 대표 1편 해부와 발표", `15분 해부 + 크루당 2분 발표. 크루장이 진행하고, 나머지는 할 일을 나눠 서로 돕습니다(누가 AI 해부, 누가 컷 세기, 누가 발표).
발표 형식은 화면 띄우기 또는 자리에서 말하기. 말하기 부담이면 크루 시트를 화면에 띄워 읽기만 해도 됩니다.`, "크루 활동");
    crewTag(s);
    k.text(s, "15분 해부", { x: M, y: 1.8, w: 5, h: 0.4, fontSize: 18, bold: true });
    k.checklist(s, ["다 같이 한 번 보기 (소리 켜고 · 끄고)", "컷 수 세기, 첫 3초 적기", "한 사람이 AI 1차 해부", "6칸을 크루 시트 한 장으로"], { x: M, y: 2.35, w: 5.8, h: 2.8, fontSize: 16, paraSpaceAfter: 10 });
    k.card(s, M + 6.3, 1.8, CW - 6.3, 3.6, { fill: C.text2 });
    k.text(s, "크루당 2분 발표", { x: M + 6.6, y: 2.0, w: 5, h: 0.4, fontSize: 18, bold: true, color: C.accent1 });
    k.bullets(s, ["첫 3초에 무엇이 있었나", "사람들이 왜 볼까 (구독할 이유)", "우리 크루가 가져갈 것 하나"], { x: M + 6.6, y: 2.6, w: CW - 6.9, h: 2.5, fontSize: 17, color: C.background1 });
    k.takeaway(s, "발표는 크루장이나 자원한 사람이. 화면 띄우고 읽기만 해도 OK", 5.75);
  }

  // ───────────────────────── 4교시 ─────────────────────────
  divider(4, "아이템 발전시키기와 채널 콘셉트", "형식은 빌리고 내용은 내 것으로. 채널 콘셉트 한 장", "img05", `목표: 가져올 것 · 버릴 것 → 각도 공식 → 타깃 한 사람 → 구독할 이유 → 시리즈 제목 → 채널 이름 · 소개 → 콘셉트 한 장 + 나를 모르는 사람 테스트.`);
  {
    const s = content("가져올 것과 버릴 것", `레퍼런스에서 가져오는 건 "형식"과 "구조", 내용은 내 경험으로. 그대로 베끼면 남의 채널, 구조를 빌리면 내 채널.`);
    const hw = (CW - 0.3) / 2;
    [["가져올 것 · 형식", ["길이와 컷 속도", "첫 3초 구조 (결과 먼저 · 질문)", "자막 스타일 · 시리즈 방식", "촬영 각도 · 소리 쓰는 법"], C.background2, C.text1],
      ["버릴 것 · 그 사람만의 것", ["출연자의 얼굴 · 말투 · 유행어", "그 채널만의 이야기와 소재", "따라 하기 어려운 장비 · 장소", "내 갈래와 안 맞는 톤"], C.text2, C.background1]].forEach(([h, bs, fill, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.7, { fill });
      k.text(s, h, { x: x + 0.4, y: 2.0, w: hw - 0.8, h: 0.5, fontSize: 22, bold: true, color: i ? C.accent1 : C.accent2 });
      k.checklist(s, bs, { x: x + 0.4, y: 2.7, w: hw - 0.8, h: 2.6, fontSize: 16, color: col, paraSpaceAfter: 10 });
    });
    k.takeaway(s, "그대로 베끼면 남의 채널, 구조를 빌리면 내 채널", 5.8);
  }
  {
    const s = content("나만의 각도 공식", `같은 아이템도 각도가 다르면 다른 채널. 가운데 칸 "나만의 경험 · 관점"이 핵심이고, 1교시 원칙 1 "나를 모르는 사람 기준"을 떠올리기.
예시는 모두 가상.`);
    const parts = [["아이템", C.background2, C.text1], ["나만의 경험 · 관점", C.text2, C.background1], ["형식", C.background2, C.text1]];
    const pw = 3.2;
    parts.forEach(([t, fill, col], i) => {
      const x = M + i * (pw + 0.85);
      k.card(s, x, 1.85, pw, 1.1, { fill });
      k.text(s, t, { x, y: 1.85, w: pw, h: 1.1, fontSize: 21, bold: true, color: col, align: "center", valign: "middle" });
      if (i < 2) k.text(s, "×", { x: x + pw, y: 1.85, w: 0.85, h: 1.1, fontSize: 30, bold: true, color: C.accent1, align: "center", valign: "middle" });
    });
    k.text(s, "= 채널 각도", { x: M + 3 * pw + 2 * 0.85 - 1.6, y: 3.0, w: 1.9, h: 0.4, fontSize: 15, bold: true, color: C.accent2, align: "right" });
    k.table(s, [
      ["아이템", "나만의 경험 · 관점", "형식", "채널 각도"],
      ["정리수납", "20년 차 강사의 실패담", "1분 숏폼", "\"버리기 전에 1분\""],
      ["동네 빵집", "새벽 4시에 굽는 사장의 시간", "아침 쇼츠", "\"오늘 첫 빵\""],
      ["반려견", "열두 살 노견과의 느린 하루", "브이로그", "\"느린 산책 일기\""],
    ], { x: M, y: 3.55, w: CW, colW: [2.4, 4.0, 2.2, CW - 8.6], fontSize: 14, rowH: 0.5 });
  }
  {
    const s = content("타깃은 한 사람", `"20~40대 여성"은 타깃이 아니라 통계. 한 사람을 정하면 말투 · 길이 · 올리는 시간이 정해집니다.
예시는 가상(정리수납 채널). 워크북 7쪽에 내 타깃 한 사람을 이 다섯 줄로.`);
    k.card(s, M, 1.8, 5.2, 3.9, { fill: C.text2 });
    await k.chip(s, M + 0.35, 2.05, 0.8, "FaUserCircle", { fill: "26302C", iconHex: HEX.accent1 });
    k.text(s, "지수 씨 (38)", { x: M + 1.35, y: 2.15, w: 3.5, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
    k.text(s, "가상의 예시", { x: M + 1.35, y: 2.6, w: 3.5, h: 0.3, fontSize: 11, color: C.accent6 });
    k.bullets(s, ["아이 둘, 맞벌이, 이사 한 달 전", "고민: 버려야 하는데 못 버린다", "폰 보는 때: 밤 11시, 아이 재우고", "검색어: \"이사 전 버릴 것\" \"정리 순서\""], { x: M + 0.4, y: 3.2, w: 4.5, h: 2.3, fontSize: 14.5, color: C.background1 });
    const tips = [["나이 · 상황", "지금 어떤 시기를 지나고 있나"], ["고민", "밤에 검색하게 만드는 문제"], ["폰 보는 때", "언제, 몇 분이나 보나 → 영상 길이"], ["검색어", "그 사람이 실제로 치는 말 → 제목"]];
    tips.forEach(([h, b], i) => k.row(s, M + 5.5, 1.8 + i * 0.98, CW - 5.5, 0.85, { n: i + 1, head: h, body: b, headW: 1.9 }));
    k.takeaway(s, "\"20~40대 여성\"은 통계, \"이사 한 달 전 지수 씨\"는 타깃", 5.95);
  }
  {
    const s = content("구독할 이유 한 줄", `1교시 원칙 6. 존이냐박이냐 인스타는 "영어 실력이 오르는 느낌"(위버스). 사람 · 감성 · 얻는 느낌 중 하나로.
워크북 7쪽 한 줄. 예시는 가상.`);
    k.card(s, M, 1.8, CW, 1.3, { fill: C.text2 });
    k.text(s, "구독하면  ○○○○한 느낌", { x: M, y: 1.8, w: CW, h: 1.3, fontSize: 34, bold: true, color: C.accent1, align: "center", valign: "middle" });
    const ex = [["사람", "\"새벽 4시 사장님을 응원하게 되는 느낌\"", "오늘 첫 빵"], ["감성", "\"하루가 느려지는 느낌\"", "느린 산책 일기"], ["얻는 것", "\"집이 하루에 한 칸씩 가벼워지는 느낌\"", "버리기 전에 1분"]];
    const c = cols(3, 0.25);
    ex.forEach(([t, q, ch], i) => {
      k.card(s, c.x(i), 3.4, c.w, 2.2);
      k.text(s, t, { x: c.x(i) + 0.3, y: 3.55, w: c.w - 0.6, h: 0.35, fontSize: 13, bold: true, color: C.accent2 });
      k.text(s, q, { x: c.x(i) + 0.3, y: 3.95, w: c.w - 0.6, h: 1.0, fontSize: 16, bold: true });
      k.text(s, ch, { x: c.x(i) + 0.3, y: 5.0, w: c.w - 0.6, h: 0.35, fontSize: 12, color: C.accent5 });
    });
    k.takeaway(s, "이 한 줄이 채널 소개글 첫 문장이 됩니다", 5.9);
  }
  {
    const s = content("시리즈 제목 10개 → 3개만 남기기", `시리즈 = 같은 틀로 계속 찍을 수 있는 묶음. ChatGPT로 10개 받고, 고를 땐 "타깃 한 사람이 검색할 말이 들어 있나"로.`);
    k.prompt(s, M, 1.8, 7.0, 3.8, "내 채널 각도는 [각도 한 줄], 타깃은 [타깃 한 사람 다섯 줄]이야.\n같은 틀로 계속 찍을 수 있는 쇼츠 시리즈 제목 10개를 줘.\n\n조건: 15자 이내, 타깃이 실제로 검색할 단어를 앞에,\n숫자나 질문을 쓴 것 3개 이상, 과장 금지.\n각 제목 옆에 첫 편 아이디어 한 줄.", "ChatGPT에 복사해 쓰기");
    k.card(s, M + 7.3, 1.8, CW - 7.3, 3.8, { fill: C.background2 });
    k.text(s, "남길 3개 고르는 기준", { x: M + 7.6, y: 2.0, w: 4.5, h: 0.4, fontSize: 15, bold: true, color: C.accent2 });
    k.checklist(s, ["타깃이 검색할 말이 들어 있나", "같은 틀로 10편 이상 가능한가", "제목만 봐도 무슨 영상인지 아나", "내 각도가 느껴지나"], { x: M + 7.6, y: 2.55, w: CW - 7.9, h: 2.9, fontSize: 15, paraSpaceAfter: 10 });
    k.takeaway(s, "시리즈는 \"다음 편이 기다려지는 틀\". 3개면 3주 과제에 충분합니다", 5.9);
  }
  {
    const s = content("채널 이름 · 핸들 · 소개글", `1교시 원칙 7: 심플하게, 또는 대화 소재가 될 만큼 궁금하게. 7교시에 바로 이 이름으로 채널을 엽니다.
핸들(@)은 채널 주소. 영문 · 숫자로, 짧고 읽기 쉽게. 이미 있는 핸들은 쓸 수 없으니 후보 3개.`);
    const n = [["FaHashtag", "채널 이름", "심플하게 또는 궁금하게. 소리 내어 한 번에 말할 수 있게"], ["FaUserCircle", "핸들 @", "영문 · 숫자 · 짧게. 후보 3개 준비 (중복 불가)"], ["FaPenNib", "소개글 두 줄", "1줄: 구독할 이유 / 2줄: 언제 · 무엇을 올리는지"], ["FaImage", "프로필 · 배너", "작게 봐도 알아보는 한 가지 그림, 배너엔 한 문장"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.3, { icon: n[i][0], head: n[i][1], body: n[i][2], bodySize: 13.5 });
    k.card(s, M, 5.35, CW, 0.9, { fill: C.background2 });
    k.text(s, "소개글 예 (가상)", { x: M + 0.3, y: 5.35, w: 2.0, h: 0.9, fontSize: 12, bold: true, color: C.accent2, valign: "middle" });
    k.text(s, "집이 하루에 한 칸씩 가벼워지는 1분.  /  20년 차 정리수납 강사가 매주 화 · 금, 버리기 전에 볼 영상을 올립니다.", { x: M + 2.2, y: 5.35, w: CW - 2.5, h: 0.9, fontSize: 14, valign: "middle" });
  }
  {
    const s = content("실습 · 채널 콘셉트 한 장", `워크북 7쪽. 위에서부터 채우고, 막히는 칸은 ChatGPT에 앞 칸들을 주고 후보를 받습니다. 크루 안에서 서로 봐 주기.
기본: 각도 · 타깃 · 구독할 이유 / 도전: 시리즈 3개 · 이름 · 핸들 · 소개글까지.`, "실습");
    const rows = [["각도", "[아이템] × [나만의 경험 · 관점] × [형식]"], ["타깃 한 사람", "나이 · 상황 · 고민 · 폰 보는 때 · 검색어"], ["구독할 이유", "\"구독하면 ○○한 느낌\""], ["시리즈 3개", "같은 틀로 계속 찍을 수 있는 제목"], ["채널 이름 · 핸들", "이름 + @핸들 후보 3개"], ["소개글 두 줄", "구독할 이유 / 언제 · 무엇을"]];
    rows.forEach(([h, b], i) => k.row(s, M, 1.75 + i * 0.72, CW, 0.62, { n: i + 1, head: h, body: b, headW: 2.8, fill: i < 3 ? C.background2 : "FFFFFF" }));
    k.takeaway(s, "기본은 1~3번, 도전은 6번까지. 다 못 채운 칸은 3주 과제 1주차에", 6.2);
  }
  {
    const s = content("크루 활동 · 나를 모르는 사람 테스트", `1교시 원칙 1을 직접 확인. 짝 · 크루원에게 콘셉트 한 장을 10초만 보여 주고 "무슨 채널 같아요?"
답이 내 의도와 같으면 통과, 다르면 그 사람이 말한 단어를 받아 적기. 그게 시청자가 실제로 읽는 내 채널입니다.`, "크루 활동");
    crewTag(s);
    k.card(s, M, 1.8, CW, 2.0, { fill: C.text2 });
    k.text(s, "10초 보여 주고  →  \"무슨 채널 같아요?\"", { x: M, y: 1.8, w: CW, h: 2.0, fontSize: 32, bold: true, color: C.background1, align: "center", valign: "middle" });
    const r = [["통과", "답이 내 의도와 같다 → 그대로 간다", C.accent2], ["다시", "답이 다르다 → 그 사람이 쓴 단어를 받아 적어 제목 · 소개글에", C.accent3]];
    const hw = (CW - 0.3) / 2;
    r.forEach(([h, b, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 4.05, hw, 1.4, { line: col, lineW: 2, fill: "FFFFFF" });
      k.text(s, h, { x: x + 0.35, y: 4.2, w: 2, h: 0.45, fontSize: 20, bold: true, color: col });
      k.text(s, b, { x: x + 0.35, y: 4.7, w: hw - 0.7, h: 0.6, fontSize: 14.5 });
    });
    k.takeaway(s, "시청자가 읽은 단어가 정답. 그 단어로 제목과 소개글을 고칩니다", 5.75);
  }

  // ───────────────────────── 5교시 ─────────────────────────
  divider(5, "기획안과 대본", "한 장의 기획안, 30초의 대본", "img06", `목표: 기획안 양식 → 갈래별 예시 4종 → 대본 3단 구조 · 훅 6가지 → AI 초안을 내 말투로 → 크루 훅 판정.`);
  {
    const s = content("기획안은 이 한 장", `워크북 8쪽. 4교시 콘셉트 한 장 + 시리즈 5편 + 대표 영상 1편 = 기획안. 3회차에 이 한 장으로 발표합니다.`);
    k.card(s, M, 1.8, 5.3, 4.2, { fill: C.text2 });
    k.text(s, "채널 콘셉트", { x: M + 0.35, y: 2.0, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: C.accent1 });
    k.text(s, "누구에게 · 무엇을 · 왜 · 어떻게\n각도 · 타깃 한 사람 · 구독할 이유\n채널 이름 · 소개글", { x: M + 0.35, y: 2.5, w: 4.6, h: 1.5, fontSize: 15, color: C.background1, paraSpaceAfter: 4 });
    k.text(s, "← 4교시에 만든 한 장", { x: M + 0.35, y: 5.3, w: 4.6, h: 0.4, fontSize: 13, color: C.accent6 });
    k.card(s, M + 5.6, 1.8, CW - 5.6, 1.9);
    k.text(s, "시리즈 5편 목록", { x: M + 5.9, y: 1.95, w: 5, h: 0.4, fontSize: 16, bold: true, color: C.accent2 });
    k.text(s, "편 번호 · 제목 · 한 줄 내용. 같은 틀로 이어지는지 확인", { x: M + 5.9, y: 2.45, w: CW - 6.2, h: 1.0, fontSize: 14, color: C.accent5 });
    k.card(s, M + 5.6, 3.9, CW - 5.6, 2.1, { fill: C.accent6 });
    k.text(s, "대표 영상 1편", { x: M + 5.9, y: 4.05, w: 5, h: 0.4, fontSize: 16, bold: true });
    k.text(s, "제목 · 길이 · 형식 · 훅(첫 3초) · 핵심 장면 3개\n→ 3주 과제에서 이 1편을 대본 · 스토리보드 · 촬영까지", { x: M + 5.9, y: 4.55, w: CW - 6.2, h: 1.3, fontSize: 14 });
  }
  {
    const s = content("갈래별 예시 기획안 4종 (가상)", `핸드북 2장 부록에 전체 버전. 내 갈래 예시를 펼쳐 놓고 따라 쓰면 됩니다. 모두 가상의 예시.`);
    const ex = [["사업 홍보", "오늘 첫 빵", "출근길 직장인", "새벽 4시 굽는 사장의 시간", "\"오늘 첫 빵 나왔습니다\" 15초"], ["취업 포트폴리오", "브랜드 1분 해부", "마케팅 채용 담당자", "지원자가 직접 고른 브랜드 분석", "\"이 광고, 왜 3초 만에 멈췄을까\""], ["전문가 · 강사", "버리기 전에 1분", "이사 앞둔 맞벌이 부모", "20년 차 강사의 실패담", "\"이건 버리지 마세요\" 결과 먼저"], ["개인 채널", "느린 산책 일기", "퇴근 후 지친 직장인", "열두 살 노견과의 하루", "현장음만 30초, 자막 한 줄"]];
    const c = cols(4, 0.22);
    ex.forEach(([g, t, who, ang, hook], i) => {
      const x = c.x(i);
      k.card(s, x, 1.8, c.w, 4.2, { fill: i % 2 ? C.background2 : "FFFFFF", line: "DDE4E0" });
      k.text(s, g, { x: x + 0.25, y: 1.95, w: c.w - 0.5, h: 0.3, fontSize: 12, bold: true, color: C.accent2 });
      k.text(s, t, { x: x + 0.25, y: 2.3, w: c.w - 0.5, h: 0.5, fontSize: 19, bold: true });
      [["타깃", who], ["각도", ang], ["대표 영상 훅", hook]].forEach(([l, v], j) => {
        k.text(s, l, { x: x + 0.25, y: 3.0 + j * 0.95, w: c.w - 0.5, h: 0.28, fontSize: 11, bold: true, color: C.accent1 });
        k.text(s, v, { x: x + 0.25, y: 3.28 + j * 0.95, w: c.w - 0.5, h: 0.6, fontSize: 13 });
      });
    });
    k.source(s, "모두 가상의 예시입니다 · 전체 기획안은 핸드북 2장 부록");
  }
  {
    const s = content("대본은 세 덩어리", `30초 쇼츠 기준. 훅에서 약속하고, 본론에서 그 약속을 지키고, 마무리에서 한 줄로 정리 + 다음 행동.
1회차 카페 릴스 타임라인(0–3초 훅 / 3–24초 본론 / 24–30초 마무리)과 같은 구조.`);
    const bx = M, by = 1.9, bw = CW;
    const segs = [["훅", "0–3초", 0.12, C.accent3, "약속하기: 끝까지 볼 이유"], ["본론", "3–24초", 0.68, C.accent2, "약속 지키기: 보여 주기, 과정, 핵심 장면 3개"], ["마무리", "24–30초", 0.2, C.accent1, "한 줄 정리 + 다음 행동 (저장 · 구독 · 댓글)"]];
    let x = bx;
    segs.forEach(([h, t, r, col]) => {
      const w = bw * r;
      s.addShape(S.rect, { x, y: by, w: w - 0.04, h: 0.75, fill: { color: col }, line: { type: "none" } });
      k.text(s, `${h}  ${t}`, { x: x + 0.12, y: by, w: w - 0.2, h: 0.75, fontSize: 14, bold: true, color: C.background1, valign: "middle" });
      x += w;
    });
    const c = cols(3, 0.3);
    segs.forEach(([h, t, , col, d], i) => {
      k.card(s, c.x(i), 3.0, c.w, 2.4, { line: col, lineW: 1.5, fill: "FFFFFF" });
      k.text(s, h, { x: c.x(i) + 0.3, y: 3.2, w: c.w - 0.6, h: 0.5, fontSize: 22, bold: true, color: col });
      k.text(s, t, { x: c.x(i) + 0.3, y: 3.7, w: c.w - 0.6, h: 0.3, fontSize: 12, color: C.accent5 });
      k.text(s, d, { x: c.x(i) + 0.3, y: 4.1, w: c.w - 0.6, h: 1.1, fontSize: 15, bold: true });
    });
    k.takeaway(s, "훅에서 한 약속을 본론에서 반드시 지키기. 안 지키면 \"낚시\"가 됩니다", 5.7);
  }
  {
    const s = content("훅 여섯 가지", `첫 3초에 쓸 수 있는 여섯 가지 틀. 예시는 가상의 채널들. 내 대표 영상에 맞는 것 두 개를 골라 각각 한 줄씩 써 보기.`);
    const h6 = [["질문", "\"이사 전에 제일 먼저 버릴 건?\""], ["결과 먼저", "완성된 빵부터 보여 주고 \"이게 새벽 4시부터\""], ["반전", "\"버리라고 하는 정리 강사가 절대 안 버리는 것\""], ["숫자", "\"이 광고, 3초 만에 멈춘 이유 2가지\""], ["공감 상황", "\"퇴근하고 문 열면 꼬리부터 흔드는 애\""], ["비포 · 애프터", "어질러진 서랍 → 1분 뒤"]];
    const c = cols(3, 0.25);
    h6.forEach(([h, e], i) => {
      const x = c.x(i % 3), y = 1.8 + Math.floor(i / 3) * 2.0;
      k.card(s, x, y, c.w, 1.8, { fill: i % 2 ? C.background2 : "FFFFFF", line: "DDE4E0" });
      k.badge(s, x + 0.25, y + 0.25, 0.5, i + 1, { fontSize: 13 });
      k.text(s, h, { x: x + 0.9, y: y + 0.25, w: c.w - 1.1, h: 0.5, fontSize: 19, bold: true, valign: "middle" });
      k.text(s, e, { x: x + 0.3, y: y + 0.9, w: c.w - 0.6, h: 0.75, fontSize: 14, color: C.accent5 });
    });
    k.takeaway(s, "내 대표 영상에 맞는 훅 두 개를 골라 한 줄씩", 5.95);
  }
  {
    const s = content("AI 초안을 내 것으로 만드는 네 단계", `AI 대본은 "누구나 쓸 수 있는 말"이 됩니다. 내 경험 디테일과 내 말투가 들어가야 내 채널.
설문에서 많이 원한 "내 일에 바로 쓰는 결과물"이 되려면 이 네 단계가 필수.`);
    const st = [["FaPenNib", "디테일 먼저", "내 경험 디테일 3개를 먼저 적어 AI에게 넣게 하기 (숫자 · 장소 · 실패담)"], ["FaComments", "말투 샘플", "평소 카톡이나 말한 문장 3개를 주고 \"이 말투로\""], ["FaMicrophone", "소리 내 읽기", "읽다가 걸리는 문장은 내 말로 바꾸기"], ["FaCheckCircle", "과장 지우기", "\"최고 · 무조건 · 100%\"와 확인 안 된 정보 지우기"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.4, { icon: st[i][0], head: st[i][1], body: st[i][2], bodySize: 13.5, num: undefined });
    k.takeaway(s, "AI는 초안, 디테일과 말투와 사실 확인은 내가", 5.55);
  }
  {
    const s = content("실습 · 대표 영상 대본 초안", `워크북 9쪽. 디테일 3개를 먼저 쓰고 → 프롬프트 → 소리 내 읽고 고치기.
기본: 훅 1개 + 본론 세 줄 / 도전: 30초 전체 대본 + 훅 3안.`, "실습");
    k.prompt(s, M, 1.8, 7.4, 3.9, "내 대표 영상은 [제목], 길이 [30초], 타깃은 [타깃 한 사람]이야.\n내 경험 디테일: [1] [2] [3]\n내 말투 샘플: \"[평소 말 1]\" \"[평소 말 2]\"\n\n훅(0–3초) · 본론 · 마무리로 30초 대본을 써 줘.\n훅은 질문 / 결과 먼저 / 숫자 버전으로 3안.\n디테일을 꼭 넣고, 내 말투로, 과장 없이.", "ChatGPT에 복사해 쓰기");
    k.card(s, M + 7.7, 1.8, CW - 7.7, 3.9, { fill: C.text2 });
    k.text(s, "받은 뒤에", { x: M + 8.0, y: 2.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.checklist(s, ["소리 내 한 번 읽기", "걸리는 문장 내 말로", "과장 · 틀린 정보 지우기", "훅 하나 고르기"], { x: M + 8.0, y: 2.5, w: CW - 8.3, h: 3.0, fontSize: 15, color: C.background1, paraSpaceAfter: 10 });
    k.takeaway(s, "다음 장에서 크루원들이 내 훅을 판정합니다", 5.95);
  }
  {
    const s = content("크루 활동 · 훅 판정", `한 사람씩 훅만 소리 내 읽기(3초). 크루원들이 "다음이 궁금하다 / 안 궁금하다"를 바로 판정하고 이유 한 줄.
"안 궁금하다"는 실패가 아니라 고칠 단서. 다른 훅 안으로 한 번 더.`, "크루 활동");
    crewTag(s);
    k.card(s, M, 1.8, CW, 1.6, { fill: C.text2 });
    k.text(s, "훅만 3초 읽기  →  크루원: \"다음이 궁금하다 / 안 궁금하다\"", { x: M, y: 1.8, w: CW, h: 1.6, fontSize: 26, bold: true, color: C.background1, align: "center", valign: "middle" });
    const r = [["궁금하다", "어디서 궁금해졌는지 한 단어 받아 적기", C.accent2], ["안 궁금하다", "다른 훅 안(질문 · 결과 먼저 · 숫자)으로 한 번 더", C.accent3]];
    const hw = (CW - 0.3) / 2;
    r.forEach(([h, b, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 3.65, hw, 1.5, { line: col, lineW: 2, fill: "FFFFFF" });
      k.text(s, h, { x: x + 0.35, y: 3.8, w: hw - 0.7, h: 0.45, fontSize: 20, bold: true, color: col });
      k.text(s, b, { x: x + 0.35, y: 4.3, w: hw - 0.7, h: 0.7, fontSize: 15 });
    });
    k.takeaway(s, "\"안 궁금하다\"는 실패가 아니라 고칠 단서", 5.5);
  }

  // ───────────────────────── 6교시 ─────────────────────────
  divider(6, "스토리보드와 촬영 계획", "찍기 전에 그려 보고, 언제 어디서 찍을지 정하기", "img07", `목표: 스토리보드 칸 → 1회차 촬영 기법 연결 → ChatGPT로 콘티 그림 → 촬영 계획표 → 스토리보드 3칸 + 서로 체크.`);
  {
    const s = content("스토리보드 한 칸에 들어가는 것", `워크북 10쪽. 그림은 막대 인간이면 충분. 중요한 건 칸마다 "샷 크기 · 앵글 · 움직임 · 소리 · 자막"이 정해져 있는 것.
마지막 칸 "촬영 / AI"는 이 장면을 직접 찍을지, AI 이미지 · 영상으로 만들지(4회차) 표시.`);
    k.card(s, M, 1.8, 3.0, 4.1, { fill: C.text2 });
    s.addShape(S.roundRect, { x: M + 0.55, y: 2.05, w: 1.9, h: 3.35, rectRadius: 0.1, fill: { color: "26302C" }, line: { color: C.accent1, width: 1.5, dashType: "dash" } });
    k.text(s, "그림\n(9:16)", { x: M + 0.55, y: 2.05, w: 1.9, h: 3.35, fontSize: 14, bold: true, color: C.accent6, align: "center", valign: "middle" });
    k.text(s, "장면 1 · 훅", { x: M, y: 5.45, w: 3.0, h: 0.35, fontSize: 13, bold: true, color: C.background1, align: "center" });
    k.table(s, [
      ["칸", "적는 것", "예 (가상 · 오늘 첫 빵)"],
      ["샷 크기", "1회차 5교시", "익스트림 클로즈업"],
      ["앵글", "아이레벨 · 하이 · 로우 · 탑뷰", "탑뷰"],
      ["움직임", "고정 · 팬 · 달리 인 …", "고정"],
      ["소리", "현장음 · 음악 · 내레이션", "오븐 문 여는 소리"],
      ["자막", "화면에 쓸 글자", "\"새벽 4시 12분\""],
      ["촬영 / AI", "직접 찍기 또는 AI로", "촬영"],
    ], { x: M + 3.3, y: 1.8, w: CW - 3.3, colW: [1.6, 3.6, CW - 8.5], fontSize: 13.5, rowH: 0.55 });
  }
  {
    const s = content("1회차에서 배운 것이 여기서 쓰입니다", `지난주 촬영 이론이 스토리보드의 언어. 핸드북 1장을 옆에 두고 칸을 채우세요.`);
    const l = [["FaLayerGroup", "샷 크기 · 앵글", "칸마다 샷 크기와 앵글 정하기. 같은 크기 연속은 피하기"], ["FaFilm", "5샷 시퀀스", "모르겠으면 손 · 얼굴 · 와이드 · 어깨 너머 · 특이한 앵글"], ["FaListOl", "숏리스트", "스토리보드를 숏리스트로 바꾸면 촬영 순서가 됨 (커버리지)"], ["FaCompass", "구도 10가지", "훅 장면 하나는 구도까지 정해 두기"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) await k.featureCard(s, c.x(i), 1.8, c.w, 3.3, { icon: l[i][0], head: l[i][1], body: l[i][2], bodySize: 13.5 });
    k.takeaway(s, "스토리보드는 \"찍기 전에 한 번 촬영해 보는 것\"", 5.5);
  }
  {
    const s = content("ChatGPT 이미지로 콘티 그림 만들기", `그림 실력이 걱정되면 AI로. 단, 실존 인물 · 브랜드 · 다른 사람 얼굴은 넣지 않습니다. 단순한 연필 스케치 스타일이 가장 콘티답습니다.
세 칸을 한 번에 요청하면 칸 모양이 섞이니, 한 칸씩 요청하는 것이 안전합니다.`);
    k.prompt(s, M, 1.8, 7.6, 3.6, "Simple storyboard sketch, pencil and light grey marker, vertical 9:16 frame.\nScene: [장면 설명, 예: a baker's hands taking bread out of an oven at dawn]\nShot size: [extreme close-up / close-up / medium / wide]\nAngle: [eye level / high angle / low angle / top-down]\nNo text, no real people's faces, simple figures.", "ChatGPT 이미지에 (영어가 더 정확해요)");
    k.card(s, M + 7.9, 1.8, CW - 7.9, 3.6, { fill: C.background2 });
    k.text(s, "쓰는 법", { x: M + 8.2, y: 2.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
    k.bullets(s, ["한 칸씩 요청", "샷 크기 · 앵글은 1회차 영어 이름 그대로", "실존 인물 · 브랜드 넣지 않기", "마음에 안 들면 \"더 단순하게\""], { x: M + 8.2, y: 2.5, w: CW - 8.5, h: 2.8, fontSize: 14.5 });
    k.takeaway(s, "1회차 영어 용어가 그대로 프롬프트가 됩니다 (4회차 AI 영상에서도)", 5.7);
  }
  {
    const s = content("촬영 계획표", `워크북 11쪽. 스토리보드가 "무엇을"이면 촬영 계획표는 "언제 · 어디서 · 무엇을 챙겨서". 특히 시간대(빛)와 허락받을 것.
3주 과제 3주차에 훅 포함 5컷 이상 촬영 → 3회차 편집 재료.`);
    k.table(s, [
      ["항목", "적는 것", "예 (가상 · 오늘 첫 빵)"],
      ["장소", "어디서, 대안 장소까지", "가게 주방 / 비 오면 계산대 앞"],
      ["날짜 · 시간대", "빛을 보고 정하기 (1회차 빛)", "11/15 새벽 5시, 창가 자연광 없음 → 주방등"],
      ["소품", "화면에 나올 것", "첫 빵 트레이, 가게 앞치마"],
      ["출연자", "누가 나오나, 얼굴 공개 여부", "사장님 손만 (얼굴 X)"],
      ["허락받을 것", "장소 · 사람 · 음악", "직원 촬영 동의"],
      ["장비", "폰 · 삼각대 · 마이크 · 반사판", "폰 + 미니 삼각대"],
    ], { x: M, y: 1.75, w: CW, colW: [2.2, 4.3, CW - 6.5], fontSize: 14, rowH: 0.55 });
    k.takeaway(s, "시간대는 빛으로 정하고, 허락은 찍기 전에", 6.0);
  }
  {
    const s = content("실습 · 스토리보드 3칸 + 서로 체크", `훅 · 핵심 · 마무리 3칸만. 크루원끼리 서로의 스토리보드를 보고 "폰으로 찍을 수 있나"만 체크(장소 · 빛 · 장비 · 허락).
기본: 3칸 + 칸마다 샷 크기 / 도전: 촬영 계획표까지 + AI 콘티 그림.`, "실습");
    crewTag(s, "실습 + 크루");
    const c = cols(3, 0.3);
    [["1", "훅", "첫 3초. 오늘 고른 훅"], ["2", "핵심", "약속을 지키는 장면 하나"], ["3", "마무리", "한 줄 정리 + 다음 행동"]].forEach(([n, h, b], i) => {
      k.card(s, c.x(i), 1.8, c.w, 2.9);
      s.addShape(S.roundRect, { x: c.x(i) + 0.3, y: 2.05, w: 1.2, h: 2.1, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { color: C.accent5, width: 1, dashType: "dash" } });
      k.badge(s, c.x(i) + 1.75, 2.05, 0.5, n, { fontSize: 14 });
      k.text(s, h, { x: c.x(i) + 1.75, y: 2.65, w: c.w - 2.0, h: 0.45, fontSize: 20, bold: true });
      k.text(s, b, { x: c.x(i) + 1.75, y: 3.15, w: c.w - 2.0, h: 1.0, fontSize: 13.5, color: C.accent5 });
    });
    k.card(s, M, 4.95, CW, 0.8, { fill: C.text2 });
    k.text(s, "서로 체크 · 폰으로 찍을 수 있나?   장소 □  빛 □  장비 □  허락 □", { x: M + 0.3, y: 4.95, w: CW - 0.6, h: 0.8, fontSize: 16, bold: true, color: C.background1, valign: "middle" });
    k.takeaway(s, "다 그리면 크루 완료 카드. 7교시는 노트북 · 폰 충전 확인하고 시작", 6.0);
  }

  // ───────────────────────── 7교시 ─────────────────────────
  divider(7, "채널 열고 내놓기", "안 되면 내가 한다. 오늘 채널을 엽니다", "img08", `목표: 유튜브 채널 개설(강사도 함께) → 발행 체크 → 첫 쇼츠 업로드 → 3회차 발표 방식 크루 투표 → 3주 과제와 크루 체크인 안내.`);
  {
    const s = content("유튜브 채널 여는 순서", `강사 화면을 띄우고 같이 합니다. 강사도 오늘 새 채널을 열어요("저도 오늘 0명부터 시작합니다").
개인 계정과 분리하고 싶으면 '브랜드 채널'로. 메뉴 이름은 바뀔 수 있으니 막히면 옆 사람 → 강사.`);
    const st = [["구글 계정 로그인", "개인과 분리하려면 브랜드 채널"], ["채널 만들기", "프로필 사진 → 내 채널 만들기"], ["이름 · 핸들(@)", "4교시에 정한 이름 · 핸들 후보"], ["프로필 · 배너", "다음 장 규격. 오늘은 임시여도 OK"], ["소개 · 링크", "소개글 두 줄, 인스타 · 가게 링크"], ["재생목록 1개", "시리즈 이름으로 만들어 두기"]];
    const hw = (CW - 0.3) / 2;
    st.forEach(([h, b], i) => {
      const col = Math.floor(i / 3), r = i % 3;
      k.row(s, M + col * (hw + 0.3), 1.8 + r * 1.25, hw, 1.05, { n: i + 1, head: h, body: b, headW: 2.6 });
    });
    k.takeaway(s, "오늘은 \"열기\"가 목표. 예쁘게 다듬는 건 3주 과제에서", 5.75);
  }
  {
    const s = content("프로필과 배너 규격", `유튜브 고객센터 기준 권장값(바뀔 수 있음). 배너는 기기마다 보이는 부분이 달라서, 글자 · 로고는 가운데 안전 영역에만.
프로필은 원형으로 잘려 보이니 가운데에 한 가지 그림. ChatGPT 이미지로 만들어도 됩니다(실존 인물 · 브랜드 X).`);
    // 배너 그림
    const bx = M, by = 1.9, bw = 7.6, bh = bw * 1152 / 2048;
    s.addShape(S.rect, { x: bx, y: by, w: bw, h: bh, fill: { color: C.background2 }, line: { color: C.accent5, width: 1 } });
    const sw = bw * 1235 / 2048, sh = bh * 338 / 1152;
    s.addShape(S.rect, { x: bx + (bw - sw) / 2, y: by + (bh - sh) / 2, w: sw, h: sh, fill: { color: C.accent1, transparency: 20 }, line: { color: C.accent1, width: 1.5 } });
    k.text(s, "1235 × 338  안전 영역 · 글자와 로고는 여기에", { x: bx + (bw - sw) / 2, y: by + (bh - sh) / 2, w: sw, h: sh, fontSize: 12, bold: true, align: "center", valign: "middle" });
    k.text(s, "배너 2048 × 1152 (TV에서는 전체가 보임)", { x: bx, y: by + bh + 0.1, w: bw, h: 0.35, fontSize: 13, bold: true, color: C.accent2 });
    // 프로필
    const px = M + 8.4;
    s.addShape(S.rect, { x: px, y: 1.9, w: 2.6, h: 2.6, fill: { color: C.background2 }, line: { color: C.accent5, width: 1 } });
    s.addShape(S.ellipse, { x: px, y: 1.9, w: 2.6, h: 2.6, fill: { color: C.accent2, transparency: 15 }, line: { color: C.accent2, width: 1.5 } });
    k.text(s, "보이는\n부분", { x: px, y: 1.9, w: 2.6, h: 2.6, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle" });
    k.text(s, "프로필 800 × 800 권장\n원형으로 잘려 보임", { x: px - 0.2, y: 4.6, w: 3.0, h: 0.7, fontSize: 13, bold: true, color: C.accent2, align: "center" });
    k.takeaway(s, "배너 글자는 가운데 띠에만, 프로필은 작게 봐도 알아보게", 5.95);
  }
  {
    const s = content("발행 전 다섯 가지", `업로드 화면에서 하나씩 같이 확인. 맞춤 썸네일은 휴대전화 인증이 필요할 수 있어요(쇼츠는 영상 속 한 장면을 고르는 방식).
AI 표시: 사실처럼 보이는 합성 · 변경 콘텐츠면 업로드할 때 '변경되거나 합성된 콘텐츠'로 공개. 오늘 첫 쇼츠는 직접 찍은 영상이면 해당 없음.`);
    const p = [["제목", "타깃이 검색할 말을 앞에, 짧게"], ["썸네일 · 첫 화면", "글자 적게, 작게 봐도 읽히게"], ["설명 첫 두 줄", "무엇을 보여 주는지 + 채널 소개 한 줄"], ["공개 범위", "공개 · 일부 공개(링크 아는 사람만) · 비공개"], ["AI 표시", "사실처럼 보이는 합성 · 변경 콘텐츠면 공개"]];
    p.forEach(([h, b], i) => k.row(s, M, 1.75 + i * 0.82, CW, 0.7, { n: i + 1, head: h, body: b, headW: 3.0 }));
    k.takeaway(s, "\"일부 공개\"로 올려도 됩니다. 채널을 여는 것 자체가 오늘의 목표", 6.0);
  }
  {
    const s = content("실습 · 첫 쇼츠 올리기", `1회차 베스트 컷이나 오늘 찍는 15초 채널 예고. 얼굴 · 공개가 부담이면 손 · 공간만 나오는 영상, "일부 공개"로.
강사가 먼저 강사 채널에 첫 쇼츠를 올리는 모습을 화면으로 보여 줍니다. 크루장은 크루원 전원 채널 주소를 크루 시트에.`, "실습");
    crewTag(s, "실습 + 크루");
    const hw = (CW - 0.3) / 2;
    [["무엇을 올리나", ["1회차 크루 베스트 컷 · 내 5샷 시퀀스", "15초 채널 예고: \"이 채널은 ○○을 올립니다\"", "얼굴 대신 손 · 공간 · 소품도 OK"], C.background2, C.text1],
      ["어떻게", ["유튜브 앱 → + → Short 만들기 (또는 PC 업로드)", "제목 · 설명 두 줄 · 공개 범위", "크루장에게 채널 주소 알려 주기"], C.text2, C.background1]].forEach(([h, bs, fill, col], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.6, { fill });
      k.text(s, h, { x: x + 0.4, y: 2.0, w: hw - 0.8, h: 0.5, fontSize: 20, bold: true, color: i ? C.accent1 : C.accent2 });
      k.checklist(s, bs, { x: x + 0.4, y: 2.7, w: hw - 0.8, h: 2.5, fontSize: 15.5, color: col, paraSpaceAfter: 10 });
    });
    k.takeaway(s, "강사도 오늘 새 채널, 첫 쇼츠. 우리 모두 구독자 0명부터", 5.75);
  }
  {
    const s = content("크루 투표 · 3회차 발표는 어떻게 할까?", `크루마다 하나에 투표 → 다수결. 어떤 방식이든 글 · 화면 기반 발표는 항상 허용(말하기 부담 있는 사람 배려).
결과는 단톡방 공지. 3회차(11/19) 오전에 발표합니다.`, "크루 투표");
    crewTag(s, "크루 투표");
    const v = [["A", "전체 앞 3분 발표", "한 사람씩 기획안 화면을 띄우고 3분. 강사 · 전체 피드백"], ["B", "크루 안 발표 → 대표 1명", "크루 안에서 전원 발표, 크루가 고른 1명이 전체 앞에서"], ["C", "갤러리 워크", "기획안을 벽 · 화면에 띄우고 돌아보며 스티커 피드백"]];
    const c = cols(3, 0.3);
    v.forEach(([n, h, b], i) => {
      k.card(s, c.x(i), 1.8, c.w, 3.4, { fill: i === 1 ? C.text2 : C.background2 });
      k.text(s, n, { x: c.x(i) + 0.35, y: 1.95, w: 1, h: 0.9, fontSize: 48, bold: true, color: C.accent1 });
      k.text(s, h, { x: c.x(i) + 0.35, y: 2.95, w: c.w - 0.7, h: 0.5, fontSize: 18, bold: true, color: i === 1 ? C.background1 : C.text1 });
      k.text(s, b, { x: c.x(i) + 0.35, y: 3.5, w: c.w - 0.7, h: 1.4, fontSize: 14, color: i === 1 ? "C9D3CE" : C.accent5 });
    });
    k.takeaway(s, "어떤 방식이든 글 · 화면으로 발표해도 괜찮습니다", 5.5);
  }
  {
    const s = content("3주 기획 과제 · 10/31 – 11/18", `워크북 13쪽에 같은 표. 제출은 드라이브 → 크루 폴더 → 내 이름 → 2회차 과제.
강사는 2주차(11/7–11/13)에 기획안에 드라이브 댓글로 한 번 피드백. 기획 코치 GPT로 스스로 점검.`);
    const wk = [["1주", "10/31 – 11/6", "아이템 확정 · 레퍼런스 10개 수집 · 그중 3개 해부 6칸", "해부 시트 3장"], ["2주", "11/7 – 11/13", "기획안 완성: 콘셉트 · 타깃 · 시리즈 5편 · 대표 영상 1편", "기획안 (강사 댓글 피드백)"], ["3주", "11/14 – 11/18", "대표 영상 대본 · 스토리보드 · 촬영 계획표 + 훅 포함 5컷 이상 촬영", "대본 · 스토리보드 · 촬영 클립"]];
    const c = cols(3, 0.3);
    wk.forEach(([w, d, todo, out], i) => {
      k.card(s, c.x(i), 1.8, c.w, 3.7, { fill: i === 2 ? C.text2 : C.background2 });
      k.text(s, w, { x: c.x(i) + 0.35, y: 1.95, w: 1.5, h: 0.6, fontSize: 28, bold: true, color: C.accent1 });
      k.text(s, d, { x: c.x(i) + 1.6, y: 2.08, w: c.w - 1.9, h: 0.4, fontSize: 13, bold: true, color: i === 2 ? C.accent6 : C.accent5 });
      k.text(s, todo, { x: c.x(i) + 0.35, y: 2.75, w: c.w - 0.7, h: 1.6, fontSize: 15, bold: true, color: i === 2 ? C.background1 : C.text1 });
      k.text(s, "제출 · " + out, { x: c.x(i) + 0.35, y: 4.5, w: c.w - 0.7, h: 0.8, fontSize: 13, color: i === 2 ? C.accent6 : C.accent2 });
    });
    k.takeaway(s, "3주차에 찍은 5컷이 3회차 CapCut 첫 편집 재료가 됩니다", 5.75);
  }
  {
    const s = content("기획 코치 GPT 쓰는 법", `3주 과제 동안 혼자 막힐 때 먼저 찾는 코치. 링크는 단톡방에 공지합니다. 강사가 화면으로 한 번 열어 보여 주기.
코치는 답을 대신 써 주기보다 질문을 먼저 합니다. 내 경험으로 답할수록 기획안이 내 것이 됩니다. 최종 선택은 늘 내가.`, "3주 과제");
    const st = [["FaComments", "링크로 열기", "단톡방 링크 → ChatGPT 로그인 → 아래 시작 버튼 중 하나 누르기"], ["FaCalendarAlt", "몇 주차인지 말하기", "\"지금 2주차, 기획안 쓰는 중이야\" 한 줄로 시작"], ["FaImage", "워크북을 그대로", "쓴 내용을 붙여 넣거나 워크북 사진을 찍어 올리기"], ["FaCheckCircle", "답하고 고르기", "코치의 질문엔 내 경험으로, 고르는 건 내가. 결과는 워크북 · 드라이브에"]];
    const c = cols(4, 0.25);
    for (let i = 0; i < 4; i++) {
      await k.featureCard(s, c.x(i), 1.8, c.w, 3.2, { icon: st[i][0], head: st[i][1], body: st[i][2], bodySize: 13.5 });
      k.badge(s, c.x(i) + c.w - 0.75, 1.95, 0.45, i + 1, { fontSize: 12 });
    }
    k.card(s, M, 5.25, CW, 0.8, { fill: C.background2 });
    k.text(s, "시작 버튼", { x: M + 0.3, y: 5.25, w: 1.6, h: 0.8, fontSize: 13, bold: true, color: C.accent2, valign: "middle" });
    k.text(s, "아이템 후보 3개 좁히기  ·  레퍼런스 해부 6칸  ·  채널 콘셉트 점검  ·  훅 판정", { x: M + 1.9, y: 5.25, w: CW - 2.2, h: 0.8, fontSize: 15, bold: true, valign: "middle" });
    k.takeaway(s, "막히면 코치 → 크루 → 강사 순서로", 6.25);
  }
  {
    const s = content("주차별로 이렇게 물어보세요", `그대로 복사해서 [대괄호]만 바꿔 쓰는 예시. 워크북 해당 쪽을 사진으로 같이 올리면 더 정확합니다.
주의: 코치가 영상 링크만 보고 내용을 지어낼 수 있어요(레퍼런스는 제목 · 자막 · 캡처를 함께). 전화번호 · 주소 같은 개인정보는 넣지 않기.`, "3주 과제");
    const q = [["1주", "아이템 · 해부", "\"내 아이템 후보 [3개]를 5기준으로 같이 좁혀 줘. 나는 [경력 · 취미]가 있어.\"\n\"이 영상을 해부 6칸으로 정리해 줘. 제목 [ ] / 자막 [ ] (캡처 첨부)\""], ["2주", "기획안", "\"내 채널 콘셉트 한 장을 점검해 줘. 잘된 점 1개, 고칠 점 2개만.\"\n\"시리즈 5편 목록이 같은 틀로 이어지는지 봐 줘: [목록]\""], ["3주", "대본 · 스토리보드", "\"내 훅 3안을 판정해 줘: [훅 1 / 2 / 3]. 나를 모르는 사람 기준으로.\"\n\"이 스토리보드를 폰으로 찍을 수 있는지 체크해 줘: [3칸]\""]];
    q.forEach(([w, h, ex], i) => {
      const y = 1.75 + i * 1.42;
      k.card(s, M, y, CW, 1.28, { fill: i % 2 ? "FFFFFF" : C.background2, line: i % 2 ? "DDE4E0" : undefined });
      k.text(s, w, { x: M + 0.3, y, w: 1.0, h: 1.28, fontSize: 24, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, h, { x: M + 1.3, y, w: 2.4, h: 1.28, fontSize: 16, bold: true, valign: "middle" });
      k.text(s, ex, { x: M + 3.7, y: y + 0.1, w: CW - 3.9, h: 1.1, fontSize: 13, valign: "middle" });
    });
    k.takeaway(s, "링크만 주면 지어낼 수 있어요. 내용을 주고, 마지막 확인은 내 눈으로", 6.15);
  }
  {
    const s = content("수업이 없는 3주에도 크루는 계속", `크루 체크인: 매주 일요일 밤까지 크루장이 단톡방에 한 줄. 남은 사람은 크루가 먼저 챙깁니다(강사가 아니라).
마지막: 오늘 채널을 연 사람은 크루 트리 현황판에 줄기 스티커. 크루 전원이면 크루 이름 옆에 별.`, "크루");
    crewTag(s, "크루");
    k.card(s, M, 1.8, CW, 1.5, { fill: C.text2 });
    k.text(s, "매주 일요일 밤 · 크루장 한 줄", { x: M + 0.4, y: 1.95, w: 6, h: 0.4, fontSize: 15, bold: true, color: C.accent6 });
    k.text(s, "\"크루 ○  이번 주 전원 완료\"  또는  \"남은 사람 ○명, 크루가 챙기는 중\"", { x: M + 0.4, y: 2.4, w: CW - 0.8, h: 0.7, fontSize: 20, bold: true, color: C.background1 });
    const t = [["FaCalendarAlt", "주 1회 크루 체크인", "일요일 밤, 크루장이 단톡방에"], ["FaUsers", "남은 사람은 크루가", "강사보다 크루가 먼저 챙기기"], ["FaTree", "크루 트리 현황판", "오늘 채널 연 사람 칸에 줄기 스티커"]];
    const c = cols(3, 0.3);
    for (let i = 0; i < 3; i++) await k.featureCard(s, c.x(i), 3.55, c.w, 2.0, { icon: t[i][0], head: t[i][1], body: t[i][2], bodySize: 13.5, headSize: 16 });
    k.takeaway(s, "크루 전원이 채널을 열었다면 크루 이름 옆에 별 하나", 5.8);
  }
  {
    const s = content("3회차 예고 · 11/19 (목)", `3회차: 오전 기획안 발표(오늘 투표한 방식) → 오후 CapCut PC로 첫 편집, 3주차에 찍은 5컷으로 파일럿 숏폼. 트리에 첫 오너먼트가 달립니다.
CapCut PC 설치가 안 된 사람은 3주 안에 꼭.`);
    k.card(s, M, 1.8, CW, 1.2, { fill: C.text2 });
    k.text(s, "11월 19일, 첫 오너먼트를 답니다", { x: M + 0.4, y: 1.8, w: CW - 0.8, h: 1.2, fontSize: 26, bold: true, color: C.accent1, valign: "middle" });
    const steps = ["기획안 발표", "CapCut PC 기초", "파일럿 숏폼 편집", "채널에 업로드", "트리에 오너먼트"];
    const sw = (CW - 4 * 0.35) / 5;
    steps.forEach((t, i) => {
      const x = M + i * (sw + 0.35);
      k.card(s, x, 3.3, sw, 1.0, { fill: i === 4 ? C.accent6 : C.background2 });
      k.text(s, t, { x, y: 3.3, w: sw, h: 1.0, fontSize: 15, bold: true, align: "center", valign: "middle" });
      if (i < 4) k.arrow(s, x + sw + 0.03, 3.8, 0.29);
    });
    k.takeaway(s, "준비물: 3주차에 찍은 5컷 이상 · 대본 · 스토리보드 · CapCut PC", 4.7);
  }
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, "img01");
    s.addText("안 되면\n내가 한다", { placeholder: "title" });
    s.addText("오늘 연 채널이 6번의 수업 내내 우리 트리의 줄기가 됩니다", { placeholder: "body" });
    s.addNotes(`마무리 인사. 크루장은 크루 시트 사진과 채널 주소를 드라이브 크루 폴더에.
수업 후: 요약 영상, 단톡방에 핸드북 2장 · 워크북 · 기획 코치 GPT 링크 · 3회차 발표 방식 투표 결과 공지.`);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
