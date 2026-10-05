/**
 * 데모용 가상 채널 데이터를 생성한다. 실제 계정이 아니다(handle이 sample_ 로 시작).
 *   npm run sample
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotSchema, type Snapshot } from "../src/lib/schema";

let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

const CAPTIONS: Record<string, string[]> = {
  춤: ["이번 주 챌린지 안무 30초 버전 🔥", "커버댄스 풀버전은 프로필 링크에서", "초보도 따라하는 안무 3단계 분해"],
  교육: ["안무 외우는 법, 이것만 기억하세요", "리듬감 키우는 연습 루틴 정리", "춤 영상 잘 찍는 꿀팁 5가지"],
  대중문화: ["이번 컴백 무대 포인트 안무 리뷰", "요즘 뜨는 밈 댄스 모음", "드라마 OST로 만든 안무"],
  홍보: ["10월 원데이 클래스 모집합니다", "신규 수강생 이벤트 진행 중"],
};
const TAGS: Record<string, string[]> = {
  춤: ["댄스", "dance", "챌린지", "kpopdance"],
  교육: ["댄스레슨", "춤배우기", "꿀팁"],
  대중문화: ["kpop", "컴백", "밈"],
  홍보: ["원데이클래스", "이벤트"],
};

function makeChannel(opts: {
  handle: string;
  role: "own" | "competitor";
  displayName: string;
  followers: number;
  weeklyGrowth: number;
  reelBias: number;
  baseEr: number;
}): Snapshot[] {
  const snaps: Snapshot[] = [];
  const start = Date.parse("2026-08-10T10:00:00+09:00");
  for (let w = 0; w < 8; w++) {
    // 주 2회 수집 → 월/목
    for (const offsetDays of [0, 3]) {
      const collected = start + (w * 7 + offsetDays) * 86_400_000;
      const followers = Math.round(opts.followers * (1 + opts.weeklyGrowth) ** (w + offsetDays / 7));
      seed = 1000 + opts.followers; // 같은 게시물은 매번 같은 기본값
      const posts = Array.from({ length: 20 }, (_, i) => {
        const daysAgo = i * 2.4 + rand();
        const postedAt = new Date(collected - daysAgo * 86_400_000);
        postedAt.setUTCHours(pick([0, 3, 9, 10, 11, 12, 13]), Math.floor(rand() * 60));
        const type = rand() < opts.reelBias ? "reel" : rand() < 0.6 ? "carousel" : "image";
        const category = pick(["춤", "춤", "교육", "대중문화", type === "image" ? "홍보" : "춤"]);
        const hour = (postedAt.getUTCHours() + 9) % 24;
        const boost = (type === "reel" ? 1.6 : type === "carousel" ? 1.1 : 0.6) * (hour >= 18 ? 1.4 : 1) * (category === "홍보" ? 0.5 : 1) * (0.5 + rand() * 1.5) * (rand() < 0.08 ? 4 : 1);
        const likes = Math.round(followers * opts.baseEr * boost);
        const comments = Math.round(likes * (0.02 + rand() * 0.05) * (category === "교육" ? 2 : 1));
        const tags = TAGS[category].filter(() => rand() < 0.7);
        const own = opts.role === "own";
        const reach = Math.round(followers * (type === "reel" ? 1.8 : 0.45) * boost);
        return {
          shortcode: `${opts.handle.slice(7, 10)}${w}${i}`.replace(/[^a-z0-9]/g, "x") + (1000 + i),
          url: `https://www.instagram.com/p/sample${i}/`,
          type,
          postedAt: postedAt.toISOString(),
          caption: `${pick(CAPTIONS[category])}\n\n${tags.map((t) => "#" + t).join(" ")}`,
          hashtags: tags,
          mentions: [],
          likes: rand() < 0.05 ? null : likes,
          comments,
          views: type === "reel" ? Math.round(followers * 0.9 * boost) : null,
          carouselCount: type === "carousel" ? 3 + Math.floor(rand() * 7) : null,
          pinned: i === 0 && w === 0 && offsetDays === 0,
          category,
          topic: null,
          hook: null,
          insights: own
            ? {
                reach,
                views: Math.round(reach * 1.3),
                saves: Math.round(likes * (category === "교육" ? 0.25 : 0.06)),
                shares: Math.round(likes * (type === "reel" ? 0.12 : 0.03)),
                profileVisits: Math.round(reach * 0.02),
                follows: Math.round(reach * 0.002),
                avgWatchTimeSec: type === "reel" ? Math.round(6 + rand() * 10) : null,
              }
            : null,
        };
      });
      snaps.push(
        snapshotSchema.parse({
          schemaVersion: 1,
          handle: opts.handle,
          collectedAt: new Date(collected).toISOString().replace("Z", "+00:00"),
          source: "sample",
          role: opts.role,
          profile: {
            displayName: opts.displayName,
            bio: "가상 데모 계정입니다",
            externalUrl: null,
            category: "교육",
            verified: false,
            posts: 300 + w * 2,
            followers,
            following: 180,
            highlights: 6,
          },
          accountInsights:
            opts.role === "own"
              ? { periodDays: 30, accountsReached: followers * 4, accountsEngaged: Math.round(followers * 0.3), profileVisits: Math.round(followers * 0.2), followerChange: Math.round(followers * opts.weeklyGrowth * 4), nonFollowerReachPct: 62 }
              : null,
          posts,
          notes: "가상 데모 데이터",
        }),
      );
    }
  }
  return snaps;
}

const channels = [
  makeChannel({ handle: "sample_my_dance_class", role: "own", displayName: "(데모) 내 댄스 클래스", followers: 8400, weeklyGrowth: 0.012, reelBias: 0.55, baseEr: 0.022 }),
  makeChannel({ handle: "sample_kpop_cover_lab", role: "competitor", displayName: "(데모) 경쟁 커버댄스", followers: 52000, weeklyGrowth: 0.02, reelBias: 0.85, baseEr: 0.014 }),
  makeChannel({ handle: "sample_study_with_pop", role: "competitor", displayName: "(데모) 대중문화 교육", followers: 21000, weeklyGrowth: 0.006, reelBias: 0.3, baseEr: 0.018 }),
];

for (const snaps of channels) {
  for (const s of snaps) {
    const dir = join("data", "channels", s.handle);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${s.collectedAt.slice(0, 10)}.json`), JSON.stringify(s, null, 2) + "\n");
  }
  console.log(`${snaps[0].handle}: ${snaps.length} snapshots`);
}
