// 1회차 추가안: 영화 현장 촬영 기법 (본편과 따로 만드는 슬라이드). node build/session1_filmcraft.js [출력 경로]
const path = require("path");
const { THEME, W, M, newDeck, makeKit } = require("./lib/deck");
const { render, KEYS } = require("./lib/film_diagrams");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "..", "lectures", "01", "1회차_추가슬라이드_현장촬영기법.pptx");
const CW = W - 2 * M;
const CACHE = path.join(__dirname, ".cache", "s1", "film");

const MOVES = [
  ["dolly", "달리 인 · 아웃", "Dolly In / Out", "카메라 자체가 다가가고 물러난다. 다가가면 몰입 · 긴장, 물러나면 고립 · 마무리.", "짐벌 들고 천천히 걷기. 줌 대신 발로."],
  ["truck", "트럭 (옆으로 이동)", "Truck · Crab", "피사체와 나란히 옆으로. 앞의 기둥 · 나무가 지나가며 깊이(시차)가 생긴다.", "전경을 하나 끼고 옆걸음. 바퀴 의자도 훌륭한 달리."],
  ["pedestal", "페디스털 · 크레인", "Pedestal · Crane", "카메라 높이를 올리고 내린다. 올라가며 공간 공개, 내려오며 인물로 진입.", "짐벌을 무릎 → 머리 위로. 틸트와 달리 몸 높이가 바뀐다."],
  ["arc", "아크 (둘러 돌기)", "Arc · Orbit", "인물을 중심으로 원을 그리며 돈다. 결심 · 고백 · 제품 공개처럼 '중요한 순간'.", "짐벌로 인물과 같은 거리를 지키며 옆걸음으로 반 바퀴."],
  ["reveal", "리빌 (드러내기)", "Reveal", "기둥 · 벽 · 물건 뒤에서 나오며 주인공을 보여 준다. 궁금증 → 해소.", "벽 모서리나 컵 뒤에서 시작해 옆이나 위로 빠지기."],
  ["whip", "휩 팬", "Whip Pan", "아주 빠른 팬으로 화면이 번지며 다음 대상으로 넘어간다. 에너지 · 장면 전환.", "끝 장면 휩 + 다음 장면 휩을 같은 방향으로 찍어 이으면 전환 효과."],
  ["dollyzoom", "돌리 줌", "Dolly Zoom", "물러나며 줌인(또는 반대). 인물 크기는 그대로, 배경만 늘었다 줄었다. 충격 · 현기증.", "뒤로 걸으며 줌인. 손으로는 어려워 짐벌 앱 기능을 쓰는 게 편하다."],
  ["oner", "롱테이크 (원테이크)", "Long Take · Oner", "끊지 않고 한 번에 따라간다. 현장감 · 긴장 · 시간이 실제로 흐르는 느낌.", "동선을 미리 걸어 보고(리허설) 짐벌로. 브이로그 오프닝에 강하다."],
];

