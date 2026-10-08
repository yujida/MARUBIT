import type { Post, PostType, Snapshot } from "./schema";

export const TIMEZONE = "Asia/Seoul";
const DAY_MS = 86_400_000;

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

const nonNull = <T,>(xs: (T | null | undefined)[]): T[] => xs.filter((x): x is T => x != null);

/** 좋아요+댓글. 좋아요가 숨김(null)이면 계산 불가. */
export function interactions(p: Post): number | null {
  if (p.likes == null) return null;
  return p.likes + (p.comments ?? 0);
}

/** 팔로워 기준 참여율 (0~1). */
export function engagementRate(p: Post, followers: number | null): number | null {
  const i = interactions(p);
  if (i == null || !followers) return null;
  return i / followers;
}

/** 도달 기준 참여율 (내 계정 인사이트가 있을 때). 좋아요+댓글+저장+공유 / 도달. */
export function engagementRateByReach(p: Post): number | null {
  const reach = p.insights?.reach;
  if (!reach || p.likes == null) return null;
  return (p.likes + (p.comments ?? 0) + (p.insights?.saves ?? 0) + (p.insights?.shares ?? 0)) / reach;
}

/** 릴스 조회율: 조회수 / 팔로워. */
export function viewRate(p: Post, followers: number | null): number | null {
  const v = p.views ?? p.insights?.views ?? null;
  if (v == null || !followers) return null;
  return v / followers;
}

/** 해시태그 정규화: '#', 공백 제거, 소문자. */
export function normalizeTag(t: string): string {
  return t.replace(/^#/, "").trim().toLowerCase();
}

/** 캡션에서 해시태그를 뽑는다(수집기가 hashtags를 비워 둔 경우 대비). */
export function extractHashtags(caption: string | null | undefined): string[] {
  if (!caption) return [];
  return [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1].toLowerCase());
}

export function postTags(p: Post): string[] {
  const tags = p.hashtags.length ? p.hashtags.map(normalizeTag) : extractHashtags(p.caption);
  return [...new Set(tags.filter(Boolean))];
}

/** 카테고리 키워드 규칙 — 수집 시 category가 비어 있을 때의 대체 분류. */
const CATEGORY_RULES: [string, RegExp][] = [
  ["춤", /춤|댄스|dance|안무|챌린지|choreo|커버댄스|k-?pop\s?dance|스우파|브레이킹/i],
  ["교육", /교육|공부|강의|수업|꿀팁|방법|하는\s?법|정리|배우|학습|study|tutorial|tip|강좌|클래스|레슨/i],
  ["대중문화", /드라마|영화|아이돌|kpop|k-pop|예능|웹툰|밈|meme|컴백|앨범|뮤비|배우|가수|넷플릭스|리뷰/i],
  ["홍보", /이벤트|할인|모집|신청|공지|오픈|예약|구매|링크\s?인\s?바이오|광고|협찬/i],
];

export function categorize(p: Post): string {
  if (p.category) return p.category;
  const text = `${p.caption ?? ""} ${postTags(p).join(" ")}`;
  for (const [cat, re] of CATEGORY_RULES) if (re.test(text)) return cat;
  return "기타";
}

/** KST 기준 요일(0=일)·시(0~23). */
export function kstDayHour(iso: string): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const wd = parts.find((x) => x.type === "weekday")!.value;
  const hour = Number(parts.find((x) => x.type === "hour")!.value);
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd), hour };
}

export function captionLengthBucket(caption: string | null | undefined): string {
  const n = (caption ?? "").length;
  if (n < 50) return "짧음 (<50자)";
  if (n < 200) return "보통 (50~199자)";
  if (n < 500) return "김 (200~499자)";
  return "매우 김 (500자+)";
}

export interface PostRow {
  post: Post;
  interactions: number | null;
  er: number | null;
  erReach: number | null;
  viewRate: number | null;
  /** 채널 중앙 참여(좋아요+댓글) 대비 배수 */
  vsMedian: number | null;
  category: string;
  tags: string[];
}

export interface GroupStat {
  key: string;
  count: number;
  medianEr: number | null;
  medianInteractions: number | null;
  medianViews: number | null;
}

export interface ChannelSummary {
  handle: string;
  role: Snapshot["role"];
  collectedAt: string;
  followers: number | null;
  following: number | null;
  totalPosts: number | null;
  postsAnalyzed: number;
  medianEr: number | null;
  meanEr: number | null;
  medianInteractions: number | null;
  medianLikes: number | null;
  medianComments: number | null;
  medianReelViews: number | null;
  medianViewRate: number | null;
  medianErReach: number | null;
  commentToLikeRatio: number | null;
  postsPerWeek: number | null;
  likesHiddenCount: number;
  rows: PostRow[];
  byType: GroupStat[];
  byCategory: GroupStat[];
  byCaptionLength: GroupStat[];
  hashtags: (GroupStat & { tag: string })[];
  /** heatmap[day][hour] = { count, medianEr } */
  heatmap: { count: number; medianEr: number | null }[][];
}

