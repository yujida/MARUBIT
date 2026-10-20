import { describe, expect, it } from "vitest";
import { snapshotSchema, type Snapshot } from "./schema";
import { kstDate, summarizeStories } from "./stories";

const snap = (collectedAt: string, stories: unknown[] | null, extra: object = {}): Snapshot =>
  snapshotSchema.parse({
    schemaVersion: 1,
    handle: "me",
    collectedAt,
    role: "own",
    profile: { posts: 10, followers: 1000, following: 10 },
    posts: [{ shortcode: "p1", type: "reel", postedAt: collectedAt, likes: 10, insights: { reach: 400 } }],
    stories,
    ...extra,
  });

// 10/5(일) KST에 3장, 10/8(수)에 2장
const day1 = [
  { id: "a", postedAt: "2026-10-05T10:00:00+09:00", type: "image", stickers: ["poll"], insights: { reach: 200, views: 220, replies: 4, exits: 22, forwardTaps: 44 } },
  { id: "b", postedAt: "2026-10-05T10:05:00+09:00", type: "video", stickers: [], insights: { reach: 150, views: 160 } },
  { id: "c", postedAt: "2026-10-05T10:10:00+09:00", type: "image", stickers: ["link"], linkUrl: "https://x.y", insights: { reach: 100, linkClicks: 5 } },
];
const day2 = [
  { id: "d", postedAt: "2026-10-08T21:00:00+09:00", type: "image", stickers: ["question", "링크아님"], insights: { reach: 300, replies: 30 } },
  { id: "e", postedAt: "2026-10-08T21:02:00+09:00", type: "image", isReshare: true, insights: { reach: 240 } },
];

describe("summarizeStories", () => {
  it("returns not-collected when no snapshot checked stories", () => {
    const s = summarizeStories([snap("2026-10-05T12:00:00+09:00", null)]);
    expect(s.collected).toBe(false);
    expect(s.frames).toBe(0);
  });

  it("dedupes frames across snapshots, keeping the newest insights", () => {
    const updatedA = { ...day1[0], insights: { ...day1[0].insights, reach: 210 } };
    const s = summarizeStories([
      snap("2026-10-05T12:00:00+09:00", day1),
      snap("2026-10-06T09:00:00+09:00", [updatedA, day1[1], day1[2]]),
      snap("2026-10-08T23:00:00+09:00", day2),
    ]);
    expect(s.frames).toBe(5);
    expect(s.storyDays).toBe(2);
    expect(s.snapshotsChecked).toBe(3);
    expect(s.rows.find((r) => r.story.id === "a")!.story.insights!.reach).toBe(210);
  });

  it("computes positions, completion and retention curve", () => {
    const s = summarizeStories([snap("2026-10-05T12:00:00+09:00", day1), snap("2026-10-08T23:00:00+09:00", day2)]);
    expect(s.rows.find((r) => r.story.id === "c")!.position).toBe(3);
    expect(s.rows.find((r) => r.story.id === "d")!.position).toBe(1);
    // 완주율: day1 100/200 = 0.5, day2 240/300 = 0.8 → 중앙값 0.65
    expect(s.medianCompletion).toBeCloseTo(0.65);
    expect(s.positionCurve[0]).toMatchObject({ position: 1, medianRetention: 1, days: 2 });
    expect(s.positionCurve[1].medianRetention).toBeCloseTo((0.75 + 0.8) / 2);
  });

  it("computes rates", () => {
    const s = summarizeStories([snap("2026-10-05T12:00:00+09:00", day1), snap("2026-10-08T23:00:00+09:00", day2)]);
    const a = s.rows.find((r) => r.story.id === "a")!;
    expect(a.reachRate).toBeCloseTo(0.2);
    expect(a.replyRate).toBeCloseTo(0.02);
    expect(a.exitRate).toBeCloseTo(0.1);
    expect(a.forwardRate).toBeCloseTo(0.2);
    expect(s.rows.find((r) => r.story.id === "c")!.linkClickRate).toBeCloseTo(0.05);
    expect(s.rows.find((r) => r.story.id === "b")!.linkClickRate).toBeNull();
    expect(s.reshareShare).toBeCloseTo(0.2);
    expect(s.linkShare).toBeCloseTo(0.2);
    // 스토리 도달 중앙값 200 ÷ 피드 도달 400
    expect(s.storyVsFeed).toBeCloseTo(0.5);
  });

  it("maps unknown stickers to other and groups frames without stickers", () => {
    const s = summarizeStories([snap("2026-10-08T23:00:00+09:00", day2)]);
    expect(s.rows.find((r) => r.story.id === "d")!.story.stickers).toEqual(["question", "other"]);
    expect(s.bySticker.map((g) => g.key).sort()).toEqual(["none", "other", "question"]);
  });

  it("uses highlights from the latest snapshot that has them", () => {
    const s = summarizeStories([
      snap("2026-10-05T12:00:00+09:00", [], { highlights: [{ title: "수업 후기", itemCount: 12 }] }),
      snap("2026-10-08T23:00:00+09:00", []),
    ]);
    expect(s.collected).toBe(true);
    expect(s.frames).toBe(0);
    expect(s.highlights).toEqual([{ title: "수업 후기", itemCount: 12 }]);
  });

  it("kstDate converts across midnight", () => {
    expect(kstDate("2026-10-04T15:30:00Z")).toBe("2026-10-05");
  });
});
