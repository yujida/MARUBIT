"use server";

import { revalidatePath } from "next/cache";
import { parseSnapshot } from "@/lib/schema";
import { store } from "@/lib/storage";

export type ImportState =
  | { status: "idle" }
  | { status: "error"; errors: string[] }
  | { status: "ok"; handle: string; posts: number; collectedAt: string };

export async function importSnapshot(_: ImportState, formData: FormData): Promise<ImportState> {
  const r = parseSnapshot(String(formData.get("json") ?? ""));
  if (!r.ok) return { status: "error", errors: r.errors };
  try {
    await store.saveSnapshot(r.snapshot);
  } catch (e) {
    return { status: "error", errors: [`저장 실패: ${(e as Error).message}. 배포 환경이라면 DATABASE_URL 설정을 확인하세요.`] };
  }
  revalidatePath("/");
  return { status: "ok", handle: r.snapshot.handle, posts: r.snapshot.posts.length, collectedAt: r.snapshot.collectedAt };
}
