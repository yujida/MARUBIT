import { describe, expect, it } from "vitest";
import { parseCount, parseSnapshot, type Snapshot } from "./schema";
import { categorize, growth, kstDayHour, median, summarize } from "./metrics";

describe("parseCount", () => {
  it.each([
    [1234, 1234],
    ["1,234", 1234],
    ["1.2만", 12000],
    ["3천", 3000],
    ["12.3K", 12300],
    ["1.2M", 1200000],
    ["2억", 200000000],
    ["좋아요 숨김", null],
    ["", null],
    [null, null],
    ["5,021개", 5021],
  ])("%s → %s", (input, expected) => {
    expect(parseCount(input)).toBe(expected);
  });
});

const base = (over: Partial<Snapshot> = {}): unknown => ({
  schemaVersion: 1,
  handle: "@Test.Account",
  collectedAt: "2026-10-01T12:00:00+09:00",
  profile: { posts: "120", followers: "1만", following: 100 },
  posts: [
    { shortcode: "a", type: "reel", postedAt: "2026-09-29T12:00:00+09:00", likes: 500, comments: 50, views: "3.1만", hashtags: ["#Dance"] },
    { shortcode: "b", type: "image", postedAt: "2026-09-22T12:00:00+09:00", likes: 100, comments: 10, caption: "공부 꿀팁 정리" },
    { shortcode: "c", type: "carousel", postedAt: "2026-09-15T12:00:00+09:00", likes: null, comments: 5 },
  ],
  ...over,
});

describe("parseSnapshot", () => {
  it("normalizes handle and Korean counts", () => {
    const r = parseSnapshot(JSON.stringify(base()));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.handle).toBe("test.account");
    expect(r.snapshot.profile.followers).toBe(10000);
    expect(r.snapshot.posts[0].views).toBe(31000);
    expect(r.snapshot.role).toBe("competitor");
  });

  it("accepts fenced JSON", () => {
    expect(parseSnapshot("```json\n" + JSON.stringify(base()) + "\n```").ok).toBe(true);
  });

  it("reports readable errors", () => {
    const r = parseSnapshot({ ...(base() as object), posts: [{ shortcode: "x", type: "story" }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join()).toContain("posts.0.type");
  });
});

describe("summarize", () => {
  const r = parseSnapshot(base());
  if (!r.ok) throw new Error(r.errors.join());
  const s = summarize(r.snapshot);

  it("computes engagement on visible-like posts only", () => {
    expect(s.medianEr).toBeCloseTo((0.055 + 0.011) / 2);
    expect(s.likesHiddenCount).toBe(1);
    expect(s.rows[0].vsMedian).toBeCloseTo(550 / 330);
  });

  it("computes cadence from post dates", () => {
    expect(s.postsPerWeek).toBeCloseTo(1, 5);
  });

  it("groups by type, tags and category", () => {
    expect(s.byType.map((g) => g.key).sort()).toEqual(["carousel", "image", "reel"]);
    expect(s.hashtags[0].tag).toBe("dance");
    expect(s.rows[1].category).toBe("교육");
    expect(s.rows[0].category).toBe("춤");
  });

  it("reel view rate", () => {
    expect(s.medianViewRate).toBeCloseTo(3.1);
  });
});

describe("helpers", () => {
  it("median", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it("KST day/hour", () => {
    expect(kstDayHour("2026-10-04T15:30:00Z")).toEqual({ day: 1, hour: 0 }); // 월 00시 KST
  });

  it("explicit category wins", () => {
    expect(categorize({ category: "대중문화", caption: "댄스" } as never)).toBe("대중문화");
  });

  it("growth over snapshots", () => {
    const a = parseSnapshot(base());
    const b = parseSnapshot(base({ collectedAt: "2026-10-08T12:00:00+09:00", profile: { posts: 121, followers: 11000, following: 100 } } as never));
    if (!a.ok || !b.ok) throw new Error();
    const g = growth([b.snapshot, a.snapshot]);
    expect(g.followerDelta).toBe(1000);
    expect(g.weeklyGrowthRate).toBeCloseTo(0.1);
  });
});
