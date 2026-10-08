import { z } from "zod";
import { store } from "@/lib/storage";

const body = z.object({
  handle: z.string().regex(/^[a-z0-9._]{1,30}$/),
  title: z.string().min(1).max(200),
  markdown: z.string().min(20),
});

/** POST /api/reports { handle, title, markdown } — Authorization: Bearer <SITE_PASSWORD> */
export async function POST(request: Request) {
  const r = body.safeParse(await request.json().catch(() => null));
  if (!r.success) return Response.json({ ok: false, errors: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
  const report = await store.saveReport({ ...r.data, createdAt: new Date().toISOString() });
  return Response.json({ ok: true, id: report.id });
}
