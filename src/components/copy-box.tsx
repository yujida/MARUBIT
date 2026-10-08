"use client";

import { useState } from "react";

export function CopyBox({ text, label = "프롬프트 복사", rows = 16 }: { text: string; label?: string; rows?: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card p-0">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-xs text-muted">{text.length.toLocaleString()}자</span>
        <button
          className="btn-primary py-1.5"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "복사됨 ✓" : label}
        </button>
      </div>
      <textarea readOnly value={text} rows={rows} className="block w-full resize-y bg-transparent p-3 font-mono text-xs text-ink-2 outline-none" />
    </div>
  );
}