function groupStats(rows: PostRow[], keyOf: (r: PostRow) => string[]): GroupStat[] {
  const groups = new Map<string, PostRow[]>();
  for (const r of rows) for (const k of keyOf(r)) groups.set(k, [...(groups.get(k) ?? []), r]);
  return [...groups.entries()]
    .map(([key, rs]) => ({
      key,
      count: rs.length,
      medianEr: median(nonNull(rs.map((r) => r.er))),
      medianInteractions: median(nonNull(rs.map((r) => r.interactions))),
      medianViews: median(nonNull(rs.map((r) => r.post.views))),
    }))
    .sort((a, b) => b.count - a.count || (b.medianEr ?? 0) - (a.medianEr ?? 0));
}

export function summarize(snap: Snapshot): ChannelSummary {
  const followers = snap.profile.followers;
  // 고정 게시물은 오래된 경우가 많아 빈도·히트맵에서는 제외하지 않되, 표에서 표시한다.
  const posts = snap.posts;

  const base = posts.map((post) => ({
    post,
    interactions: interactions(post),
    er: engagementRate(post, followers),
    erReach: engagementRateByReach(post),
    viewRate: viewRate(post, followers),
    category: categorize(post),
    tags: postTags(post),
  }));
  const medInter = median(nonNull(base.map((b) => b.interactions)));
  const rows: PostRow[] = base.map((b) => ({
    ...b,
    vsMedian: b.interactions != null && medInter ? b.interactions / medInter : null,
  }));

  const ers = nonNull(rows.map((r) => r.er));
  const likes = nonNull(posts.map((p) => p.likes));
  const comments = nonNull(posts.map((p) => p.comments));
  const reels = rows.filter((r) => r.post.type === "reel");

  const dated = nonNull(posts.filter((p) => !p.pinned).map((p) => (p.postedAt ? Date.parse(p.postedAt) : null)));
  let postsPerWeek: number | null = null;
  if (dated.length >= 2) {
    const spanDays = (Math.max(...dated) - Math.min(...dated)) / DAY_MS;
    postsPerWeek = spanDays > 0 ? ((dated.length - 1) / spanDays) * 7 : null;
  }

  const heatmap = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ ers: [] as number[], count: 0 })),
  );
  for (const r of rows) {
    if (!r.post.postedAt) continue;
    const { day, hour } = kstDayHour(r.post.postedAt);
    heatmap[day][hour].count++;
    if (r.er != null) heatmap[day][hour].ers.push(r.er);
  }

  const sumLikes = likes.reduce((a, b) => a + b, 0);
  const sumComments = posts.filter((p) => p.likes != null).reduce((a, p) => a + (p.comments ?? 0), 0);

  return {
    handle: snap.handle,
    role: snap.role,
    collectedAt: snap.collectedAt,
    followers,
    following: snap.profile.following,
    totalPosts: snap.profile.posts,
    postsAnalyzed: posts.length,
    medianEr: median(ers),
    meanEr: mean(ers),
    medianInteractions: medInter,
    medianLikes: median(likes),
    medianComments: median(comments),
    medianReelViews: median(nonNull(reels.map((r) => r.post.views))),
    medianViewRate: median(nonNull(reels.map((r) => r.viewRate))),
    medianErReach: median(nonNull(rows.map((r) => r.erReach))),
    commentToLikeRatio: sumLikes ? sumComments / sumLikes : null,
    postsPerWeek,
    likesHiddenCount: posts.filter((p) => p.likes == null).length,
    rows,
    byType: groupStats(rows, (r) => [r.post.type]),
    byCategory: groupStats(rows, (r) => [r.category]),
    byCaptionLength: groupStats(rows, (r) => [captionLengthBucket(r.post.caption)]),
    hashtags: groupStats(rows, (r) => r.tags).map((g) => ({ ...g, tag: g.key })),
    heatmap: heatmap.map((day) => day.map((c) => ({ count: c.count, medianEr: median(c.ers) }))),
  };
}

export interface GrowthPoint {
  date: string;
  followers: number | null;
  medianEr: number | null;
}

/** 스냅샷들(시간순 무관) → 팔로워·참여율 추이와 증감. */
export function growth(snaps: Snapshot[]): {
  points: GrowthPoint[];
  followerDelta: number | null;
  weeklyGrowthRate: number | null;
} {
  const sorted = [...snaps].sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt));
  const points = sorted.map((s) => ({
    date: s.collectedAt,
    followers: s.profile.followers,
    medianEr: summarize(s).medianEr,
  }));
  const withF = sorted.filter((s) => s.profile.followers != null);
  if (withF.length < 2) return { points, followerDelta: null, weeklyGrowthRate: null };
  const first = withF[0];
  const last = withF[withF.length - 1];
  const delta = last.profile.followers! - first.profile.followers!;
  const weeks = (Date.parse(last.collectedAt) - Date.parse(first.collectedAt)) / (7 * DAY_MS);
  const weeklyGrowthRate =
    weeks > 0 && first.profile.followers ? delta / first.profile.followers / weeks : null;
  return { points, followerDelta: delta, weeklyGrowthRate };
}

export const TYPE_LABEL: Record<PostType, string> = {
  image: "사진",
  carousel: "캐러셀",
  reel: "릴스",
};
export const DAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
