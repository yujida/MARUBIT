import type { Highlight, Snapshot, Story, StorySticker } from "./schema";
import { categorize, median, TIMEZONE } from "./metrics";

export const STICKER_LABEL: Record<StorySticker | "none", string> = {
  poll: "투표",
  quiz: "퀴즈",
  question: "질문",
  slider: "이모지 슬라이더",
  link: "링크",
  mention: "멘션",
  hashtag: "해시태그",
  location: "위치",
  music: "음악",
  countdown: "카운트다운",
  add_yours: "내 차례",
  product: "상품",
  gif: "GIF",
  other: "기타",
  none: "스티커 없음",
};

const nonNull = <T,>(xs: (T | null | undefined)[]): T[] => xs.filter((x): x is T => x != null);
const ratio = (a: number | null | undefined, b: number | null | undefined) => (a != null && b ? a / b : null);

/** KST 날짜 (YYYY-MM-DD) */
export function kstDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

function storyKey(s: Story): string {
  if (s.id) return `id:${s.id}`;
  // id가 없으면 게시 시각(분 단위)·유형·문구 앞부분으로 같은 프레임인지 판단
  return `t:${s.postedAt?.slice(0, 16) ?? "?"}|${s.type}|${(s.text ?? "").slice(0, 30)}`;
}

export interface StoryRow {
  story: Story;
  category: string;
  /** 같은 날(KST) 스토리 중 몇 번째 프레임인지 (1부터) */
  position: number | null;
  reachRate: number | null;
  replyRate: number | null;
  exitRate: number | null;
  forwardRate: number | null;
  linkClickRate: number | null;
  stickerTapRate: number | null;
}

export interface StoryGroup {
  key: string;
  count: number;
  medianReachRate: number | null;
  medianReplyRate: number | null;
}

export interface StorySummary {
  /** 스토리를 한 번이라도 확인한 스냅샷이 있는지 */
  collected: boolean;
  snapshotsChecked: number;
  hasInsights: boolean;
  frames: number;
  storyDays: number;
  medianFramesPerDay: number | null;
  imageShare: number | null;
  reshareShare: number | null;
  stickerShare: number | null;
  linkShare: number | null;
  medianReach: number | null;
  medianReachRate: number | null;
  medianReplyRate: number | null;
  medianExitRate: number | null;
  medianForwardRate: number | null;
  medianLinkClickRate: number | null;
  medianStickerTapRate: number | null;
  /** 하루 스토리의 마지막 프레임 도달 ÷ 첫 프레임 도달 (2장 이상 올린 날의 중앙값) */
  medianCompletion: number | null;
  /** 프레임 순서별 도달 (첫 프레임 = 100%) */
  positionCurve: { position: number; label: string; days: number; medianRetention: number | null }[];
  /** 스토리 도달 중앙값 ÷ 피드 게시물 도달 중앙값 */
  storyVsFeed: number | null;
  bySticker: StoryGroup[];
  byCategory: StoryGroup[];
  rows: StoryRow[];
  highlights: Highlight[] | null;
  firstSeen: string | null;
  lastSeen: string | null;
}

function group(rows: StoryRow[], keysOf: (r: StoryRow) => string[]): StoryGroup[] {
  const m = new Map<string, StoryRow[]>();
  for (const r of rows) for (const k of keysOf(r)) m.set(k, [...(m.get(k) ?? []), r]);
  return [...m.entries()]
    .map(([key, rs]) => ({
      key,
      count: rs.length,
      medianReachRate: median(nonNull(rs.map((r) => r.reachRate))),
      medianReplyRate: median(nonNull(rs.map((r) => r.replyRate))),
    }))
    .sort((a, b) => b.count - a.count);
}

const MAX_POSITION = 6; // 6번째 이후 프레임은 "6+"로 묶음

/**
 * 모든 스냅샷의 스토리를 합쳐(중복 제거) 요약한다.
 * 스토리는 24시간 뒤 사라지므로 스냅샷마다 일부만 보이기 때문.
 * 같은 프레임이 여러 번 수집되면 나중 스냅샷의 값(최신 인사이트)을 쓴다.
 */
