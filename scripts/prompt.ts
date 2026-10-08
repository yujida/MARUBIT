/**
 * 사이트 없이 터미널에서 프롬프트를 만든다 (로컬 data/ 기준).
 *   npm run prompt -- collect <handle> [own|competitor] [게시물수]
 *   npm run prompt -- analyze <handle> [비교계정 ...]
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotSchema, type Snapshot } from "../src/lib/schema";
import { analyzePrompt, collectPrompt } from "../src/lib/prompts";

const [cmd, handle, ...rest] = process.argv.slice(2);
const site = process.env.SITE_URL ?? "http://localhost:3000";

function load(h: string): Snapshot[] {
  const dir = join("data", "channels", h);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => snapshotSchema.parse(JSON.parse(readFileSync(join(dir, f), "utf8"))))
    .sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt));
}

if (cmd === "collect" && handle) {
  const role = rest[0] === "own" ? "own" : "competitor";
  console.log(collectPrompt({ handle: handle.replace(/^@/, "").toLowerCase(), role, postCount: Number(rest[1]) || undefined, siteUrl: site }));
} else if (cmd === "analyze" && handle) {
  console.log(analyzePrompt(load(handle), rest.map(load)));
} else {
  console.error("usage: npm run prompt -- collect <handle> [own|competitor] [n] | analyze <handle> [peer ...]");
  process.exit(1);
}
