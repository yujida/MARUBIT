import { z } from "zod";

/**
 * 인스타 화면의 숫자 표기를 정수로 바꾼다.
 * "1,234" · "1.2만" · "3천" · "12.3K" · "1.2M" · "1억" → number. 읽을 수 없으면 null.
 */
export function parseCount(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "number") return Number.isFinite(input) ? Math.round(input) : null;
  if (typeof input !== "string") return null;

  const s = input.replace(/[,\s]/g, "").replace(/(개|회|명|views?|likes?|plays?)$/i, "");
  const m = s.match(/^(\d+(?:\.\d+)?)(만|천|억|[kKmMbB])?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit: Record<string, number> = {
    천: 1e3, 만: 1e4, 억: 1e8, k: 1e3, m: 1e6, b: 1e9,
  };
  const mult = m[2] ? unit[m[2].toLowerCase()] ?? unit[m[2]] : 1;
  return Math.round(n * mult);
}

const count = z.preprocess((v) => parseCount(v), z.number().int().nonnegative().nullable());
const optCount = count.optional().default(null);

export const POST_TYPES = ["image", "carousel", "reel"] as const;
export const CATEGORIES = ["교육", "대중문화", "춤", "일상", "홍보", "기타"] as const;

export const postInsightsSchema = z.object({
  reach: optCount,
  views: optCount,
  saves: optCount,
  shares: optCount,
  profileVisits: optCount,
  follows: optCount,
  avgWatchTimeSec: z.number().nonnegative().nullable().optional().default(null),
});

export const postSchema = z.object({
  shortcode: z.string().min(1),
  url: z.string().url().optional(),
  type: z.enum(POST_TYPES),
  postedAt: z.string().datetime({ offset: true }).nullable(),
  caption: z.string().nullable().optional().default(null),
  hashtags: z.array(z.string()).optional().default([]),
  mentions: z.array(z.string()).optional().default([]),
  likes: optCount,
  comments: optCount,
  views: optCount,
  carouselCount: z.number().int().positive().nullable().optional().default(null),
  pinned: z.boolean().optional().default(false),
  category: z.string().nullable().optional().default(null),
  topic: z.string().nullable().optional().default(null),
  hook: z.string().nullable().optional().default(null),
  insights: postInsightsSchema.nullable().optional().default(null),
});

export const accountInsightsSchema = z.object({
  periodDays: z.number().int().positive(),
  accountsReached: optCount,
  accountsEngaged: optCount,
  profileVisits: optCount,
  followerChange: z.number().int().nullable().optional().default(null),
  nonFollowerReachPct: z.number().min(0).max(100).nullable().optional().default(null),
});

export const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  handle: z
    .string()
    .transform((h) => h.trim().replace(/^@/, "").toLowerCase())
    .pipe(z.string().regex(/^[a-z0-9._]{1,30}$/, "인스타 핸들 형식이 아닙니다")),
  collectedAt: z.string().datetime({ offset: true }),
  source: z.enum(["computer-use", "graph-api", "export", "manual", "sample"]).default("computer-use"),
  role: z.enum(["own", "competitor"]).default("competitor"),
  profile: z.object({
    displayName: z.string().nullable().optional().default(null),
    bio: z.string().nullable().optional().default(null),
    externalUrl: z.string().nullable().optional().default(null),
    category: z.string().nullable().optional().default(null),
    verified: z.boolean().optional().default(false),
    posts: count,
    followers: count,
    following: count,
    highlights: optCount,
  }),
  accountInsights: accountInsightsSchema.nullable().optional().default(null),
  posts: z.array(postSchema).max(60),
  notes: z.string().nullable().optional().default(null),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
export type Post = z.infer<typeof postSchema>;
export type PostType = (typeof POST_TYPES)[number];

export type ParseResult =
  | { ok: true; snapshot: Snapshot }
  | { ok: false; errors: string[] };

/** JSON 문자열 또는 객체를 검증한다. 코드펜스(```json)로 감싼 붙여넣기도 허용. */
export function parseSnapshot(input: unknown): ParseResult {
  let data = input;
  if (typeof input === "string") {
    const text = input.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { ok: false, errors: [`JSON 파싱 실패: ${(e as Error).message}`] };
    }
  }
  const r = snapshotSchema.safeParse(data);
  if (r.success) return { ok: true, snapshot: r.data };
  return {
    ok: false,
    errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
  };
}
