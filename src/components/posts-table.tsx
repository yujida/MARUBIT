"use client";

import { useMemo, useState } from "react";
import type { PostRow } from "@/lib/metrics";
import { TYPE_LABEL } from "@/lib/metrics";
import { fmtDate, fmtNum, fmtPct, fmtX } from "@/lib/format";
import type { TermKey } from "@/lib/glossary";
import { Term } from "./term";

type Col = {
  key: string;
  label: string;
  value: (r: PostRow) => number | null;
  fmt: (n: number | null) => string;
  term?: TermKey;
  ownOnly?: boolean;
};

const COLS: Col[] = [
  { key: "date", label: "게시일", value: (r) => (r.post.postedAt ? Date.parse(r.post.postedAt) : null), fmt: () => "" },
  { key: "likes", term: "likes", label: "좋아요", value: (r) => r.post.likes, fmt: fmtNum },
  { key: "comments", term: "comments", label: "댓글", value: (r) => r.post.comments, fmt: fmtNum },
  { key: "views", term: "views", label: "조회", value: (r) => r.post.views ?? r.post.insights?.views ?? null, fmt: fmtNum },
  { key: "er", term: "er", label: "참여율", value: (r) => r.er, fmt: (n) => fmtPct(n) },
  { key: "vs", term: "vsMedian", label: "중앙 대비", value: (r) => r.vsMedian, fmt: fmtX },
  { key: "reach", term: "reach", label: "도달", value: (r) => r.post.insights?.reach ?? null, fmt: fmtNum, ownOnly: true },
  { key: "saves", term: "saves", label: "저장", value: (r) => r.post.insights?.saves ?? null, fmt: fmtNum, ownOnly: true },
  { key: "shares", term: "shares", label: "공유", value: (r) => r.post.insights?.shares ?? null, fmt: fmtNum, ownOnly: true },
  { key: "erReach", term: "erReach", label: "도달 참여율", value: (r) => r.erReach, fmt: (n) => fmtPct(n), ownOnly: true },
];

export function PostsTable({ rows, own }: { rows: PostRow[]; own: boolean }) {
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({ key: "date", desc: true });
  const [type, setType] = useState<string>("all");
  const cols = COLS.filter((c) => own || !c.ownOnly);

  const shown = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key)!;
    return rows
      .filter((r) => type === "all" || r.post.type === type)
      .sort((a, b) => {
        const va = col.value(a);
        const vb = col.value(b);
        if (va == null) return 1;
        if (vb == null) return -1;
        return sort.desc ? vb - va : va - vb;
      });
  }, [rows, sort, type]);

  return (
    <div className="card overflow-x-auto p-0">
      <div className="flex gap-1 border-b border-line p-2">
        {["all", "reel", "carousel", "image"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-md px-2.5 py-1 text-xs ${type === t ? "bg-accent text-white" : "text-ink-2 hover:bg-page"}`}
          >
            {t === "all" ? "전체" : TYPE_LABEL[t as keyof typeof TYPE_LABEL]}
          </button>
        ))}
        <span className="ml-auto self-center pr-2 text-xs text-muted">열 제목을 눌러 정렬</span>
      </div>
      <table className="table min-w-[56rem]">
        <thead>
          <tr>
            <th>게시물</th>
            {cols.map((c) => (
              <th key={c.key} className="cursor-pointer whitespace-nowrap text-right" onClick={() => setSort((s) => ({ key: c.key, desc: s.key === c.key ? !s.desc : true }))}>
                {c.term ? <Term k={c.term} iconOnly>{c.label}</Term> : c.label}
                {sort.key === c.key ? (sort.desc ? " ↓" : " ↑") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.post.shortcode}>
              <td className="max-w-xs">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="badge">{TYPE_LABEL[r.post.type]}</span>
                  <span className="badge">{r.category}</span>
                  {r.post.pinned && <span className="badge">고정</span>}
                </div>
                <a href={r.post.url ?? `https://www.instagram.com/p/${r.post.shortcode}/`} target="_blank" rel="noreferrer" className="mt-1 line-clamp-2 text-ink-2 hover:text-accent">
                  {r.post.caption?.split("\n")[0] || "(캡션 없음)"}
                </a>
              </td>
              {cols.map((c) => (
                <td key={c.key} className="num whitespace-nowrap text-right">
                  {c.key === "date" ? fmtDate(r.post.postedAt, true) : c.key === "vs" ? <VsMedian v={r.vsMedian} /> : c.fmt(c.value(r))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VsMedian({ v }: { v: number | null }) {
  if (v == null) return <span className="text-muted">–</span>;
  const cls = v >= 2 ? "font-semibold text-good" : v < 0.5 ? "text-bad" : "";
  return <span className={cls}>{fmtX(v)}</span>;
}
