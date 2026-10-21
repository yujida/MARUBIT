// 1회차 5교시: 구도 10가지 슬라이드 묶음. session1_slides.js가 make()로 받아 원하는 자리에 끼워 넣는다.
// 예시 사진(img19~img28)이 있으면 사진 + 구도선, 없으면 도식만 쓴다.
const path = require("path");
const { W, M } = require("./deck");
const { render } = require("./composition_diagrams");

const CW = W - 2 * M;
const CACHE = path.join(__dirname, "..", ".cache", "s1", "comp");

const TECH = [
  {
    key: "thirds", img: "img19", name: "삼분할", en: "Rule of Thirds",
    feel: "가운데를 비워 자연스럽고 여유 있는 균형",
    how: "격자를 켜고 주인공은 세로선 위에, 수평선은 가로선 위에. 가운데에 두는 습관부터 깨기.",
    where: "운동장 끝 하늘, 창가 벤치에 앉은 짝, 넓은 복도 한쪽에 선 사람.",
    vert: "세로 화면은 가로선 두 개가 핵심. 얼굴은 위쪽 선, 자막은 아래쪽 선 근처에.",
    take: "가운데를 비우면 화면이 숨을 쉽니다. 모든 구도의 출발점",
    note: "격자는 오전에 켜 둔 그대로. 가운데 두기 vs 삼분할을 같은 장면으로 비교해 보여 주면 바로 이해합니다.",
  },
  {
    key: "power", img: "img20", name: "교차점", en: "Power Points (Intersections)",
    feel: "격자의 네 점은 시선이 가장 먼저 닿는 자리",
    how: "인물은 눈을, 물건은 핵심 부분(라떼아트 · 로고)을 점 위에. 보는 방향의 반대편 점을 고르면 앞에 여백이 생깁니다.",
    where: "짝의 얼굴 클로즈업, 책상 위 컵 하나, 손에 든 소품.",
    vert: "세로에선 위쪽 두 점이 얼굴 자리. 오른쪽 아래 점은 버튼 · 캡션에 가리기 쉬우니 피하기.",
    take: "선보다 점이 더 셉니다. 주인공의 '눈'을 점에",
    note: "시선 여백(looking room)과 함께 설명. 오른쪽을 보는 사람은 왼쪽 위 점, 왼쪽을 보는 사람은 오른쪽 위 점.",
  },
  {
    key: "golden", img: "img21", name: "황금비 · 황금나선", en: "Golden Ratio · Fibonacci Spiral",
    feel: "1 : 1.618. 삼분할보다 조금 더 안쪽, 더 우아한 흐름",
    how: "선을 3등분(33%) 대신 약 38% · 62% 자리에. 나선이 말려 들어가는 끝에 주인공을 두면 시선이 곡선을 타고 들어갑니다.",
    where: "음식 플레이팅, 굽은 계단 난간, 꽃 · 화분 같은 곡선 소품.",
    vert: "나선을 세로로 돌려 쓰고 나선 끝을 얼굴이나 제품에. 찍을 땐 삼분할, 고르고 자를 땐 황금비로 다듬기.",
    take: "삼분할의 정밀 버전. 찍을 땐 삼분할, 다듬을 땐 황금비",
    note: "황금비는 '정답 공식'이 아니라 가이드라는 점을 분명히. 현장에서 나선을 맞추기는 어렵고, 편집 단계의 자르기에서 쓰기 좋습니다.",
  },
  {
    key: "horizon", img: "img22", name: "수평선 · 수직선", en: "Horizontal & Vertical Lines",
    feel: "가로선은 고요 · 안정 · 넓음, 세로선은 높이 · 힘 · 단단함",
    how: "수평선은 가운데 말고 위 1/3이나 아래 1/3에(하늘이 주인공이면 아래로). 수평계를 켜서 기울지 않게.",
    where: "창틀, 칠판, 운동장 끝선, 복도 기둥, 건물 세로선.",
    vert: "세로 화면은 세로선이 강한 화면. 폰을 위로 꺾으면 건물 세로선이 기울어지니 폰을 똑바로 세우기.",
    take: "선이 비뚤어지면 영상 전체가 아마추어처럼 보입니다",
    note: "아이폰: 설정 > 카메라 > 수평계. 갤럭시: 카메라 설정 > 수직/수평 안내선. 4교시에 켰는지 다시 확인.",
  },
  {
    key: "diagonal", img: "img23", name: "사선", en: "Diagonal Lines",
    feel: "움직임 · 속도 · 긴장. 멈춘 장면에도 방향이 생긴다",
    how: "계단 · 난간 · 그림자 · 길이 화면을 모서리에서 모서리로 가로지르게. 카메라를 기울이는 '더치 앵글'은 긴장을 줄 때만 짧게.",
    where: "계단, 경사로, 에스컬레이터, 오후에 비스듬히 들어오는 햇살 그림자.",
    vert: "세로 화면에선 사선이 길어져 효과가 더 커집니다. 짧은 계단도 깊고 높아 보여요.",
    take: "똑같은 계단도 비스듬히 넣으면 움직이기 시작합니다",
    note: "정면에서 찍은 계단 vs 비스듬히 찍은 계단을 비교. 인트로 · 운동 · 여행 숏폼에 자주 쓰는 구도.",
  },
  {
    key: "triangle", img: "img24", name: "삼각형", en: "Triangle Composition",
    feel: "바로 선 삼각형은 안정 · 든든함, 거꾸로 선 삼각형은 긴장",
    how: "셋을 일렬로 세우지 말고 높이를 다르게. 단체 사진은 가운데를 높게, 정물은 큰 것 하나 + 작은 것 둘.",
    where: "컵 · 디저트 · 화분 세 개, 크루 단체 사진, 앉은 사람의 상반신(머리가 꼭짓점).",
    vert: "세로에선 위아래로 긴 삼각형. 얼굴이 꼭짓점, 두 손과 소품이 밑변.",
    take: "셋을 일렬로 세우지 말고, 높이를 다르게",
    note: "크루 단체 사진을 이 구도로 찍어 보게 하면 바로 실습이 됩니다. 대화 장면도 두 사람 + 앞의 물건이 삼각형.",
  },
  {
    key: "circle", img: "img25", name: "원형", en: "Circular Composition",
    feel: "시선이 화면 안을 돌며 머문다. 완결 · 조화 · 모임",
    how: "접시 · 컵 · 시계 같은 동그라미를 바로 위에서(탑뷰). 소품을 원을 따라 놓고 가운데에 주인공.",
    where: "카페 테이블 탑뷰, 둘러앉은 크루, 둥근 창, 나선 계단을 위에서.",
    vert: "원이 가로 폭을 꽉 채우게 놓고, 위 · 아래는 자막 자리로 비우기.",
    take: "동그라미는 시선을 가둡니다. 음식 · 제품 콘텐츠의 기본",
    note: "영상에서는 탑뷰로 접시를 천천히 돌리거나, 원을 따라 카메라가 도는 아크 샷으로 이어집니다(4회차 정보성 · 제품 리뷰).",
  },
  {
    key: "scurve", img: "img26", name: "S자 곡선", en: "S-Curve",
    feel: "부드러움 · 여유 · 깊이. 시선이 천천히 안쪽으로 걸어 들어간다",
    how: "가까운 아래에서 시작해 멀리 위로 사라지는 곡선 찾기. 조금 높은 곳에서 내려다보면 잘 보입니다. 한 번만 휘면 C자 곡선.",
    where: "굽은 산책로, 하천, 휘어진 계단 · 난간, 줄 서 있는 사람들.",
    vert: "세로 화면과 가장 잘 맞는 선. 화면 아래에서 위 끝까지 이어지게.",
    take: "직선은 가리키고, 곡선은 데려갑니다",
    note: "여행 · 산책 브이로그 오프닝에 좋습니다. 곡선 끝에 작은 인물을 두면 규모감까지.",
  },
  {
    key: "leading", img: "img27", name: "유도선 · 소실점", en: "Leading Lines · Vanishing Point",
    feel: "선들이 한 점으로 모이며 '여기를 보라'고 가리킨다. 깊이감",
    how: "복도 · 길 · 책상 줄의 선이 모이는 곳에 주인공. 폰을 무릎 높이로 낮추면 바닥 선이 길어져 효과가 커집니다.",
    where: "공학관 복도, 긴 계단, 주차장 선, 강의실 책상 줄.",
    vert: "소실점은 가운데보다 약간 위에. 인물이 선을 따라 걸어오거나 멀어지는 장면으로.",
    take: "선은 화살표입니다. 화살표 끝에 주인공을",
    note: "1회차 본편의 '리딩 라인'을 확장한 장. 브이로그 오프닝 단골: 복도 끝에서 걸어오는 나.",
  },
  {
    key: "frame", img: "img28", name: "프레임 속 프레임", en: "Frame within a Frame",
    feel: "시선을 가두고 집중시킨다. 엿보는 느낌 · 앞뒤 깊이",
    how: "문 · 창문 · 나뭇가지 · 어깨 너머로 주인공을 한 번 더 감싸기. 앞의 틀은 어둡게, 주인공은 밝은 쪽에.",
    where: "강의실 문, 창틀, 복도 끝 출입구, 노트북 화면 너머.",
    vert: "세로로 긴 문틀이 세로 화면과 딱 맞습니다. 문틀 밖에서 안을 보는 샷으로 장면 시작하기.",
    take: "화면 안에 화면을 하나 더",
    note: "이야기 속으로 '들어가는' 느낌을 줄 때. 6교시 5샷 시퀀스의 오프닝 샷으로 연결할 수 있습니다.",
  },
];

