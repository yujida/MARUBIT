import { DAY_LABEL } from "@/lib/metrics";

/** 요일×시간(KST) 게시 히트맵. 색 = 해당 칸 게시물의 중앙 참여율(순차 단일 색상). */
export function Heatmap({ cells }: { cells: { count: number; medianEr: number | null }[][] }) {
  const ers = cells.flat().map((c) => c.medianEr).filter((x): x is number => x != null);
  const max = Math.max(...ers, 0);
  const step = (er: number | null) => (er == null || max === 0 ? 0 : Math.min(6, 1 + Math.floor((er / max) * 5.999)));
  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="w-6 text-center text-[10px] font-normal text-muted">{h % 3 === 0 ? h : ""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((row, d) => (
            <tr key={d}>
              <th className="pr-1 text-xs font-normal text-muted">{DAY_LABEL[d]}</th>
              {row.map((c, h) => (
                <td
                  key={h}
                  className="h-6 w-6 rounded text-center text-[10px]"
                  style={{ background: `var(--seq-${c.count ? step(c.medianEr) : 0})`, color: step(c.medianEr) >= 4 ? "#fff" : "var(--ink-2)" }}
                  title={`${DAY_LABEL[d]}요일 ${h}시 · 게시 ${c.count}개${c.medianEr != null ? ` · 중앙 참여율 ${(c.medianEr * 100).toFixed(2)}%` : ""}`}
                >
                  {c.count || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>참여율 낮음</span>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="h-3 w-5 rounded" style={{ background: `var(--seq-${i})` }} />
        ))}
        <span>높음 · 숫자 = 게시물 수 (KST)</span>
      </div>
    </div>
  );
}
