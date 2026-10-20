/** 가로 막대 목록 (단일 측정값 → 단일 색). 값 라벨을 항상 표시. */
export function BarList({
  rows,
  format,
  max,
}: {
  rows: { label: string; value: number | null; note?: string }[];
  format: (n: number) => string;
  max?: number;
}) {
  const top = max ?? Math.max(0, ...rows.map((r) => r.value ?? 0));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm" title={r.note}>
          <span className="truncate text-ink-2">{r.label}</span>
          <span className="h-3 rounded-r bg-page">
            {r.value != null && top > 0 && (
              <span className="block h-3 rounded-r" style={{ width: `${Math.max(2, (r.value / top) * 100)}%`, background: "var(--series-1)" }} />
            )}
          </span>
          <span className="num w-24 text-right">
            {r.value == null ? "–" : format(r.value)}
            {r.note && <span className="ml-1 text-xs text-muted">{r.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