const BONUS = [
  ["symmetry", "대칭 · 중앙", "Symmetry", "양쪽이 같은 복도 · 건물 정면은 가운데가 정답. 웅장하고 단정하게."],
  ["negative", "여백", "Negative Space", "빈 하늘 · 벽을 넓게. 고요함 · 외로움 · 미니멀. 자막 자리도 됩니다."],
  ["layers", "전경 겹치기", "Foreground Layers", "앞에 흐린 잎 · 소품을 걸면 앞 · 중간 · 뒤 세 겹의 깊이가 생깁니다."],
  ["pattern", "패턴과 깨기", "Pattern & Break", "반복되는 무늬 속 하나만 다르게. 눈이 그 하나로 바로 갑니다."],
];

const IMAGE_SPECS = Object.fromEntries(TECH.map((t) => [t.img, { kind: "photo", fallback: "none" }]));

async function make({ k, C, content, img }) {
  const { S } = k;
  const dia = {}, lines = {};
  for (const t of TECH) {
    dia[t.key] = await render(t.key, CACHE);
    lines[t.key] = await render(t.key, CACHE, { scene: false });
  }
  for (const [key] of BONUS) dia[key] = await render(key, CACHE);
  // 도식 또는 (예시 사진 + 구도선)
  const visual = (s, t, x, y, w, h) => {
    if (img[t.img]) {
      k.photo(s, img[t.img], x, y, w, h, { alt: `${t.name} 예시 사진` });
      s.addImage({ path: lines[t.key], x, y, w, h, altText: `${t.name} 구도선` });
    } else s.addImage({ path: dia[t.key], x, y, w, h, altText: `${t.name} 구도 도식` });
  };
  return {
    overview: async () => {
      {
        const s = content("구도 10가지 · 화면 안에 숨은 선 · 점 · 도형", `"구도는 외우는 규칙이 아니라, 보는 사람의 시선을 어디로 보낼지 정하는 선택입니다."
    오늘은 10가지를 '이름과 느낌'까지만. 다 외울 필요 없고, 실습에서 3개 이상 찾아 찍으면 성공.
    흐름: 점(삼분할 · 교차점 · 황금비) → 선(수평 · 수직, 사선, S자, 유도선) → 도형(삼각형, 원형, 프레임).`);
        const n = 5, gap = 0.25, cw = (CW - (n - 1) * gap) / n, ch = cw / 1.5;
        TECH.forEach((t, i) => {
          const x = M + (i % n) * (cw + gap), y = 1.7 + Math.floor(i / n) * (ch + 0.72);
          s.addImage({ path: dia[t.key], x, y, w: cw, h: ch, altText: t.name });
          k.text(s, String(i + 1).padStart(2, "0"), { x, y: y + ch + 0.1, w: 0.45, h: 0.32, fontSize: 13, bold: true, color: C.accent1 });
          k.text(s, t.name, { x: x + 0.42, y: y + ch + 0.1, w: cw - 0.42, h: 0.32, fontSize: 14, bold: true });
        });
        k.takeaway(s, "구도는 규칙이 아니라 선택: 보는 사람의 시선을 어디로 보낼지 내가 정하는 것", 6.15);
      }
    },
    techniques: async () => {
      TECH.forEach((t, i) => {
        const s = content(`구도 ${String(i + 1).padStart(2, "0")} · ${t.name}`, `${t.note}
    느낌: ${t.feel}
    이렇게 찍기: ${t.how}`);
        const vw = 6.3, vh = 4.2;
        visual(s, t, M, 1.75, vw, vh);
        const rx = M + vw + 0.45, rw = W - M - rx;
        k.text(s, t.en.toUpperCase(), { x: rx, y: 1.72, w: rw, h: 0.3, fontSize: 11.5, bold: true, color: C.accent2, charSpacing: 1 });
        k.text(s, t.feel, { x: rx, y: 2.05, w: rw, h: 0.8, fontSize: 18, bold: true });
        [["이렇게 찍기", t.how], ["학교에서 찾기", t.where], ["세로 9:16에서", t.vert]].forEach(([lab, body], j) => {
          const y = 2.98 + j * 1.0;
          s.addShape(S.line, { x: rx, y: y - 0.07, w: rw, h: 0, line: { color: "DDE4E0", width: 0.75 } });
          k.text(s, lab, { x: rx, y, w: rw, h: 0.26, fontSize: 11.5, bold: true, color: C.accent1 });
          k.text(s, body, { x: rx, y: y + 0.27, w: rw, h: 0.68, fontSize: 12.5, color: C.text1 });
        });
        k.takeaway(s, t.take, 6.15);
      });
    },
    bonus: async () => {
      {
        const s = content("+ 4가지 더 · 알아 두면 바로 쓰는 구도", `[보너스] 시간이 남으면. 대칭은 복도 · 건물 정면, 여백은 하늘 · 벽, 전경 겹치기는 화분 · 잎을 렌즈 앞에, 패턴과 깨기는 같은 의자 · 컵이 줄지어 있을 때.`);
        const n = 4, gap = 0.3, cw = (CW - (n - 1) * gap) / n, ih = cw / 1.5;
        BONUS.forEach(([key, name, en, body], i) => {
          const x = M + i * (cw + gap);
          k.card(s, x, 1.75, cw, 4.2);
          s.addImage({ path: dia[key], x, y: 1.75, w: cw, h: ih, altText: name });
          k.text(s, en.toUpperCase(), { x: x + 0.25, y: 1.75 + ih + 0.2, w: cw - 0.5, h: 0.26, fontSize: 10.5, bold: true, color: C.accent2, charSpacing: 1 });
          k.text(s, name, { x: x + 0.25, y: 1.75 + ih + 0.47, w: cw - 0.5, h: 0.4, fontSize: 17, bold: true });
          k.text(s, body, { x: x + 0.25, y: 1.75 + ih + 0.92, w: cw - 0.5, h: 1.2, fontSize: 12.5, color: C.accent5 });
        });
        k.takeaway(s, "영어 이름도 같이 기억하기: 4회차 AI 영상 프롬프트에 그대로 씁니다", 6.15);
      }
    },
    summary: async () => {
      {
        const s = content("한 장 정리 · 어떤 느낌을, 어떤 콘텐츠에", `[정리] 표는 워크북 · 핸드북에 그대로 넣을 수 있는 형태. "내 채널 아이템에 맞는 구도 두 개에 동그라미."`);
        const rows = [
          ["", "구도", "주는 느낌", "이런 콘텐츠에"],
          ["01", "삼분할", "자연스러운 균형", "인터뷰 · 브이로그 전반"],
          ["02", "교차점", "주인공 강조", "인물 · 제품 컷"],
          ["03", "황금비 · 나선", "우아한 흐름", "음식 · 공간 · 감성 영상"],
          ["04", "수평선 · 수직선", "안정 · 고요 · 높이", "풍경 · 공간 소개"],
          ["05", "사선", "움직임 · 에너지", "운동 · 여행 · 인트로"],
          ["06", "삼각형", "안정 · 관계", "단체 · 정물 · 대화"],
          ["07", "원형", "집중 · 완결", "음식 · 제품 탑뷰"],
          ["08", "S자 곡선", "여유 · 여정", "여행 · 산책 브이로그"],
          ["09", "유도선 · 소실점", "깊이 · 집중", "오프닝 · 장소 소개"],
          ["10", "프레임 속 프레임", "몰입 · 엿보기", "스토리 · 인물"],
        ];
        k.table(s, rows, { x: M, y: 1.7, w: CW, colW: [0.7, 3.1, 3.6, CW - 7.4], fontSize: 14, rowH: 0.41 });
      }
    },
    bingo: async () => {
      {
        const s = content("실습 · 구도 빙고 (15분)", `[실습] 크루별로 학교 공간에서 15분. 한 칸에 사진 한 장, 가로 · 세로 · 대각선 한 줄을 채우면 빙고.
    가운데 칸은 황금비 도전(어려우면 자유). 다른 사람이 나오면 동의 받기.
    돌아와서: 크루 베스트 1장을 ChatGPT에 올려 피드백 → 단톡방 공유.`);
        const cells = ["thirds", "diagonal", "triangle", "leading", "golden", "circle", "frame", "horizon", "scurve"];
        const gs = 4.35, cs = (gs - 2 * 0.12) / 3, ih = cs / 1.5;
        cells.forEach((key, i) => {
          const t = TECH.find((x) => x.key === key);
          const x = M + (i % 3) * (cs + 0.12), y = 1.72 + Math.floor(i / 3) * (ih + 0.47);
          s.addImage({ path: dia[key], x, y, w: cs, h: ih, altText: t.name });
          k.text(s, key === "golden" ? "황금비 (도전)" : t.name, { x, y: y + ih + 0.05, w: cs, h: 0.32, fontSize: 12, bold: true, align: "center" });
        });
        const rx = M + gs + 0.5, rw = W - M - rx;
        k.text(s, "규칙", { x: rx, y: 1.72, w: rw, h: 0.32, fontSize: 13, bold: true, color: C.accent1 });
        k.checklist(s, ["크루별로 9칸 중 최대한 많이, 한 칸에 사진 한 장", "가로 · 세로 · 대각선 한 줄을 채우면 빙고", "같은 장소라도 구도가 다르면 OK", "세로 사진 2장 이상 섞기 (숏폼 연습)"], { x: rx, y: 2.08, w: rw, h: 1.8, fontSize: 14 });
        k.prompt(s, rx, 3.95, rw, 1.95, "이 사진은 ○○ 구도로 찍었어. 의도한 구도가 잘 보이는지 화면 속 선 · 점 · 도형 위치로 설명하고, 더 좋아지려면 폰을 어디로 옮기면 될지 한 가지만 알려줘.", "ChatGPT에 사진을 올리고");
        k.takeaway(s, "빙고 사진은 드라이브 크루 폴더에. 가장 좋은 한 장이 크루 트리의 오너먼트가 됩니다", 6.15);
      }
    },
  };
}

module.exports = { make, IMAGE_SPECS };
