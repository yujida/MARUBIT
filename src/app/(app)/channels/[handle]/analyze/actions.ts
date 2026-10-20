"use server";

import { redirect } from "next/navigation";
import { store } from "@/lib/storage";

export async function saveReport(handle: string, _: string | null, formData: FormData): Promise<string | null> {
  const markdown = String(formData.get("markdown") ?? "").trim();
  if (markdown.length < 20) return "리포트 내용을 붙여 넣어 주세요.";
  const title =
    String(formData.get("title") ?? "").trim() ||
    markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
    `@${handle} 분석 리포트`;
  let id: string;
  try {
    ({ id } = await store.saveReport({ handle, title, markdown, createdAt: new Date().toISOString() }));
  } catch (e) {
    return `저장 실패: ${(e as Error).message}`;
  }
  redirect(`/channels/${handle}/reports/${id}`);
}