async function main() {
  const dia = {};
  for (const k of KEYS) dia[k] = await render(k, CACHE);

  const { pres, C } = newDeck({ title: "촬영편집 1회차 추가안 — 영화 현장 촬영 기법", footer: "AI콘텐츠 크리에이터 실무 · 촬영편집 1회차 — 추가안: 현장 촬영 기법" });
  const k = makeKit(pres, C);
  const { S } = k;
  const sec = "6교시 추가안 · 현장 촬영 기법";
  pres.addSection({ title: sec });
  const content = (title, notes, part) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    k.kicker(s, `6교시 · 추가안: 현장 촬영 기법${part ? "  ·  " + part : ""}`);
    k.progress(s, 6);
    s.addText(title, { placeholder: "title" });
    if (notes) s.addNotes(notes.trim());
    return s;
  };
  const dark = (s, x, y, w, h) => k.card(s, x, y, w, h, { fill: C.text2 });
  const label = (s, t, x, y, w, col = C.accent1) => k.text(s, t, { x, y, w, h: 0.28, fontSize: 11.5, bold: true, color: col, charSpacing: 1 });

  // 1. 한눈에
  {
    const s = content("영화 현장은 이렇게 찍는다", `[추가안 시작] 오늘 오전까지가 '카메라 사용법'이었다면, 여기부터는 '현장의 일하는 방식'.
장비가 폰이어도 방식은 똑같이 쓸 수 있습니다. 다섯 묶음: 무빙 → 렌즈와 초점 → 커버리지 → 현장 운영 → 화질 · 색 · 빛 · 소리.
"이걸 다 외우자는 게 아니라, 현장 사람들이 왜 이렇게 일하는지 이유를 가져가자."`);
    const parts = [
      ["A", "카메라 무빙", "달리 · 트럭 · 크레인 · 아크 · 리빌 · 휩 팬 · 돌리 줌 · 롱테이크"],
      ["B", "렌즈와 초점", "화각이 감정을 바꾼다. 초점 이동으로 시선을 옮긴다"],
      ["C", "커버리지", "한 장면을 여러 각도로. 대화 · 인터뷰 카메라 배치"],
      ["D", "현장 운영", "콜 순서 · 슬레이트 · 숏리스트 · 연속성 · 데이터 백업"],
      ["E", "화질과 소리", "180도 셔터 · 노출 도구 · 색 맞추기 · 조명 · 이중 녹음"],
    ];
    const cw = (CW - 4 * 0.25) / 5;
    parts.forEach(([n, h, b], i) => {
      const x = M + i * (cw + 0.25);
      dark(s, x, 1.75, cw, 3.9);
      k.text(s, n, { x: x + 0.3, y: 1.95, w: 1, h: 0.9, fontSize: 48, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.3, y: 2.95, w: cw - 0.5, h: 0.5, fontSize: 18, bold: true, color: C.background1 });
      k.text(s, b, { x: x + 0.3, y: 3.55, w: cw - 0.5, h: 1.9, fontSize: 13, color: "C9D3CE" });
    });
    k.takeaway(s, "장비는 폰이어도 일하는 방식은 현장과 똑같이. 그게 '실무'입니다", 5.95);
  }

  // 2~3. 무빙 8가지
  for (const [pi, slice] of [[0, MOVES.slice(0, 4)], [1, MOVES.slice(4)]]) {
    const s = content(`카메라 무빙 8가지 ${pi === 0 ? "①" : "②"}`, pi === 0
      ? `[무빙 ①] 오전의 팬 · 틸트는 '고개만 돌리기', 여기부터는 '카메라가 몸째 움직이기'.
평면도 보는 법: 위에서 내려다본 그림. 흰 원 = 사람, 금색 부채꼴 = 카메라가 보는 범위, 흐린 카메라 = 출발 위치.
달리: 줌과 달리 원근이 바뀐다(다음 장들에서). 트럭: 전경을 끼면 시차로 깊이감. 페디스털: 틸트와 헷갈리지 않기. 아크: 짐벌 실습 때 강사 시연.`
      : `[무빙 ②] 리빌: 숏폼 첫 1초 후킹에 강함. 휩 팬: 데이미언 셔젤 감독 영화(위플래시 · 라라랜드)에서 자주 보이는 전환.
돌리 줌: 히치콕 〈현기증〉(1958)에서 유명해져 'Vertigo effect', 〈죠스〉(1975) 해변 장면도 유명.
롱테이크: 〈1917〉은 영화 전체가 한 번에 찍은 것처럼 보이게 설계. 브이로그 오프닝 원테이크로 응용.`, "A 카메라 무빙");
    const cw = (CW - 3 * 0.25) / 4, ih = cw / 1.5;
    slice.forEach(([key, name, en, eff, phone], i) => {
      const x = M + i * (cw + 0.25);
      k.card(s, x, 1.72, cw, 4.38);
      s.addImage({ path: dia[key], x, y: 1.72, w: cw, h: ih, altText: name });
      label(s, en.toUpperCase(), x + 0.22, 1.72 + ih + 0.15, cw - 0.4, C.accent2);
      k.text(s, name, { x: x + 0.22, y: 1.72 + ih + 0.42, w: cw - 0.4, h: 0.38, fontSize: 16, bold: true });
      k.text(s, eff, { x: x + 0.22, y: 1.72 + ih + 0.85, w: cw - 0.4, h: 0.95, fontSize: 11.5, color: C.text1 });
      k.text(s, "폰으로 · " + phone, { x: x + 0.22, y: 1.72 + ih + 1.78, w: cw - 0.4, h: 0.6, fontSize: 11, color: C.accent5 });
    });
    k.takeaway(s, pi === 0 ? "무빙은 '왜 움직이는지'가 먼저. 이유 없는 움직임은 흔들림일 뿐입니다" : "멋진 무빙도 한 영상에 한두 번. 많이 쓰면 효과가 사라집니다", 6.25);
  }

  // 4. 폰 · 짐벌로
  {
    const s = content("폰과 짐벌로 현장 무빙 흉내 내기", `[무빙 실전] 표는 그대로 6교시 장비 체험 때 체크리스트로 씁니다. 강사 짐벌로 아크 · 페디스털 · 휩 팬 시연 → 크루별 2분 체험.
현장 기본: 움직임 시작 전 2초 정지, 끝나고 2초 정지(편집 손잡이). 빠른 휩 팬 외에는 생각보다 두 배 천천히.`, "A 카메라 무빙");
    k.table(s, [
      ["기법", "장비 없이", "짐벌이 있으면", "현장 팁"],
      ["달리 인 · 아웃", "두 손 + 팔꿈치 고정, 닌자 걸음", "가장 쉬운 무빙. 속도 일정하게", "줌 대신 발로. 화질 손해 없음"],
      ["트럭", "바퀴 의자 · 카트에 앉아서", "옆걸음, 짐벌 팬 모드", "전경(기둥 · 화분)을 꼭 끼기"],
      ["페디스털 · 크레인", "무릎 높이에서 일어서며", "로우 모드로 바닥 → 눈높이", "틸트하지 말고 높이만 바꾸기"],
      ["아크", "인물과 같은 거리로 반 바퀴", "팔로우 모드 + 옆걸음", "인물 쪽으로 몸을 기울이기"],
      ["리빌", "물건 뒤에서 옆으로 빠지기", "같은 방법, 더 부드럽게", "첫 프레임은 완전히 가려 두기"],
      ["휩 팬", "손목 스냅으로 빠르게", "스포츠(빠른 팬) 모드", "두 장면을 같은 방향으로"],
      ["돌리 줌", "어려움(손으로 줌 조절 불가)", "짐벌 앱의 돌리 줌 기능", "배경이 깊은 장소에서"],
      ["롱테이크", "광각 0.5x + 닌자 걸음", "동선 리허설 후 한 번에", "실패 대비 두세 번 찍기"],
    ], { x: M, y: 1.7, w: CW, colW: [2.2, 3.2, 3.2, CW - 8.6], fontSize: 12.5, rowH: 0.44 });
  }

  // 5. 줌 vs 달리 · 돌리 줌
  {
    const s = content("줌과 달리는 다르다 · 돌리 줌의 원리", `[렌즈 ①] 현장에서 줌으로 '다가가기'를 잘 안 쓰는 이유: 줌은 확대일 뿐 원근(배경과 인물의 관계)이 그대로라 평면적.
달리는 카메라가 실제로 움직여 배경과 인물의 관계가 바뀌어 입체적. 폰의 디지털 줌은 화질까지 떨어짐.
돌리 줌: 카메라는 뒤로(또는 앞으로), 줌은 반대로 → 인물 크기는 같은데 배경만 변해 '세상이 흔들리는' 느낌. 도식: 금색 = 가까이서 넓게(배경이 넓게 보임), 흰색 = 멀리서 좁게.`, "B 렌즈와 초점");
    s.addImage({ path: dia.dollyzoom, x: M, y: 1.72, w: 6.3, h: 4.2, altText: "돌리 줌 평면도" });
    const rx = M + 6.75, rw = W - M - rx;
    [["줌 (Zoom)", "렌즈만 확대. 원근은 그대로라 평면적. 폰은 디지털 줌이면 화질도 손해."],
     ["달리 (Dolly)", "카메라가 실제로 이동. 배경과 인물의 관계가 바뀌어 입체적."],
     ["돌리 줌 (Dolly Zoom)", "물러나며 줌인. 인물 크기는 그대로, 배경만 바짝 다가오며 늘어난다. 충격 · 깨달음의 순간."]].forEach(([h, b], i) => {
      const y = 1.72 + i * 1.42;
      k.card(s, rx, y, rw, 1.27, { fill: i === 2 ? C.text2 : C.background2 });
      k.text(s, h, { x: rx + 0.3, y: y + 0.17, w: rw - 0.6, h: 0.36, fontSize: 16, bold: true, color: i === 2 ? C.accent1 : C.text1 });
      k.text(s, b, { x: rx + 0.3, y: y + 0.55, w: rw - 0.6, h: 0.66, fontSize: 12.5, color: i === 2 ? "C9D3CE" : C.accent5 });
    });
    k.takeaway(s, "다가가고 싶으면 줌 버튼보다 발. 폰은 렌즈 배율(0.5x · 1x · 3x)만 바꾸고 그 사이는 걸어서", 6.2);
  }

  // 6. 렌즈와 감정
  {
    const s = content("렌즈가 감정을 바꾼다 · 0.5x · 1x · 3x", `[렌즈 ②] 세 칸 모두 인물 크기는 같게, 카메라 거리만 다르게 찍은 것. 광각은 배경이 작고 멀어지며 얼굴이 살짝 늘어남. 망원은 배경이 크게 다가오며(압축) 인물이 도드라짐.
실무: 인물 클로즈업은 2~3x로 조금 떨어져서(얼굴 왜곡이 줄어 예쁘게). 공간 소개 · 좁은 방은 0.5x. 인터뷰 B캠은 3x.`, "B 렌즈와 초점");
    s.addImage({ path: dia.lens, x: M, y: 1.72, w: CW, h: CW * 0.3, altText: "광각 · 표준 · 망원 비교" });
    const cw = (CW - 2 * 0.3) / 3, y0 = 1.72 + CW * 0.3 + 0.18;
    [["0.5x 광각", "Wide", "공간이 넓고 깊게, 다이내믹. 가까이 대면 얼굴이 늘어난다", "공간 소개 · 좁은 방 · 롱테이크"],
     ["1x 표준", "Normal", "사람 눈과 비슷한 자연스러움", "브이로그 · 기본 촬영"],
     ["2~3x 망원", "Telephoto", "배경이 당겨지는 압축 · 인물 강조 · 관찰하는 시선", "인물 클로즈업 · 인터뷰 B캠 · 제품"]].forEach(([h, en, b, use], i) => {
      const x = M + i * (cw + 0.3);
      k.text(s, h, { x, y: y0, w: 2.6, h: 0.36, fontSize: 16, bold: true });
      k.text(s, en.toUpperCase(), { x: x + 2.4, y: y0 + 0.06, w: cw - 2.4, h: 0.3, fontSize: 11, bold: true, color: C.accent2, align: "right" });
      k.text(s, b, { x, y: y0 + 0.4, w: cw, h: 0.5, fontSize: 12, color: C.text1 });
      k.text(s, "→ " + use, { x, y: y0 + 0.88, w: cw, h: 0.3, fontSize: 11.5, bold: true, color: C.accent1 });
    });
  }

  // 7. 초점 이동
  {
    const s = content("초점 이동 · 시선을 옮기는 가장 영화 같은 방법", `[렌즈 ③] 랙 포커스: 앞사람 → 뒷사람(또는 물건 → 사람)으로 초점을 옮겨 '이제 이걸 보세요'라고 말하는 기법. 현장에서는 포커스 풀러가 거리를 재서 정확히 돌립니다.
폰: ① 녹화 중 화면 탭(가장 쉬움, 속도는 폰이 정함) ② 아이폰 '시네마틱 모드'는 촬영 후 편집에서 초점을 바꿀 수 있음 ③ 수동 카메라 앱의 초점 링으로 천천히.
심도가 얕아야 효과가 큼: 앞 물체에 가까이, 배경은 멀리. 3x 망원 + 가까운 전경이 쉬운 조합.`, "B 렌즈와 초점");
    s.addImage({ path: dia.rack, x: M, y: 1.72, w: 7.0, h: 7.0 / 2.467, altText: "초점 이동 전후" });
    k.text(s, "앞사람에 초점", { x: M, y: 1.72 + 2.84 + 0.08, w: 3.4, h: 0.3, fontSize: 12.5, bold: true, align: "center" });
    k.text(s, "뒷사람으로 초점 이동", { x: M + 3.6, y: 1.72 + 2.84 + 0.08, w: 3.4, h: 0.3, fontSize: 12.5, bold: true, align: "center" });
    const rx = M + 7.4, rw = W - M - rx;
    label(s, "RACK FOCUS · FOCUS PULL", rx, 1.72, rw, C.accent2);
    k.text(s, "폰으로 하는 세 가지 방법", { x: rx, y: 2.02, w: rw, h: 0.4, fontSize: 17, bold: true });
    [["1", "녹화 중 화면 탭", "가장 쉽다. 이동 속도는 폰이 정한다"], ["2", "아이폰 시네마틱 모드", "찍은 뒤 편집에서 초점을 옮길 수 있다"], ["3", "수동 카메라 앱", "초점 링을 직접 천천히 돌린다"]].forEach(([n, h, b], i) => {
      const y = 2.55 + i * 0.95;
      k.badge(s, rx, y + 0.05, 0.48, n, { fontSize: 13 });
      k.text(s, h, { x: rx + 0.65, y, w: rw - 0.65, h: 0.34, fontSize: 14.5, bold: true });
      k.text(s, b, { x: rx + 0.65, y: y + 0.36, w: rw - 0.65, h: 0.5, fontSize: 12, color: C.accent5 });
    });
    k.takeaway(s, "효과를 키우려면 심도를 얕게: 앞 물체에 가까이, 배경은 멀리, 3x 망원으로", 6.0);
  }

  // 8. 커버리지 순서
  {
    const s = content("커버리지 · 한 장면을 여러 각도로 찍어 두기", `[커버리지 ①] 커버리지 = 편집자가 고를 수 있게 같은 장면을 여러 각도 · 크기로 확보하는 것. 한 컷이 망가져도 다른 각도로 살릴 수 있는 보험.
보통 넓은 것에서 좁은 것으로: 마스터(전체 연기를 처음부터 끝까지) → 미디엄 → 어깨 너머 → 클로즈업 → 인서트 · 컷어웨이.
인서트 = 마스터 안에 있던 행동을 다르게 보여 주기(손, 컵), 컷어웨이 = 마스터에 없던 것(창밖, 다른 손님).`, "C 커버리지");
    const steps = [["1", "마스터", "Master", "장면 전체를 처음부터 끝까지 넓게"], ["2", "미디엄", "Medium", "두 사람 · 상반신, 관계가 보이게"], ["3", "어깨 너머", "Over the Shoulder", "상대 어깨 너머로 말하는 사람"], ["4", "클로즈업", "Close-up", "표정 · 리액션, 가장 감정적인 컷"], ["5", "인서트", "Insert", "손 · 컵 · 화면처럼 행동의 디테일"], ["6", "컷어웨이", "Cutaway", "장면 밖의 것: 창밖 · 시계 · 주변"]];
    const cw = (CW - 5 * 0.2) / 6;
    steps.forEach(([n, h, en, b], i) => {
      const x = M + i * (cw + 0.2);
      k.card(s, x, 1.75, cw, 3.3, { fill: i === 0 ? C.text2 : C.background2 });
      k.text(s, n, { x: x + 0.22, y: 1.9, w: 0.8, h: 0.7, fontSize: 30, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.22, y: 2.65, w: cw - 0.35, h: 0.4, fontSize: 16, bold: true, color: i === 0 ? C.background1 : C.text1 });
      k.text(s, en.toUpperCase(), { x: x + 0.22, y: 3.05, w: cw - 0.35, h: 0.45, fontSize: 9.5, bold: true, color: i === 0 ? C.accent6 : C.accent2 });
      k.text(s, b, { x: x + 0.22, y: 3.55, w: cw - 0.35, h: 1.3, fontSize: 12, color: i === 0 ? "C9D3CE" : C.accent5 });
    });
    k.arrow(s, M + 0.2, 5.35, CW - 0.4);
    k.text(s, "넓게 → 좁게 (조명 · 세팅을 덜 바꾸는 순서)", { x: M, y: 5.45, w: CW, h: 0.3, fontSize: 12, color: C.accent5, align: "center" });
    k.takeaway(s, "편집은 찍어 둔 것 안에서만 할 수 있습니다. 커버리지는 편집자를 위한 보험", 6.0);
  }

  // 9. 대화 장면 배치
  {
    const s = content("대화 장면 카메라 배치 · 다섯 자리", `[커버리지 ②] 평면도: A와 B가 마주 앉은 대화. 빨간 점선 = 180도 선(오전에 배운 그 선). 모든 카메라는 선의 한쪽에만.
1 마스터 → 2 · 3 어깨 너머(OTS)로 숏-리버스 숏 → 4 · 5 클로즈업. 2와 3은 거울처럼 같은 거리 · 높이 · 렌즈로 찍어야 편집 때 자연스럽다.
아이라인: A의 시선은 화면 오른쪽, B의 시선은 화면 왼쪽으로 일관되게.`, "C 커버리지");
    s.addImage({ path: dia.coverage, x: M, y: 1.72, w: 6.3, h: 4.2, altText: "대화 장면 카메라 배치 평면도" });
    const rx = M + 6.75, rw = W - M - rx;
    [["1", "마스터", "두 사람 전체, 장면 전부"], ["2", "B 어깨 너머로 A", "숏 (Shot)"], ["3", "A 어깨 너머로 B", "리버스 숏 (Reverse Shot)"], ["4", "A 클로즈업", "표정 · 리액션"], ["5", "B 클로즈업", "표정 · 리액션"]].forEach(([n, h, b], i) => {
      const y = 1.72 + i * 0.72;
      k.badge(s, rx, y + 0.08, 0.46, n, { fontSize: 13, fill: i < 3 ? C.accent1 : C.text2, color: i < 3 ? C.text1 : C.background1 });
      k.text(s, h, { x: rx + 0.62, y: y + 0.02, w: rw - 0.62, h: 0.32, fontSize: 14.5, bold: true });
      k.text(s, b, { x: rx + 0.62, y: y + 0.34, w: rw - 0.62, h: 0.3, fontSize: 12, color: C.accent5 });
    });
    k.card(s, rx, 5.4, rw, 0.55, { fill: "F6E3E1" });
    k.text(s, "빨간 점선 = 180도 선. 카메라는 한쪽에만", { x: rx + 0.2, y: 5.4, w: rw - 0.4, h: 0.55, fontSize: 12.5, bold: true, color: C.accent3, valign: "middle" });
    k.takeaway(s, "2와 3은 거울처럼: 같은 거리 · 높이 · 배율로 찍어야 편집이 매끄럽습니다", 6.2);
  }

  // 10. 인터뷰
  {
    const s = content("인터뷰 실무 · 카메라 두 대로 찍기", `[커버리지 ③] 정보성 · 브랜딩 영상의 기본은 인터뷰. 폰 두 대로 현장 방식 그대로.
A캠 = 와이드(바스트, 정면에 가깝게), B캠 = 타이트(클로즈업, 45도 옆, 3x). 말을 잘라 붙일 때 A → B로 바꾸면 점프컷이 안 보입니다.
시선: 인터뷰이는 카메라가 아니라 카메라 바로 옆의 인터뷰어를 봅니다. 정보 전달형 숏폼은 렌즈를 직접 보는 경우도 있어 의도에 따라 선택.`, "C 커버리지");
    s.addImage({ path: dia.interview, x: M, y: 1.72, w: 6.3, h: 4.2, altText: "인터뷰 두 대 카메라 평면도" });
    const rx = M + 6.75, rw = W - M - rx;
    k.checklist(s, [
      "A캠 와이드 + B캠 타이트(45도, 3x)",
      "인터뷰이는 카메라 옆 인터뷰어를 본다",
      "벽에서 1.5m 이상 떨어져 앉기(배경 깊이 · 그림자 없애기)",
      "창문(금색)을 얼굴 45도 앞쪽에: 키 라이트",
      "두 폰 모두 같은 화이트밸런스 · fps · 해상도",
      "시작 전 손뼉 한 번: 두 카메라 · 녹음 싱크",
      "질문 끝나고 1초 쉬고 대답(편집 여유)",
    ], { x: rx, y: 1.75, w: rw, h: 4.2, fontSize: 13.5 });
    k.takeaway(s, "B캠이 있으면 말을 잘라도 티가 나지 않습니다. 폰 두 대면 충분", 6.2);
  }

  // 11. 편집을 위한 촬영
  {
    const s = content("편집을 위한 촬영 · 현장에서 챙기는 네 가지", `[커버리지 ④] 편집에서 어색한 것은 대부분 촬영에서 생깁니다.
액션 겹쳐 찍기: 컵을 드는 동작을 와이드에서도 클로즈업에서도 처음부터 끝까지 → 편집에서 동작 중간에 자르면(컷 온 액션) 컷이 안 보입니다.
핸들: 액션 전 2~3초, 컷 후 2~3초. 룸톤: 그 장소의 '조용한 소리' 30초 이상 → 대사 사이 빈 곳을 메움.`, "C 커버리지");
    const items = [["01", "액션 겹쳐 찍기", "Overlapping Action", "같은 동작을 모든 각도에서 처음부터 끝까지. 편집에서 동작 중간에 잘라 이으면 컷이 사라진다(컷 온 액션)."],
      ["02", "핸들", "Handles", "'액션' 전 2~3초, '컷' 후 2~3초 그대로 두기. 전환 · 속도 조절에 쓸 여유."],
      ["03", "룸톤", "Room Tone", "모두 멈추고 그 장소의 소리만 30초 이상. 대사 사이 빈 곳을 자연스럽게 메운다."],
      ["04", "B롤 넉넉히", "B-roll · Cutaways", "손 · 소품 · 공간 · 창밖. 말이 길어질 때 덮을 그림. 필요하다 싶은 양의 두 배."]];
    const cw = (CW - 3 * 0.3) / 4;
    items.forEach(([n, h, en, b], i) => {
      const x = M + i * (cw + 0.3);
      k.card(s, x, 1.75, cw, 3.95);
      k.text(s, n, { x: x + 0.3, y: 1.95, w: 1.2, h: 0.6, fontSize: 26, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.3, y: 2.62, w: cw - 0.55, h: 0.4, fontSize: 17, bold: true });
      k.text(s, en.toUpperCase(), { x: x + 0.3, y: 3.03, w: cw - 0.55, h: 0.3, fontSize: 10, bold: true, color: C.accent2 });
      k.text(s, b, { x: x + 0.3, y: 3.45, w: cw - 0.55, h: 2.1, fontSize: 12.5, color: C.accent5 });
    });
    k.takeaway(s, "'나중에 편집에서 살리자'는 없습니다. 편집할 재료는 현장에서만 생깁니다", 6.0);
  }

  // 12. 콜 순서
  {
    const s = content("현장의 약속 · 촬영 시작 콜 순서", `[현장 운영 ①] 영화 현장은 정해진 순서로 말하고 대답합니다. 소리를 먼저 돌려야 테이크 앞부분 소리를 잃지 않기 때문에 사운드가 먼저.
조감독: "롤 사운드" → 녹음: "스피드" → 조감독: "롤 카메라" → 촬영: "롤링" → 슬레이트: "마커"(딱!) → 감독: "액션" → 감독: "컷".
팀마다 조금씩 다르고(동시에 돌리는 '턴오버' 등) 슬레이트는 보통 촬영부(세컨드)가 칩니다. 우리 크루 버전은 아래 줄.`, "D 현장 운영");
    const calls = [["롤 사운드", "Roll Sound", "조감독"], ["스피드", "Speed", "녹음"], ["롤 카메라", "Roll Camera", "조감독"], ["롤링", "Rolling", "촬영"], ["마커!", "Marker · 슬레이트", "촬영부"], ["액션", "Action", "감독"], ["컷", "Cut", "감독"]];
    const cw = (CW - 6 * 0.15) / 7;
    calls.forEach(([h, en, who], i) => {
      const x = M + i * (cw + 0.15);
      const hi = i === 4 || i === 5;
      k.card(s, x, 1.8, cw, 1.75, { fill: hi ? C.text2 : C.background2 });
      k.text(s, who, { x: x + 0.15, y: 1.92, w: cw - 0.3, h: 0.28, fontSize: 11, bold: true, color: hi ? C.accent6 : C.accent5 });
      k.text(s, h, { x: x + 0.15, y: 2.3, w: cw - 0.3, h: 0.45, fontSize: 18, bold: true, color: hi ? C.accent1 : C.text1 });
      k.text(s, en, { x: x + 0.15, y: 2.85, w: cw - 0.3, h: 0.5, fontSize: 10.5, color: hi ? "C9D3CE" : C.accent2 });
    });
    k.text(s, "우리 크루 버전 (폰 촬영)", { x: M, y: 3.85, w: 6, h: 0.35, fontSize: 15, bold: true, color: C.accent2 });
    const ours = ["감독 \"녹음!\"", "녹음 \"돌아요\"", "감독 \"카메라!\"", "촬영 \"돌아요\"", "슬레이트 손뼉 짝!", "2초 쉬고 \"액션\"", "끝나고 2초 뒤 \"컷\""];
    ours.forEach((t, i) => {
      const x = M + i * (cw + 0.15);
      k.card(s, x, 4.3, cw, 0.9, { line: "DDE4E0", fill: "FFFFFF" });
      k.text(s, t, { x: x + 0.1, y: 4.3, w: cw - 0.2, h: 0.9, fontSize: 12.5, bold: true, align: "center", valign: "middle" });
    });
    k.takeaway(s, "콜 순서를 지키면 '찍었는데 소리가 없다', '앞부분이 잘렸다'가 사라집니다", 5.6);
  }

  // 13. 슬레이트와 숏리스트
  {
    const s = content("슬레이트와 숏리스트 · 무엇을 몇 번째로 찍었나", `[현장 운영 ②] 슬레이트: 화면에 씬 · 컷 · 테이크 번호를 남기고, '딱' 소리로 소리와 화면을 맞춥니다. 폰 현장은 손뼉 + 종이에 번호를 써서 2초 비추기, 또는 슬레이트 앱.
숏리스트: 찍을 컷의 목록. 2교시의 카페 릴스를 숏리스트로 바꾸면 이렇게 됩니다. 2회차 기획안의 스토리보드가 현장에서는 이 표가 됩니다.
좋은 테이크 표시: 찍자마자 사진 앱에서 '하트'(즐겨찾기) → 편집 때 OK컷만 바로 찾기.`, "D 현장 운영");
    // 슬레이트 그림
    const sx = M, sy = 1.8, sw = 4.2, sh = 3.6;
    s.addShape(S.rect, { x: sx, y: sy, w: sw, h: 0.55, fill: { color: C.text2 }, line: { type: "none" } });
    for (let i = 0; i < 6; i++) s.addShape(S.parallelogram, { x: sx + 0.1 + i * 0.7, y: sy + 0.08, w: 0.5, h: 0.4, fill: { color: "FFFFFF" }, line: { type: "none" } });
    s.addShape(S.rect, { x: sx, y: sy + 0.6, w: sw, h: sh - 0.6, fill: { color: "1B211E" }, line: { type: "none" } });
    const cells = [["SCENE", "3"], ["SHOT", "4"], ["TAKE", "2"]];
    cells.forEach(([l, v], i) => {
      const x = sx + 0.2 + i * 1.3;
      k.text(s, l, { x, y: sy + 0.8, w: 1.2, h: 0.28, fontSize: 11, bold: true, color: C.accent6 });
      k.text(s, v, { x, y: sy + 1.08, w: 1.2, h: 0.9, fontSize: 44, bold: true, color: C.background1 });
    });
    k.text(s, "PROD  카페 릴스\nDIR  ○○○   CAM  ○○○\nDATE  2026. 10. 22", { x: sx + 0.2, y: sy + 2.2, w: sw - 0.4, h: 1.1, fontSize: 12, color: "C9D3CE" });
    k.text(s, "폰 현장: 종이에 번호 + 손뼉 '짝'", { x: sx, y: sy + sh + 0.12, w: sw, h: 0.3, fontSize: 12, bold: true, color: C.accent2, align: "center" });
    k.table(s, [
      ["씬-컷", "크기 · 앵글", "무빙 · 기법", "내용", "OK"],
      ["1-1", "익스트림 클로즈업 · 탑뷰", "고정", "라떼아트가 그려지는 잔", "☐"],
      ["1-2", "미디엄 · 아이레벨", "달리 인", "바리스타가 잔을 건넨다", "☐"],
      ["1-3", "와이드 · 하이앵글", "페디스털 다운", "비 오는 창가와 카페 전경", "☐"],
      ["1-4", "클로즈업 · 3x", "초점 이동", "컵 → 손님의 미소", "☐"],
      ["1-5", "인서트", "고정", "원두를 가는 손", "☐"],
      ["1-6", "와이드 · 외부", "리빌", "간판 뒤에서 나오는 카페 외관", "☐"],
    ], { x: M + 4.55, y: 1.8, w: CW - 4.55, colW: [0.75, 2.2, 1.45, CW - 4.55 - 4.95, 0.55], fontSize: 12, rowH: 0.5 });
    k.takeaway(s, "좋은 테이크는 찍자마자 '하트'. 편집 때 OK컷만 바로 찾습니다", 6.0);
  }

  // 14. 연속성 · 데이터
  {
    const s = content("연속성과 데이터 · 현장이 끝나도 끝이 아니다", `[현장 운영 ③] 스크립터(스크립트 수퍼바이저)는 컷과 컷이 이어지는지 기록하는 사람. 컵의 물 높이, 손에 든 쪽, 머리카락, 소품 위치.
우리 크루는 기록 담당이 매 컷 끝나고 사진 한 장 → 다음 각도 찍을 때 비교.
데이터: 현장 백업 담당(DIT)이 당일에 복사 · 확인. 우리는 3-2-1 규칙과 파일명 규칙.`, "D 현장 운영");
    const hw = (CW - 0.3) / 2;
    k.card(s, M, 1.75, hw, 4.0);
    label(s, "CONTINUITY · 연속성", M + 0.35, 1.95, hw - 0.7, C.accent2);
    k.text(s, "컷이 바뀌어도 세상은 그대로", { x: M + 0.35, y: 2.25, w: hw - 0.7, h: 0.45, fontSize: 18, bold: true });
    k.checklist(s, ["컵 · 물 높이 · 소품 위치", "어느 손으로 들었나, 어느 쪽을 보나", "머리카락 · 옷깃 · 소매", "빛의 방향 · 창밖 날씨", "매 컷 끝나면 기록 담당이 사진 한 장"], { x: M + 0.35, y: 2.9, w: hw - 0.7, h: 2.7, fontSize: 14 });
    k.card(s, M + hw + 0.3, 1.75, hw, 4.0, { fill: C.text2 });
    const dx = M + hw + 0.65, dw = hw - 0.7;
    label(s, "DATA · 3-2-1 백업", dx, 1.95, dw, C.accent6);
    k.text(s, "원본은 세 군데에", { x: dx, y: 2.25, w: dw, h: 0.45, fontSize: 18, bold: true, color: C.background1 });
    [["3", "사본 세 개 (원본 포함)"], ["2", "서로 다른 저장 장치 두 종류"], ["1", "한 개는 다른 장소 (클라우드)"]].forEach(([n, t], i) => {
      const y = 2.9 + i * 0.6;
      k.text(s, n, { x: dx, y, w: 0.6, h: 0.5, fontSize: 26, bold: true, color: C.accent1, valign: "middle" });
      k.text(s, t, { x: dx + 0.65, y, w: dw - 0.65, h: 0.5, fontSize: 14, color: C.background1, valign: "middle" });
    });
    k.text(s, "파일명: 날짜_장면_컷_테이크\n예) 1022_카페_03_T2.mp4", { x: dx, y: 4.85, w: dw, h: 0.7, fontSize: 13, color: C.accent6 });
    k.takeaway(s, "폰 → 드라이브 크루 폴더 → 내 PC. 수업 끝나기 전에 업로드 확인까지가 촬영입니다", 6.0);
  }

  // 15. 노출 실무
  {
    const s = content("노출 실무 · 180도 셔터와 모니터링 도구", `[화질 ①] 180도 셔터 법칙: 셔터 속도 ≈ 1 / (fps × 2). 24fps → 1/50, 30fps → 1/60, 60fps → 1/120. 사람 눈에 자연스러운 움직임 번짐.
밝은 야외에서 폰은 조리개가 고정이라 셔터를 빠르게 올려 버림 → 움직임이 뚝뚝 끊김 → 현장은 ND 필터(렌즈용 선글라스)로 빛을 줄여 셔터를 지킴. 폰용 클립 ND가 있음.
기본 카메라 앱은 셔터를 못 바꾸는 경우가 많음: 갤럭시 '프로 동영상', 아이폰 · 일부 갤럭시 · 픽셀은 무료 Blackmagic Camera 앱.`, "E 화질 · 색 · 빛 · 소리");
    k.card(s, M, 1.75, 4.3, 4.0, { fill: C.text2 });
    label(s, "180° SHUTTER RULE", M + 0.35, 1.95, 3.6, C.accent6);
    k.text(s, "셔터 = 1 / (fps × 2)", { x: M + 0.35, y: 2.3, w: 3.7, h: 0.55, fontSize: 22, bold: true, color: C.accent1 });
    [["24fps", "1/50"], ["30fps", "1/60"], ["60fps", "1/120"]].forEach(([a, b], i) => {
      const y = 3.1 + i * 0.6;
      k.text(s, a, { x: M + 0.35, y, w: 1.6, h: 0.5, fontSize: 18, bold: true, color: C.background1, valign: "middle" });
      k.text(s, "→  " + b, { x: M + 1.9, y, w: 2.0, h: 0.5, fontSize: 18, bold: true, color: C.accent6, valign: "middle" });
    });
    k.text(s, "밝은 야외 → ND 필터로 빛을 줄여 셔터 지키기", { x: M + 0.35, y: 5.0, w: 3.7, h: 0.6, fontSize: 12.5, color: "C9D3CE" });
    const tools = [["지브라", "Zebra", "하얗게 날아갈 곳에 빗금 표시. 얼굴엔 빗금이 살짝 걸리기 직전까지"], ["폴스 컬러", "False Color", "밝기를 색으로 표시. 피부가 같은 색으로 나오게 맞추기"], ["포커스 피킹", "Focus Peaking", "초점 맞은 테두리에 색 표시. 수동 초점의 필수품"], ["히스토그램", "Histogram", "밝기 분포 그래프. 오른쪽 벽에 붙으면 하늘 · 창이 날아감"]];
    const tx = M + 4.6, tw = W - M - tx, th = (4.0 - 3 * 0.15) / 4;
    tools.forEach(([h, en, b], i) => {
      const y = 1.75 + i * (th + 0.15);
      k.card(s, tx, y, tw, th);
      k.text(s, h, { x: tx + 0.3, y: y + 0.12, w: 2.0, h: 0.36, fontSize: 15, bold: true });
      k.text(s, en.toUpperCase(), { x: tx + 0.3, y: y + 0.5, w: 2.0, h: 0.28, fontSize: 10, bold: true, color: C.accent2 });
      k.text(s, b, { x: tx + 2.3, y, w: tw - 2.55, h: th, fontSize: 12.5, color: C.accent5, valign: "middle" });
    });
    k.takeaway(s, "수동 앱: 갤럭시 '프로 동영상' · 무료 Blackmagic Camera(아이폰, 일부 갤럭시 · 픽셀)", 6.0);
  }

  // 16. 색 실무
  {
    const s = content("색 실무 · 고정하고, 맞추고, 남겨 두기", `[화질 ②] 현장 색의 원칙: 촬영 중에 색이 변하면 안 된다(자동 화이트밸런스가 컷마다 바뀌는 것이 아마추어 티의 1순위).
두 대 이상이면 같은 기종 · 같은 설정, 시작할 때 흰 종이 · 회색 카드를 같이 찍어 두면 편집에서 맞추기 쉬움.
Log: 색을 일부러 밋밋하게 찍어 편집에서 넓게 보정하는 방식. 아이폰 15 Pro 이후의 Apple Log 등. 보정(LUT 적용)을 꼭 해야 하므로 초보는 기본 색으로 먼저.`, "E 화질 · 색 · 빛 · 소리");
    const items = [["01", "고정하기", "Lock", "화이트밸런스 · 노출 · 초점을 잠그고 찍기. 컷 중간에 색이 변하지 않게."], ["02", "맞추기", "Match", "두 카메라는 같은 설정. 시작할 때 흰 종이 · 회색 카드를 함께 찍기."], ["03", "남겨 두기", "Log & LUT", "Log로 밋밋하게 찍고 편집에서 LUT로 색 입히기. 보정할 시간이 있을 때만."], ["04", "같은 빛에서", "Light", "한 장면은 같은 시간대에. 해가 움직이면 컷마다 색이 달라진다."]];
    const cw = (CW - 3 * 0.3) / 4;
    items.forEach(([n, h, en, b], i) => {
      const x = M + i * (cw + 0.3);
      k.card(s, x, 1.75, cw, 3.7, { fill: i === 2 ? C.text2 : C.background2 });
      k.text(s, n, { x: x + 0.3, y: 1.95, w: 1, h: 0.6, fontSize: 26, bold: true, color: C.accent1 });
      k.text(s, h, { x: x + 0.3, y: 2.62, w: cw - 0.55, h: 0.4, fontSize: 18, bold: true, color: i === 2 ? C.background1 : C.text1 });
      k.text(s, en.toUpperCase(), { x: x + 0.3, y: 3.03, w: cw - 0.55, h: 0.3, fontSize: 10, bold: true, color: i === 2 ? C.accent6 : C.accent2 });
      k.text(s, b, { x: x + 0.3, y: 3.45, w: cw - 0.55, h: 1.8, fontSize: 12.5, color: i === 2 ? "C9D3CE" : C.accent5 });
    });
    k.takeaway(s, "아마추어 티의 1순위는 컷마다 바뀌는 색. 화이트밸런스부터 고정", 5.75);
  }

  // 17. 빛 실무
  {
    const s = content("빛 실무 · 현장 조명팀이 쓰는 다섯 가지", `[화질 ③] 오전의 3점 조명을 현장 방식으로 확장.
모티베이티드: 화면 속에 빛의 '이유'(창문 · 스탠드)가 있는 방향에서 비추기 → 자연스러움. 네거티브 필: 검은 천 · 옷으로 한쪽 빛을 막아 입체감 만들기(빛을 더하는 게 아니라 빼기).
실용 조명(Practicals): 화면 안에 보이는 스탠드 · 전구 · 모니터. 매직아워: 해 뜬 직후 · 해 지기 직전의 부드러운 빛, 블루아워는 해 진 직후.`, "E 화질 · 색 · 빛 · 소리");
    const items = [["FaWindowMaximize", "모티베이티드 빛", "Motivated Light", "화면 속 창문 · 스탠드 쪽에서 빛이 오게. 빛에 '이유'가 있으면 자연스럽다."], ["FaAdjust", "네거티브 필", "Negative Fill", "검은 천 · 어두운 옷으로 한쪽 빛을 막기. 빛을 빼서 입체감을."], ["FaSun", "림 · 역광", "Rim · Backlight", "뒤에서 오는 빛으로 머리 · 어깨 윤곽. 배경과 인물이 분리된다."], ["FaLightbulb", "실용 조명", "Practicals", "화면 안의 스탠드 · 전구 · 모니터. 분위기와 깊이를 동시에."], ["FaCloudSun", "매직아워", "Golden · Blue Hour", "해 뜬 직후 · 해 지기 직전의 부드러운 금빛, 해 진 직후의 푸른빛."]];
    const cw = (CW - 4 * 0.22) / 5;
    for (let i = 0; i < items.length; i++) {
      const [ic, h, en, b] = items[i];
      const x = M + i * (cw + 0.22);
      await k.featureCard(s, x, 1.75, cw, 3.9, { icon: ic, head: h, body: en.toUpperCase() + "\n\n" + b, headSize: 15, bodySize: 12 });
    }
    k.takeaway(s, "조명은 더하기만이 아니라 빼기. 흰 종이(반사)와 검은 천(네거티브 필)이 기본 장비", 5.95);
  }

  // 18. 소리 실무
  {
    const s = content("소리 실무 · 녹음부가 지키는 다섯 가지", `[화질 ④] 오전의 '소리는 영상의 절반'을 현장 방식으로.
이중 녹음: 핀마이크(무선) + 폰 자체 녹음을 동시에 → 하나가 끊겨도 산다. 레벨: 말소리의 가장 큰 순간이 -12dB 근처, 0dB(빨간색)에 닿으면 깨져서 복구 불가.
와일드 트랙: 화면 없이 소리만 따로(문 닫는 소리, 발소리, 대사 한 번 더). 손뼉 싱크는 콜 순서 슬라이드 참고.`, "E 화질 · 색 · 빛 · 소리");
    const items = [["01", "이중 녹음", "핀마이크 + 폰 녹음 동시에. 하나가 끊겨도 산다"], ["02", "마이크는 가까이", "입에서 한 뼘. 거리가 두 배면 잡음이 확 늘어난다"], ["03", "레벨 -12dB", "가장 큰 말소리가 -12dB 근처. 0dB에 닿으면 깨진다"], ["04", "룸톤 30초", "모두 멈추고 그 공간 소리만. 편집의 빈틈을 메운다"], ["05", "와일드 트랙", "소리만 따로: 문 소리 · 발소리 · 대사 한 번 더"]];
    items.forEach(([n, h, b], i) => k.row(s, M, 1.72 + i * 0.8, CW, 0.68, { n, head: h, body: b, headW: 3.0 }));
    k.takeaway(s, "흐린 화면은 참아도 깨진 소리는 못 참습니다. 녹음은 두 군데에", 5.95);
  }

  // 19. 용어 사전
  {
    const s = content("현장 용어 사전 · 오늘부터 우리끼리 쓰는 말", `[정리] 크루 단톡방에 그대로 올려 두기. 오늘 실습부터 이 말로 소통합니다.`, "정리");
    const terms = [["스탠바이", "촬영 준비 완료, 모두 제자리"], ["롤", "녹화 · 녹음 시작"], ["슬레이트 · 마커", "번호판 + 딱 소리로 싱크"], ["액션 / 컷", "연기 시작 / 멈춤"], ["테이크", "같은 컷을 찍은 횟수(T1, T2…)"], ["킵 · OK", "쓸 수 있는 컷, 보관"], ["NG", "다시 찍기"], ["픽업", "앞부분 빼고 중간부터 다시"],
      ["마스터", "장면 전체를 넓게 한 번에"], ["인서트", "손 · 소품 같은 디테일 컷"], ["커버리지", "여러 각도로 확보한 컷 묶음"], ["셋업", "카메라 위치를 바꾸는 것"], ["블로킹", "배우 동선과 위치 정하기"], ["마크", "배우가 설 자리에 붙인 테이프"], ["룸톤", "그 공간의 조용한 소리"], ["콜시트", "그날의 촬영 일정표"]];
    const colW = (CW - 0.3) / 2;
    [0, 1].forEach((c) => {
      const rows = [["용어", "뜻"], ...terms.slice(c * 8, c * 8 + 8)];
      k.table(s, rows, { x: M + c * (colW + 0.3), y: 1.7, w: colW, colW: [1.9, colW - 1.9], fontSize: 13, rowH: 0.44 });
    });
  }

  // 20. 실습
  {
    const s = content("실습 · 우리 크루 미니 촬영 현장 (20분)", `[실습] 크루별로 30초 대화 장면 하나를 '현장 방식'으로. 장면 예: 카페에서 커피를 건네며 한마디 주고받기.
역할: 감독(콜) · 촬영 · 녹음(두 번째 폰) · 슬레이트 겸 기록 · 배우 2명. 6명 크루는 촬영 B캠 추가.
순서: 블로킹 3분 → 마스터 → 어깨 너머 2컷 → 인서트 1컷 → 룸톤 30초. 끝나면 숏리스트에 OK 체크, 드라이브 업로드.`, "실습");
    const roles = [["FaBullhorn", "감독", "콜 순서 진행 · OK 판단"], ["FaVideo", "촬영", "숏리스트대로 · AE/AF 잠금"], ["FaMicrophone", "녹음", "두 번째 폰 · 룸톤"], ["FaClipboardList", "슬레이트 · 기록", "손뼉 · 번호 · 연속성 사진"], ["FaUserFriends", "배우 2명", "마크 지키기 · 같은 동작 반복"]];
    const cw = (CW - 4 * 0.22) / 5;
    for (let i = 0; i < roles.length; i++) await k.featureCard(s, M + i * (cw + 0.22), 1.72, cw, 2.15, { icon: roles[i][0], head: roles[i][1], body: roles[i][2], headSize: 15, bodySize: 12 });
    k.text(s, "찍을 것", { x: M, y: 4.1, w: 3, h: 0.32, fontSize: 13, bold: true, color: C.accent1 });
    k.checklist(s, ["마스터 1  ·  어깨 너머 2 (숏 · 리버스)", "인서트 1 (컵 · 손)  ·  룸톤 30초", "모든 테이크 앞뒤 2초, 콜 순서대로"], { x: M, y: 4.45, w: 6.0, h: 1.3, fontSize: 14 });
    k.prompt(s, M + 6.4, 4.05, CW - 6.4, 1.75, "우리 크루가 찍은 대화 장면 숏리스트야. 편집할 때 빠진 컷이 있는지, 180도 선을 넘은 컷이 있는지 확인하고, 추가로 찍으면 좋을 컷 2개를 추천해 줘.", "ChatGPT에 숏리스트를 붙여 넣고");
    k.takeaway(s, "오늘 찍은 장면은 3회차 CapCut 첫 편집 재료가 됩니다", 6.05);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
