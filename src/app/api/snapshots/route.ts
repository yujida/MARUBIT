import { parseSnapshot } from "@/lib/schema";
import { store } from "@/lib/storage";

/** GET /api/snapshots?handle=xxx → 해당 계정 스냅샷 목록, handle 없으면 계정 목록 */
export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle");
  if (!handle) return Response.json({ handles: await store.listHandles() });
  return Response.json({ snapshots: await store.getSnapshots(handle.toLowerCase()) });
}

/** POST /api/snapshots (본문: 스냅샷 JSON) — Authorization: Bearer <SITE_PASSWORD> */
export async function POST(request: Request) {
  const r = parseSnapshot(await request.text());
  if (!r.ok) return Response.json({ ok: false, errors: r.errors }, { status: 400 });
  await store.saveSnapshot(r.snapshot);
  return Response.json({ ok: true, handle: r.snapshot.handle, posts: r.snapshot.posts.length });
}
