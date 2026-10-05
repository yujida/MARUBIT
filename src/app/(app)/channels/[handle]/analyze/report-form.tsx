"use client";

import { useActionState } from "react";
import { saveReport } from "./actions";

export function ReportForm({ handle }: { handle: string }) {
  const [error, action, pending] = useActionState(saveReport.bind(null, handle), null);
  return (
    <form action={action} className="space-y-3">
      <input name="title" placeholder="제목 (비우면 리포트 첫 줄 제목 사용)" className="input" />
      <textarea name="markdown" aria-label="리포트 Markdown" required rows={14} placeholder="Claude가 작성한 리포트(Markdown)를 붙여 넣으세요" className="input font-mono text-xs" />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "저장 중…" : "리포트 저장"}</button>
    </form>
  );
}
