import { describe, expect, it } from "vitest";
import { collectPrompt } from "./prompts";
import { parseSnapshot } from "./schema";

/** 프롬프트 안의 예시 JSON이 실제 스키마로 저장 가능한지 확인 (프롬프트와 스키마가 어긋나지 않게) */
function exampleOf(prompt: string) {
  const m = prompt.match(/```json\n([\s\S]*?)\n```/);
  if (!m) throw new Error("no json block");
  return m[1].replace(/"<지금 시각[^"]*>"/, '"2026-10-20T21:30:00+09:00"');
}

describe("collectPrompt example JSON", () => {
  it.each([
    ["own", undefined],
    ["competitor", false],
    ["competitor", true],
  ] as const)("%s (stories=%s) parses", (role, includeStories) => {
    const p = collectPrompt({ handle: "abc", role, siteUrl: "https://x.test", includeStories });
    const r = parseSnapshot(exampleOf(p));
    if (!r.ok) throw new Error(r.errors.join("\n"));
    const snap = r.snapshot;
    expect(snap.highlights?.length).toBe(1);
    if (role === "competitor" && !includeStories) expect(snap.stories).toBeNull();
    else expect(snap.stories?.[0].stickers).toEqual(["countdown", "link"]);
    expect(snap.stories?.[0]?.insights != null).toBe(role === "own");
  });

  it("only opens competitor stories when allowed", () => {
    expect(collectPrompt({ handle: "abc", role: "competitor", siteUrl: "x" })).toContain("스토리를 열지 않습니다");
    expect(collectPrompt({ handle: "abc", role: "competitor", siteUrl: "x", includeStories: true })).toContain("절대 누르지 말 것");
    expect(collectPrompt({ handle: "abc", role: "own", siteUrl: "x" })).toContain("archive/stories");
  });
});
