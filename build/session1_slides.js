// 1회차 (10/22) 슬라이드 생성: node build/session1_slides.js [출력 경로]
const fs = require("fs");
const path = require("path");
const { THEME, HEX, W, H, M, newDeck, makeKit } = require("./lib/deck");
const { prepare, whiteBalanceSet } = require("./lib/images");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "01", "1회차_보는눈_슬라이드.pptx");
const CW = W - 2 * M; // 본문 폭

// 수강생 이름은 공개 레포에 두지 않는다: private/crews.json이 있으면 그 명단을, 없으면 빈칸을 넣는다.
function loadCrews() {
  const file = path.join(__dirname, "..", "private", "crews.json");
  if (!process.env.PUBLIC_BUILD && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const blank = ["(크루장)", "(기술 도우미)", "(기록)", "(첫 시청자)", "", ""];
  return [1, 2, 3, 4].map((n) => ({ name: `크루 ${n}`, members: blank.map((r) => `________ ${r}`.trim()) }));
}

const IMAGE_SPECS = {
  img01: { kind: "photo", fallback: "gradient", seed: 0 },
  img02: { kind: "photo", fallback: "gradient", seed: 1 },
  img03: { kind: "photo", fallback: "gradient", seed: 2 },
  img04: { kind: "photo", fallback: "gradient", seed: 3 },
  img05: { kind: "photo", fallback: "gradient", seed: 1 },
  img06: { kind: "photo", fallback: "gradient", seed: 2 },
  img07: { kind: "photo", fallback: "gradient", seed: 0 },
  img08: { kind: "photo", fallback: "gradient", seed: 3 },
  img09: { kind: "panels", cols: 5, rows: 1, panelRatio: [600, 900], label: "샷 크기 5컷" },
  img10: { kind: "panels", cols: 2, rows: 2, panelRatio: [800, 800], label: "앵글 4컷" },
  img11: { kind: "panels", cols: 2, rows: 2, panelRatio: [800, 800], label: "빛의 방향 4컷" },
  img12: { kind: "panels", cols: 3, rows: 1, panelRatio: [800, 1000], label: "구도 3컷" },
  img13: { kind: "panels", cols: 5, rows: 1, panelRatio: [600, 900], label: "5샷 시퀀스" },
  img14: { kind: "photo", ratio: [1536, 1024], label: "카페 릴스 콘티" },
  img15: { kind: "photo", ratio: [1024, 1536], label: "완성 장면 9:16" },
  img16: { kind: "panels", cols: 2, rows: 1, panelRatio: [900, 900], label: "심도 비교" },
  img17: { kind: "photo", ratio: [1536, 1024], label: "화이트밸런스 기준" },
};

async function main() {
  const img = await prepare("s1", IMAGE_SPECS);
  const wb = await whiteBalanceSet(img.img17, path.dirname(img.overlay));
  if (img.missing.length) console.log("이미지 없음(자리 표시로 대체):", img.missing.join(", "));

  const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 1회차 — 보는 눈";
  const { pres, C } = newDeck({ title: "촬영편집 1회차 — 보는 눈", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";
  let period = 0;
  let periodName = "시작";

  const content = (title, notes) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, period ? `${period}교시 · ${periodName}` : "1회차 · 보는 눈");
    if (period) k.progress(s, period);
    s.addText(title, { placeholder: "title" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  const fullBleed = (s, file) => {
    s.addImage({ path: file, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
    s.addImage({ path: img.overlay, x: 0, y: 0, w: W, h: H });
  };
  const divider = (n, title, sub, imgKey, notes) => {
    period = n;
    periodName = title;
    sec = `${n}교시 ${title}`;
    pres.addSection({ title: sec });
    const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: sec });
    fullBleed(s, img[imgKey]);
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

  // ───────────────────────── 시작 ─────────────────────────
  pres.addSection({ title: sec });
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, img.img01);
    k.text(s, "AI콘텐츠 크리에이터 실무 · 촬영편집", { x: M, y: 1.7, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.accent1, charSpacing: 1 });
    s.addText("1회차\n보는 눈", { placeholder: "title" });
    s.addText("프로처럼 보고, 정석대로 찍는 날", { placeholder: "body" });
    k.text(s, "2026. 10. 22 (목)  ·  10:00–17:30  ·  1공학관", { x: M, y: 6.5, w: 8, h: 0.35, fontSize: 13, color: "C9D3CE" });
    s.addNotes(`[10:00 시작 전] 입장하는 대로 크루 자리로 안내합니다(크루 편성표를 책상 위에).
첫 멘트: "오늘부터 6번, 여러분은 각자 자기 채널 하나를 키웁니다. 첫날인 오늘은 '보는 눈'을 만드는 날이에요."`);
  }
  {
    const s = content("오늘의 시간표", `오늘 흐름을 30초 안에. "오전엔 큰 그림, 오후엔 카메라 원리와 실습." 매 교시 50분 수업 + 10분 휴식, 점심 11:50–12:40.`);
    k.card(s, M, 1.8, 3.4, 4.75, { fill: C.text2 });
    k.text(s, "10:00", { x: M + 0.35, y: 2.1, w: 2.9, h: 0.8, fontSize: 40, bold: true, color: C.accent1 });
    k.text(s, "– 17:30", { x: M + 0.35, y: 2.85, w: 2.9, h: 0.6, fontSize: 26, bold: true, color: C.background1 });
    k.text(s, "7교시\n50분 수업 + 10분 휴식\n점심 11:50–12:40", { x: M + 0.35, y: 3.85, w: 2.9, h: 1.4, fontSize: 14, color: "C9D3CE" });
    k.text(s, "오전 큰 그림 → 오후 카메라와 실습", { x: M + 0.35, y: 5.6, w: 2.9, h: 0.7, fontSize: 13, bold: true, color: C.accent6 });
    const rows = [
      ["10:00", "OT · 크루 · 세팅 · 한 줄 자기소개", "한 줄 소개, 크루와 짝"],
      ["11:00", "영상 콘텐츠, 지금 어떻게 만들어지나", "제작 공정 지도"],
      ["12:40", "카메라의 원리 ① 사진: 노출 · 색 · 초점", "설정별 비교 사진"],
      ["13:40", "카메라의 원리 ② 영상: 프레임 · 셔터 · 세팅", "내 폰 세팅 완료"],
      ["14:40", "화면의 언어와 빛: 샷 · 앵글 · 구도 · 조명", "구도 사진 + AI 피드백"],
      ["15:40", "움직임 · 컷 · 소리 + 장비 체험", "5샷 시퀀스"],
      ["16:40", "촬영 리뷰 · 크루 베스트 컷 · 과제", "베스트 컷"],
    ];
    const x0 = M + 3.7, rw = CW - 3.7, rh = 0.6, gap = 0.08;
    rows.forEach(([t, what, out], i) => {
      const y = 1.8 + i * (rh + gap);
      k.card(s, x0, y, rw, rh, { fill: i % 2 ? "FFFFFF" : C.background2 });
      k.text(s, `${i + 1}`, { x: x0 + 0.2, y, w: 0.4, h: rh, fontSize: 16, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, t, { x: x0 + 0.6, y, w: 0.9, h: rh, fontSize: 13, color: C.accent5, valign: "middle" });
      k.text(s, what, { x: x0 + 1.55, y, w: 4.9, h: rh, fontSize: 14.5, bold: true, valign: "middle" });
      k.text(s, out, { x: x0 + 6.5, y, w: rw - 6.7, h: rh, fontSize: 12.5, color: C.accent5, valign: "middle", align: "right" });
    });
  }

  // ───────────────────────── 1교시 ─────────────────────────
  divider(1, "OT와 과정 지도", "10:00–10:50  ·  우리가 6번 동안 무엇을 키우는지, 누구와 함께 가는지", "img02", `[10:00–10:50] 목표: 과정 전체 그림 + 크루 결성 + 수업 도구 세팅 + 첫 기획 연습(한 줄 소개).
시간: 과정 지도 10분 → 크루 10분 → 세팅 15분 → 한 줄 소개 15분.`);
  {
    const s = content("6번의 수업, 나무 한 그루", `[10:02] 과정 전체를 크리스마스 트리 한 그루로.
- 화분(1회): 보는 눈. 카메라와 화면의 언어가 모든 것의 바닥.
- 줄기(2회 + 3주 과제): 내 채널 기획안. 2회차에 유튜브 채널을 엽니다.
- 오너먼트(3·4회): 숏폼, 브이로그, 정보성, 스트리머형, AI 영상을 하나씩.
- 별(5회): 브랜딩과 후킹으로 대표작 리뉴얼.
- 점등식(6회 12/10): 우리끼리 채널을 처음부터 다시 보는 상영회.
"연습용으로 만들고 버리는 영상은 없습니다. 전부 여러분 채널에 남아요."`);
    const cx = 3.35;
    k.card(s, M, 1.75, 5.2, 4.85, { fill: C.text2 });
    s.addShape(S.triangle, { x: cx - 1.0, y: 2.25, w: 2.0, h: 1.4, fill: { color: "2E7D57" }, line: { type: "none" } });
    s.addShape(S.triangle, { x: cx - 1.45, y: 2.95, w: 2.9, h: 1.65, fill: { color: "2A7050" }, line: { type: "none" } });
    s.addShape(S.triangle, { x: cx - 1.9, y: 3.75, w: 3.8, h: 1.75, fill: { color: "25654A" }, line: { type: "none" } });
    s.addShape(S.rect, { x: cx - 0.2, y: 5.5, w: 0.4, h: 0.35, fill: { color: "8A7A62" }, line: { type: "none" } });
    s.addShape(S.trapezoid, { x: cx - 0.7, y: 5.85, w: 1.4, h: 0.5, fill: { color: C.accent3 }, line: { type: "none" }, flipV: true });
    s.addShape(S.star5, { x: cx - 0.33, y: 1.9, w: 0.66, h: 0.62, fill: { color: C.accent1 }, line: { type: "none" } });
    [[cx - 0.15, 3.2, C.accent3], [cx - 0.75, 4.1, "E8C46A"], [cx + 0.45, 4.15, C.accent4], [cx - 1.3, 5.0, C.accent4], [cx + 0.95, 4.95, C.accent3], [cx - 0.2, 4.9, "E8C46A"]].forEach(([x, y, col]) => s.addShape(S.ellipse, { x, y, w: 0.3, h: 0.3, fill: { color: col }, line: { type: "none" } }));
    const rows = [
      ["별", "5회 · 12/1", "브랜딩 · 후킹으로 대표작 리뉴얼", C.accent1],
      ["오너먼트", "3·4회 · 11/19 · 11/26", "숏폼 · 브이로그 · 정보성 · 스트리머형 · AI 영상", C.accent3],
      ["줄기", "2회 · 10/30 + 3주 과제", "채널 기획안 · 채널 개설 · 스토리보드", "8A7A62"],
      ["화분", "1회 · 오늘", "보는 눈: 촬영 이론 + 프로의 제작 공정", C.text2],
      ["점등식", "6회 · 12/10", "채널을 처음부터 다시 보는 상영회", C.accent2],
    ];
    rows.forEach(([name, when, what, col], i) => {
      const y = 1.75 + i * 0.99;
      k.card(s, 6.2, y, CW - 5.45, 0.86);
      s.addShape(S.ellipse, { x: 6.42, y: y + 0.28, w: 0.3, h: 0.3, fill: { color: col }, line: { type: "none" } });
      k.text(s, name, { x: 6.9, y: y + 0.1, w: 1.5, h: 0.36, fontSize: 16, bold: true });
      k.text(s, when, { x: 8.3, y: y + 0.12, w: 3.9, h: 0.34, fontSize: 12, color: C.accent5 });
      k.text(s, what, { x: 6.9, y: y + 0.46, w: 5.4, h: 0.34, fontSize: 13 });
    });
  }
  {
    const s = content("12월 10일, 여러분 손에 남는 것", `[10:05] 결과물을 숫자로 약속합니다. "수료할 때 각자 유튜브 채널 하나, 영상 7편 이상, 기획안, 제작 노트가 남습니다. 취업 포트폴리오로 바로 씁니다."`);
    const items = [["1", "채널", "내 유튜브 채널. 2회차에 열고 매 회차 영상이 쌓여요"], ["7+", "영상", "숏폼부터 브이로그, AI 영상, 대표작까지"], ["1", "기획안", "누구에게, 무엇을, 왜. 스토리보드 포함"], ["1", "제작 노트", "사람이 한 것 / AI가 도운 것"]];
    const cw = (CW - 3 * 0.3) / 4;
    items.forEach(([n, u, d], i) => {
      const x = M + i * (cw + 0.3);
      k.card(s, x, 1.8, cw, 3.6, { fill: C.text2 });
      k.text(s, n, { x: x + 0.35, y: 2.05, w: cw - 0.7, h: 1.2, fontSize: 64, bold: true, color: C.accent1 });
      k.text(s, u, { x: x + 0.35, y: 3.3, w: cw - 0.7, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
      k.text(s, d, { x: x + 0.35, y: 3.9, w: cw - 0.7, h: 1.2, fontSize: 13.5, color: "C9D3CE" });
    });
    k.takeaway(s, "연습용으로 만들고 버리는 영상은 없습니다. 전부 여러분 채널에 남아 6회차에 처음부터 다시 봅니다", 5.75);
  }
  {
    const s = content("매 회차 받아 가는 것", `[10:07] 수업이 끝날 때마다 단톡방과 드라이브로 나눠 주는 것들. "복습은 이걸로 하시면 됩니다. 놓친 부분이 있어도 괜찮아요."`);
    const items = [["FaBook", "전자책 한 장씩", "수업 내용 + 더 깊은 설명 + 실무 팁. 6회차에 한 권으로"], ["FaMagic", "프롬프트북", "그대로 복사하는 완성형 + 내 것으로 채우는 빈칸형"], ["FaPlayCircle", "요약 영상", "수업 다음 날 1~2분, 그날 핵심 3가지"], ["FaFileAlt", "양식 · 치트시트", "폰 세팅표, 촬영 용어집, 기획안, 스토리보드"]];
    const cw = (CW - 3 * 0.3) / 4;
    for (let i = 0; i < items.length; i++) await k.featureCard(s, M + i * (cw + 0.3), 1.8, cw, 3.2, { icon: items[i][0], head: items[i][1], body: items[i][2], bodySize: 14 });
    k.takeaway(s, "전자책 · 프롬프트북 · 요약 영상 · 양식은 매 회차 끝에 단톡방과 드라이브로", 5.35);
  }
  {
    const s = content("AI는 장비, 연출은 사람", `[10:08] 과정 전체의 원칙. ChatGPT와 CapCut 유료 계정을 끝까지 쓰되, 결정과 책임은 사람에게.
매 실습마다 워크북에 "AI가 한 것 / 내가 고친 것"을 한 줄씩 → 6회차 제작 노트.`);
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.8, hw, 4.1, { fill: C.text2 });
    k.card(s, M + hw + 0.3, 1.8, hw, 4.1);
    await k.chip(s, M + 0.35, 2.1, 0.7, "FaUser", { fill: "26302C", iconHex: HEX.accent1 });
    await k.chip(s, M + hw + 0.65, 2.1, 0.7, "FaRobot");
    k.text(s, "사람의 몫", { x: M + 1.25, y: 2.2, w: 4, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
    k.text(s, "AI의 몫", { x: M + hw + 1.55, y: 2.2, w: 4, h: 0.5, fontSize: 22, bold: true });
    k.bullets(s, ["정하기 — 무엇을, 누구에게, 왜", "현장 — 진짜 장소 · 사람 · 감정을 찍기", "고르기 — 고르고, 버리고, 순서 정하기", "책임 — 초상권 · 저작권 · AI 표시"], { x: M + 0.4, y: 3.15, w: hw - 0.7, h: 2.6, fontSize: 16, color: C.background1 });
    k.bullets(s, ["초안 — 아이디어 · 대본 · 자막 · 캡션", "반복 작업 — 받아쓰기 · 보정 · 잡음 제거", "불가능한 장면 — 찍을 수 없는 장면", "두 번째 의견 — 구도 · 흐름 피드백"], { x: M + hw + 0.7, y: 3.15, w: hw - 0.7, h: 2.6, fontSize: 16 });
    k.takeaway(s, "매 실습마다 워크북에 \"AI가 한 것 / 내가 고친 것\" 한 줄 → 6회차 제작 노트가 됩니다", 6.15);
  }
  {
    const s = content("영상은 각자, 배움은 크루로", `[10:10] "영상은 각자 만들고, 배우는 건 같이. 누구도 뒤처지지 않게, 누구도 혼자 달리지 않게."
4개 크루(5~6명), 경험자와 입문자가 섞여 있고 짝이 정해져 있습니다. 역할은 2회차부터 명단 순서로 한 칸씩 돌아갑니다.
막힘 규칙: 3분 막히면 짝 → 5분 더 막히면 기술 도우미 → 그래도 안 되면 "강사 호출 카드".
개인 순위는 없습니다. 매 회차 목표는 "크루 전원 완료".`);
    const roles = [["FaFlag", "크루장", "시간 · 진행 체크, 크루 전원 완료 확인"], ["FaTools", "기술 도우미", "CapCut · AI 질문 1차 해결"], ["FaVideo", "기록", "수업 장면 촬영 → 6회차 브이로그 재료"], ["FaEye", "첫 시청자", "크루 영상을 먼저 보고 칭찬 1 + 제안 1"]];
    const cw = (CW - 3 * 0.3) / 4;
    for (let i = 0; i < roles.length; i++) await k.featureCard(s, M + i * (cw + 0.3), 1.8, cw, 2.55, { icon: roles[i][0], head: roles[i][1], body: roles[i][2], bodySize: 12.5 });
    k.text(s, "막혔을 때", { x: M, y: 4.65, w: 3, h: 0.35, fontSize: 15, bold: true });
    const steps = [["3분", "짝에게"], ["+5분", "기술 도우미"], ["그래도", "강사 호출 카드"]];
    const sw = 3.45;
    steps.forEach(([t, w], i) => {
      const x = M + i * (sw + 0.75);
      k.card(s, x, 5.1, sw, 0.85, { fill: i === 2 ? C.accent6 : C.background2 });
      k.badge(s, x + 0.2, 5.22, 0.6, t, { fontSize: 11, fill: i === 2 ? C.accent3 : C.text2, color: i === 2 ? C.background1 : C.accent1 });
      k.text(s, w, { x: x + 0.95, y: 5.1, w: sw - 1.1, h: 0.85, fontSize: 16, bold: true, valign: "middle" });
      if (i < 2) k.arrow(s, x + sw + 0.12, 5.52, 0.5);
    });
    k.text(s, "개인 순위는 없습니다. 매 회차 목표는 \"크루 전원 완료\"", { x: M, y: 6.25, w: CW, h: 0.35, fontSize: 13, color: C.accent5 });
  }
  {
    const s = content("크루를 소개합니다", `[10:13] 크루별 인사(이름 + 만들고 싶은 것 한 마디). 크루 이름은 7교시 전까지 크루가 직접 짓기(예: 별 · 종 · 방울 · 리본).
괄호는 1회차 역할. 설문 자기평가로 짠 1차 편성이라 오늘 실습을 보고 1~2명 조정할 수 있다고 미리 말해 두세요.`);
    const cols = [C.accent2, C.accent4, C.accent3, C.accent1];
    const crews = loadCrews();
    const cw = (CW - 3 * 0.3) / 4;
    crews.forEach((c, i) => {
      const x = M + i * (cw + 0.3);
      k.card(s, x, 1.8, cw, 4.35);
      s.addShape(S.rect, { x, y: 1.8, w: cw, h: 0.08, fill: { color: cols[i] }, line: { type: "none" } });
      k.text(s, String(i + 1).padStart(2, "0"), { x: x + 0.3, y: 2.05, w: 1, h: 0.55, fontSize: 26, bold: true, color: cols[i] });
      k.text(s, c.name, { x: x + 1.15, y: 2.12, w: cw - 1.3, h: 0.45, fontSize: 18, bold: true, valign: "middle" });
      k.bullets(s, c.members, { x: x + 0.3, y: 2.85, w: cw - 0.45, h: 3.1, fontSize: 12.5, paraSpaceAfter: 6 });
    });
    k.text(s, "크루 이름은 오늘 7교시 전까지 크루가 직접 짓습니다", { x: M, y: 6.35, w: CW, h: 0.3, fontSize: 13, color: C.accent5 });
  }
  {
    const s = content("지금 함께 세팅해요 · 15분", `[10:20–10:35] 크루장이 전원 완료를 확인하고 손을 듭니다. 기술 도우미는 막힌 사람부터.
- 단톡방: QR 또는 링크. 공지 · 과제 · 질문용.
- 구글 드라이브: 공유 폴더 → 크루 폴더 → 내 이름 폴더. 오늘 찍은 건 7교시에 여기로.
- CapCut PC: PC마다 설치 상태가 다릅니다. 실행해 보고 안 되면 설치 안내대로(못 하면 과제로).
- 유료 계정: ChatGPT와 CapCut 로그인 확인(10/21부터 사용 가능).
- 촬영 동의: 수업 장면을 찍어 6회차 브이로그에 쓰는 것에 대한 동의. 원하지 않으면 얼굴 없이 찍는다고 안내.`);
    const items = [["FaComments", "단톡방 입장", "공지 · 과제 · 질문"], ["FaGoogleDrive", "드라이브 폴더", "크루 폴더 → 내 이름"], ["FaDesktop", "CapCut 확인", "PC에서 실행되는지, 안 되면 안내대로"], ["FaKey", "계정 로그인", "ChatGPT · CapCut 유료 계정"], ["FaHandshake", "촬영 동의", "수업 장면 → 6회차 브이로그"]];
    const cw = (CW - 4 * 0.25) / 5;
    for (let i = 0; i < items.length; i++) {
      const x = M + i * (cw + 0.25);
      k.text(s, String(i + 1).padStart(2, "0"), { x, y: 1.8, w: cw, h: 0.5, fontSize: 22, bold: true, color: C.accent1 });
      await k.featureCard(s, x, 2.35, cw, 2.9, { icon: items[i][0], head: items[i][1], body: items[i][2], headSize: 15, bodySize: 12.5 });
    }
    k.takeaway(s, "크루장은 크루 전원이 끝나면 손을 들어 주세요. 기술 도우미는 막힌 사람부터", 5.6);
  }
  {
    const s = content("첫 기획: 이름 대신, 나를 설명하는 한 줄", `[10:35–10:50] 오늘의 첫 기획 연습이자 2회차 채널 소개글의 초안. "나를 모르는 사람 기준"은 2회차 기획 원칙 1번이기도 합니다.
진행: 3분 쓰기 → 짝에게 읽기("보고 싶다 / 아니다") → 3번 고쳐 쓰기 → 크루 안에서 발표.
AI는 후보만. 내 이야기와 맞는 단어만 가져오기(워크북 p.2). 말하기가 부담인 사람은 글로 보여줘도 됩니다.`);
    k.card(s, M, 1.8, CW, 1.35, { fill: C.text2 });
    k.text(s, "___ 한   ___ 의   ___", { x: M, y: 1.8, w: CW, h: 1.35, fontSize: 36, bold: true, color: C.accent1, align: "center", valign: "middle" });
    k.text(s, "이런 느낌으로", { x: M, y: 3.45, w: 5.6, h: 0.35, fontSize: 15, bold: true });
    k.bullets(s, ["10년 만에 다시 출근하는 엄마의 첫 출근 준비", "요리 30년 차가 처음 찍는 유튜브", "퇴근 후 30분, 동네를 걷는 직장인의 산책 기록"], { x: M, y: 3.9, w: 5.6, h: 1.8, fontSize: 15 });
    k.prompt(s, 6.75, 3.45, CW - 6.0, 2.25, "나는 [하는 일]이고 [좋아하는 것]을 좋아해. 이름 없이 나를 소개하는 한 줄 후보 10개를 줘. 처음 보는 사람이 \"보고 싶다\"고 느끼게.");
    k.takeaway(s, "3분 쓰기 → 짝에게 읽기 → 3번 고쳐 쓰기. 최종 한 줄은 내가 고릅니다 (워크북 p.2)", 6.0);
  }

  // ───────────────────────── 2교시 ─────────────────────────
  divider(2, "영상 콘텐츠, 지금 어떻게 만들어지나", "11:00–11:50  ·  우리가 매일 보는 영상의 지도와, 한 편이 만들어지는 과정", "img03", `[11:00–11:50] 목표: 영상 콘텐츠의 지형(형식 · 유형 · 플랫폼)과 프로의 제작 공정 7단계를 "카페 30초 릴스" 한 편으로 이해하기. AI가 각 단계에 들어가는 자리를 보며 6회 과정을 미리 보기.
시간: 도입 3분 → 콘텐츠 지도 10분 → 공정 7단계 5분 → 카페 릴스 따라가기 15분 → 프로덕션 vs 1인 + AI 9분 → 마스터링 · 규격 6분 → 정리 2분.`);
  statement("오늘 아침부터 지금까지,\n영상 몇 편 보셨나요?", "숏폼 하나를 1편으로 셉니다. 크루에서 가장 많이 본 사람은?", `[11:00] 크루별로 세어 보고 가장 많은 사람 손들기. 대부분 수십 편이 나옵니다.
"우리는 이미 영상을 아주 많이 '보는' 사람입니다. 오늘부터는 '만드는 사람의 눈'으로 봅니다."`);
  {
    const s = content("영상 콘텐츠 지도", `[11:03–11:13] 형식(숏폼 · 롱폼 · 라이브)과 유형을 한 장에. ●는 그 형식에서 흔히 보이는 조합이라는 뜻의 대략적인 지도입니다(정답표가 아님).
질문: "여러분이 저장해 둔 영상은 어느 칸에 많나요?"
4회차에 브이로그 · 정보성 · 스트리머형 · AI 영상을 각자 기획안에 오너먼트로 답니다. 브랜디드는 5회차 마케팅과 연결.`);
    const rows = [
      ["유형", "숏폼", "롱폼", "라이브", "이 과정에서"],
      ["브이로그 · 일상", "●", "●", "", "4회차"],
      ["정보성 · 하우투", "●", "●", "", "4회차"],
      ["리뷰 · 언박싱", "●", "●", "●", "4회차 (라이브커머스)"],
      ["토크 · 리액션 · 스트리머", "●", "●", "●", "4회차"],
      ["AI 영상 · 숏드라마", "●", "", "", "4회차"],
      ["브랜디드 · 광고", "●", "●", "", "5회차"],
    ];
    k.table(s, rows, { x: M, y: 1.8, w: 7.7, colW: [2.9, 1.0, 1.0, 1.0, 1.8], rowH: 0.56, fontSize: 13.5, align: "left" });
    const notes = [["숏폼", "15~90초 세로 영상. 쇼츠 · 릴스 · 틱톡. 발견되는 곳"], ["롱폼", "몇 분 이상 가로 영상. 깊이와 신뢰가 쌓이는 곳"], ["라이브", "실시간 방송. 소통과 판매(라이브커머스)"]];
    notes.forEach(([h, b], i) => {
      const y = 1.8 + i * 1.33;
      k.card(s, 8.8, y, CW - 8.05, 1.2);
      k.text(s, h, { x: 9.1, y: y + 0.15, w: 3, h: 0.4, fontSize: 17, bold: true, color: C.accent2 });
      k.text(s, b, { x: 9.1, y: y + 0.55, w: CW - 8.6, h: 0.6, fontSize: 12.5, color: C.accent5 });
    });
    k.text(s, "● 그 형식에서 흔한 조합 (대략적인 지도)", { x: M, y: 5.95, w: 7.5, h: 0.3, fontSize: 11, color: C.accent5 });
  }
  {
    const s = content("플랫폼마다 성격이 다르다", `[11:13] 같은 영상도 어디에 올리느냐에 따라 역할이 다릅니다. 이 과정의 기록은 유튜브 채널에 쌓고, 사업 홍보가 목적인 분은 인스타그램 · 틱톡 동시 업로드를 권합니다.
(플랫폼 정책과 기능은 자주 바뀌니 성격 위주로 설명하세요.)`);
    const p = [["FaYoutube", "유튜브", "검색과 추천이 함께 일하고, 영상이 오래 쌓이는 곳", "롱폼 · 쇼츠 · 라이브", "우리 수업의 기록 채널"], ["FaInstagram", "인스타그램", "관계와 브랜드의 얼굴. 팔로워와 가까운 곳", "릴스 · 캐러셀 · 스토리", "가게 · 개인 브랜드 홍보"], ["FaTiktok", "틱톡", "발견과 트렌드. 소리와 밈이 퍼지는 속도가 빠른 곳", "짧은 세로 영상", "새로운 사람에게 닿기"]];
    const cw = (CW - 2 * 0.3) / 3;
    for (let i = 0; i < p.length; i++) {
      const x = M + i * (cw + 0.3);
      k.card(s, x, 1.8, cw, 4.6);
      await k.chip(s, x + 0.35, 2.1, 0.75, p[i][0]);
      k.text(s, p[i][1], { x: x + 1.3, y: 2.2, w: cw - 1.5, h: 0.55, fontSize: 21, bold: true, valign: "middle" });
      k.text(s, p[i][2], { x: x + 0.35, y: 3.1, w: cw - 0.7, h: 1.0, fontSize: 14.5 });
      k.text(s, "강한 형식", { x: x + 0.35, y: 4.2, w: cw - 0.7, h: 0.3, fontSize: 11, bold: true, color: C.accent5 });
      k.text(s, p[i][3], { x: x + 0.35, y: 4.5, w: cw - 0.7, h: 0.4, fontSize: 14, bold: true });
      k.text(s, "이렇게 쓰자", { x: x + 0.35, y: 5.1, w: cw - 0.7, h: 0.3, fontSize: 11, bold: true, color: C.accent5 });
      k.text(s, p[i][4], { x: x + 0.35, y: 5.4, w: cw - 0.7, h: 0.4, fontSize: 14, bold: true, color: C.accent2 });
    }
  }
  {
    const s = content("프로의 제작 공정 7단계", `[11:15] 프로는 이 7단계를 거칩니다. 6번의 수업도 이 순서로 갑니다. 오늘은 3단계 '촬영'의 기초.
기획(누구에게·무엇을·왜) → 프리프로덕션(대본·콘티·장소·소품) → 촬영(빛·소리·샷) → 편집 → 마스터링(음량·색·규격·검수) → 발행(제목·썸네일·공개) → 분석(지표 → 다음 기획).`);
    const steps = [["기획", "누구에게 · 무엇을 · 왜", "2회"], ["프리\n프로덕션", "대본 · 콘티 · 장소", "2회"], ["촬영", "빛 · 소리 · 샷", "오늘"], ["편집", "컷 · 자막 · 음악", "3·4회"], ["마스터링", "음량 · 색 · 규격", "5회"], ["발행", "제목 · 썸네일", "2회"], ["분석", "지표 → 다음 기획", "5회"]];
    const bw = (CW - 6 * 0.22) / 7;
    steps.forEach(([n, d, when], i) => {
      const x = M + i * (bw + 0.22);
      const now = when === "오늘";
      k.card(s, x, 2.0, bw, 3.2, { fill: now ? C.text2 : C.background2 });
      k.text(s, String(i + 1).padStart(2, "0"), { x: x + 0.2, y: 2.2, w: bw - 0.4, h: 0.5, fontSize: 22, bold: true, color: C.accent1 });
      k.text(s, n, { x: x + 0.2, y: 2.85, w: bw - 0.3, h: 0.8, fontSize: 16, bold: true, color: now ? C.background1 : C.text1, valign: "top" });
      k.text(s, d, { x: x + 0.2, y: 3.7, w: bw - 0.3, h: 0.8, fontSize: 11.5, color: now ? "C9D3CE" : C.accent5 });
      k.text(s, when, { x: x + 0.2, y: 4.65, w: bw - 0.3, h: 0.3, fontSize: 12, bold: true, color: now ? C.accent1 : C.accent2 });
    });
    k.takeaway(s, "오늘은 3단계 '촬영'의 기초. 카드 아래 숫자는 각 단계를 깊게 배우는 회차입니다", 5.6);
  }
  {
    const s = content("한 편 따라가기 ① 카페 30초 릴스: 기획 → 촬영", `[11:20–11:28] 가상의 예시: 동네 카페 사장님이 직접 올리는 "비 오는 날 시그니처 라떼" 30초 릴스.
1) 기획: 누구에게(근처 직장인 20~30대) · 무엇을(비 오는 날 창가 자리와 라떼) · 왜(저장하고 찾아오게). 한 줄로: "비 오는 날, 여기 창가 자리 하나면 충분해요."
2) 프리프로덕션: 6컷 콘티(왼쪽 그림), 샷 리스트, 촬영 시간대(오전 창가빛), 소품(우산, 젖은 창).
3) 촬영: 5샷 시퀀스 + B롤(빗방울, 김 오르는 컵), 우유 붓는 장면은 60fps로 슬로 재료, 마지막에 룸톤 10초.
수강생 아이템(디저트 · 뷰티샵 · MD 상품)으로 바꿔 생각해 보게 하세요.`);
    k.photo(s, img.img14, M, 1.8, 6.4, 4.27, { alt: "카페 릴스 6컷 콘티" });
    const steps = [["1 기획", "근처 직장인에게, 비 오는 날 창가 자리와 라떼를, 저장하고 찾아오게", "\"비 오는 날, 여기 창가 자리 하나면 충분해요\""], ["2 프리프로덕션", "6컷 콘티 · 샷 리스트 · 오전 창가빛 · 소품(우산, 젖은 창)", "산출물: 콘티 한 장, 샷 리스트"], ["3 촬영", "5샷 시퀀스 + B롤(빗방울, 김 오르는 컵) · 우유 붓기는 60fps · 룸톤 10초", "산출물: 클립 20~30개"]];
    steps.forEach(([h, b, o], i) => {
      const y = 1.8 + i * 1.45;
      k.card(s, 7.45, y, CW - 6.7, 1.32);
      k.text(s, h, { x: 7.7, y: y + 0.13, w: 4.6, h: 0.35, fontSize: 15, bold: true, color: C.accent2 });
      k.text(s, b, { x: 7.7, y: y + 0.48, w: CW - 7.2, h: 0.5, fontSize: 12.5 });
      k.text(s, o, { x: 7.7, y: y + 0.95, w: CW - 7.2, h: 0.3, fontSize: 11.5, color: C.accent5 });
    });
    k.source(s, "가상의 예시입니다. 왼쪽 그림은 6컷 콘티(스토리보드).");
  }
  {
    const s = content("한 편 따라가기 ② 카페 30초 릴스: 편집 → 분석", `[11:28–11:35]
4) 편집: 0~3초 훅(우유가 퍼지는 슬로) → 3~24초 본론(창가 · 손 · 표정) → 24~30초 마무리(간판 + "저장해 두세요"). 자막 3역할, 음악 30~50%.
5) 마스터링: 목소리 > 음악, 컷마다 색 통일, 자막 오탈자, 1080×1920 내보내기.
6) 발행: 커버 한 장, 캡션 첫 줄 = 훅 문장, 해시태그 2~3개, 위치 태그, AI를 썼다면 표시.
7) 분석: 3초에서 몇 명이 넘겼나, 저장은 몇 개인가 → "다음 편은 디저트로" 같은 다음 기획.`);
    const px = M, pw = 2.75, ph = 4.85;
    s.addShape(S.roundRect, { x: px, y: 1.75, w: pw, h: ph, rectRadius: 0.22, fill: { color: "0E1110" }, line: { type: "none" } });
    k.photo(s, img.img15, px + 0.1, 1.85, pw - 0.2, ph - 0.2, { alt: "카페 릴스 완성 장면" });
    const tx = 3.85, tw = CW - 3.1, ty = 1.85;
    k.text(s, "0초", { x: tx, y: ty, w: 0.6, h: 0.3, fontSize: 11, color: C.accent5 });
    k.text(s, "30초", { x: tx + tw - 0.6, y: ty, w: 0.6, h: 0.3, fontSize: 11, color: C.accent5, align: "right" });
    const segs = [[0, 3, "훅", "우유가 퍼지는 슬로", C.accent3], [3, 24, "본론", "창가 · 손 · 표정 · 컵", C.accent2], [24, 30, "마무리", "간판 + 저장해 두세요", C.accent1]];
    segs.forEach(([a, b, h, d, col]) => {
      const x = tx + (a / 30) * tw, w = ((b - a) / 30) * tw - 0.04;
      s.addShape(S.rect, { x, y: ty + 0.35, w, h: 0.5, fill: { color: col }, line: { type: "none" } });
      k.text(s, h, { x: x + 0.08, y: ty + 0.35, w: Math.max(w - 0.1, 0.6), h: 0.5, fontSize: 12, bold: true, color: C.background1, valign: "middle" });
    });
    k.text(s, "0–3초 훅: 우유가 퍼지는 슬로   ·   3–24초 본론: 창가 · 손 · 표정 · 컵   ·   24–30초 마무리: 간판 + \"저장해 두세요\"", { x: tx, y: ty + 0.95, w: tw, h: 0.3, fontSize: 11, color: C.accent5 });
    const steps = [["4 편집", "훅 3초 → 본론 → 마무리 · 자막 3역할 · 음악 30~50%"], ["5 마스터링", "목소리 > 음악 · 컷마다 색 통일 · 오탈자 · 1080×1920"], ["6 발행", "커버 · 캡션 첫 줄 = 훅 · 해시태그 2~3개 · 위치 태그 · AI 표시"], ["7 분석", "3초에 몇 명이 넘겼나 · 저장 수 → 다음 기획"]];
    const cw = (tw - 0.25) / 2;
    steps.forEach(([h, b], i) => {
      const x = tx + (i % 2) * (cw + 0.25), y = 3.3 + Math.floor(i / 2) * 1.6;
      k.card(s, x, y, cw, 1.45);
      k.text(s, h, { x: x + 0.25, y: y + 0.15, w: cw - 0.5, h: 0.35, fontSize: 15, bold: true, color: C.accent2 });
      k.text(s, b, { x: x + 0.25, y: y + 0.55, w: cw - 0.5, h: 0.8, fontSize: 12.5 });
    });
  }
  {
    const s = content("프로덕션 현장 vs 1인 크리에이터", `[11:35–11:39] 프로 현장은 역할을 나눠 맡고, 1인 크리에이터는 같은 역할을 혼자 합니다. 그래서 1인 크리에이터에게 AI는 '팀원'입니다.
"역할은 똑같습니다. 사람 수만 다를 뿐이에요."`);
    const hw = (CW - 0.4) / 2;
    k.card(s, M, 1.8, hw, 4.3);
    k.text(s, "프로덕션 현장", { x: M + 0.35, y: 2.05, w: hw - 0.7, h: 0.45, fontSize: 19, bold: true });
    k.text(s, "역할마다 사람이 따로", { x: M + 0.35, y: 2.5, w: hw - 0.7, h: 0.3, fontSize: 12.5, color: C.accent5 });
    const roles = ["기획 PD", "작가", "촬영감독", "조명", "음향", "편집자", "컬러리스트", "마케터"];
    const pw = (hw - 0.7 - 0.3) / 2;
    roles.forEach((r, i) => {
      const x = M + 0.35 + (i % 2) * (pw + 0.3), y = 3.0 + Math.floor(i / 2) * 0.72;
      s.addShape(S.roundRect, { x, y, w: pw, h: 0.56, rectRadius: 0.28, fill: { color: "FFFFFF" }, line: { color: HEX.line, width: 0.75 } });
      k.text(s, r, { x, y, w: pw, h: 0.56, fontSize: 14, bold: true, align: "center", valign: "middle" });
    });
    const rx = M + hw + 0.4;
    k.card(s, rx, 1.8, hw, 4.3, { fill: C.text2 });
    k.text(s, "1인 크리에이터", { x: rx + 0.35, y: 2.05, w: hw - 0.7, h: 0.45, fontSize: 19, bold: true, color: C.background1 });
    k.text(s, "같은 역할을 혼자", { x: rx + 0.35, y: 2.5, w: hw - 0.7, h: 0.3, fontSize: 12.5, color: "C9D3CE" });
    k.text(s, "나", { x: rx + 0.35, y: 3.1, w: 1.5, h: 1.3, fontSize: 70, bold: true, color: C.background1 });
    k.text(s, "+", { x: rx + 1.75, y: 3.1, w: 0.8, h: 1.3, fontSize: 54, bold: true, color: C.accent6, align: "center" });
    k.text(s, "AI", { x: rx + 2.6, y: 3.1, w: 2.2, h: 1.3, fontSize: 70, bold: true, color: C.accent1 });
    k.text(s, "아이디어 · 대본 초안 · 자막 · 보정은 AI가 거들고\n정하고 고르고 책임지는 건 내가", { x: rx + 0.35, y: 4.7, w: hw - 0.7, h: 1.0, fontSize: 14, color: "C9D3CE" });
    k.takeaway(s, "역할은 똑같다. 사람 수만 다르다. 그래서 1인 크리에이터에게 AI는 팀원이다", 6.25);
  }
  {
    const s = content("AI가 바꾼 제작 과정", `[11:39–11:44] 7단계마다 AI가 거드는 일과 사람이 남는 일. 맨 오른쪽 칸은 이 과정에서 그 단계를 깊게 다루는 회차입니다. 6번의 수업 예고편으로 쓰세요.`);
    k.table(s, [
      ["단계", "AI가 거드는 일", "사람이 하는 일", "배우는 회차"],
      ["기획", "아이디어 후보 · 레퍼런스 정리 · 대본 초안", "무엇을 왜 만들지, 최종 선택", "2회"],
      ["프리프로덕션", "콘티 그림 · 샷 리스트", "장소 · 사람 섭외, 현장 판단", "2회"],
      ["촬영", "구도 피드백 · 찍을 수 없는 장면 생성", "진짜 장소 · 사람 · 감정을 담기", "1 · 4회"],
      ["편집", "자동 자막 · 잡음 제거 · 컷 제안", "어디서 자르고 무엇을 강조할지", "3 · 5회"],
      ["마스터링", "음량 · 색 자동 보정", "끝까지 보고 최종 검수", "5회"],
      ["발행", "제목 · 캡션 · 썸네일 문구 후보", "약속 지키기, AI 사용 표시", "2 · 5회"],
      ["분석", "지표 요약", "다음 기획 결정", "5회"],
    ], { x: M, y: 1.8, w: CW, colW: [2.0, 4.3, 3.9, CW - 10.2], rowH: 0.56, fontSize: 13.5 });
  }
  {
    const s = content("편집 다음에 오는 것: 마스터링", `[11:44–11:47] 프로가 반드시 하는 단계. 직접 해 보는 건 5회차, 오늘은 "편집이 끝이 아니다"만.
- 소리: 유튜브는 재생할 때 음량을 일정하게 맞춥니다(흔히 약 -14 LUFS로 알려짐). 무작정 키우지 말고, 목소리가 음악보다 항상 크게.
- 색 · 밝기: 클립마다 톤을 맞추기. 자막: 오탈자, 잘린 글자, 버튼에 가리는 위치. 내보내기 규격. 최종 검수: 소리 켜고 한 번, 끄고 한 번.`);
    const items = [["FaVolumeUp", "소리 크기", "목소리 > 음악. 플랫폼이 음량을 맞추니 무작정 키우지 않기"], ["FaPalette", "색 · 밝기", "클립마다 톤을 한 가지로"], ["FaFont", "자막 점검", "오탈자, 잘린 글자, 버튼에 가리는 위치"], ["FaExpand", "내보내기 규격", "해상도 · 프레임 · 비율"], ["FaCheckDouble", "최종 검수", "소리 켜고 한 번, 끄고 한 번"]];
    const cw = (CW - 4 * 0.25) / 5;
    for (let i = 0; i < items.length; i++) await k.featureCard(s, M + i * (cw + 0.25), 1.8, cw, 3.35, { icon: items[i][0], head: items[i][1], body: items[i][2], headSize: 15, bodySize: 12.5 });
    k.takeaway(s, "직접 해 보는 건 5회차. 오늘은 '편집이 끝이 아니다'만 기억하세요", 5.5);
  }
  {
    const s = content("플랫폼마다 화면이 다르다", `[11:47–11:50] 우리 수업의 기본은 세로 9:16, 1080×1920. 롱폼(브이로그 등)은 16:9. 세로 영상은 위 · 아래 · 오른쪽에 버튼과 캡션이 덮입니다(5교시에 다시). 길이 제한은 플랫폼이 자주 바꾸니 업로드할 때 확인.`);
    const frames = [["유튜브 쇼츠", "9:16 · 1080×1920", true, "FaYoutube"], ["인스타그램 릴스", "9:16 · 1080×1920", true, "FaInstagram"], ["틱톡", "9:16 · 1080×1920", true, "FaTiktok"], ["유튜브 롱폼", "16:9 · 1920×1080", false, "FaYoutube"]];
    let x = M + 0.2;
    for (const [name, spec, vertical, ic] of frames) {
      const fw = vertical ? 1.95 : 4.4, fh = vertical ? 3.47 : 2.48;
      const y = 1.85 + (3.47 - fh);
      s.addShape(S.roundRect, { x, y, w: fw, h: fh, rectRadius: 0.14, fill: { color: C.background2 }, line: { color: C.text2, width: 2 } });
      await k.chip(s, x + fw / 2 - 0.4, y + fh / 2 - 0.4, 0.8, ic);
      k.text(s, name, { x: x - 0.3, y: 5.5, w: fw + 0.6, h: 0.35, fontSize: 15, bold: true, align: "center" });
      k.text(s, spec, { x: x - 0.3, y: 5.85, w: fw + 0.6, h: 0.3, fontSize: 12, color: C.accent5, align: "center" });
      x += fw + 0.62;
    }
    k.text(s, "우리 수업 기본값  ·  세로 9:16  ·  1080×1920  ·  30fps", { x: M, y: 6.35, w: CW, h: 0.32, fontSize: 14, bold: true, color: C.accent2 });
  }
  statement("점심 시간", "11:50–12:40  ·  오후는 카메라 원리부터. 폰을 충전하고, 저장공간을 10GB 이상 비워 두세요", `[11:50] 점심 전 안내: 폰 충전, 저장공간 10GB 이상. 오후엔 폰을 계속 씁니다.`);

  // ───────────────────────── 3교시 ─────────────────────────
  divider(3, "카메라의 원리 ① 사진", "12:40–13:30  ·  얼마나 많은 빛을, 어떤 색으로, 어디에 초점을", "img04", `[12:40–13:30] 목표: 노출 삼각형 · 화이트밸런스 · 초점과 심도 · 폰 렌즈를 이해하고 프로 모드로 바꿔 보기. 개념 25분 → 실습 25분. 디자인 전공자가 많으니 원리는 짧게, 예시는 사진으로.`);
  {
    const s = content("사진은 빛을 담는 일: 노출 삼각형", `[12:42] 밝기는 세 가지가 함께 정합니다. 하나로 밝게 만들면 나머지 둘 중 하나가 대가를 치러요.
조리개: 구멍 크기 → 배경 흐림 / 셔터스피드: 빛을 받는 시간 → 움직임 / ISO: 감도 → 노이즈.`);
    k.card(s, M, 1.8, 5.4, 4.8, { fill: C.text2 });
    s.addShape(S.triangle, { x: M + 0.75, y: 2.45, w: 3.9, h: 3.4, fill: { color: "1E2724" }, line: { color: C.accent1, width: 2.5 } });
    k.text(s, "노출", { x: M + 1.7, y: 4.45, w: 2.0, h: 0.6, fontSize: 26, bold: true, color: C.background1, align: "center" });
    k.badge(s, M + 2.25, 2.0, 0.9, "조리개", { fontSize: 13, fill: C.accent3, color: C.background1 });
    k.badge(s, M + 0.3, 5.45, 0.9, "셔터", { fontSize: 14, fill: C.accent4, color: C.background1 });
    k.badge(s, M + 4.2, 5.45, 0.9, "ISO", { fontSize: 16, fill: C.accent1, color: C.text2 });
    const rows = [["조리개", "빛이 들어오는 구멍의 크기", "→ 배경이 얼마나 흐려지나", C.accent3], ["셔터스피드", "빛을 받는 시간", "→ 움직임이 멈추나, 흐르나", C.accent4], ["ISO", "빛에 반응하는 감도", "→ 화면이 깨끗한가, 자글자글한가", C.accent1]];
    rows.forEach(([n, a, b, col], i) => {
      const y = 1.8 + i * 1.42;
      k.card(s, 6.55, y, CW - 5.8, 1.26);
      s.addShape(S.ellipse, { x: 6.8, y: y + 0.24, w: 0.26, h: 0.26, fill: { color: col }, line: { type: "none" } });
      k.text(s, n, { x: 7.2, y: y + 0.15, w: 5, h: 0.4, fontSize: 18, bold: true });
      k.text(s, `${a}  ${b}`, { x: 7.2, y: y + 0.6, w: CW - 6.7, h: 0.5, fontSize: 13.5, color: C.accent5 });
    });
    k.text(s, "하나로 밝게 만들면, 나머지 둘 중 하나가 대가를 치른다", { x: 6.55, y: 6.15, w: CW - 5.8, h: 0.35, fontSize: 13.5, bold: true, color: C.accent3 });
  }
  {
    const s = content("조리개 · 셔터 · ISO를 한 장에", `[12:47] 숫자 방향을 헷갈려 하는 분이 많아요. "조리개는 숫자가 작을수록 밝다"만 확실히.
폰 조리개는 대부분 고정 → 배경 흐림은 '인물 모드'가 소프트웨어로 흉내. 대상에 가까이, 배경은 멀리.
어두우면 ISO가 올라가 노이즈 → 해결은 설정이 아니라 빛.`);
    k.table(s, [["", "한쪽 끝", "다른 쪽 끝", "폰에서는"], ["조리개 (f값)", "f/1.8 · 구멍 큼 · 밝음 · 배경 흐림", "f/11 · 구멍 작음 · 어두움 · 앞뒤 선명", "대부분 고정 → 인물 모드, 대상에 가까이"], ["셔터스피드", "1/1000 · 순간이 멈춤", "1/30 · 움직임이 흐름, 흔들림", "영상은 4교시 '2배 규칙'"], ["ISO", "100~400 · 깨끗", "3200 이상 · 자글자글", "어두우면 ISO 말고 빛을 더하기"]], { x: M, y: 1.8, w: CW, colW: [2.1, 3.2, 3.3, CW - 8.6], rowH: 0.95, fontSize: 14 });
    k.takeaway(s, "조리개는 숫자가 작을수록 밝다 — 이것 하나만 확실히", 5.75);
  }
  {
    const s = content("화이트밸런스: 빛에도 색이 있다", `[12:55] 같은 흰 종이도 전구 아래선 노랗게, 그늘에선 파랗게 찍힙니다(사진은 한 장을 세 가지 빛 색으로 바꿔 본 것).
자동 화이트밸런스는 찍는 도중 색이 바뀔 수 있어요 → 영상은 고정이 안전. 색이 다른 빛(창가 + 형광등)을 섞지 않기.`);
    const sets = [[wb.warm, "약 3,000K", "촛불 · 전구 → 노랗게"], [wb.neutral, "약 5,500K", "한낮 햇빛 → 자연스럽게"], [wb.cool, "약 7,000K", "그늘 · 흐린 날 → 파랗게"]];
    const cw = (CW - 2 * 0.3) / 3;
    sets.forEach(([f, kk, d], i) => {
      const x = M + i * (cw + 0.3);
      k.photo(s, f, x, 1.8, cw, 2.55, { alt: kk });
      k.text(s, kk, { x, y: 4.45, w: cw, h: 0.45, fontSize: 20, bold: true });
      k.text(s, d, { x, y: 4.9, w: cw, h: 0.35, fontSize: 13, color: C.accent5 });
    });
    k.takeaway(s, "영상은 화이트밸런스를 고정하고, 색이 다른 빛을 섞지 않기 (창가 빛 + 형광등 = 얼굴 반반)", 5.65);
  }
  {
    const s = content("초점 · 심도 · 폰의 렌즈", `[13:00] 초점은 '보여주고 싶은 곳'에. 사람이면 눈. 심도는 선명한 범위: 얕으면 주인공만(감성), 깊으면 전부(정보).
렌즈: 0.5x는 넓지만 가장자리가 휘고 가까운 얼굴이 커 보임. 인물은 1x~3x로 조금 떨어져서. 배율 사이 디지털 줌은 화질 저하 → "줌 말고 발로."`);
    const pw = 2.95, ph = 2.95;
    k.photo(s, img.img16[0], M, 1.8, pw, ph, { caption: "얕은 심도", sub: "주인공만 선명 · 감성" });
    k.photo(s, img.img16[1], M + pw + 0.25, 1.8, pw, ph, { caption: "깊은 심도", sub: "전부 선명 · 정보" });
    const lens = [["0.5x", "초광각", "공간 전체 · 가장자리가 휨 · 얼굴 가까이는 왜곡"], ["1x", "기본", "가장 선명 · 대부분의 촬영"], ["2~3x", "망원", "얼굴이 자연스러움 · 배경 정리"]];
    const lx = M + 2 * pw + 0.6, lw = CW - 2 * pw - 0.6;
    lens.forEach(([z, n, d], i) => {
      const y = 1.8 + i * 1.08;
      k.card(s, lx, y, lw, 0.95);
      k.text(s, z, { x: lx + 0.25, y, w: 1.1, h: 0.95, fontSize: 20, bold: true, color: C.accent2, valign: "middle" });
      k.text(s, n, { x: lx + 1.35, y: y + 0.12, w: lw - 1.5, h: 0.35, fontSize: 15, bold: true });
      k.text(s, d, { x: lx + 1.35, y: y + 0.47, w: lw - 1.5, h: 0.4, fontSize: 12, color: C.accent5 });
    });
    k.takeaway(s, "줌 말고 발로. 렌즈 배율 사이의 디지털 줌은 화질이 떨어집니다", 5.65);
  }
  {
    const s = content("실습 · 프로 모드로 바꿔 찍기 (짝과 25분)", `[13:05–13:30] 짝끼리. 경험자가 설정 화면을 먼저 찾아 주세요.
갤럭시: 카메라 → 더보기 → 프로 / 프로 동영상. 아이폰: 기본 카메라는 노출 조절 위주 → 무료 수동 촬영 앱(예: Blackmagic Camera). 부담이면 인물 모드 · 노출 슬라이더로.
찍은 사진은 드라이브 '1회차/3교시'. 메뉴 이름은 기종 · 버전마다 조금씩 다릅니다.`);
    const hw = (CW - 0.3) / 2;
    [["갤럭시", "카메라 → 더보기 → 프로 / 프로 동영상\nISO · 셔터 · WB를 직접 조절"], ["아이폰", "기본 카메라는 노출 조절 위주\n→ 무료 수동 앱 (예: Blackmagic Camera)"]].forEach(([h, b], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 1.55);
      k.text(s, h, { x: x + 0.3, y: 1.95, w: hw - 0.6, h: 0.4, fontSize: 17, bold: true, color: C.accent2 });
      k.text(s, b, { x: x + 0.3, y: 2.4, w: hw - 0.6, h: 0.85, fontSize: 14 });
    });
    k.checklist(s, ["같은 장면 ISO 100 vs 3200", "손 흔들기 셔터 1/60 vs 1/1000", "흰 종이 WB 전구 vs 맑음", "인물 모드 켜고 / 끄고 (배경 흐림 비교)"], { x: M, y: 3.7, w: 7.2, h: 2.3, fontSize: 16 });
    k.card(s, 8.3, 3.65, CW - 7.55, 2.3, { fill: C.text2 });
    k.text(s, "다 찍었으면", { x: 8.6, y: 3.85, w: 3.9, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, "가장 마음에 드는 1장 + 이유 한 줄\n→ 드라이브 '1회차/3교시'", { x: 8.6, y: 4.3, w: CW - 8.15, h: 1.4, fontSize: 15, bold: true, color: C.background1 });
  }

  // ───────────────────────── 4교시 ─────────────────────────
  divider(4, "카메라의 원리 ② 영상", "13:40–14:30  ·  영상은 1초에 사진 수십 장. 그래서 규칙이 조금 다르다", "img05", `[13:40–14:30] 목표: 프레임레이트 · 셔터 2배 규칙 · 해상도를 이해하고, 편집에서 문제없는 폰 세팅을 함께 끝내기. 개념 20분 → 함께 세팅 15분 → 비교 촬영 15분.`);
  {
    const s = content("프레임레이트: 1초에 몇 장인가", `[13:42] 24fps 영화 같은 느낌 / 30fps SNS 기본 · 우리 수업 기본 / 60fps 매끄러운 움직임, 편집에서 절반 속도로 늦추면 부드러운 슬로모션. 선의 촘촘함이 1초에 담기는 장면 수.`);
    const rows = [["24", "영화 같은 느낌", C.accent4], ["30", "SNS 기본 · 우리 수업 기본값", C.accent2], ["60", "매끄러운 움직임 · 슬로모션 재료", C.accent3]];
    rows.forEach(([fps, use, col], i) => {
      const y = 1.95 + i * 1.4;
      k.text(s, fps, { x: M, y, w: 1.1, h: 0.95, fontSize: 40, bold: true, color: col, valign: "middle" });
      k.text(s, "fps", { x: M + 1.05, y: y + 0.32, w: 0.6, h: 0.4, fontSize: 14, color: C.accent5 });
      const n = Number(fps), x0 = 2.55, wl = 6.5;
      for (let j = 0; j < n; j++) s.addShape(S.rect, { x: x0 + (j * wl) / n, y: y + 0.12, w: Math.max(0.03, (wl / n) * 0.55), h: 0.72, fill: { color: col }, line: { type: "none" } });
      k.text(s, use, { x: 9.35, y, w: CW - 8.6, h: 0.95, fontSize: 16, bold: true, valign: "middle" });
    });
    k.text(s, "← 1초 →", { x: 2.55, y: 6.0, w: 6.5, h: 0.3, fontSize: 12, color: C.accent5, align: "center" });
  }
  {
    const s = content("셔터 2배 규칙과 깜빡이는 조명", `[13:48] 영상의 셔터는 프레임의 2배 정도가 기준. 훨씬 빠르면 움직임이 뚝뚝 끊겨 보여요. 30fps → 1/60, 60fps → 1/120.
실내 형광등 · LED 아래서 화면에 줄이 흐르면 셔터를 1/60이나 1/120으로(한국 전기는 60Hz). 밖이 너무 밝을 때 프로는 ND 필터를 쓰지만, 폰은 자동이 알아서 처리하니 크게 걱정하지 않아도 됩니다.`);
    const items = [["30", "30fps → 셔터 1/60", "가장 자연스러운 움직임"], ["60", "60fps → 셔터 1/120", "슬로모션 재료로 찍을 때"], ["!", "너무 빠른 셔터 (1/1000)", "움직임이 뚝뚝 끊겨 보여요"]];
    items.forEach(([n, h, b], i) => k.row(s, M, 1.8 + i * 1.12, 6.2, 0.98, { n, head: h, body: b, headW: 2.8 }));
    const rx = M + 6.5, rw = CW - 6.5;
    k.card(s, rx, 1.8, rw, 3.2, { fill: C.text2 });
    await k.chip(s, rx + 0.35, 2.1, 0.7, "FaLightbulb", { fill: "26302C", iconHex: HEX.accent1 });
    k.text(s, "화면에 줄이 흐르면", { x: rx + 0.35, y: 2.95, w: rw - 0.7, h: 0.45, fontSize: 19, bold: true, color: C.background1 });
    k.text(s, "실내 형광등 · LED가 깜빡이는 것\n→ 셔터를 1/60 또는 1/120으로\n→ 그래도 안 되면 창가 자연광으로", { x: rx + 0.35, y: 3.45, w: rw - 0.7, h: 1.4, fontSize: 14.5, color: "C9D3CE" });
  }
  {
    const s = content("편집에서 문제가 되는 설정", `[13:53] 편집에서 생길 문제를 촬영 단계에서 막는 법.
- HDR 동영상(아이폰 'HDR 비디오', 갤럭시 'HDR10+'): 폰에선 화려해도 편집 · 다른 화면에서 색이 틀어져 보일 수 있어요 → 끄기.
- HEVC(고효율, H.265): 일부 PC에서 편집이 끊김 → 아이폰 '가장 호환성 높은 포맷', 갤럭시 '고효율 동영상' 끄기.
- 4K: 파일이 1080p의 약 4배, PC가 느려짐 → 수업 기본은 1080p. 메뉴 이름은 기종마다 조금씩 다릅니다.`);
    const items = [["FaSun", "HDR 동영상 → 끄기", "폰에선 화려해도 편집 · 다른 화면에서 색이 틀어져 보일 수 있어요"], ["FaFileVideo", "HEVC(고효율) → 끄기", "파일은 작지만 일부 PC에서 편집이 끊겨요. 호환성 우선(H.264)"], ["FaHdd", "4K → 1080p", "4K는 파일이 약 4배. 수업 기본은 1080p 30fps"]];
    const cw = (CW - 2 * 0.3) / 3;
    for (let i = 0; i < items.length; i++) await k.featureCard(s, M + i * (cw + 0.3), 1.8, cw, 3.35, { icon: items[i][0], head: items[i][1], body: items[i][2], bodySize: 13.5 });
    k.takeaway(s, "편집에서 생길 문제를 촬영 전에 막는 것. 메뉴 이름은 기종마다 조금씩 달라요", 5.5);
  }
  {
    const s = content("함께 세팅해요 · 15분", `[13:58–14:13] 화면을 보면서 한 단계씩. 크루장은 전원 완료 확인.
아이폰: 설정 → 카메라 → 비디오 녹화 → 1080p 30fps / 같은 화면 'HDR 비디오' 끄기 / 포맷 → '가장 호환성 높은 포맷' / 격자 켜기.
갤럭시: 동영상 → 상단 해상도 FHD 30 / 설정 → 고급 동영상 옵션 → 고효율 동영상 · HDR10+ 끄기 / 수직 · 수평 안내선 켜기.
공통: 렌즈 닦기, 저장공간 10GB 이상, 방해 금지, 기본은 세로로.`);
    const hw = (CW - 0.3) / 2;
    [["아이폰", ["설정 → 카메라 → 비디오 녹화 → 1080p 30fps", "같은 화면에서 'HDR 비디오' 끄기", "카메라 → 포맷 → '가장 호환성 높은 포맷'", "카메라 → 격자 켜기"]], ["갤럭시", ["동영상 → 상단 해상도에서 FHD 30", "설정 → 고급 동영상 옵션 → 고효율 동영상 끄기", "같은 곳에서 HDR10+ 동영상 끄기", "설정 → 수직 · 수평 안내선 켜기"]]].forEach(([h, items], i) => {
      const x = M + i * (hw + 0.3);
      k.card(s, x, 1.8, hw, 3.25);
      k.text(s, h, { x: x + 0.3, y: 1.98, w: hw - 0.6, h: 0.4, fontSize: 18, bold: true, color: C.accent2 });
      k.checklist(s, items, { x: x + 0.3, y: 2.5, w: hw - 0.6, h: 2.45, fontSize: 14 });
    });
    const common = [["FaBroom", "렌즈 닦기"], ["FaSdCard", "저장공간 10GB+"], ["FaBellSlash", "방해 금지"], ["FaMobileAlt", "기본은 세로"]];
    const cw = (CW - 3 * 0.25) / 4;
    for (let i = 0; i < common.length; i++) {
      const x = M + i * (cw + 0.25);
      k.card(s, x, 5.3, cw, 0.85, { fill: C.accent6 });
      await k.chip(s, x + 0.15, 5.4, 0.65, common[i][0], { fill: "FFFFFF" });
      k.text(s, common[i][1], { x: x + 0.95, y: 5.3, w: cw - 1.05, h: 0.85, fontSize: 14.5, bold: true, valign: "middle" });
    }
  }
  {
    const s = content("초점 · 노출 잠그기 (AE/AF 잠금)", `[14:13] 잠그지 않으면 찍는 도중 밝기와 초점이 출렁입니다. 프로 영상과 아마추어 영상의 가장 쉬운 차이.
1) 찍을 대상을 길게 누르기 2) 잠금 표시(아이폰 AE/AF 잠금, 갤럭시 자물쇠) 3) 밝기 막대를 위아래로.`);
    const steps = [["1", "대상을 길게 누르기", "화면에서 찍을 대상을 꾹"], ["2", "잠금 표시 확인", "아이폰 AE/AF 잠금 · 갤럭시 자물쇠"], ["3", "밝기 막대 조절", "위아래로 밀어 원하는 밝기"]];
    steps.forEach(([n, h, b], i) => k.row(s, M, 1.8 + i * 1.12, 6.6, 0.98, { n, head: h, body: b, headW: 2.6 }));
    const rx = M + 6.9, rw = CW - 6.9;
    k.card(s, rx, 1.8, rw, 3.2, { fill: C.text2 });
    k.text(s, "잠그지 않으면", { x: rx + 0.35, y: 2.05, w: rw - 0.7, h: 0.35, fontSize: 14, color: C.accent6 });
    k.text(s, "사람이 지나갈 때마다\n밝기와 초점이 출렁입니다", { x: rx + 0.35, y: 2.5, w: rw - 0.7, h: 1.2, fontSize: 20, bold: true, color: C.background1 });
    k.text(s, "→ 가장 쉬운 프로와 아마추어의 차이", { x: rx + 0.35, y: 4.2, w: rw - 0.7, h: 0.4, fontSize: 14, bold: true, color: C.accent1 });
    k.takeaway(s, "다음 실습부터 모든 촬영은 '잠그고' 찍습니다", 5.5);
  }
  {
    const s = content("실습 · 비교 클립 두 쌍 (15분)", `[14:15–14:30] 짝끼리. 같은 장면을 두 번씩. 드라이브 '1회차/4교시'.
30fps vs 60fps: 머리 넘기기, 물 따르기. 60fps는 3회차 편집에서 슬로모션으로 씁니다. 잠금 없이 vs 잠금: 창가를 지나가며.
경험자 도전: 갤럭시 프로 동영상으로 셔터 1/60 vs 1/1000.`);
    const cw = (CW - 2 * 0.3) / 3;
    await k.featureCard(s, M, 1.8, cw, 3.35, { icon: "FaTachometerAlt", head: "30fps vs 60fps", body: "머리 넘기기, 물 따르기\n같은 동작을 두 번", bodySize: 14 });
    await k.featureCard(s, M + cw + 0.3, 1.8, cw, 3.35, { icon: "FaLock", head: "잠금 없이 vs 잠금", body: "창가를 지나가며 찍기\n밝기 출렁임 비교", bodySize: 14 });
    await k.featureCard(s, M + 2 * (cw + 0.3), 1.8, cw, 3.35, { icon: "FaStar", head: "도전 미션", body: "갤럭시 프로 동영상으로\n셔터 1/60 vs 1/1000\n아이폰은 수동 앱으로", bodySize: 14, dark: true });
    k.takeaway(s, "찍은 클립은 드라이브 '1회차/4교시'로. 60fps 클립은 3회차 편집에서 슬로모션으로 씁니다", 5.5);
  }

  // ───────────────────────── 5교시 ─────────────────────────
  divider(5, "화면의 언어와 빛", "14:40–15:30  ·  얼마나 가까이, 어디서, 화면 어디에, 어떤 빛으로", "img06", `[14:40–15:30] 목표: 샷 크기 · 앵글 · 구도 · 빛을 영어 용어와 함께(4회차 AI 프롬프트 어휘). 개념 25분 → 학교 공간 구도 미션 15분 → ChatGPT 피드백 10분.`);
  {
    const s = content("샷 크기: 얼마나 가까이 찍느냐가 말을 정한다", `[14:42] 영어 이름도 함께. 4회차에 이 단어가 그대로 AI 영상 프롬프트가 됩니다.
연결 공식: 어디서(와이드) → 누가 무엇을(미디엄) → 어떤 감정으로(클로즈업). 같은 크기를 연달아 붙이면 화면이 튑니다.`);
    const shots = [["익스트림 와이드", "Extreme Wide", "어디인지"], ["와이드 · 풀", "Wide / Full", "누가, 어디서"], ["미디엄", "Medium", "무엇을 하는지"], ["클로즈업", "Close-up", "감정, 동작"], ["익스트림 클로즈업", "Extreme Close-up", "강조, 질감"]];
    const pw = (CW - 4 * 0.2) / 5, ph = 2.95;
    shots.forEach(([ko, en, use], i) => {
      const x = M + i * (pw + 0.2);
      k.photo(s, img.img09[i], x, 1.75, pw, ph, { alt: ko });
      k.text(s, ko, { x, y: 4.82, w: pw, h: 0.35, fontSize: 14, bold: true });
      k.text(s, en, { x, y: 5.15, w: pw, h: 0.28, fontSize: 11, color: C.accent2 });
      k.text(s, use, { x, y: 5.42, w: pw, h: 0.3, fontSize: 12, color: C.accent5 });
    });
    k.takeaway(s, "어디서(와이드) → 누가 무엇을(미디엄) → 어떤 감정으로(클로즈업)", 6.0);
  }
  {
    const s = content("앵글: 어디서 보느냐가 느낌을 바꾼다", `[14:48] 카메라 높이가 감정을 만듭니다. 하이앵글 작고 귀엽게 / 아이레벨 자연스럽게(기본) / 로우앵글 크고 당당하게 / 탑뷰 음식 · 책상 · 손 작업(정보성 · 요리의 기본). 더치 앵글(기울이기)은 가끔만.`);
    const a = [["하이앵글", "High angle", "내려다보기 · 작고 귀엽게"], ["아이레벨", "Eye level", "눈높이 · 자연스럽게"], ["로우앵글", "Low angle", "올려다보기 · 크고 당당하게"], ["탑뷰", "Top-down", "바로 위 · 음식 · 손 작업"]];
    const pw = (CW - 3 * 0.25) / 4, ph = pw * 0.88;
    a.forEach(([ko, en, d], i) => {
      const x = M + i * (pw + 0.25);
      k.photo(s, img.img10[i], x, 1.75, pw, ph, { alt: ko });
      k.text(s, ko, { x, y: 1.85 + ph, w: pw, h: 0.35, fontSize: 15, bold: true });
      k.text(s, `${en}  ·  ${d}`, { x, y: 2.2 + ph, w: pw, h: 0.3, fontSize: 11.5, color: C.accent5 });
    });
    k.takeaway(s, "+ 더치 앵글(기울이기): 불안하고 역동적인 느낌. 가끔만", 6.0);
  }
  {
    const s = content("구도 ① 주인공을 어디에 둘까", `[14:52] 격자는 오전 세팅에서 켜 둔 그대로.
삼분할: 선이 만나는 네 점에 주인공, 눈은 위쪽 선에. 리딩 라인: 길 · 난간 · 복도의 선이 주인공을 가리키게. 프레임 속 프레임: 문 · 창문으로 한 번 더 감싸기. 대칭: 복도 · 건물 정면은 가운데.`);
    const c = [["삼분할", "선이 만나는 점에 주인공, 눈은 위쪽 선에"], ["리딩 라인", "길 · 난간 · 복도의 선이 주인공을 가리키게"], ["프레임 속 프레임", "문 · 창문으로 주인공을 한 번 더 감싸기"]];
    const pw = (CW - 2 * 0.3) / 3, ph = 3.2;
    c.forEach(([h, d], i) => {
      const x = M + i * (pw + 0.3);
      k.photo(s, img.img12[i], x, 1.75, pw, ph, { caption: h, sub: d, alt: h });
      if (i === 0) {
        [1, 2].forEach((t) => {
          s.addShape(S.line, { x: x + (pw * t) / 3, y: 1.75, w: 0, h: ph, line: { color: "FFFFFF", width: 1, transparency: 30 } });
          s.addShape(S.line, { x, y: 1.75 + (ph * t) / 3, w: pw, h: 0, line: { color: "FFFFFF", width: 1, transparency: 30 } });
        });
      }
    });
    k.takeaway(s, "+ 대칭: 양쪽이 같은 곳(복도 · 건물 정면)은 가운데가 정답", 6.15);
  }
  {
    const s = content("구도 ② 무엇을 비울까", `[14:56] 비우는 것도 구도입니다.
헤드룸: 머리 위는 손가락 한두 개만큼. 시선 여백: 보는 쪽 · 가는 쪽에 공간. 세로 안전 영역: 9:16의 위 · 아래 · 오른쪽은 버튼 · 캡션 · 프로필 자리 → 얼굴과 자막은 가운데 쪽. 수직선: 문틀 · 건물 세로선을 화면과 나란히.`);
    const px = M + 0.3, py = 1.75, pw = 2.75, ph = 4.85;
    s.addShape(S.roundRect, { x: px, y: py, w: pw, h: ph, rectRadius: 0.22, fill: { color: "0E1110" }, line: { type: "none" } });
    k.photo(s, img.img15, px + 0.1, py + 0.1, pw - 0.2, ph - 0.2, { alt: "세로 화면" });
    const iw = pw - 0.2, ih = ph - 0.2;
    s.addShape(S.rect, { x: px + 0.1, y: py + 0.1, w: iw, h: ih * 0.14, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + 0.1, y: py + 0.1 + ih * 0.76, w: iw, h: ih * 0.24, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + 0.1 + iw * 0.84, y: py + 0.1 + ih * 0.42, w: iw * 0.16, h: ih * 0.34, fill: { color: C.accent3, transparency: 45 }, line: { type: "none" } });
    k.text(s, "빨간 곳 = 버튼 · 캡션 자리", { x: px - 0.2, y: py + ph + 0.05, w: pw + 0.4, h: 0.3, fontSize: 11.5, bold: true, color: C.accent3, align: "center" });
    const items = [["1", "헤드룸", "머리 위는 손가락 한두 개만큼"], ["2", "시선 여백", "보는 쪽, 가는 쪽에 공간을"], ["3", "세로 안전 영역", "위 · 아래 · 오른쪽은 버튼과 캡션 자리"], ["4", "수직선", "문틀 · 건물 세로선을 화면과 나란히"]];
    items.forEach(([n, h, b], i) => k.row(s, 4.4, 1.75 + i * 1.2, CW - 3.65, 1.05, { n, head: h, body: b, headW: 2.6 }));
  }
  {
    const s = content("빛의 방향", `[15:00] 같은 얼굴도 빛의 방향에 따라 다른 사람이 됩니다. 순광 밝고 선명 / 측광 입체감과 분위기 / 역광 얼굴이 어두움 → 흰 종이 반사판 / 그늘 부드럽고 고르게. 역광은 6교시에 강사 장비와 흰 종이로 직접.`);
    const l = [["순광", "정면 · 밝고 선명"], ["측광", "옆 · 입체감과 분위기"], ["역광", "뒤 · 윤곽은 예쁘지만 얼굴이 어두움"], ["그늘", "부드럽고 고르게"]];
    const pw = (CW - 3 * 0.25) / 4, ph = pw * 0.92;
    l.forEach(([h, d], i) => {
      const x = M + i * (pw + 0.25);
      k.photo(s, img.img11[i], x, 1.75, pw, ph, { caption: h, sub: d, alt: h });
    });
    k.takeaway(s, "역광은 흰 종이 한 장으로 살린다: 얼굴 앞 아래쪽에서 빛을 튕겨 주기", 6.1);
  }
  {
    const s = content("3점 조명, 폰으로 하면", `[15:03] 프로의 기본 조명. 키(주 조명, 45도) + 필(반대쪽에서 그림자 채움) + 백(뒤에서 윤곽). 폰으로는 창문 = 키, 흰 종이 · 흰 벽 = 필, 뒤쪽 스탠드 = 백.`);
    k.card(s, M, 1.75, 6.0, 4.85, { fill: C.text2 });
    const cx = M + 3.0, cy = 3.95;
    s.addShape(S.line, { x: cx - 1.75, y: cy + 0.1, w: 1.35, h: 0.45, flipV: true, line: { color: C.accent1, width: 2 } });
    s.addShape(S.line, { x: cx + 0.4, y: cy + 0.1, w: 1.25, h: 0.45, line: { color: "C9B26A", width: 1.5, dashType: "dash" } });
    s.addShape(S.ellipse, { x: cx - 0.4, y: cy - 0.4, w: 0.8, h: 0.8, fill: { color: "E6EEE9" }, line: { type: "none" } });
    k.text(s, "사람", { x: cx - 0.6, y: cy + 0.45, w: 1.2, h: 0.3, fontSize: 12, bold: true, color: C.background1, align: "center" });
    await k.chip(s, cx - 0.33, cy + 1.45, 0.66, "FaVideo", { fill: "26302C", iconHex: "C9D3CE" });
    k.text(s, "카메라", { x: cx - 0.6, y: cy + 2.12, w: 1.2, h: 0.3, fontSize: 11, color: "C9D3CE", align: "center" });
    await k.chip(s, cx - 2.55, cy + 0.35, 0.8, "FaSun", { fill: C.accent1, iconHex: HEX.dk2 });
    k.text(s, "키 = 창문", { x: cx - 2.95, y: cy + 1.2, w: 1.6, h: 0.3, fontSize: 12, bold: true, color: C.accent1, align: "center" });
    await k.chip(s, cx + 1.6, cy + 0.38, 0.72, "FaSquare", { fill: C.accent6, iconHex: "8A7A62" });
    k.text(s, "필 = 흰 종이", { x: cx + 1.2, y: cy + 1.2, w: 1.6, h: 0.3, fontSize: 12, bold: true, color: C.accent6, align: "center" });
    await k.chip(s, cx - 0.33, cy - 1.75, 0.66, "FaLightbulb", { fill: C.accent4, iconHex: "FFFFFF" });
    k.text(s, "백 = 뒤쪽 스탠드", { x: cx - 1.2, y: cy - 1.05, w: 2.4, h: 0.3, fontSize: 12, bold: true, color: "9CC2E0", align: "center" });
    const items = [["키 라이트", "가장 강한 주 조명. 얼굴 정면에서 45도 옆, 살짝 위", "창문"], ["필 라이트", "반대쪽에서 그림자를 부드럽게 채움", "흰 종이 · 흰 벽"], ["백 라이트", "뒤에서 머리 · 어깨 윤곽을 살려 배경과 분리", "뒤쪽 스탠드"]];
    items.forEach(([h, d, p], i) => {
      const y = 1.75 + i * 1.65;
      const x = M + 6.3, w = CW - 6.3;
      k.card(s, x, y, w, 1.5);
      k.text(s, h, { x: x + 0.3, y: y + 0.15, w: w - 0.6, h: 0.38, fontSize: 17, bold: true });
      k.text(s, d, { x: x + 0.3, y: y + 0.55, w: w - 0.6, h: 0.5, fontSize: 13, color: C.accent5 });
      k.text(s, `폰으로는 → ${p}`, { x: x + 0.3, y: y + 1.05, w: w - 0.6, h: 0.32, fontSize: 13, bold: true, color: C.accent2 });
    });
  }
  {
    const s = content("실습 · 구도 사진 미션 + AI 피드백 (25분)", `[15:05–15:30] 학교 공간에서 15분, 돌아와서 ChatGPT 피드백 10분. 짝끼리 서로 모델이 되어 주기. 다른 사람이 나오면 동의 받기.
가장 자신 있는 1장을 ChatGPT에 올려 피드백. 워크북에 "AI가 맞게 본 것 하나 / 놓친 것 하나" → AI는 규칙을 보고, 사람은 의도를 봅니다.`);
    k.text(s, "학교 공간에서 15분", { x: M, y: 1.75, w: 5.6, h: 0.4, fontSize: 17, bold: true });
    k.checklist(s, ["삼분할 × 2", "헤드룸 좋은 예 · 나쁜 예", "대칭 × 1", "시선 여백 좋은 예 · 나쁜 예", "리딩 라인 × 1", "탑뷰 × 1", "프레임 속 프레임 × 1", "역광 + 흰 종이 반사판 × 1"], { x: M, y: 2.3, w: 5.6, h: 4.0, fontSize: 15, paraSpaceAfter: 7 });
    k.prompt(s, 6.75, 1.75, CW - 6.0, 2.45, "이 사진의 구도에서 좋은 점 1개, 고칠 점 2개를 알려줘. 초보자가 다음 촬영에서 바로 고칠 수 있게, 샷 크기 · 앵글 · 구도 용어를 써서.", "ChatGPT에 사진을 올리고");
    k.card(s, 6.75, 4.4, CW - 6.0, 1.75, { fill: C.text2 });
    k.text(s, "워크북에 한 줄씩", { x: 7.05, y: 4.55, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, "AI가 맞게 본 것 하나: ________\nAI가 놓친 것 하나: ________", { x: 7.05, y: 5.0, w: CW - 6.6, h: 1.0, fontSize: 15, color: C.background1 });
    k.text(s, "AI는 규칙을 보고, 사람은 의도를 봅니다", { x: 6.75, y: 6.3, w: CW - 6.0, h: 0.32, fontSize: 13, bold: true, color: C.accent3 });
  }

  // ───────────────────────── 6교시 ─────────────────────────
  divider(6, "움직임 · 컷 · 소리, 그리고 장비", "15:40–16:30  ·  흔들림 없이, 한 장면을 여러 컷으로, 소리까지", "img07", `[15:40–16:30] 목표: 안정 · 무빙 · 컷의 문법 · 녹음 기초 + 강사 장비 체험 + 5샷 시퀀스 촬영. 개념 20분 → 장비 시연 · 체험 10분 → 5샷 촬영 20분.`);
  {
    const s = content("흔들림 잡기와 카메라 움직임", `[15:42] 흔들림은 자세로 먼저, 앱 보정은 그다음(보정은 화면을 잘라내서 화질이 떨어져요). 두 손, 팔꿈치는 몸에, 벽 · 기둥에 기대기. 걸을 땐 무릎을 살짝 굽히고 발뒤꿈치부터.
무빙 5가지와 영어 이름(4회차 프롬프트 어휘). 세 가지 약속: 한 클립에 한 움직임, 두 배 천천히, 시작과 끝 2초 멈추기.`);
    const moves = [["FaPause", "고정", "Static"], ["FaArrowsAltH", "팬", "Pan"], ["FaArrowsAltV", "틸트", "Tilt"], ["FaCompressArrowsAlt", "다가가기", "Push-in"], ["FaWalking", "따라가기", "Tracking"]];
    const cw = (CW - 4 * 0.25) / 5;
    for (let i = 0; i < moves.length; i++) {
      const x = M + i * (cw + 0.25);
      k.card(s, x, 1.75, cw, 2.25);
      await k.chip(s, x + (cw - 0.8) / 2, 1.98, 0.8, moves[i][0]);
      k.text(s, moves[i][1], { x, y: 2.95, w: cw, h: 0.4, fontSize: 17, bold: true, align: "center" });
      k.text(s, moves[i][2], { x, y: 3.35, w: cw, h: 0.3, fontSize: 12, color: C.accent2, align: "center" });
    }
    const rules = ["한 클립에 한 움직임", "생각보다 두 배 천천히", "시작과 끝에 2초 멈추기"];
    const rw = (CW - 2 * 0.3) / 3;
    rules.forEach((r, i) => {
      const x = M + i * (rw + 0.3);
      k.card(s, x, 4.3, rw, 0.95, { fill: C.text2 });
      k.text(s, String(i + 1).padStart(2, "0"), { x: x + 0.25, y: 4.3, w: 0.8, h: 0.95, fontSize: 22, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, r, { x: x + 1.0, y: 4.3, w: rw - 1.15, h: 0.95, fontSize: 16, bold: true, color: C.background1, valign: "middle" });
    });
    k.takeaway(s, "흔들림은 자세로 먼저: 두 손, 팔꿈치는 몸에, 벽에 기대기. 앱 보정은 그다음", 5.6);
  }
  {
    const s = content("5샷 시퀀스: 뭘 찍을지 모를 때 꺼내는 공식", `[15:47] 한 장면을 다섯 컷으로 찍으면 편집할 재료가 생깁니다(다큐 · 뉴스 촬영의 기본 공식).
1 손 클로즈업 2 얼굴 클로즈업 3 와이드 4 어깨너머 5 특이한 앵글. 컷마다 7초 이상, 두 번씩. ①과 ②는 같은 동작을 다른 크기로 → 편집에서 '동작 연결'.`);
    const shots = [["손 클로즈업", "무엇을 하는지"], ["얼굴 클로즈업", "누가, 어떤 표정으로"], ["와이드", "어디서"], ["어깨너머", "그 사람의 시점"], ["특이한 앵글", "탑뷰 · 로우앵글"]];
    const pw = (CW - 4 * 0.2) / 5, ph = 2.95;
    shots.forEach(([h, d], i) => {
      const x = M + i * (pw + 0.2);
      k.photo(s, img.img13[i], x, 1.75, pw, ph, { alt: h });
      k.badge(s, x + 0.12, 1.87, 0.48, i + 1, { fontSize: 13 });
      k.text(s, h, { x, y: 4.82, w: pw, h: 0.35, fontSize: 14, bold: true });
      k.text(s, d, { x, y: 5.17, w: pw, h: 0.3, fontSize: 12, color: C.accent5 });
    });
    k.takeaway(s, "컷마다 7초 이상, 두 번씩. ①과 ②는 같은 동작을 다른 크기로 → 편집에서 이어 붙이면 자연스러워요", 5.9);
  }
  {
    const s = content("컷을 잇는 규칙: 180도 · 30도 · B롤", `[15:52] 편집에서 어색해지는 이유는 대부분 촬영 때 생깁니다.
180도 규칙: 두 사람 사이 가상의 선, 카메라는 한쪽에만. 넘으면 방향이 뒤집혀 보여요. 30도 규칙: 다시 찍을 땐 각도 30도 이상 또는 샷 크기 바꾸기(아니면 점프컷). B롤: 손 · 소품 · 공간 컷, 편집에서 자른 자리를 덮어 줍니다.`);
    const ox = M, oy = 1.75, ow = 5.9, oh = 4.85;
    k.card(s, ox, oy, ow, oh, { fill: C.text2 });
    s.addShape(S.line, { x: ox + 0.4, y: oy + 2.0, w: ow - 0.8, h: 0, line: { color: C.accent3, width: 2, dashType: "dash" } });
    k.text(s, "가상의 선", { x: ox + 0.45, y: oy + 2.08, w: 1.4, h: 0.3, fontSize: 11, color: "E8A49C" });
    s.addShape(S.ellipse, { x: ox + 1.3, y: oy + 1.6, w: 0.8, h: 0.8, fill: { color: "E6EEE9" }, line: { type: "none" } });
    s.addShape(S.ellipse, { x: ox + 3.8, y: oy + 1.6, w: 0.8, h: 0.8, fill: { color: "E6EEE9" }, line: { type: "none" } });
    await k.chip(s, ox + 1.5, oy + 3.2, 0.66, "FaVideo", { fill: C.accent2, iconHex: "FFFFFF" });
    await k.chip(s, ox + 3.7, oy + 3.2, 0.66, "FaVideo", { fill: C.accent2, iconHex: "FFFFFF" });
    k.text(s, "카메라는 이쪽에서만 ✓", { x: ox + 0.5, y: oy + 4.0, w: ow - 1.0, h: 0.35, fontSize: 14, bold: true, color: "8FD1AE", align: "center" });
    await k.chip(s, ox + 2.62, oy + 0.35, 0.6, "FaTimes", { fill: C.accent3, iconHex: "FFFFFF" });
    k.text(s, "넘어가면 방향이 뒤집혀 보여요", { x: ox + 3.35, y: oy + 0.45, w: 2.4, h: 0.4, fontSize: 11.5, color: "E8A49C" });
    const items = [["180", "180도 규칙", "두 사람 사이 선을 넘지 않기"], ["30", "30도 규칙", "다시 찍을 땐 30도 이상, 또는 샷 크기를 바꾸기"], ["B", "B롤을 넉넉히", "손 · 소품 · 공간 컷. 편집에서 자른 자리를 덮어 줘요"]];
    items.forEach(([n, h, b], i) => {
      const x = M + 6.2, w = CW - 6.2, y = 1.75 + i * 1.65;
      k.card(s, x, y, w, 1.5);
      k.badge(s, x + 0.25, y + 0.4, 0.7, n, { fontSize: 13 });
      k.text(s, h, { x: x + 1.15, y: y + 0.25, w: w - 1.35, h: 0.4, fontSize: 17, bold: true });
      k.text(s, b, { x: x + 1.15, y: y + 0.7, w: w - 1.35, h: 0.65, fontSize: 13, color: C.accent5 });
    });
  }
  {
    const s = content("소리는 영상의 절반", `[15:56] 시청자는 흐린 화면은 참아도 안 들리는 소리는 못 참습니다.
폰과 입 사이 한 뼘 / 에어컨 · 냉장고 · 복도 소리 피하기 / 끝에 룸톤 10초(편집에서 빈 곳 메꾸기) / 현장음 살리기(음악으로 다 덮지 않기). 이어폰 마이크나 핀마이크가 있으면 훨씬 깨끗합니다.`);
    const items = [["FaRulerHorizontal", "한 뼘 거리", "폰과 입 사이 한 뼘. 멀수록 방 울림"], ["FaVolumeMute", "조용한 자리", "에어컨 · 냉장고 · 복도 소리 피하기"], ["FaClock", "룸톤 10초", "끝에 말없이 10초 녹음 → 편집에서 빈 곳 메꾸기"], ["FaTint", "현장음 살리기", "발소리 · 물소리. 음악으로 다 덮지 않기"]];
    const cw = (CW - 3 * 0.3) / 4;
    for (let i = 0; i < items.length; i++) await k.featureCard(s, M + i * (cw + 0.3), 1.8, cw, 3.6, { icon: items[i][0], head: items[i][1], body: items[i][2], bodySize: 14 });
    k.takeaway(s, "흐린 화면은 참아도, 안 들리는 소리는 못 참는다", 5.75);
  }
  {
    const s = content("강사 장비 체험: 언제 쓰면 좋은가", `[16:00–16:10] 강사 장비를 보여 주고 크루별로 2분씩 돌려 쓰기(나머지 크루는 5샷 시퀀스 계획).
삼각대: 고정 샷 · 혼자 찍는 토크 · 타임랩스. 무선 핀마이크: 인터뷰 · 토크 · 내레이션(폰 마이크와 같은 문장으로 비교). 짐벌: 걷거나 따라가며, 대신 무겁고 세팅 시간이 들어요. "사기 전에 자세부터."`);
    const items = [["FaCamera", "삼각대", "고정 샷 · 혼자 찍는 토크 · 타임랩스. 미니 삼각대도 충분"], ["FaMicrophone", "무선 핀마이크", "인터뷰 · 토크 · 내레이션. 폰 마이크와 같은 문장으로 비교"], ["FaRunning", "짐벌", "걷거나 따라가며 찍을 때. 무겁고 세팅 시간이 들어요"]];
    const cw = (CW - 2 * 0.3) / 3;
    for (let i = 0; i < items.length; i++) await k.featureCard(s, M + i * (cw + 0.3), 1.8, cw, 3.6, { icon: items[i][0], head: items[i][1], body: items[i][2], bodySize: 14.5 });
    k.takeaway(s, "크루별로 2분씩 돌려 써 보기. 장비는 사기 전에 자세부터", 5.75);
  }
  {
    const s = content("실습 · 학교 공간에서 5샷 시퀀스 (20분)", `[16:10–16:30] 짝 중 한 사람이 행동하고 한 사람이 찍기 → 바꾸기. 행동은 내 아이템과 관련 있으면 더 좋아요. 컷마다 7초 이상, 두 번씩, 앞뒤 2초 멈춤, 모두 AE/AF 잠금. 크루 기록 담당은 이 장면을 찍어 두기.`);
    k.text(s, "짝이 행동하고, 나는 찍고 → 바꾸기", { x: M, y: 1.75, w: 6.5, h: 0.4, fontSize: 17, bold: true });
    k.checklist(s, ["① 손 클로즈업", "② 얼굴 클로즈업", "③ 와이드", "④ 어깨너머", "⑤ 특이한 앵글", "컷마다 7초 이상 · 두 번씩 · 앞뒤 2초", "모든 컷 AE/AF 잠금"], { x: M, y: 2.3, w: 6.3, h: 4.0, fontSize: 16 });
    const rx = 7.35, rw = CW - 6.6;
    k.card(s, rx, 1.75, rw, 2.35);
    k.text(s, "행동 예시 (내 아이템이면 더 좋아요)", { x: rx + 0.3, y: 1.92, w: rw - 0.6, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
    k.text(s, "디저트 포장하기 · 화장품 바르기\n노트북으로 작업하기 · 커피 내리기\n반려견 사진 넘겨 보기", { x: rx + 0.3, y: 2.35, w: rw - 0.6, h: 1.5, fontSize: 14.5 });
    k.card(s, rx, 4.3, rw, 1.85, { fill: C.text2 });
    k.text(s, "크루 기록 담당", { x: rx + 0.3, y: 4.45, w: rw - 0.6, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
    k.text(s, "크루가 촬영하는 모습을 찍어 두기\n→ 6회차 우리 반 브이로그 재료", { x: rx + 0.3, y: 4.9, w: rw - 0.6, h: 1.0, fontSize: 14.5, color: C.background1 });
  }

  // ───────────────────────── 7교시 ─────────────────────────
  divider(7, "촬영 리뷰와 공유", "16:40–17:30  ·  보고, 고르고, 남기기", "img08", `[16:40–17:30] 목표: 오늘 찍은 것을 드라이브에 모으고, 크루 리뷰로 '고르는 눈'을 기르고, 크루 베스트 컷 선정. 업로드 10분 → 크루 리뷰 20분 → 베스트 컷 공유 10분 → 정리 · 과제 10분.`);
  {
    const s = content("크루 리뷰: 찍고, 보고, 고르기", `[16:40–17:10] 1) 드라이브: 공유 폴더 → 크루 폴더 → 내 이름 → 1회차(파일이 크면 폰 앱에서 바로) 2) 한 사람씩 5샷 시퀀스를 크루에게, 첫 시청자가 먼저 칭찬 1 + 제안 1 3) 체크: 세로 · 흔들림 · 밝기 출렁임 · 초점 · 소리 4) 크루 베스트 컷 1개 → 2회차 첫 업로드 재료. 크루 이름도 이때.`);
    const steps = [["1", "드라이브에 올리기", "크루 폴더 → 내 이름 → 1회차"], ["2", "크루에게 보여 주기", "첫 시청자가 먼저 칭찬 1 + 제안 1"], ["3", "체크하기", "세로 · 흔들림 · 밝기 출렁임 · 초점 · 소리"], ["4", "크루 베스트 컷 고르기", "2회차 첫 업로드 재료 + 크루 이름 정하기"]];
    steps.forEach(([n, h, b], i) => k.row(s, M, 1.75 + i * 1.1, CW, 0.96, { n, head: h, body: b, headW: 3.4 }));
    k.text(s, "편집은 3회차부터. 오늘은 보고 고르는 눈을 기르는 날", { x: M, y: 6.3, w: CW, h: 0.32, fontSize: 13, color: C.accent5 });
  }
  {
    const s = content("오늘 배운 다섯 가지", `[17:10] 한 줄씩 짚고, 크루에서 "오늘 제일 기억에 남는 것" 하나씩.`);
    const items = [["제작 공정", "기획 → 프리프로덕션 → 촬영 → 편집 → 마스터링 → 발행 → 분석"], ["노출과 색", "조리개 · 셔터 · ISO + 화이트밸런스. 조리개는 숫자가 작을수록 밝다"], ["영상 세팅", "1080p 30fps · 셔터 2배 · HDR과 HEVC 끄기 · AE/AF 잠금"], ["화면의 언어", "샷 크기 · 앵글 · 구도 · 빛. 영어 이름은 4회차 AI 프롬프트가 된다"], ["컷과 소리", "5샷 시퀀스 · 180도 · 30도 · B롤 · 한 뼘 거리 · 룸톤"]];
    items.forEach(([h, b], i) => k.row(s, M, 1.75 + i * 0.95, CW, 0.82, { n: i + 1, head: h, body: b, headW: 2.6 }));
  }
  {
    const s = content("다음 시간까지 · 10/30 (금)", `[17:15] 과제는 단톡방에도. 제출은 드라이브 '1회차 과제'.
1) 마음에 드는 콘텐츠 10편 저장 + 왜 좋은지 한 줄씩 → 2회차 레퍼런스 해부 재료. 2) "내가 만들고 싶은 채널" 한 줄. 3) CapCut PC 설치가 안 된 사람은 안내대로. 선택: 5샷 시퀀스를 내 아이템으로 하나 더.`);
    const items = [["FaBookmark", "콘텐츠 10편 저장", "인스타 · 유튜브 · 틱톡 어디든. 왜 좋은지 한 줄씩"], ["FaPen", "만들고 싶은 채널 한 줄", "누구에게, 무엇을 보여 주고 싶은지"], ["FaDownload", "CapCut PC 설치", "오늘 못 한 사람만, 안내대로"]];
    const cw = (CW - 2 * 0.3) / 3;
    for (let i = 0; i < items.length; i++) {
      const x = M + i * (cw + 0.3);
      k.text(s, String(i + 1).padStart(2, "0"), { x, y: 1.75, w: 1, h: 0.5, fontSize: 22, bold: true, color: C.accent1 });
      await k.featureCard(s, x, 2.3, cw, 3.2, { icon: items[i][0], head: items[i][1], body: items[i][2], bodySize: 14.5 });
    }
    k.takeaway(s, "선택: 5샷 시퀀스를 내 아이템으로 하나 더  ·  제출은 드라이브 '1회차 과제'", 5.85);
  }
  {
    const s = content("2회차 예고 · 기획하는 머리", `[17:20] 2회차: 아이템 찾기 → 레퍼런스 해부 → 채널 콘셉트 → 기획안 · 대본 → 스토리보드 → 그리고 유튜브 채널을 엽니다. 강사도 같은 날 새 채널을 엽니다. "오늘 고른 베스트 컷이 첫 영상이 될 수도 있어요."`);
    k.card(s, M, 1.75, CW, 2.1, { fill: C.text2 });
    k.text(s, "10월 30일, 우리는 각자 채널을 엽니다", { x: M + 0.4, y: 1.95, w: CW - 0.8, h: 0.8, fontSize: 28, bold: true, color: C.accent1, valign: "middle" });
    k.text(s, "강사도 같은 날, 여러분과 함께 새 채널을 엽니다", { x: M + 0.4, y: 2.8, w: CW - 0.8, h: 0.5, fontSize: 17, color: C.background1, valign: "middle" });
    const flow = ["아이템 찾기", "레퍼런스 해부", "채널 콘셉트", "기획안 · 대본", "스토리보드", "채널 개설"];
    const fw = (CW - 5 * 0.3) / 6;
    flow.forEach((t, i) => {
      const x = M + i * (fw + 0.3);
      k.card(s, x, 4.25, fw, 1.05, { fill: i === 5 ? C.accent6 : C.background2 });
      k.text(s, String(i + 1).padStart(2, "0"), { x: x + 0.18, y: 4.33, w: fw - 0.3, h: 0.3, fontSize: 11, bold: true, color: C.accent2 });
      k.text(s, t, { x: x + 0.18, y: 4.62, w: fw - 0.3, h: 0.55, fontSize: 14.5, bold: true, valign: "middle" });
      if (i < flow.length - 1) k.arrow(s, x + fw + 0.03, 4.78, 0.24);
    });
    k.takeaway(s, "오늘 고른 크루 베스트 컷이 여러분 채널의 첫 영상이 될 수도 있어요", 5.75);
  }
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: sec });
    fullBleed(s, img.img01);
    s.addText("AI는 장비,\n연출은 당신", { placeholder: "title" });
    s.addText("오늘 기른 '보는 눈'이 6번의 수업 내내 모든 것의 바닥이 됩니다", { placeholder: "body" });
    s.addNotes(`[17:25] 마무리 인사. 크루장은 크루 전원이 드라이브 업로드를 마쳤는지 확인하고 해산. 크루 트리 현황판에 첫 오너먼트(베스트 컷) 붙이기.
수업 후: 요약 영상(진행안의 대본), 단톡방에 핸드북 1장 · 치트시트 · 과제 공지.`);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
