"use client";

import Link from "next/link";
import { useActionState } from "react";
import { importSnapshot, type ImportState } from "./actions";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importSnapshot, { status: "idle" });
  return (
    <form action={action} className="mt-6 space-y-3">
      <textarea
        name="json"
        aria-label="스냅샷 JSON"
        required
        rows={18}
        placeholder='{ "schemaVersion": 1, "handle": "...", ... }'
        className="input font-mono text-xs"
      />
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "저장 중…" : "저장"}</button>
        <label className="btn cursor-pointer">
          JSON 파일 선택
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              const ta = e.target.form?.elements.namedItem("json") as HTMLTextAreaElement | null;
              if (f && ta) ta.value = await f.text();
            }}
          />
        </label>
      </div>
      {state.status === "error" && (
        <div role="alert" className="card border-bad text-sm">
          <p className="font-medium text-bad">저장하지 못했습니다. 아래 항목을 고쳐 주세요.</p>
          <ul className="mt-2 list-disc pl-5 font-mono text-xs text-ink-2">
            {state.errors.slice(0, 20).map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}
      {state.status === "ok" && (
        <div role="status" className="card text-sm">
          <p className="font-medium text-good">저장 완료 ✓</p>
          <p className="mt-1 text-ink-2">@{state.handle} · 게시물 {state.posts}개 · {state.collectedAt}</p>
          <Link href={`/channels/${state.handle}`} className="mt-2 inline-block text-accent underline">채널 분석 보기 →</Link>
        </div>
      )}
    </form>
  );
}