export function summarizeStories(snaps: Snapshot[]): StorySummary {
  const sorted = [...snaps].sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt));
  const checked = sorted.filter((s) => s.stories != null);
  const latest = sorted.at(-1);
  const followers = latest?.profile.followers ?? null;

  const unique = new Map<string, Story>();
  for (const snap of checked) for (const st of snap.stories!) unique.set(storyKey(st), st);
  const stories = [...unique.values()].sort((a, b) => (a.postedAt ?? "").localeCompare(b.postedAt ?? ""));

  // 날짜별 순서
  const byDay = new Map<string, Story[]>();
  for (const st of stories) {
    if (!st.postedAt) continue;
    const d = kstDate(st.postedAt);
    byDay.set(d, [...(byDay.get(d) ?? []), st]);
  }
  const positionOf = new Map<Story, number>();
  for (const day of byDay.values()) day.forEach((st, i) => positionOf.set(st, i + 1));

  const rows: StoryRow[] = stories.map((st) => {
    const ins = st.insights;
    const views = ins?.views ?? ins?.reach ?? null;
    return {
      story: st,
      category: categorize({ category: st.category, caption: st.text, hashtags: [] } as never),
      position: positionOf.get(st) ?? null,
      reachRate: ratio(ins?.reach, followers),
      replyRate: ratio(ins?.replies, ins?.reach),
      exitRate: ratio(ins?.exits, views),
      forwardRate: ratio(ins?.forwardTaps, views),
      linkClickRate: st.stickers.includes("link") || st.linkUrl ? ratio(ins?.linkClicks, ins?.reach) : null,
      stickerTapRate: st.stickers.some((k) => k !== "link" && k !== "music") ? ratio(ins?.stickerTaps, ins?.reach) : null,
    };
  });

  // 프레임 순서별 도달 유지율 / 완주율
  const retentionByPos = new Map<number, number[]>();
  const completions: number[] = [];
  for (const day of byDay.values()) {
    const first = day[0].insights?.reach;
    if (!first) continue;
    day.forEach((st, i) => {
      const r = st.insights?.reach;
      if (r == null) return;
      const pos = Math.min(i + 1, MAX_POSITION);
      retentionByPos.set(pos, [...(retentionByPos.get(pos) ?? []), r / first]);
    });
    const last = day.at(-1)!.insights?.reach;
    if (day.length >= 2 && last != null) completions.push(last / first);
  }
  const positionCurve = [...retentionByPos.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([position, xs]) => ({
      position,
      label: position === MAX_POSITION ? `${MAX_POSITION}번째 이후` : `${position}번째`,
      days: xs.length,
      medianRetention: median(xs),
    }));

  const feedReach = median(nonNull((latest?.posts ?? []).map((p) => p.insights?.reach)));
  const storyReach = median(nonNull(stories.map((s) => s.insights?.reach)));
  const n = stories.length;
  const share = (pred: (s: Story) => boolean) => (n ? stories.filter(pred).length / n : null);
  const framesPerDay = [...byDay.values()].map((d) => d.length);

  return {
    collected: checked.length > 0,
    snapshotsChecked: checked.length,
    hasInsights: stories.some((s) => s.insights != null),
    frames: n,
    storyDays: byDay.size,
    medianFramesPerDay: median(framesPerDay),
    imageShare: share((s) => s.type === "image"),
    reshareShare: share((s) => s.isReshare),
    stickerShare: share((s) => s.stickers.length > 0),
    linkShare: share((s) => s.stickers.includes("link") || !!s.linkUrl),
    medianReach: storyReach,
    medianReachRate: median(nonNull(rows.map((r) => r.reachRate))),
    medianReplyRate: median(nonNull(rows.map((r) => r.replyRate))),
    medianExitRate: median(nonNull(rows.map((r) => r.exitRate))),
    medianForwardRate: median(nonNull(rows.map((r) => r.forwardRate))),
    medianLinkClickRate: median(nonNull(rows.map((r) => r.linkClickRate))),
    medianStickerTapRate: median(nonNull(rows.map((r) => r.stickerTapRate))),
    medianCompletion: median(completions),
    positionCurve,
    storyVsFeed: ratio(storyReach, feedReach),
    bySticker: group(rows, (r) => (r.story.stickers.length ? [...new Set(r.story.stickers)] : ["none"])),
    byCategory: group(rows, (r) => [r.category]),
    rows: [...rows].reverse(), // 최신순
    highlights: [...sorted].reverse().find((s) => s.highlights != null)?.highlights ?? null,
    firstSeen: stories[0]?.postedAt ?? null,
    lastSeen: stories.at(-1)?.postedAt ?? null,
  };
}
