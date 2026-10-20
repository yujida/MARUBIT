// 1회차 (10/22) 슬라이드 생성: node build/session1_slides.js <출력 경로>
const path = require("path");
const { THEME, HEX, newDeck, makeKit } = require("./lib/deck");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "01", "1회차_보는눈_슬라이드.pptx");
// 수강생 이름은 공개 레포에 두지 않는다: private/crews.json이 있으면 그 명단을, 없으면 빈칸을 넣는다.
function loadCrews() {
  const fs = require("fs");
  const file = path.join(__dirname, "..", "private", "crews.json");
  if (!process.env.PUBLIC_BUILD && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const blank = ["(크루장)", "(기술 도우미)", "(기록)", "(첫 시청자)", "", ""];
  return [1, 2, 3, 4].map((n) => ({ name: `크루 ${n}`, members: blank.map((r) => `________ ${r}`.trim()) }));
}
const FOOTER = "AI콘텐츠 크리에이터 실무 · 촬영편집 1회차 — 보는 눈";

async function main() {
  const { pres, C } = newDeck({ title: "촬영편집 1회차 — 보는 눈", footer: FOOTER });
  const k = makeKit(pres, C);
  const { S } = k;
  let sec = "시작";

  const content = (title, notes) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    s.addText(title, { placeholder: "title" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  const section = async (n, title, sub, notes) => {
    sec = `${n}교시 ${title}`;
    pres.addSection({ title: sec });
    const s = pres.addSlide({ masterName: "SECTION", sectionTitle: sec });
    await k.ornament(s, 0.95, 2.6, 1.6, C.accent1, n, { fontSize: 60, textColor: C.text2 });
    k.text(s, "교시", { x: 0.95, y: 4.3, w: 1.6, h: 0.4, align: "center", fontSize: 16, color: C.accent6 });
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

  // ───────────── 시작 ─────────────
  pres.addSection({ title: sec });
  {
    const s = pres.addSlide({ masterName: "TITLE", sectionTitle: sec });
    s.addText("1회차 — 보는 눈", { placeholder: "title" });
    s.addText("프로처럼 보고, 정석대로 찍는 날", { placeholder: "body" });
    k.text(s, "AI콘텐츠 크리에이터 실무 · 촬영편집", { x: 0.9, y: 1.45, w: 11, h: 0.5, fontSize: 18, color: C.accent6 });
    k.text(s, "2026. 10. 22 (목) · 10:00–17:30 · 1공학관", { x: 0.9, y: 6.3, w: 11, h: 0.4, fontSize: 14, color: C.accent6 });
    // 작은 트리 장식
    s.addShape(S.triangle, { x: 10.6, y: 0.7, w: 1.6, h: 1.9, fill: { color: C.accent2 }, line: { type: "none" } });
    s.addShape(S.rect, { x: 11.25, y: 2.6, w: 0.3, h: 0.35, fill: { color: C.accent5 }, line: { type: "none" } });
    await k.ornament(s, 11.25, 0.35, 0.3, C.accent1, null);
    await k.ornament(s, 11.05, 1.6, 0.22, C.accent3, null);
    await k.ornament(s, 11.6, 2.05, 0.22, C.accent4, null);
    s.addNotes(`
[10:00 시작 전] 화면에 이 슬라이드를 띄워 두고 입장하는 대로 크루 자리로 안내합니다(크루 편성표 출력해 책상 위에).
첫 멘트: "오늘부터 6번, 여러분은 각자 자기 채널 하나를 키웁니다. 첫날인 오늘은 '보는 눈'을 만드는 날이에요."
`);
  }
  {
    const s = content("오늘의 시간표", `
오늘 하루 흐름을 30초 안에 훑습니다. "오전엔 큰 그림, 오후엔 카메라 원리와 실습"이라고만 말하고 넘어가세요.
매 교시는 50분 수업 + 10분 휴식. 점심은 11:50–12:40.
`);
    k.table(s, [
      ["교시", "시간", "하는 일", "남는 것"],
      ["1", "10:00–10:50", "OT · 크루 · 세팅 · 한 줄 자기소개", "한 줄 소개, 크루와 짝"],
      ["2", "11:00–11:50", "프로는 이렇게 기획하고 만든다 (윤성원 PD 사례)", "프로 제작 공정 지도"],
      ["점심", "11:50–12:40", "", ""],
      ["3", "12:40–13:30", "카메라의 원리 ① 사진: 노출 · 색 · 초점", "설정별 비교 사진"],
      ["4", "13:40–14:30", "카메라의 원리 ② 영상: 프레임 · 셔터 · 세팅", "내 폰 세팅 완료"],
      ["5", "14:40–15:30", "화면의 언어와 빛: 샷 · 앵글 · 구도 · 조명", "구도 사진 + AI 피드백"],
      ["6", "15:40–16:30", "움직임 · 컷 · 소리 + 장비 체험", "5샷 시퀀스"],
      ["7", "16:40–17:30", "촬영 리뷰 · 크루 베스트 컷 · 과제", "베스트 컷"],
    ], { x: 0.6, y: 1.5, w: 12.1, colW: [0.9, 1.7, 6.0, 3.5], rowH: 0.5 });
  }

  // ───────────── 1교시 ─────────────
  await section(1, "OT와 과정 지도", "10:00–10:50 · 우리가 6번 동안 무엇을 키우는지, 누구와 함께 가는지", `
[10:00–10:50] 목표: 과정 전체 그림 + 크루 결성 + 수업 도구 세팅 + 첫 기획 연습(한 줄 소개).
시간 배분: 과정 지도 10분 → 크루 10분 → 세팅 15분 → 한 줄 소개 15분.
`);
  {
    const s = content("6번의 수업, 나무 한 그루", `
[10:02] 과정 전체를 크리스마스 트리 한 그루로 설명합니다.
- 화분(1회): 보는 눈. 오늘 배우는 카메라와 화면의 언어가 모든 것의 바닥입니다.
- 줄기(2회 + 3주 과제): 내 채널 기획안. 2회차에 유튜브 채널을 엽니다.
- 오너먼트(3·4회): 숏폼, 브이로그, 정보성, 스트리머형, AI 영상을 하나씩 달아요.
- 별(5회): 브랜딩과 후킹으로 대표작을 다시 만듭니다.
- 점등식(6회 12/10): 우리끼리 채널을 처음부터 다시 보는 상영회.
멘트: "연습용으로 만들고 버리는 영상은 없습니다. 전부 여러분 채널에 남아요."
`);
    // 트리 그림
    const cx = 3.6;
    s.addShape(S.triangle, { x: cx - 2.1, y: 1.85, w: 4.2, h: 3.5, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "tree" });
    s.addShape(S.rect, { x: cx - 0.3, y: 5.35, w: 0.6, h: 0.55, fill: { color: C.accent5 }, line: { type: "none" } });
    s.addShape(S.trapezoid, { x: cx - 0.85, y: 5.9, w: 1.7, h: 0.6, fill: { color: C.text2 }, line: { type: "none" }, flipV: true });
    s.addShape(S.star5, { x: cx - 0.35, y: 1.4, w: 0.7, h: 0.66, fill: { color: C.accent1 }, line: { type: "none" } });
    await k.ornament(s, cx - 0.2, 2.9, 0.4, C.accent3, null);
    await k.ornament(s, cx - 1.0, 3.9, 0.4, C.accent4, null);
    await k.ornament(s, cx + 0.6, 3.9, 0.4, C.accent4, null);
    await k.ornament(s, cx - 1.5, 4.7, 0.4, C.accent4, null);
    await k.ornament(s, cx + 1.1, 4.7, 0.4, C.accent4, null);
    const rows = [
      ["별", "5회 · 12/1", "브랜딩·후킹으로 대표작 리뉴얼", C.accent1],
      ["오너먼트", "3·4회 · 11/19, 11/26", "숏폼 · 브이로그 · 정보성 · 스트리머형 · AI 영상", C.accent3],
      ["줄기", "2회 · 10/30 + 3주 과제", "채널 기획안 · 채널 개설 · 스토리보드", C.accent5],
      ["화분", "1회 · 오늘", "보는 눈: 촬영 이론 + 프로 공정", C.text2],
      ["점등식", "6회 · 12/10", "채널을 처음부터 다시 보는 상영회", C.accent2],
    ];
    rows.forEach(([name, when, what, col], i) => {
      const y = 1.55 + i * 0.98;
      k.card(s, 6.6, y, 6.1, 0.82);
      s.addShape(S.ellipse, { x: 6.8, y: y + 0.21, w: 0.4, h: 0.4, fill: { color: col }, line: { type: "none" } });
      k.text(s, `${name}  ·  ${when}`, { x: 7.4, y: y + 0.1, w: 5.2, h: 0.35, fontSize: 15, bold: true, color: C.text2 });
      k.text(s, what, { x: 7.4, y: y + 0.44, w: 5.2, h: 0.32, fontSize: 13 });
    });
  }
  {
    const s = content("12월 10일, 여러분 손에 남는 것", `
[10:05] 결과물을 구체적으로 약속합니다. 숫자로 말하면 동기부여가 됩니다.
"수료할 때 각자 유튜브 채널 하나, 그 안에 영상 7편 이상, 기획안, 제작 노트가 남습니다. 취업 포트폴리오로 바로 씁니다."
`);
    const items = [
      ["FaYoutube", C.accent3, "내 유튜브 채널", "2회차에 개설. 매 회차 영상이 쌓여요"],
      ["FaFilm", C.accent4, "영상 7편 이상", "숏폼부터 브이로그, AI 영상, 대표작까지"],
      ["FaClipboardList", C.accent2, "채널 기획안", "누구에게, 무엇을, 왜. 스토리보드 포함"],
      ["FaPenNib", C.accent1, "제작 노트", "사람이 한 것 / AI가 도운 것"],
    ];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 3.08, 1.6, 2.86, 3.3, { icon: ic, color: col, head, body, bodySize: 14 });
    }
    k.note(s, "연습용으로 만들고 버리는 영상은 없습니다. 전부 여러분 채널에 남아 6회차에 처음부터 다시 봅니다", { y: 5.4 });
  }
  {
    const s = content("매 회차 받아 가는 것", `
[10:07] 수업이 끝날 때마다 단톡방과 드라이브로 나눠 주는 것들입니다.
- 전자책: 회차마다 1장씩, 6회차에 완성본
- 프롬프트북: 그대로 복사해 쓰는 완성형 + 내 것으로 채우는 빈칸형
- 요약 영상: 수업 다음 날 1~2분짜리
- 양식·치트시트: 기획안, 스토리보드, 폰 세팅표 등
"복습은 이걸로 하시면 됩니다. 놓친 부분이 있어도 괜찮아요."
`);
    const items = [
      ["FaBook", C.accent2, "전자책 1장씩", "수업 내용 + 더 깊은 설명 + 실무 팁. 6회차에 완성본"],
      ["FaMagic", C.accent4, "프롬프트북", "복사해 쓰는 완성형 + 내 것으로 채우는 빈칸형"],
      ["FaPlayCircle", C.accent3, "요약 영상", "수업 다음 날 1~2분, 그날 핵심 3가지"],
      ["FaFileAlt", C.accent1, "양식 · 치트시트", "폰 세팅표, 촬영 용어집, 기획안, 스토리보드"],
    ];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + (i % 2) * 6.1, 1.55 + Math.floor(i / 2) * 2.45, 6.0, 2.25, { icon: ic, color: col, head, body });
    }
  }
  {
    const s = content("AI는 장비, 연출은 사람", `
[10:08] 과정 전체의 원칙. AI를 최대한 쓰되, 결정과 책임은 사람에게 있다는 것.
- 매 실습마다 워크북에 "AI가 한 것 / 내가 고친 것"을 한 줄씩 적습니다. 이게 6회차 제작 노트가 됩니다.
멘트: "ChatGPT와 CapCut 유료 계정을 끝까지 쓸 겁니다. 대신 마지막에 고르고 고치는 건 여러분이에요."
`);
    k.card(s, 0.6, 1.55, 5.95, 4.4, { fill: C.background2 });
    k.card(s, 6.75, 1.55, 5.95, 4.4, { fill: C.background2 });
    await k.ornament(s, 0.9, 1.8, 0.7, C.text2, null, { icon: "FaUser" });
    await k.ornament(s, 7.05, 1.8, 0.7, C.accent4, null, { icon: "FaRobot" });
    k.text(s, "사람의 몫", { x: 1.8, y: 1.9, w: 4, h: 0.5, fontSize: 22, bold: true, color: C.text2 });
    k.text(s, "AI의 몫", { x: 7.95, y: 1.9, w: 4, h: 0.5, fontSize: 22, bold: true, color: C.text2 });
    k.bullets(s, ["정하기 — 무엇을, 누구에게, 왜", "현장 — 진짜 장소·사람·감정을 찍기", "고르기 — 고르고, 버리고, 순서 정하기", "책임 — 초상권 · 저작권 · AI 표시"], { x: 0.95, y: 2.75, w: 5.3, h: 3.0, fontSize: 17 });
    k.bullets(s, ["초안 — 아이디어 · 대본 · 자막 · 캡션", "반복 작업 — 받아쓰기 · 보정 · 잡음 제거", "불가능한 장면 — 찍을 수 없는 장면 만들기", "두 번째 의견 — 구도·흐름 피드백"], { x: 7.1, y: 2.75, w: 5.3, h: 3.0, fontSize: 17 });
    k.note(s, "매 실습마다 워크북에 \"AI가 한 것 / 내가 고친 것\"을 한 줄씩 → 6회차 제작 노트가 됩니다", { y: 6.15 });
  }
  {
    const s = content("우리는 크루로 움직입니다", `
[10:10] 크루 제도 소개. 핵심 메시지: "영상은 각자 만들고, 배우는 건 같이. 누구도 뒤처지지 않게, 누구도 혼자 달리지 않게."
- 4개 크루, 5~6명. 크루마다 경험자와 입문자가 섞여 있고, 짝이 정해져 있습니다.
- 역할은 매 회차 돌아갑니다(2회차부터 명단 순서로 한 칸씩).
- 막힘 규칙: 3분 막히면 짝 → 5분 더 막히면 기술 도우미 → 그래도 안 되면 "강사 호출 카드"를 책상 위에 세우기.
- 개인 순위는 없습니다. 매 회차 목표는 "크루 전원 완료".
`);
    const roles = [
      ["FaFlag", C.accent2, "크루장", "시간·진행 체크, 크루 전원 완료 확인"],
      ["FaTools", C.accent4, "기술 도우미", "CapCut·AI 질문 1차 해결"],
      ["FaVideo", C.accent3, "기록", "수업 장면 촬영 → 6회차 브이로그 재료"],
      ["FaEye", C.accent1, "첫 시청자", "크루 영상을 먼저 보고 칭찬 1 + 제안 1"],
    ];
    for (let i = 0; i < roles.length; i++) {
      const [ic, col, head, body] = roles[i];
      await k.iconCard(s, 0.6 + i * 3.08, 1.5, 2.86, 2.75, { icon: ic, color: col, head, body, bodySize: 13 });
    }
    k.text(s, "막혔을 때", { x: 0.6, y: 4.5, w: 3, h: 0.4, fontSize: 18, bold: true, color: C.text2 });
    const steps = [["3분", "짝에게"], ["+5분", "기술 도우미"], ["그래도", "강사 호출 카드"]];
    for (let i = 0; i < steps.length; i++) {
      const x = 0.6 + i * 4.1;
      k.card(s, x, 5.0, 3.5, 0.95, { fill: C.background2 });
      await k.ornament(s, x + 0.18, 5.12, 0.7, i === 2 ? C.accent3 : C.accent2, steps[i][0], { fontSize: 13 });
      k.text(s, steps[i][1], { x: x + 1.05, y: 5.0, w: 2.3, h: 0.95, fontSize: 17, bold: true, color: C.text2, valign: "middle" });
      if (i < 2) k.arrowRight(s, x + 3.55, 5.47, 0.5);
    }
    k.text(s, "개인 순위는 없습니다. 매 회차 목표는 \"크루 전원 완료\"", { x: 0.6, y: 6.15, w: 12.1, h: 0.4, fontSize: 15, color: C.accent5 });
  }
  {
    const s = content("크루를 소개합니다", `
[10:13] 크루별로 서로 인사(이름 + 만들고 싶은 것 한 마디). 크루 이름은 오늘 7교시 전까지 크루가 직접 짓기(예: 별·종·방울·리본).
괄호는 1회차 역할. 짝은 같은 색 표시된 사람끼리가 아니라 출력한 편성표 기준으로 안내하세요.
※ 설문 자기평가로 짠 1차 편성입니다. 오늘 실습을 보고 1~2명 조정할 수 있다고 미리 말해 두세요.
`);
    const cols = [C.accent2, C.accent4, C.accent3, C.accent1];
    const crews = loadCrews().map((c, i) => [c.name, cols[i % 4], c.members]);
    for (let i = 0; i < crews.length; i++) {
      const [name, col, members] = crews[i];
      const x = 0.6 + i * 3.08;
      k.card(s, x, 1.5, 2.86, 4.55);
      await k.ornament(s, x + 0.25, 1.72, 0.62, col, String(i + 1), { fontSize: 20 });
      k.text(s, name, { x: x + 1.0, y: 1.78, w: 1.7, h: 0.5, fontSize: 20, bold: true, color: C.text2, valign: "middle" });
      k.bullets(s, members, { x: x + 0.3, y: 2.6, w: 2.4, h: 3.3, fontSize: 15, paraSpaceAfter: 6 });
    }
    k.text(s, "크루 이름은 오늘 7교시 전까지 크루가 직접 짓습니다", { x: 0.6, y: 6.2, w: 12.1, h: 0.4, fontSize: 15, color: C.accent5 });
  }
  {
    const s = content("지금 함께 세팅해요 (15분)", `
[10:20–10:35] 크루장이 크루 전원 완료를 확인하고 손을 듭니다. 기술 도우미는 막힌 사람부터.
- 단톡방: QR 또는 링크(수업 전에 개설해 두기). 공지·과제·질문용.
- 구글 드라이브: 공유 폴더 → 크루 폴더 → 내 이름 폴더. 오늘 찍은 건 7교시에 여기로 올립니다.
- CapCut PC: PC마다 설치 상태가 다릅니다. 실행해 보고 안 되면 설치 안내 페이지대로(오늘 설치까지 못 하면 과제로).
- 유료 계정: ChatGPT와 CapCut에 로그인되는지 확인(10/21부터 사용 가능).
- 촬영 동의: 수업 장면을 찍어 6회차 브이로그에 쓰는 것에 대한 동의를 받습니다. 원하지 않는 사람은 얼굴이 나오지 않게 찍는다고 안내.
`);
    const items = [
      ["FaComments", C.accent2, "단톡방 입장", "공지 · 과제 · 질문"],
      ["FaGoogleDrive", C.accent4, "드라이브 폴더", "크루 폴더 → 내 이름 폴더"],
      ["FaDesktop", C.accent3, "CapCut PC 확인", "실행되는지, 안 되면 설치 안내대로"],
      ["FaKey", C.accent1, "유료 계정 로그인", "ChatGPT · CapCut"],
      ["FaHandshake", C.accent5, "촬영 동의", "수업 장면 → 6회차 브이로그"],
    ];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 2.46, 1.6, 2.3, 3.2, { icon: ic, color: col, head, body, headSize: 16, bodySize: 13 });
    }
    k.note(s, "크루장은 크루 전원이 끝나면 손을 들어 주세요. 기술 도우미는 막힌 사람부터", { y: 5.25 });
  }
  {
    const s = content("첫 기획: 이름 대신, 나를 설명하는 한 줄", `
[10:35–10:50] 오늘의 첫 기획 연습이자, 2회차 채널 소개글의 초안입니다.
윤성원 PD 원칙 1번 "나를 모르는 사람 기준"을 미리 맛보는 활동. 그는 아이돌을 이름 대신 "사투리 쓰는 아이돌", "경주에서 올라온 아이돌"처럼 사회적 특성으로 소개했습니다(위버스 매거진 인터뷰).
진행: 3분 쓰기 → 짝에게 읽기("보고 싶다/아니다") → 3번 고쳐 쓰기 → 크루 안에서 한 명씩 발표.
AI는 후보만. 내 이야기와 맞는 단어만 가져오기. 워크북 p.2에 적기.
말하기가 부담인 사람은 크루 안에서 글로 보여줘도 됩니다.
`);
    k.card(s, 0.6, 1.5, 12.1, 1.2, { fill: C.text2 });
    k.text(s, "___ 한  ___ 의  ___", { x: 0.9, y: 1.5, w: 11.5, h: 1.2, fontSize: 34, bold: true, color: C.accent1, valign: "middle", align: "center" });
    k.text(s, "이런 느낌으로", { x: 0.6, y: 2.95, w: 5.8, h: 0.4, fontSize: 17, bold: true, color: C.text2 });
    k.bullets(s, ["10년 만에 다시 출근하는 엄마의 첫 출근 준비", "요리 30년 차가 처음 찍는 유튜브", "퇴근 후 30분, 동네를 걷는 직장인의 산책 기록"], { x: 0.6, y: 3.45, w: 5.8, h: 2.0, fontSize: 16 });
    k.card(s, 6.75, 2.95, 5.95, 2.6);
    k.text(s, "ChatGPT에게", { x: 7.0, y: 3.1, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: C.accent4 });
    k.text(s, "나는 [하는 일]이고 [좋아하는 것]을 좋아해. 이름 없이 나를 소개하는 한 줄 후보 10개를 줘. 처음 보는 사람이 \"보고 싶다\"고 느끼게.", { x: 7.0, y: 3.55, w: 5.45, h: 1.9, fontSize: 15 });
    k.note(s, "3분 쓰기 → 짝에게 읽기 → 3번 고쳐 쓰기. 최종 한 줄은 내가 고릅니다 (워크북 p.2)", { y: 5.85 });
  }

  // ───────────── 2교시 ─────────────
  await section(2, "프로는 이렇게 기획하고 만든다", "11:00–11:50 · 윤성원 PD(스튜디오 솔파)의 채널로 보는 프로의 제작 공정", `
[11:00–11:50] 목표: 프로 제작 공정 7단계를 실제 사례 위에서 이해하기.
시간: 도입 5분 → 안원잘부 15분 → 존이냐박이냐 10분 → ODG 10분 → 공정 완성(마스터링·규격) 10분.
사례 출처는 문서 "윤성원 PD 사례" 탭 참고. 영상은 수업 전에 틀 장면을 표시해 두세요.
`);
  statement("리센느를 아는 사람?", "몰라도 \"곰\"이나 \"거제\" 영상은 본 적 있지 않나요", `
[11:00] 손 들기. 아이돌 리센느를 아는 사람은 적을 겁니다. 그런데 "곰 만났을 때 대처법", "거제" 밈은 본 사람이 꽤 있을 거예요.
→ "기획은 그 사람을 모르는 사람에게까지 닿게 만드는 일입니다." 이 질문으로 2교시를 엽니다.
(곰 영상 10~20초 재생)
`);
  {
    const s = content("프로 제작 공정 7단계", `
[11:05] 프로는 이 7단계를 거칩니다. 6번의 수업도 이 순서로 갑니다. 오늘은 3단계 '촬영'의 기초를 다집니다.
- 기획: 누구에게, 무엇을, 왜
- 프리프로덕션: 대본, 콘티(스토리보드), 장소, 의상·소품, 장비
- 촬영: 빛, 소리, 샷, 커버리지
- 편집: 가편집 → 본편집, 자막, 음악
- 마스터링: 소리 크기, 색, 오탈자, 내보내기 규격, 최종 검수
- 발행: 제목, 썸네일, 설명, 공개 범위
- 분석: 클릭률, 시청 지속률, 댓글 → 다음 기획
`);
    const steps = [
      ["기획", "누구에게·무엇을·왜", C.accent2, "2회"],
      ["프리\n프로덕션", "대본·콘티·장소·소품", C.accent2, "2회"],
      ["촬영", "빛·소리·샷", C.accent3, "오늘"],
      ["편집", "컷·자막·음악", C.accent4, "3·4회"],
      ["마스터링", "음량·색·규격·검수", C.accent4, "5회"],
      ["발행", "제목·썸네일·공개", C.accent1, "2회"],
      ["분석", "지표 → 다음 기획", C.accent1, "5회"],
    ];
    const bw = 1.52, gap = 0.25;
    for (let i = 0; i < steps.length; i++) {
      const [name, desc, col, when] = steps[i];
      const x = 0.6 + i * (bw + gap);
      const now = when === "오늘";
      k.card(s, x, 1.8, bw, 3.0, { fill: now ? C.accent6 : C.background2, line: now ? C.accent1 : undefined, lineW: 2 });
      await k.ornament(s, x + (bw - 0.6) / 2, 2.0, 0.6, col, i + 1, { fontSize: 18 });
      k.text(s, name, { x: x + 0.05, y: 2.75, w: bw - 0.1, h: 0.75, fontSize: 16, bold: true, color: C.text2, align: "center", valign: "middle" });
      k.text(s, desc, { x: x + 0.1, y: 3.55, w: bw - 0.2, h: 0.75, fontSize: 12, align: "center" });
      k.text(s, when, { x: x + 0.1, y: 4.35, w: bw - 0.2, h: 0.3, fontSize: 12, bold: true, color: now ? C.accent3 : C.accent5, align: "center" });
      if (i < steps.length - 1) k.arrowRight(s, x + bw + 0.02, 3.3, gap - 0.04);
    }
    k.note(s, "오늘은 3단계 '촬영'의 기초. 아래 숫자는 각 단계를 깊게 배우는 회차입니다", { y: 5.3 });
  }
  {
    const s = content("사례 1 · 안원잘부는 거절당한 기획안에서 시작됐다", `
[11:10–11:25] 출처: iMBC 연예(2026.7.8, 미미미누 채널 출연분), 위버스 매거진 인터뷰.
흐름을 프로 공정 지도에 얹어서 이야기하세요.
1) 기획: 회사 외부 프로젝트로 기업에 낼 기획안에 원이를 호스트로 제안 → 채택 안 됨. 윤 PD: "이거 안 되면 내가 해야겠다"
2) 촬영: 시간이 없어서 "되게 효율적으로 찍으려고 했다"
3) 발행: 첫 영상은 '나의 연수 아저씨' 이선민과 함께 → 약 20만 회(이전 맥락을 이어받음)
4) 성장: '곰' 영상으로 주목 → 소속사에 보낸 기획안의 사투리·일본어 요소가 '거제' 밈으로
5) 분석: 사투리 편이 성장의 계기였다는 걸 데이터로 확인
포인트: "거절당해도 직접 연다" → 우리도 2회차에 직접 채널을 엽니다.
`);
    const tl = [
      ["기획", "외부 기획안에 원이를 호스트로 제안 → 탈락", "\"이거 안 되면 내가 해야겠다\""],
      ["촬영", "다른 일이 많아 효율적으로 찍기", "\"되게 효율적으로 찍으려고 했다\""],
      ["발행", "첫 영상: '연수 아저씨' 이선민과 함께", "약 20만 회 — 이전 맥락을 이어받음"],
      ["성장", "'곰' 영상으로 주목, 사투리·일본어 기획", "'거제' 밈의 출발"],
      ["분석", "사투리 편이 성장 계기", "데이터로 확인"],
    ];
    for (let i = 0; i < tl.length; i++) {
      const [step, what, why] = tl[i];
      const y = 1.5 + i * 0.93;
      await k.ornament(s, 0.6, y + 0.08, 0.62, i === 0 ? C.accent3 : C.accent2, null);
      k.text(s, step, { x: 0.6, y: y + 0.08, w: 0.62, h: 0.62, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" });
      k.card(s, 1.45, y, 11.25, 0.78);
      k.text(s, what, { x: 1.7, y, w: 6.2, h: 0.78, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
      k.text(s, why, { x: 8.0, y, w: 4.5, h: 0.78, fontSize: 14, color: C.accent5, valign: "middle" });
    }
    k.text(s, "출처: iMBC 연예(2026.7.8), 위버스 매거진 윤성원 인터뷰", { x: 0.6, y: 6.25, w: 12, h: 0.3, fontSize: 11, color: C.accent5 });
  }
  {
    const s = content("사례 2 · 존이냐박이냐: 같은 사람도 콘셉트로 새로워진다", `
[11:25–11:35] 출처: 스포탈코리아(존박 발언), 위버스 매거진.
- 기우제: 핫한 걸그룹 노래를 존박이 커버(첫 곡 에스파 '슈퍼노바'). 존박: "이만큼 제작진이 중요하구나"
- 베를린 클럽: "베를린 클럽을 아는 사람은 대한민국의 1%도 안 된다"는 전제로 기획 → 팬덤이 아닌 대중 기준
- 인스타그램 초기 전략: 보면 "영어 실력이 오르는 듯한 느낌"을 주는 것 = 구독할 이유 설계
질문 던지기: "여러분 아이템에서 '구독하면 ○○한 느낌'은 뭘까요?" (2회차에 본격적으로)
`);
    const cols = [
      ["FaMusic", C.accent3, "기우제", "걸그룹 노래를 존박이 커버\n첫 곡: 에스파 '슈퍼노바'", "익숙한 사람 + 의외의 상황"],
      ["FaGlobeEurope", C.accent4, "베를린 클럽", "\"베를린 클럽을 아는 사람은\n대한민국의 1%도 안 된다\"", "팬덤보다 대중 기준"],
      ["FaInstagram", C.accent1, "인스타그램", "보면 영어 실력이\n오르는 듯한 느낌", "구독할 이유 설계"],
    ];
    for (let i = 0; i < cols.length; i++) {
      const [ic, col, head, body, lesson] = cols[i];
      const x = 0.6 + i * 4.1;
      k.card(s, x, 1.55, 3.9, 3.85);
      await k.ornament(s, x + 0.3, 1.8, 0.75, col, null, { icon: ic });
      k.text(s, head, { x: x + 0.3, y: 2.75, w: 3.3, h: 0.5, fontSize: 20, bold: true, color: C.text2 });
      k.text(s, body, { x: x + 0.3, y: 3.3, w: 3.3, h: 1.2, fontSize: 15 });
      k.text(s, "→ " + lesson, { x: x + 0.3, y: 4.65, w: 3.3, h: 0.5, fontSize: 15, bold: true, color: col });
    }
    k.text(s, "출처: 스포탈코리아(존박 발언), 위버스 매거진 윤성원 인터뷰", { x: 0.6, y: 6.25, w: 12, h: 0.3, fontSize: 11, color: C.accent5 });
  }
  {
    const s = content("사례 3 · ODG: 아이가 나오지만 어른이 보는 채널", `
[11:35–11:40] 출처: 유튜브 공식 블로그(2022.5), 마리끌레르(2021.6), 나무위키.
- 아이들이 출연하지만 타깃은 어른. 어른이 자기 어린 시절을 돌아보게 하는 콘텐츠.
- 채널명: 아이들이 "어디지?"를 "오디지?"로 발음한 데서(유퀴즈에서 밝힌 내용으로 알려짐).
- 이영현 "요즘 여학생들은 무슨 노래 부르니?"가 2021년 유튜브 국내 인기 동영상 TOP 10.
- 모토: "누구나 보편적으로 즐겨볼 수 있는 영상"
포인트: 출연자와 시청자가 꼭 같을 필요는 없다. 타깃을 뒤집으면 새로워진다.
`);
    k.card(s, 0.6, 1.55, 5.9, 4.0, { fill: C.text2 });
    k.text(s, "출연자", { x: 0.9, y: 1.85, w: 2.4, h: 0.4, fontSize: 16, color: C.accent6 });
    k.text(s, "아이들", { x: 0.9, y: 2.25, w: 2.4, h: 0.7, fontSize: 30, bold: true, color: C.background1 });
    k.text(s, "보는 사람", { x: 3.6, y: 1.85, w: 2.6, h: 0.4, fontSize: 16, color: C.accent6 });
    k.text(s, "어른들", { x: 3.6, y: 2.25, w: 2.6, h: 0.7, fontSize: 30, bold: true, color: C.accent1 });
    k.text(s, "→ 어른이 자기 어린 시절을 돌아보게", { x: 0.9, y: 3.2, w: 5.4, h: 0.5, fontSize: 17, color: C.background1 });
    k.text(s, "\"누구나 보편적으로 즐겨볼 수 있는 영상\"", { x: 0.9, y: 4.3, w: 5.4, h: 0.9, fontSize: 18, bold: true, color: C.accent6 });
    await k.stepRow(s, 6.75, 1.55, 5.95, 1.25, { n: "Aa", color: C.accent4, head: "채널명 ODG", body: "아이들이 \"어디지?\"를 \"오디지?\"로 발음한 데서" });
    await k.stepRow(s, 6.75, 2.95, 5.95, 1.25, { n: "10", color: C.accent3, head: "2021 국내 인기 동영상 TOP 10", body: "이영현 \"요즘 여학생들은 무슨 노래 부르니?\"" });
    await k.stepRow(s, 6.75, 4.35, 5.95, 1.2, { n: "?", color: C.accent1, head: "내 채널이라면?", body: "출연자와 보는 사람을 뒤집어 보기" });
    k.text(s, "출처: 유튜브 공식 블로그(2022.5), 마리끌레르(2021.6)", { x: 0.6, y: 6.25, w: 12, h: 0.3, fontSize: 11, color: C.accent5 });
  }
  {
    const s = content("편집 다음에 오는 것: 마스터링", `
[11:40–11:47] 사례에는 잘 안 나오지만 프로가 반드시 하는 단계. 5회차에 직접 해 봅니다. 오늘은 "이런 단계가 있다"만.
- 소리: 유튜브는 재생할 때 음량을 일정하게 맞춥니다(흔히 약 -14 LUFS로 알려짐). 너무 크게 만들면 오히려 깎여서 들려요. 목소리가 음악보다 항상 커야 합니다.
- 색과 밝기: 클립마다 톤을 맞추기.
- 자막: 오탈자, 화면 밖으로 나간 글자, 버튼에 가려지는 위치.
- 내보내기 규격: 해상도·프레임·비율이 플랫폼에 맞는지.
- 최종 검수: 처음부터 끝까지 소리 켜고 한 번, 끄고 한 번.
`);
    const items = [
      ["FaVolumeUp", C.accent4, "소리 크기", "목소리 > 음악. 플랫폼이 음량을 맞추니 무작정 키우지 않기"],
      ["FaPalette", C.accent3, "색 · 밝기", "클립마다 톤을 한 가지로"],
      ["FaFont", C.accent2, "자막 점검", "오탈자, 잘린 글자, 버튼에 가리는 위치"],
      ["FaExpand", C.accent1, "내보내기 규격", "해상도 · 프레임 · 비율"],
      ["FaCheckDouble", C.text2, "최종 검수", "소리 켜고 한 번, 끄고 한 번"],
    ];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 2.46, 1.6, 2.3, 3.4, { icon: ic, color: col, head, body, headSize: 16, bodySize: 13 });
    }
    k.note(s, "직접 해 보는 건 5회차. 오늘은 '편집이 끝이 아니다'만 기억하세요", { y: 5.4 });
  }
  {
    const s = content("플랫폼마다 화면이 다르다", `
[11:47–11:50] 우리 수업의 기본은 세로 9:16, 1080×1920입니다. 롱폼(브이로그 등)은 16:9.
세로 영상은 위·아래에 버튼과 캡션이 덮입니다(세로 안전 영역, 5교시에 다시).
길이 제한은 플랫폼이 자주 바꾸니 업로드할 때 확인하세요.
`);
    const frames = [
      ["유튜브 쇼츠", "9:16 · 1080×1920", C.accent3, true, "FaYoutube"],
      ["인스타그램 릴스", "9:16 · 1080×1920", C.accent1, true, "FaInstagram"],
      ["틱톡", "9:16 · 1080×1920", C.text1, true, "FaTiktok"],
      ["유튜브 롱폼", "16:9 · 1920×1080", C.accent4, false, "FaYoutube"],
    ];
    let x = 0.6;
    for (const [name, spec, col, vertical, ic] of frames) {
      const fw = vertical ? 1.9 : 4.2, fh = vertical ? 3.38 : 2.36;
      const y = 1.65 + (3.38 - fh);
      s.addShape(S.roundRect, { x, y, w: fw, h: fh, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: col, width: 2.5 } });
      await k.ornament(s, x + fw / 2 - 0.4, y + fh / 2 - 0.4, 0.8, col, null, { icon: ic });
      k.text(s, name, { x: x - 0.2, y: 5.2, w: fw + 0.4, h: 0.4, fontSize: 16, bold: true, color: C.text2, align: "center" });
      k.text(s, spec, { x: x - 0.2, y: 5.6, w: fw + 0.4, h: 0.35, fontSize: 13, color: C.accent5, align: "center" });
      x += fw + 0.6;
    }
    k.text(s, "우리 수업 기본값: 세로 9:16 · 1080×1920 · 30fps", { x: 0.6, y: 6.2, w: 12, h: 0.4, fontSize: 15, bold: true, color: C.text2 });
  }
  statement("점심 시간", "11:50–12:40 · 오후는 카메라 원리부터. 폰 배터리를 충전해 두세요", `
[11:50] 점심 전 안내: 폰 충전, 저장공간 10GB 이상 비워 두기. 오후엔 폰을 계속 씁니다.
`);

  // ───────────── 3교시 ─────────────
  await section(3, "카메라의 원리 ① 사진", "12:40–13:30 · 얼마나 많은 빛을, 어떤 색으로, 어디에 초점을", `
[12:40–13:30] 목표: 노출 삼각형, 화이트밸런스, 초점·심도, 폰 렌즈를 이해하고 프로 모드로 직접 바꿔 보기.
시간: 개념 25분 → 실습 25분. 디자인 전공자가 많으니 원리는 짧고 명확하게, 예시는 시각적으로.
`);
  {
    const s = content("사진은 빛을 담는 일: 노출 삼각형", `
[12:42] 밝기는 세 가지가 함께 정합니다. 하나로 밝게 만들면 나머지 둘 중 하나가 대가를 치러요.
- 조리개: 빛이 들어오는 구멍 크기 → 배경 흐림
- 셔터스피드: 빛을 받는 시간 → 움직임이 선명한지
- ISO: 빛에 반응하는 감도 → 화면이 깨끗한지
`);
    s.addShape(S.triangle, { x: 0.9, y: 1.7, w: 5.0, h: 4.3, fill: { color: C.background2 }, line: { color: C.accent2, width: 3 } });
    k.text(s, "노출", { x: 2.4, y: 3.9, w: 2.0, h: 0.6, fontSize: 26, bold: true, color: C.text2, align: "center" });
    await k.ornament(s, 2.95, 1.25, 0.9, C.accent3, "조리개", { fontSize: 13 });
    await k.ornament(s, 0.5, 5.45, 0.9, C.accent4, "셔터", { fontSize: 14 });
    await k.ornament(s, 5.4, 5.45, 0.9, C.accent1, "ISO", { fontSize: 16, textColor: C.text2 });
    const rows = [
      ["조리개", "빛이 들어오는 구멍의 크기", "→ 배경이 얼마나 흐려지나", C.accent3],
      ["셔터스피드", "빛을 받는 시간", "→ 움직임이 멈추나, 흐르나", C.accent4],
      ["ISO", "빛에 반응하는 감도", "→ 화면이 깨끗한가, 자글자글한가", C.accent1],
    ];
    rows.forEach(([n, what, effect, col], i) => {
      const y = 1.6 + i * 1.45;
      k.card(s, 7.0, y, 5.7, 1.25);
      s.addShape(S.ellipse, { x: 7.2, y: y + 0.42, w: 0.4, h: 0.4, fill: { color: col }, line: { type: "none" } });
      k.text(s, n, { x: 7.8, y: y + 0.12, w: 4.7, h: 0.4, fontSize: 18, bold: true, color: C.text2 });
      k.text(s, `${what}  ${effect}`, { x: 7.8, y: y + 0.58, w: 4.75, h: 0.55, fontSize: 14 });
    });
    k.text(s, "하나로 밝게 만들면, 나머지 둘 중 하나가 대가를 치른다", { x: 7.0, y: 6.05, w: 5.7, h: 0.4, fontSize: 14, bold: true, color: C.accent3 });
  }
  {
    const s = content("조리개 · 셔터 · ISO를 한 장에", `
[12:47] 숫자 방향을 헷갈려 하는 분이 많아요. "조리개는 숫자가 작을수록 밝다"만 확실히.
- 조리개: f/1.8(구멍 큼, 밝음, 배경 흐림) ↔ f/11(구멍 작음, 어두움, 앞뒤 선명). 폰은 조리개가 대부분 고정 → 배경 흐림은 '인물 모드'가 소프트웨어로 흉내. 대상에 가까이, 배경은 멀리.
- 셔터: 1/1000(빠름, 순간이 멈춤) ↔ 1/30(느림, 움직임이 흐름·흔들림).
- ISO: 100~400(밝은 곳, 깨끗) ↔ 3200+(어두운 곳, 노이즈). 해결은 ISO가 아니라 빛.
`);
    const rows = [
      ["조리개 (f값)", "f/1.8 · 구멍 큼 · 밝음 · 배경 흐림", "f/11 · 구멍 작음 · 어두움 · 앞뒤 선명", "폰은 대부분 고정 → 인물 모드, 대상에 가까이"],
      ["셔터스피드", "1/1000 · 순간이 멈춤", "1/30 · 움직임이 흐름, 흔들림", "영상은 4교시 '2배 규칙'"],
      ["ISO", "100~400 · 깨끗", "3200 이상 · 자글자글", "어두우면 ISO 말고 빛을 더하기"],
    ];
    k.table(s, [["", "한쪽 끝", "다른 쪽 끝", "폰에서는"], ...rows], { x: 0.6, y: 1.6, w: 12.1, colW: [2.1, 3.3, 3.3, 3.4], rowH: 0.95, fontSize: 15 });
    k.note(s, "조리개는 숫자가 작을수록 밝다 — 이것 하나만 확실히", { y: 5.6 });
  }
  {
    const s = content("화이트밸런스: 빛에도 색이 있다", `
[12:55] 같은 흰 종이도 전구 아래선 노랗게, 그늘에선 파랗게 찍힙니다.
- 자동 화이트밸런스는 찍는 도중 색이 바뀔 수 있어요 → 영상은 고정이 안전.
- 색이 다른 빛을 섞지 않기: 창가 빛 + 형광등이 섞이면 얼굴 한쪽은 파랗고 한쪽은 노랗습니다.
`);
    const sw = [["F2B35B", "약 3,000K", "촛불 · 전구", "그냥 찍으면 노랗게"], ["F4F1E8", "약 5,500K", "한낮 햇빛", "자연스럽게"], ["9DB8D6", "약 7,000K", "그늘 · 흐린 날", "그냥 찍으면 파랗게"]];
    sw.forEach(([hex, kk, src, look], i) => {
      const x = 0.6 + i * 4.1;
      s.addShape(S.roundRect, { x, y: 1.6, w: 3.9, h: 2.1, rectRadius: 0.12, fill: { color: hex }, line: { color: "D5DED9", width: 1 } });
      k.text(s, kk, { x, y: 1.6, w: 3.9, h: 2.1, fontSize: 28, bold: true, color: C.text2, align: "center", valign: "middle" });
      k.text(s, src, { x, y: 3.85, w: 3.9, h: 0.4, fontSize: 17, bold: true, color: C.text2, align: "center" });
      k.text(s, look, { x, y: 4.25, w: 3.9, h: 0.4, fontSize: 14, color: C.accent5, align: "center" });
    });
    await k.stepRow(s, 0.6, 4.95, 5.95, 1.0, { n: "1", color: C.accent2, head: "영상은 고정하기", body: "자동은 찍는 도중 색이 바뀔 수 있어요", bodySize: 13 });
    await k.stepRow(s, 6.75, 4.95, 5.95, 1.0, { n: "2", color: C.accent3, head: "색이 다른 빛을 섞지 않기", body: "창가 빛 + 형광등 = 얼굴 반반", bodySize: 13 });
  }
  {
    const s = content("초점과 심도, 그리고 폰의 렌즈 세 개", `
[13:00] 초점은 '보여주고 싶은 곳'에. 사람이면 눈.
- 심도: 선명한 범위. 얕으면 주인공만 선명(감성), 깊으면 전부 선명(정보).
- 폰 렌즈: 0.5x 초광각은 넓지만 가장자리가 휘고 가까운 얼굴이 커 보여요. 사람 얼굴은 1x~3x로, 조금 떨어져서.
- 디지털 줌(렌즈 배율 사이)은 화질이 떨어집니다. "줌 말고 발로."
`);
    const lens = [["0.5x", "초광각", "공간 전체 · 가장자리 휨\n얼굴 가까이 쓰면 왜곡", C.accent4], ["1x", "기본", "가장 선명 · 화질 기준\n대부분의 촬영", C.accent2], ["2~3x", "망원", "얼굴이 자연스러움\n배경이 가까워 보임", C.accent3]];
    for (let i = 0; i < lens.length; i++) {
      const [z, n, d, col] = lens[i];
      const x = 0.6 + i * 2.75;
      k.card(s, x, 1.55, 2.55, 3.3);
      await k.ornament(s, x + 0.7, 1.75, 1.15, col, z, { fontSize: 20 });
      k.text(s, n, { x: x + 0.1, y: 3.0, w: 2.35, h: 0.4, fontSize: 17, bold: true, color: C.text2, align: "center" });
      k.text(s, d, { x: x + 0.15, y: 3.45, w: 2.25, h: 1.2, fontSize: 13, align: "center" });
    }
    k.card(s, 9.0, 1.55, 3.7, 3.3, { fill: C.text2 });
    k.text(s, "초점은 보여주고 싶은 곳에", { x: 9.25, y: 1.8, w: 3.2, h: 0.8, fontSize: 18, bold: true, color: C.accent1 });
    k.text(s, "사람이면 눈.\n얕은 심도 = 주인공만 선명\n깊은 심도 = 전부 선명", { x: 9.25, y: 2.7, w: 3.2, h: 1.8, fontSize: 15, color: C.background1 });
    k.note(s, "줌 말고 발로. 렌즈 배율 사이의 디지털 줌은 화질이 떨어집니다", { y: 5.2 });
  }
  {
    const s = content("실습 · 프로 모드로 바꿔 찍기 (짝과 25분)", `
[13:05–13:30] 짝끼리 진행. 경험자가 설정 화면을 먼저 찾아 주세요.
- 갤럭시: 카메라 → 더보기 → 프로(사진) / 프로 동영상
- 아이폰: 기본 카메라는 노출 조절 위주 → 무료 수동 촬영 앱(예: Blackmagic Camera) 설치해 보기. 설치가 부담이면 인물 모드·노출 슬라이더로.
- 찍은 사진은 드라이브 내 폴더 "1회차/3교시"에.
- 메뉴 이름은 기종·버전마다 조금씩 다릅니다.
`);
    k.card(s, 0.6, 1.55, 5.95, 2.1);
    k.text(s, "갤럭시", { x: 0.85, y: 1.7, w: 5.4, h: 0.4, fontSize: 17, bold: true, color: C.accent4 });
    k.text(s, "카메라 → 더보기 → 프로 / 프로 동영상\nISO · 셔터 · WB를 직접 조절", { x: 0.85, y: 2.15, w: 5.4, h: 1.3, fontSize: 15 });
    k.card(s, 6.75, 1.55, 5.95, 2.1);
    k.text(s, "아이폰", { x: 7.0, y: 1.7, w: 5.4, h: 0.4, fontSize: 17, bold: true, color: C.accent4 });
    k.text(s, "기본 카메라는 노출 조절 위주\n→ 무료 수동 앱(예: Blackmagic Camera)", { x: 7.0, y: 2.15, w: 5.4, h: 1.3, fontSize: 15 });
    k.checklist(s, ["같은 장면 ISO 100 vs 3200", "손 흔들기 셔터 1/60 vs 1/1000", "흰 종이 WB 전구 vs 맑음", "인물 모드 켜고 / 끄고 (배경 흐림 비교)"], { x: 0.6, y: 3.95, w: 7.5, h: 2.2 });
    k.card(s, 8.4, 3.95, 4.3, 2.0, { fill: C.accent6 });
    k.text(s, "다 찍었으면\n가장 마음에 드는 1장 + 이유 한 줄\n→ 드라이브 '1회차/3교시'", { x: 8.65, y: 4.1, w: 3.9, h: 1.7, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
  }

  // ───────────── 4교시 ─────────────
  await section(4, "카메라의 원리 ② 영상", "13:40–14:30 · 영상은 1초에 사진 수십 장. 그래서 규칙이 조금 다르다", `
[13:40–14:30] 목표: 프레임레이트·셔터 2배 규칙·해상도를 이해하고, 편집에서 문제 없는 폰 세팅을 함께 끝내기.
시간: 개념 20분 → 함께 세팅 15분 → 비교 촬영 15분.
`);
  {
    const s = content("프레임레이트: 1초에 몇 장인가", `
[13:42] 1초에 찍는 사진 수.
- 24fps: 영화 같은 느낌.
- 30fps: SNS 기본값. 우리 수업 기본.
- 60fps: 움직임이 매끄럽고, 편집에서 절반 속도로 늦추면 부드러운 슬로모션.
선의 촘촘함이 1초 안에 담기는 장면 수라고 보여 주세요.
`);
    const rows = [["24", "영화 같은 느낌", C.accent4], ["30", "SNS 기본 · 우리 수업 기본값", C.accent2], ["60", "매끄러운 움직임 · 슬로모션 재료", C.accent3]];
    rows.forEach(([fps, use, col], i) => {
      const y = 1.7 + i * 1.45;
      k.text(s, fps + "fps", { x: 0.6, y, w: 1.6, h: 0.9, fontSize: 26, bold: true, color: col, valign: "middle" });
      const n = Number(fps), x0 = 2.3, wl = 6.6;
      for (let j = 0; j < n; j++) s.addShape(S.rect, { x: x0 + (j * wl) / n, y: y + 0.1, w: Math.max(0.03, (wl / n) * 0.55), h: 0.7, fill: { color: col }, line: { type: "none" } });
      k.text(s, use, { x: 9.2, y, w: 3.5, h: 0.9, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
    });
    k.text(s, "← 1초 →", { x: 2.3, y: 5.95, w: 6.6, h: 0.35, fontSize: 13, color: C.accent5, align: "center" });
  }
  {
    const s = content("셔터 2배 규칙과 깜빡이는 조명", `
[13:48] 영상에서 셔터는 프레임의 2배 정도가 기준입니다. 이보다 훨씬 빠르면 움직임이 뚝뚝 끊겨 보여요.
- 30fps → 1/60초, 60fps → 1/120초.
- 실내 형광등·LED 아래서 화면에 줄이 흐르면 셔터를 1/60이나 1/120으로 맞춰 보세요(한국 전기는 60Hz).
- 밖이 너무 밝아 1/60로는 하얗게 날아갈 때 프로는 ND 필터를 씁니다. 폰은 자동이 알아서 셔터를 올리니 크게 걱정하지 않아도 돼요.
`);
    await k.stepRow(s, 0.6, 1.6, 5.95, 1.4, { n: "30", color: C.accent2, head: "30fps → 셔터 1/60", body: "가장 자연스러운 움직임" });
    await k.stepRow(s, 0.6, 3.15, 5.95, 1.4, { n: "60", color: C.accent3, head: "60fps → 셔터 1/120", body: "슬로모션 재료로 찍을 때" });
    await k.stepRow(s, 0.6, 4.7, 5.95, 1.4, { n: "!", color: C.accent1, head: "너무 빠른 셔터 (1/1000)", body: "움직임이 뚝뚝 끊겨 보여요" });
    k.card(s, 6.75, 1.6, 5.95, 4.5, { fill: C.text2 });
    await k.ornament(s, 7.05, 1.85, 0.75, C.accent1, null, { icon: "FaLightbulb", iconHex: HEX.dk2 });
    k.text(s, "화면에 줄이 흐르면", { x: 7.05, y: 2.8, w: 5.4, h: 0.5, fontSize: 20, bold: true, color: C.background1 });
    k.text(s, "실내 형광등 · LED가 깜빡이는 것\n→ 셔터를 1/60 또는 1/120으로\n→ 그래도 안 되면 조명을 바꾸거나\n   창가 자연광으로", { x: 7.05, y: 3.4, w: 5.4, h: 2.4, fontSize: 16, color: C.background1 });
  }
  {
    const s = content("편집에서 문제가 되는 설정 두 가지", `
[13:53] 디자인·사무 경력자도 처음 들어 보는 부분일 거예요. 편집 단계에서 생기는 문제를 촬영 단계에서 막는 법.
- HDR 동영상(아이폰 'HDR 비디오', 갤럭시 'HDR10+'): 폰 화면에선 화려하지만, 편집 프로그램과 다른 화면에서 색이 허옇거나 과하게 보일 수 있어요. 수업에선 끕니다.
- HEVC(고효율, H.265): 파일이 작지만 일부 PC에서 편집이 끊깁니다. 아이폰은 '가장 호환성 높은 포맷'(H.264), 갤럭시는 '고효율 동영상' 끄기.
- 4K는 화질이 좋지만 파일이 4배 커지고 편집 PC가 느려져요. 수업 기본은 1080p.
메뉴 이름은 기종·버전마다 조금씩 다릅니다.
`);
    const items = [
      ["FaSun", C.accent1, "HDR 동영상 → 끄기", "폰에선 화려해도 편집·다른 화면에서 색이 틀어져 보일 수 있어요"],
      ["FaFileVideo", C.accent4, "HEVC(고효율) → 끄기", "파일은 작지만 일부 PC에서 편집이 끊겨요. 호환성 우선(H.264)으로"],
      ["FaHdd", C.accent3, "4K → 1080p로", "4K는 파일이 4배. 수업 기본은 1080p 30fps"],
    ];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 4.1, 1.6, 3.9, 3.4, { icon: ic, color: col, head, body, headSize: 18, bodySize: 15 });
    }
    k.note(s, "편집에서 생길 문제를 촬영 전에 막는 것. 메뉴 이름은 기종마다 조금씩 달라요", { y: 5.4 });
  }
  {
    const s = content("함께 세팅해요 (15분)", `
[13:58–14:13] 화면을 보면서 한 단계씩. 크루장은 전원 완료 확인.
아이폰: 설정 → 카메라 → 비디오 녹화 → 1080p 30fps / 같은 화면에서 'HDR 비디오' 끄기 / 설정 → 카메라 → 포맷 → '가장 호환성 높은 포맷' / 설정 → 카메라 → 격자 켜기
갤럭시: 카메라 → 동영상 → 상단 해상도에서 FHD 30 / 카메라 설정 → 고급 동영상 옵션 → 고효율 동영상·HDR10+ 끄기 / 카메라 설정 → 수직·수평 안내선 켜기
공통: 렌즈 닦기, 저장공간 10GB 이상, 방해 금지, 기본은 세로로.
`);
    k.card(s, 0.6, 1.55, 5.95, 3.6);
    k.text(s, "아이폰", { x: 0.85, y: 1.7, w: 5.4, h: 0.45, fontSize: 19, bold: true, color: C.accent4 });
    k.bullets(s, ["설정 → 카메라 → 비디오 녹화 → 1080p 30fps", "같은 화면에서 'HDR 비디오' 끄기", "카메라 → 포맷 → '가장 호환성 높은 포맷'", "카메라 → 격자 켜기"], { x: 0.85, y: 2.25, w: 5.5, h: 2.8, fontSize: 15 });
    k.card(s, 6.75, 1.55, 5.95, 3.6);
    k.text(s, "갤럭시", { x: 7.0, y: 1.7, w: 5.4, h: 0.45, fontSize: 19, bold: true, color: C.accent4 });
    k.bullets(s, ["동영상 → 상단 해상도에서 FHD 30", "설정 → 고급 동영상 옵션 → 고효율 동영상 끄기", "같은 곳에서 HDR10+ 동영상 끄기", "설정 → 수직·수평 안내선 켜기"], { x: 7.0, y: 2.25, w: 5.5, h: 2.8, fontSize: 15 });
    const common = [["FaBroom", "렌즈 닦기"], ["FaSdCard", "저장공간 10GB+"], ["FaBellSlash", "방해 금지"], ["FaMobileAlt", "기본은 세로"]];
    for (let i = 0; i < common.length; i++) {
      const x = 0.6 + i * 3.08;
      k.card(s, x, 5.35, 2.86, 0.8, { fill: C.accent6 });
      await k.ornament(s, x + 0.15, 5.45, 0.6, C.text2, null, { icon: common[i][0] });
      k.text(s, common[i][1], { x: x + 0.9, y: 5.35, w: 1.9, h: 0.8, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
    }
  }
  {
    const s = content("초점 · 노출 잠그기 (AE/AF 잠금)", `
[14:13] 잠그지 않으면 찍는 도중 밝기와 초점이 출렁입니다. 프로 영상과 아마추어 영상의 가장 쉬운 차이.
1) 찍을 대상을 화면에서 길게 누르기
2) 잠금 표시가 뜨면 손 떼기(아이폰: AE/AF 잠금, 갤럭시: 자물쇠)
3) 밝기 막대를 위아래로 밀어 조절
`);
    const steps = [["1", "대상을 길게 누르기", "화면에서 찍을 대상을 꾹"], ["2", "잠금 표시 확인", "아이폰 AE/AF 잠금 · 갤럭시 자물쇠"], ["3", "밝기 막대 조절", "위아래로 밀어 원하는 밝기"]];
    for (let i = 0; i < steps.length; i++) {
      const [n, h, b] = steps[i];
      await k.stepRow(s, 0.6, 1.6 + i * 1.3, 6.4, 1.1, { n, color: C.accent2, head: h, body: b });
    }
    k.card(s, 7.3, 1.6, 5.4, 3.7, { fill: C.text2 });
    k.text(s, "잠그지 않으면", { x: 7.6, y: 1.85, w: 4.8, h: 0.45, fontSize: 18, color: C.accent6 });
    k.text(s, "사람이 지나갈 때마다\n밝기와 초점이 출렁입니다", { x: 7.6, y: 2.35, w: 4.8, h: 1.2, fontSize: 20, bold: true, color: C.background1 });
    k.text(s, "→ 가장 쉬운 프로와 아마추어의 차이", { x: 7.6, y: 4.3, w: 4.8, h: 0.6, fontSize: 16, bold: true, color: C.accent1 });
    k.note(s, "다음 실습부터 모든 촬영은 '잠그고' 찍습니다", { y: 5.6 });
  }
  {
    const s = content("실습 · 비교 클립 두 쌍 (15분)", `
[14:15–14:30] 짝끼리. 같은 장면을 두 번씩 찍어 비교합니다. 드라이브 '1회차/4교시'에.
- 30fps vs 60fps: 머리 넘기기, 물 따르기처럼 움직임 있는 장면. 60fps 영상은 3교시 이후 편집에서 슬로모션으로 써 봅니다.
- 잠금 없이 vs 잠금: 창가를 지나가며 찍기. 밝기 출렁임 차이를 직접 보기.
경험자는 하나 더: 갤럭시 프로 동영상으로 셔터 1/60 vs 1/1000.
`);
    const pairs = [["FaTachometerAlt", C.accent3, "30fps vs 60fps", "머리 넘기기, 물 따르기\n같은 동작을 두 번"], ["FaLock", C.accent2, "잠금 없이 vs 잠금", "창가를 지나가며 찍기\n밝기 출렁임 비교"]];
    for (let i = 0; i < pairs.length; i++) {
      const [ic, col, head, body] = pairs[i];
      await k.iconCard(s, 0.6 + i * 4.1, 1.6, 3.9, 3.6, { icon: ic, color: col, head, body, headSize: 19, bodySize: 15 });
    }
    k.card(s, 8.8, 1.6, 3.9, 3.6, { fill: C.accent6 });
    k.text(s, "도전 미션", { x: 9.05, y: 1.85, w: 3.4, h: 0.4, fontSize: 18, bold: true, color: C.accent3 });
    k.text(s, "갤럭시 프로 동영상으로\n셔터 1/60 vs 1/1000\n\n아이폰은 수동 앱으로", { x: 9.05, y: 2.35, w: 3.4, h: 2.6, fontSize: 15, color: C.text2 });
    k.note(s, "찍은 클립은 드라이브 '1회차/4교시'로. 60fps 클립은 3회차 편집에서 슬로모션으로 씁니다", { y: 5.55 });
  }

  // ───────────── 5교시 ─────────────
  await section(5, "화면의 언어와 빛", "14:40–15:30 · 얼마나 가까이, 어디서, 화면 어디에, 어떤 빛으로", `
[14:40–15:30] 목표: 샷 크기·앵글·구도·빛을 영어 용어와 함께 익히기(4회차 AI 프롬프트 어휘가 됨) + 구도 미션 + ChatGPT 피드백.
시간: 개념 25분 → 학교 공간 구도 미션 15분 → ChatGPT 피드백 10분.
`);
  {
    const s = content("샷 크기: 얼마나 가까이 찍느냐가 말을 정한다", `
[14:42] 영어 이름도 같이 말해 주세요. 4회차에 이 단어가 그대로 AI 영상 프롬프트가 됩니다.
- 익스트림 와이드(Extreme Wide): 풍경 속 작은 사람 → 어디인지
- 와이드/풀 샷(Wide/Full): 전신과 주변 → 누가, 어디서
- 미디엄(Medium): 허리 위 → 무엇을 하는지
- 클로즈업(Close-up): 얼굴·손 → 감정, 동작
- 익스트림 클로즈업(Extreme Close-up): 눈·디테일 → 강조, 질감
연결 공식: 어디서(와이드) → 누가 무엇을(미디엄) → 어떤 감정으로(클로즈업). 같은 크기를 연달아 붙이면 화면이 튑니다.
`);
    // 사람 실루엣 + 샷 경계선
    const fx = 2.3, top = 1.6;
    s.addShape(S.ellipse, { x: fx - 0.32, y: top, w: 0.64, h: 0.72, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.roundRect, { x: fx - 0.65, y: top + 0.8, w: 1.3, h: 1.45, rectRadius: 0.22, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.rect, { x: fx - 0.52, y: top + 2.15, w: 0.44, h: 1.55, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.rect, { x: fx + 0.08, y: top + 2.15, w: 0.44, h: 1.55, fill: { color: C.text2 }, line: { type: "none" } });
    const cuts = [
      [top + 0.3, "익스트림 클로즈업", "Extreme Close-up", "눈 · 디테일 → 강조, 질감", C.accent3],
      [top + 1.05, "클로즈업", "Close-up", "얼굴 · 손 → 감정, 동작", C.accent1],
      [top + 2.0, "미디엄", "Medium", "허리 위 → 무엇을 하는지", C.accent2],
      [top + 3.8, "와이드 · 풀", "Wide / Full", "전신과 주변 → 누가, 어디서", C.accent4],
    ];
    cuts.forEach(([y, ko, en, use, col]) => {
      s.addShape(S.line, { x: 1.0, y, w: 4.0, h: 0, line: { color: col, width: 2, dashType: "dash" } });
      k.text(s, ko, { x: 5.2, y: y - 0.25, w: 2.6, h: 0.5, fontSize: 17, bold: true, color: col, valign: "middle" });
      k.text(s, en, { x: 7.8, y: y - 0.25, w: 2.3, h: 0.5, fontSize: 13, color: C.accent5, valign: "middle" });
      k.text(s, use, { x: 10.1, y: y - 0.25, w: 2.7, h: 0.5, fontSize: 13, valign: "middle" });
    });
    k.text(s, "+ 익스트림 와이드(Extreme Wide): 풍경 속 작은 사람 → 어디인지", { x: 5.2, y: 5.72, w: 7.5, h: 0.4, fontSize: 14, color: C.text2 });
    k.note(s, "어디서(와이드) → 누가 무엇을(미디엄) → 어떤 감정으로(클로즈업)", { y: 6.2 });
  }
  {
    const s = content("앵글: 어디서 보느냐가 느낌을 바꾼다", `
[14:48] 카메라 높이가 감정을 만듭니다.
- 하이앵글(High angle): 내려다보기 → 작고 귀엽게, 전체를
- 아이레벨(Eye level): 눈높이 → 자연스럽고 편하게(기본)
- 로우앵글(Low angle): 올려다보기 → 크고 당당하게
- 탑뷰(Top view / Overhead): 바로 위 → 음식·책상·손 작업. 정보성·요리 콘텐츠의 기본
- 더치 앵글(기울이기): 불안·역동. 가끔만.
`);
    const angles = [["FaArrowDown", C.accent4, "하이앵글", "High angle", "내려다보기\n작고 귀엽게, 전체를"], ["FaArrowsAltH", C.accent2, "아이레벨", "Eye level", "눈높이\n자연스럽고 편하게"], ["FaArrowUp", C.accent3, "로우앵글", "Low angle", "올려다보기\n크고 당당하게"], ["FaUtensils", C.accent1, "탑뷰", "Top view", "바로 위에서\n음식 · 책상 · 손 작업"]];
    for (let i = 0; i < angles.length; i++) {
      const [ic, col, ko, en, d] = angles[i];
      const x = 0.6 + i * 3.08;
      k.card(s, x, 1.6, 2.86, 3.7);
      await k.ornament(s, x + 0.95, 1.85, 0.95, col, null, { icon: ic });
      k.text(s, ko, { x, y: 2.95, w: 2.86, h: 0.45, fontSize: 19, bold: true, color: C.text2, align: "center" });
      k.text(s, en, { x, y: 3.4, w: 2.86, h: 0.35, fontSize: 13, color: C.accent5, align: "center" });
      k.text(s, d, { x: x + 0.2, y: 3.9, w: 2.46, h: 1.1, fontSize: 14, align: "center" });
    }
    k.note(s, "+ 더치 앵글(기울이기): 불안하고 역동적인 느낌. 가끔만", { y: 5.6 });
  }
  {
    const s = content("구도 ① 주인공을 어디에 둘까", `
[14:52] 격자는 오전 세팅에서 켜 둔 그대로.
- 삼분할: 선 위, 선이 만나는 네 점에 주인공. 눈은 위쪽 선에.
- 대칭: 양쪽이 같은 곳(복도, 건물 정면)에선 가운데가 정답.
- 리딩 라인: 길·난간·책상 모서리 같은 선이 주인공을 가리키게.
`);
    // 삼분할 프레임
    const fx = 0.6, fy = 1.6, fw = 6.2, fh = 3.49;
    s.addShape(S.rect, { x: fx, y: fy, w: fw, h: fh, fill: { color: C.background2 }, line: { color: C.accent5, width: 1.5 } });
    [1, 2].forEach((t) => {
      s.addShape(S.line, { x: fx + (fw * t) / 3, y: fy, w: 0, h: fh, line: { color: C.accent5, width: 1, dashType: "dash" } });
      s.addShape(S.line, { x: fx, y: fy + (fh * t) / 3, w: fw, h: 0, line: { color: C.accent5, width: 1, dashType: "dash" } });
    });
    [[1, 1], [2, 1], [1, 2], [2, 2]].forEach(([a, b]) => s.addShape(S.ellipse, { x: fx + (fw * a) / 3 - 0.12, y: fy + (fh * b) / 3 - 0.12, w: 0.24, h: 0.24, fill: { color: C.accent1 }, line: { type: "none" } }));
    s.addShape(S.ellipse, { x: fx + (fw * 2) / 3 - 0.35, y: fy + fh / 3 - 0.45, w: 0.7, h: 0.8, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.roundRect, { x: fx + (fw * 2) / 3 - 0.7, y: fy + fh / 3 + 0.4, w: 1.4, h: 1.6, rectRadius: 0.2, fill: { color: C.text2 }, line: { type: "none" } });
    k.text(s, "삼분할: 선이 만나는 점에 주인공, 눈은 위쪽 선에", { x: fx, y: fy + fh + 0.15, w: fw, h: 0.4, fontSize: 14, color: C.text2 });
    await k.stepRow(s, 7.1, 1.6, 5.6, 1.15, { n: "1", color: C.accent1, head: "삼분할", body: "선 위, 선이 만나는 네 점에 주인공" });
    await k.stepRow(s, 7.1, 2.9, 5.6, 1.15, { n: "2", color: C.accent2, head: "대칭", body: "양쪽이 같은 곳(복도·건물 정면)은 가운데" });
    await k.stepRow(s, 7.1, 4.2, 5.6, 1.15, { n: "3", color: C.accent4, head: "리딩 라인", body: "길 · 난간 · 책상 모서리가 주인공을 가리키게" });
  }
  {
    const s = content("구도 ② 무엇을 비울까", `
[14:56] 비우는 것도 구도입니다.
- 헤드룸: 머리 위는 손가락 한두 개만큼. 너무 비면 사람이 가라앉아 보이고, 너무 붙으면 답답해요.
- 시선 여백(리드룸): 보는 쪽, 가는 쪽에 공간을.
- 세로 안전 영역: 9:16 화면의 맨 위와 아래, 오른쪽은 버튼·캡션·프로필이 덮어요. 얼굴과 자막은 가운데 쪽에.
- 수직선: 문틀·건물 세로선을 화면과 나란히. 폰을 살짝만 기울여도 어색해요.
`);
    // 세로 안전 영역 폰
    const px = 0.9, py = 1.55, pw = 2.6, ph = 4.62;
    s.addShape(S.roundRect, { x: px, y: py, w: pw, h: ph, rectRadius: 0.2, fill: { color: C.background2 }, line: { color: C.text2, width: 2.5 } });
    s.addShape(S.rect, { x: px + 0.05, y: py + 0.05, w: pw - 0.1, h: ph * 0.13, fill: { color: C.accent3, transparency: 70 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + 0.05, y: py + ph * 0.75, w: pw - 0.1, h: ph * 0.25 - 0.05, fill: { color: C.accent3, transparency: 70 }, line: { type: "none" } });
    s.addShape(S.rect, { x: px + pw * 0.83, y: py + ph * 0.45, w: pw * 0.17 - 0.05, h: ph * 0.3, fill: { color: C.accent3, transparency: 70 }, line: { type: "none" } });
    k.text(s, "얼굴 · 자막은\n여기", { x: px, y: py + ph * 0.3, w: pw * 0.8, h: 0.8, fontSize: 14, bold: true, color: C.text2, align: "center" });
    k.text(s, "세로 안전 영역", { x: px - 0.3, y: py + ph + 0.1, w: pw + 0.6, h: 0.35, fontSize: 14, bold: true, color: C.accent3, align: "center" });
    const items = [["1", C.accent2, "헤드룸", "머리 위는 손가락 한두 개만큼"], ["2", C.accent4, "시선 여백", "보는 쪽, 가는 쪽에 공간을"], ["3", C.accent3, "세로 안전 영역", "위 · 아래 · 오른쪽은 버튼과 캡션 자리"], ["4", C.accent1, "수직선", "문틀 · 건물 세로선을 화면과 나란히"]];
    for (let i = 0; i < items.length; i++) {
      const [n, col, h, b] = items[i];
      await k.stepRow(s, 4.4, 1.55 + i * 1.18, 8.3, 1.02, { n, color: col, head: h, body: b, bodySize: 14 });
    }
  }
  {
    const s = content("구도 ③ 깊이와 틀", `
[15:00] 폰 화면은 평면이라 깊이를 일부러 만들어야 해요.
- 전경·중경·배경: 앞에 화분, 컵, 어깨 같은 걸 살짝 걸치면 깊이가 생겨요.
- 프레임 속 프레임: 문·창문·나뭇가지로 주인공을 한 번 더 감싸기.
- 반복과 깨짐: 같은 것이 늘어선 곳(의자, 계단)에 다른 하나를 두기.
`);
    const items = [["FaLayerGroup", C.accent2, "전경 · 중경 · 배경", "앞에 무언가를 살짝 걸치면 화면에 깊이가 생겨요"], ["FaBorderAll", C.accent4, "프레임 속 프레임", "문 · 창문 · 나뭇가지로 주인공을 한 번 더 감싸기"], ["FaGripLines", C.accent3, "반복과 깨짐", "같은 것이 늘어선 곳에 다른 하나를 두기"]];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 4.1, 1.6, 3.9, 3.5, { icon: ic, color: col, head, body, headSize: 19, bodySize: 15 });
    }
    k.note(s, "학교 공간에서 찾아보기: 복도 끝 창문, 계단 난간, 줄지은 책상", { y: 5.45 });
  }
  {
    const s = content("빛의 방향과 3점 조명", `
[15:03] 같은 얼굴도 빛의 방향에 따라 다른 사람이 됩니다.
- 순광: 정면에서, 밝고 선명 / 측광: 옆에서, 입체감과 분위기 / 역광: 뒤에서, 얼굴이 어두워짐 → 반사판 / 그늘: 부드럽고 고르게.
- 3점 조명(프로의 기본): 키(주 조명, 45도) + 필(반대쪽에서 그림자를 채움) + 백(뒤에서 윤곽).
- 폰으로는: 창문 = 키, 흰 종이·흰 벽 = 필, 뒤쪽 스탠드 = 백.
- 6교시에 강사 장비로 직접 보여 줍니다.
`);
    // 3점 조명 위에서 본 그림
    const cx = 3.5, cy = 3.7;
    s.addShape(S.ellipse, { x: cx - 0.4, y: cy - 0.4, w: 0.8, h: 0.8, fill: { color: C.text2 }, line: { type: "none" } });
    k.text(s, "사람", { x: cx - 0.6, y: cy + 0.45, w: 1.2, h: 0.35, fontSize: 13, align: "center", bold: true, color: C.text2 });
    await k.ornament(s, cx - 0.35, cy + 1.6, 0.7, C.accent5, null, { icon: "FaVideo" });
    k.text(s, "카메라", { x: cx - 0.6, y: cy + 2.3, w: 1.2, h: 0.3, fontSize: 12, align: "center" });
    await k.ornament(s, cx - 2.4, cy + 0.6, 0.8, C.accent1, null, { icon: "FaSun", iconHex: HEX.dk2 });
    k.text(s, "키 (주 조명)\n= 창문", { x: cx - 2.9, y: cy + 1.45, w: 1.8, h: 0.6, fontSize: 12, bold: true, align: "center" });
    await k.ornament(s, cx + 1.65, cy + 0.6, 0.7, C.accent6, null, { icon: "FaSquare", iconHex: HEX.dk2 });
    k.text(s, "필 (그림자 채움)\n= 흰 종이", { x: cx + 1.1, y: cy + 1.35, w: 1.8, h: 0.6, fontSize: 12, bold: true, align: "center" });
    await k.ornament(s, cx - 0.35, cy - 1.9, 0.7, C.accent4, null, { icon: "FaLightbulb" });
    k.text(s, "백 (윤곽) = 뒤쪽 스탠드", { x: cx - 1.3, y: cy - 1.15, w: 2.6, h: 0.3, fontSize: 12, bold: true, align: "center" });
    const dirs = [["순광", "정면 · 밝고 선명"], ["측광", "옆 · 입체감과 분위기"], ["역광", "뒤 · 얼굴이 어두움 → 반사판"], ["그늘", "부드럽고 고르게"]];
    k.text(s, "빛의 방향 네 가지", { x: 7.0, y: 1.55, w: 5.7, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
    dirs.forEach(([n, d], i) => {
      const y = 2.1 + i * 0.95;
      k.card(s, 7.0, y, 5.7, 0.8);
      k.text(s, n, { x: 7.25, y, w: 1.3, h: 0.8, fontSize: 17, bold: true, color: C.accent3, valign: "middle" });
      k.text(s, d, { x: 8.6, y, w: 4.0, h: 0.8, fontSize: 15, valign: "middle" });
    });
    k.text(s, "역광은 흰 종이 한 장으로 살린다 — 6교시에 직접", { x: 7.0, y: 6.0, w: 5.7, h: 0.4, fontSize: 14, bold: true, color: C.accent3 });
  }
  {
    const s = content("실습 · 구도 사진 미션 + AI 피드백 (25분)", `
[15:05–15:30] 학교 공간에서 15분, 돌아와서 ChatGPT 피드백 10분.
- 짝끼리 서로 모델이 되어 주기. 다른 사람이 나오면 동의 받기.
- 가장 자신 있는 1장을 ChatGPT에 올려 피드백 받기.
- 워크북에 "AI가 맞게 본 것 하나 / 놓친 것 하나" 적기 → AI는 규칙을 보고, 사람은 의도를 봅니다.
`);
    k.text(s, "학교 공간에서 15분", { x: 0.6, y: 1.5, w: 5.8, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
    k.checklist(s, ["삼분할 × 2", "헤드룸 좋은 예 · 나쁜 예", "대칭 × 1", "시선 여백 좋은 예 · 나쁜 예", "리딩 라인 × 1", "탑뷰 × 1", "프레임 속 프레임 × 1", "역광 + 흰 종이 반사판 × 1"], { x: 0.6, y: 2.05, w: 5.8, h: 4.0, fontSize: 15, paraSpaceAfter: 7 });
    k.card(s, 6.75, 1.5, 5.95, 2.6);
    k.text(s, "ChatGPT에 사진을 올리고", { x: 7.0, y: 1.65, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: C.accent4 });
    k.text(s, "이 사진의 구도에서 좋은 점 1개, 고칠 점 2개를 알려줘. 초보자가 다음 촬영에서 바로 고칠 수 있게, 샷 크기 · 앵글 · 구도 용어를 써서.", { x: 7.0, y: 2.1, w: 5.45, h: 1.9, fontSize: 15 });
    k.card(s, 6.75, 4.3, 5.95, 1.75, { fill: C.accent6 });
    k.text(s, "워크북에 한 줄씩", { x: 7.0, y: 4.42, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: C.text2 });
    k.text(s, "AI가 맞게 본 것 하나: ________\nAI가 놓친 것 하나: ________", { x: 7.0, y: 4.85, w: 5.4, h: 1.0, fontSize: 15, color: C.text2 });
    k.text(s, "AI는 규칙을 보고, 사람은 의도를 봅니다", { x: 6.75, y: 6.2, w: 5.95, h: 0.4, fontSize: 14, bold: true, color: C.accent3 });
  }

  // ───────────── 6교시 ─────────────
  await section(6, "움직임 · 컷 · 소리, 그리고 장비", "15:40–16:30 · 흔들림 없이, 한 장면을 여러 컷으로, 소리까지", `
[15:40–16:30] 목표: 안정·무빙·컷의 문법·녹음 기초 + 강사 장비 체험 + 5샷 시퀀스 촬영.
시간: 개념 20분 → 장비 시연·체험 10분 → 5샷 시퀀스 촬영 20분.
`);
  {
    const s = content("흔들림 잡기와 카메라 움직임", `
[15:42] 흔들림은 자세로 먼저, AI·앱 보정은 그다음(보정은 화면을 잘라내서 화질이 떨어져요).
- 자세: 두 손, 팔꿈치를 몸에 붙이기, 벽·기둥에 기대기. 걸을 땐 무릎을 살짝 굽히고 발뒤꿈치부터.
- 무빙 5가지와 영어 이름(4회차 프롬프트 어휘): 고정(Static), 팬(Pan), 틸트(Tilt), 다가가기(Push-in), 따라가기(Tracking).
- 세 가지 약속: 한 클립에 한 움직임, 생각보다 두 배 천천히, 시작과 끝에 2초 멈추기(편집에서 자를 자리).
`);
    const moves = [["FaPause", "고정", "Static"], ["FaArrowsAltH", "팬", "Pan"], ["FaArrowsAltV", "틸트", "Tilt"], ["FaCompressArrowsAlt", "다가가기", "Push-in"], ["FaWalking", "따라가기", "Tracking"]];
    for (let i = 0; i < moves.length; i++) {
      const [ic, ko, en] = moves[i];
      const x = 0.6 + i * 2.46;
      k.card(s, x, 1.55, 2.3, 2.6);
      await k.ornament(s, x + 0.75, 1.85, 0.8, C.accent4, null, { icon: ic });
      k.text(s, ko, { x, y: 2.85, w: 2.3, h: 0.45, fontSize: 18, bold: true, color: C.text2, align: "center" });
      k.text(s, en, { x, y: 3.3, w: 2.3, h: 0.35, fontSize: 13, color: C.accent5, align: "center" });
    }
    const rules = [["1", "한 클립에 한 움직임"], ["2", "생각보다 두 배 천천히"], ["3", "시작과 끝에 2초 멈추기"]];
    for (let i = 0; i < rules.length; i++) {
      const x = 0.6 + i * 4.1;
      k.card(s, x, 4.45, 3.9, 0.95, { fill: C.accent6 });
      await k.ornament(s, x + 0.15, 4.55, 0.75, C.accent3, rules[i][0], { fontSize: 18 });
      k.text(s, rules[i][1], { x: x + 1.05, y: 4.45, w: 2.75, h: 0.95, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
    }
    k.text(s, "흔들림은 자세로 먼저: 두 손, 팔꿈치는 몸에, 벽에 기대기. 앱 보정은 화면을 잘라내니 그다음", { x: 0.6, y: 5.75, w: 12.1, h: 0.7, fontSize: 15, color: C.text2 });
  }
  {
    const s = content("5샷 시퀀스: 뭘 찍을지 모를 때 꺼내는 공식", `
[15:47] 한 장면을 다섯 컷으로 찍으면 편집할 재료가 생깁니다(뉴스·다큐 촬영의 기본 공식).
1) 손 클로즈업: 무엇을 하는지
2) 얼굴 클로즈업: 누가, 어떤 표정으로
3) 와이드: 어디서
4) 어깨너머(Over the shoulder): 그 사람 시점
5) 특이한 앵글: 탑뷰, 로우앵글 등 눈길 끄는 컷
컷마다 7초 이상, 두 번씩. ①과 ②는 같은 동작을 다른 크기로 → 편집에서 '동작 연결'.
`);
    const shots = [["FaHandPaper", "손 클로즈업", "무엇을 하는지"], ["FaSmile", "얼굴 클로즈업", "누가, 어떤 표정으로"], ["FaMountain", "와이드", "어디서"], ["FaUserFriends", "어깨너머", "그 사람의 시점"], ["FaSyncAlt", "특이한 앵글", "탑뷰 · 로우앵글"]];
    for (let i = 0; i < shots.length; i++) {
      const [ic, h, b] = shots[i];
      const x = 0.6 + i * 2.46;
      k.card(s, x, 1.6, 2.3, 3.3);
      await k.ornament(s, x + 0.15, 1.75, 0.55, C.accent1, i + 1, { fontSize: 16, textColor: C.text2 });
      await k.ornament(s, x + 0.75, 2.2, 0.8, C.accent2, null, { icon: ic });
      k.text(s, h, { x, y: 3.15, w: 2.3, h: 0.45, fontSize: 17, bold: true, color: C.text2, align: "center" });
      k.text(s, b, { x: x + 0.1, y: 3.6, w: 2.1, h: 0.8, fontSize: 14, align: "center" });
    }
    k.note(s, "컷마다 7초 이상, 두 번씩. ①과 ②는 같은 동작을 다른 크기로 → 편집에서 이어 붙이면 자연스러워요", { y: 5.3 });
  }
  {
    const s = content("컷을 잇는 규칙: 180도 · 30도 · B롤", `
[15:52] 편집에서 어색해지는 이유는 대부분 촬영 때 생깁니다.
- 180도 규칙: 두 사람 사이에 가상의 선을 긋고, 카메라는 한쪽에만. 넘어가면 두 사람이 서로 반대를 보는 것처럼 보여요.
- 30도 규칙: 같은 대상을 다시 찍을 땐 각도를 30도 이상 바꾸거나 샷 크기를 바꾸기. 비슷하게 찍으면 튀는 컷(점프컷)이 됩니다.
- B롤: 이야기 사이에 끼우는 분위기 컷(손, 소품, 공간). 편집에서 말을 자른 자리를 덮어 줍니다. 넉넉히 찍어 두세요.
`);
    // 180도 다이어그램
    const ox = 0.9, oy = 1.7;
    k.card(s, ox - 0.3, oy - 0.15, 5.9, 4.3);
    s.addShape(S.ellipse, { x: ox + 0.8, y: oy + 1.2, w: 0.8, h: 0.8, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.ellipse, { x: ox + 3.6, y: oy + 1.2, w: 0.8, h: 0.8, fill: { color: C.text2 }, line: { type: "none" } });
    s.addShape(S.line, { x: ox, y: oy + 1.6, w: 5.2, h: 0, line: { color: C.accent3, width: 2, dashType: "dash" } });
    k.text(s, "가상의 선", { x: ox, y: oy + 1.7, w: 1.3, h: 0.3, fontSize: 12, color: C.accent3 });
    await k.ornament(s, ox + 1.0, oy + 2.75, 0.6, C.accent2, null, { icon: "FaVideo" });
    await k.ornament(s, ox + 3.2, oy + 2.75, 0.6, C.accent2, null, { icon: "FaVideo" });
    k.text(s, "카메라는 이쪽에서만 ✓", { x: ox + 0.6, y: oy + 3.45, w: 4.0, h: 0.35, fontSize: 14, bold: true, color: C.accent2, align: "center" });
    await k.ornament(s, ox + 2.2, oy + 0.1, 0.6, C.accent3, null, { icon: "FaTimes" });
    k.text(s, "넘어가면 방향이 뒤집혀 보여요", { x: ox + 2.9, y: oy + 0.2, w: 2.4, h: 0.5, fontSize: 12, color: C.accent3 });
    await k.stepRow(s, 6.9, 1.55, 5.8, 1.35, { n: "180", color: C.accent3, head: "180도 규칙", body: "두 사람 사이 선을 넘지 않기", bodySize: 14 });
    await k.stepRow(s, 6.9, 3.05, 5.8, 1.35, { n: "30", color: C.accent4, head: "30도 규칙", body: "다시 찍을 땐 30도 이상, 또는 샷 크기를 바꾸기", bodySize: 14 });
    await k.stepRow(s, 6.9, 4.55, 5.8, 1.35, { n: "B", color: C.accent1, head: "B롤을 넉넉히", body: "손 · 소품 · 공간 컷. 편집에서 자른 자리를 덮어 줘요", bodySize: 14 });
  }
  {
    const s = content("소리는 영상의 절반", `
[15:56] 시청자는 흐린 화면은 참아도 안 들리는 소리는 못 참습니다.
- 폰 마이크와 입 사이는 한 뼘. 멀어질수록 방 울림이 커져요.
- 조용한 곳: 에어컨·냉장고·복도 소리 없는 자리.
- 룸톤 10초: 촬영 끝에 아무 말 없이 10초 녹음. 편집에서 소리 빈 곳을 메꿉니다.
- 현장음: 발소리, 물소리, 칼질 소리 → 장면을 진짜로 만듭니다. 음악으로 다 덮지 않기.
- 이어폰 마이크나 핀마이크가 있으면 훨씬 깨끗합니다(다음 슬라이드 장비 체험).
`);
    const items = [["FaRulerHorizontal", C.accent2, "한 뼘 거리", "폰과 입 사이 한 뼘. 멀수록 방 울림"], ["FaVolumeMute", C.accent4, "조용한 자리", "에어컨 · 냉장고 · 복도 소리 피하기"], ["FaClock", C.accent1, "룸톤 10초", "끝에 말없이 10초 녹음 → 편집에서 빈 곳 메꾸기"], ["FaTint", C.accent3, "현장음 살리기", "발소리 · 물소리. 음악으로 다 덮지 않기"]];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 3.08, 1.6, 2.86, 3.5, { icon: ic, color: col, head, body, bodySize: 14 });
    }
    k.note(s, "흐린 화면은 참아도, 안 들리는 소리는 못 참는다", { y: 5.45 });
  }
  {
    const s = content("강사 장비 체험: 언제 쓰면 좋은가", `
[16:00–16:10] 강사 개인 장비를 보여 주고 크루별로 돌려 써 봅니다(크루당 약 2분, 나머지 크루는 5샷 시퀀스 기획).
- 삼각대: 고정 샷, 혼자 찍는 토크, 타임랩스. 미니 삼각대도 충분.
- 무선 핀마이크: 인터뷰·토크·브이로그 내레이션. 폰 마이크와 같은 문장을 녹음해 비교해 보기.
- 짐벌: 걷거나 따라가며 찍을 때. 대신 무겁고 세팅 시간이 들어요. 자세로 충분한 장면도 많습니다.
장비는 꼭 사지 않아도 된다고 말해 주세요. "사기 전에 자세부터."
`);
    const items = [["FaCamera", C.accent2, "삼각대", "고정 샷 · 혼자 찍는 토크 · 타임랩스\n미니 삼각대도 충분"], ["FaMicrophone", C.accent3, "무선 핀마이크", "인터뷰 · 토크 · 내레이션\n폰 마이크와 같은 문장으로 비교"], ["FaRunning", C.accent4, "짐벌", "걷거나 따라가며 찍을 때\n무겁고 세팅 시간이 들어요"]];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 4.1, 1.6, 3.9, 3.4, { icon: ic, color: col, head, body, headSize: 19, bodySize: 15 });
    }
    k.note(s, "크루별로 2분씩 돌려 써 보기. 장비는 사기 전에 자세부터", { y: 5.4 });
  }
  {
    const s = content("실습 · 학교 공간에서 5샷 시퀀스 (20분)", `
[16:10–16:30] 짝 중 한 사람이 행동하고 한 사람이 찍기 → 바꾸기.
- 행동은 내 아이템과 관련 있으면 더 좋아요(예: 디저트 포장, 화장품 바르기, 노트북 작업, 반려견 사진 보기).
- 컷마다 7초 이상, 두 번씩. 시작과 끝 2초 멈춤. 모두 잠그고(AE/AF) 찍기.
- 크루 기록 담당은 이 장면을 찍어 두기(6회차 브이로그 재료).
`);
    k.text(s, "짝이 행동하고, 나는 찍고 → 바꾸기", { x: 0.6, y: 1.5, w: 7.0, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
    k.checklist(s, ["① 손 클로즈업", "② 얼굴 클로즈업", "③ 와이드", "④ 어깨너머", "⑤ 특이한 앵글", "컷마다 7초 이상 · 두 번씩 · 앞뒤 2초", "모든 컷 AE/AF 잠금"], { x: 0.6, y: 2.05, w: 6.6, h: 4.0, fontSize: 16 });
    k.card(s, 7.4, 1.5, 5.3, 2.3);
    k.text(s, "행동 예시 (내 아이템이면 더 좋아요)", { x: 7.65, y: 1.65, w: 4.9, h: 0.4, fontSize: 15, bold: true, color: C.accent4 });
    k.text(s, "디저트 포장하기 · 화장품 바르기\n노트북으로 작업하기 · 커피 내리기\n반려견 사진 넘겨 보기", { x: 7.65, y: 2.1, w: 4.9, h: 1.5, fontSize: 15 });
    k.card(s, 7.4, 4.0, 5.3, 1.95, { fill: C.accent6 });
    k.text(s, "크루 기록 담당", { x: 7.65, y: 4.15, w: 4.9, h: 0.4, fontSize: 15, bold: true, color: C.accent3 });
    k.text(s, "크루가 촬영하는 모습을 찍어 두기\n→ 6회차 우리 반 브이로그 재료", { x: 7.65, y: 4.6, w: 4.9, h: 1.1, fontSize: 15, color: C.text2 });
  }

  // ───────────── 7교시 ─────────────
  await section(7, "촬영 리뷰와 공유", "16:40–17:30 · 보고, 고르고, 남기기", `
[16:40–17:30] 목표: 오늘 찍은 것을 드라이브에 모으고, 크루 리뷰로 '고르는 눈'을 기르고, 크루 베스트 컷 선정.
시간: 업로드 10분 → 크루 리뷰 20분 → 베스트 컷 공유 10분 → 정리·과제 10분.
`);
  {
    const s = content("크루 리뷰: 찍고, 보고, 고르기", `
[16:40–17:10]
1) 드라이브 업로드: 공유 폴더 → 크루 폴더 → 내 이름 → 1회차. 파일이 크면 폰 앱에서 바로 올리기.
2) 크루 리뷰: 한 사람씩 5샷 시퀀스를 크루에게 보여 주기. 첫 시청자가 먼저 칭찬 1 + 제안 1.
3) 체크: 세로·흔들림·밝기 출렁임·초점·소리.
4) 크루 베스트 컷 1개 선정 → 2회차에 채널을 열면 첫 업로드 재료가 됩니다.
크루 이름도 이때 정하기.
`);
    const steps = [["1", C.accent4, "드라이브에 올리기", "크루 폴더 → 내 이름 → 1회차"], ["2", C.accent2, "크루에게 보여 주기", "첫 시청자가 먼저 칭찬 1 + 제안 1"], ["3", C.accent3, "체크하기", "세로 · 흔들림 · 밝기 출렁임 · 초점 · 소리"], ["4", C.accent1, "크루 베스트 컷 고르기", "2회차 첫 업로드 재료 + 크루 이름 정하기"]];
    for (let i = 0; i < steps.length; i++) {
      const [n, col, h, b] = steps[i];
      await k.stepRow(s, 0.6, 1.55 + i * 1.18, 12.1, 1.02, { n, color: col, head: h, body: b });
    }
    k.text(s, "편집은 3회차부터. 오늘은 보고 고르는 눈을 기르는 날", { x: 0.6, y: 6.3, w: 12.1, h: 0.35, fontSize: 14, color: C.accent5 });
  }
  {
    const s = content("오늘 배운 다섯 가지", `
[17:10] 한 줄씩 짚고, 크루에서 "오늘 제일 기억에 남는 것" 하나씩 말하기.
`);
    const items = [["프로의 공정", "기획 → 프리프로덕션 → 촬영 → 편집 → 마스터링 → 발행 → 분석"], ["노출과 색", "조리개 · 셔터 · ISO + 화이트밸런스. 조리개는 숫자가 작을수록 밝다"], ["영상 세팅", "1080p 30fps · 셔터 2배 · HDR과 HEVC 끄기 · AE/AF 잠금"], ["화면의 언어", "샷 크기 · 앵글 · 구도 · 빛. 영어 이름은 4회차 AI 프롬프트가 된다"], ["컷과 소리", "5샷 시퀀스 · 180도 · 30도 · B롤 · 한 뼘 거리 · 룸톤"]];
    for (let i = 0; i < items.length; i++) {
      const [h, b] = items[i];
      await k.stepRow(s, 0.6, 1.5 + i * 0.98, 12.1, 0.86, { n: i + 1, color: [C.accent2, C.accent4, C.accent3, C.accent1, C.text2][i], head: h, body: null });
      k.text(s, b, { x: 4.4, y: 1.5 + i * 0.98, w: 8.1, h: 0.86, fontSize: 15, valign: "middle" });
    }
  }
  {
    const s = content("다음 시간까지 · 10/30 (금)", `
[17:15] 과제는 단톡방에도 올립니다. 제출은 드라이브 내 폴더 '1회차 과제'.
1) 마음에 드는 콘텐츠 10편 저장(인스타·유튜브·틱톡 어디든) + 왜 좋은지 한 줄씩 → 2회차 레퍼런스 분석에 씁니다.
2) "내가 만들고 싶은 채널" 한 줄: 누구에게 무엇을 보여 주고 싶은지.
3) CapCut PC 설치가 안 된 사람은 안내대로 설치.
선택: 오늘 배운 5샷 시퀀스를 집에서 하나 더(내 아이템으로).
`);
    const items = [["FaBookmark", C.accent3, "콘텐츠 10편 저장", "인스타 · 유튜브 · 틱톡 어디든\n왜 좋은지 한 줄씩"], ["FaPen", C.accent2, "만들고 싶은 채널 한 줄", "누구에게, 무엇을 보여 주고 싶은지"], ["FaDownload", C.accent4, "CapCut PC 설치", "오늘 못 한 사람만\n안내대로"]];
    for (let i = 0; i < items.length; i++) {
      const [ic, col, head, body] = items[i];
      await k.iconCard(s, 0.6 + i * 4.1, 1.6, 3.9, 3.3, { icon: ic, color: col, head, body, headSize: 19, bodySize: 15 });
    }
    k.note(s, "선택: 5샷 시퀀스를 집에서 내 아이템으로 하나 더 · 제출은 드라이브 '1회차 과제'", { y: 5.3 });
  }
  {
    const s = content("2회차 예고 · 기획하는 머리", `
[17:20] 2회차: 아이템 찾기 → 레퍼런스 해부 → 채널 콘셉트 → 기획안·대본 → 스토리보드 → 그리고 유튜브 채널을 엽니다(강사도 함께 새 채널을 엽니다).
"다음 주에 여러분 채널이 생깁니다. 오늘 고른 베스트 컷이 첫 영상이 될 수도 있어요."
`);
    k.card(s, 0.6, 1.55, 12.1, 2.0, { fill: C.text2 });
    k.text(s, "10월 30일, 우리는 각자 채널을 엽니다", { x: 0.9, y: 1.7, w: 11.5, h: 0.8, fontSize: 28, bold: true, color: C.accent1, valign: "middle" });
    k.text(s, "강사도 같은 날, 여러분과 함께 새 채널을 엽니다", { x: 0.9, y: 2.55, w: 11.5, h: 0.6, fontSize: 18, color: C.background1, valign: "middle" });
    const flow = ["아이템 찾기", "레퍼런스 해부", "채널 콘셉트", "기획안 · 대본", "스토리보드", "채널 개설"];
    flow.forEach((t, i) => {
      const x = 0.6 + i * 2.06;
      k.card(s, x, 4.0, 1.8, 1.0, { fill: i === 5 ? C.accent6 : C.background2 });
      k.text(s, t, { x, y: 4.0, w: 1.8, h: 1.0, fontSize: 15, bold: true, color: C.text2, align: "center", valign: "middle" });
      if (i < flow.length - 1) k.arrowRight(s, x + 1.82, 4.5, 0.22);
    });
  }
  statement("AI는 장비, 연출은 당신", "오늘 기른 '보는 눈'이 6번의 수업 내내 모든 것의 바닥이 됩니다", `
[17:25] 마무리 인사. 크루장은 크루 전원이 드라이브 업로드를 마쳤는지 확인하고 해산.
수업 후 강사 할 일: 요약 영상 제작(대본은 별도 파일), 단톡방에 전자책 1장·치트시트·과제 공지 올리기.
`);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
