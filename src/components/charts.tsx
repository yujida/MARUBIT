"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AXIS = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 12 }, tickLine: false } as const;
const TOOLTIP = {
  contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--ink)" },
  labelStyle: { color: "var(--ink-2)" },
  cursor: { stroke: "var(--axis)", strokeWidth: 1 },
} as const;

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(iso));
const compact = (n: number) => new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(n);

/** 단일 계정 팔로워 추이 (단일 시리즈 → 범례 없음, 제목이 이름 역할) */
export function FollowerChart({ points }: { points: { date: string; followers: number | null }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} {...AXIS} minTickGap={24} />
          <YAxis tickFormatter={compact} {...AXIS} axisLine={false} width={48} domain={["auto", "auto"]} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={(d) => shortDate(String(d))}
            formatter={(v) => [new Intl.NumberFormat("ko-KR").format(Number(v)), "팔로워"]}
          />
          <Line type="monotone" dataKey="followers" stroke="var(--series-1)" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "var(--series-1)" }} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)"];

/** 여러 계정의 팔로워 증가율(첫 수집일 대비 %) — 규모가 다른 계정을 한 축에서 비교하기 위해 지수화 */
export function IndexedGrowthChart({ series }: { series: { handle: string; points: { date: string; followers: number | null }[] }[] }) {
  const byDate = new Map<string, Record<string, number | string>>();
  for (const s of series) {
    const base = s.points.find((p) => p.followers != null)?.followers;
    if (!base) continue;
    for (const p of s.points) {
      if (p.followers == null) continue;
      const day = p.date.slice(0, 10);
      const row = byDate.get(day) ?? { date: day };
      row[s.handle] = Math.round(((p.followers - base) / base) * 10000) / 100;
      byDate.set(day, row);
    }
  }
  const data = [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} {...AXIS} minTickGap={24} />
          <YAxis tickFormatter={(v) => `${v}%`} {...AXIS} axisLine={false} width={48} />
          <Tooltip {...TOOLTIP} labelFormatter={(d) => shortDate(String(d))} formatter={(v, name) => [`${v}%`, `@${name}`]} />
          <Legend formatter={(v) => <span style={{ color: "var(--ink-2)", fontSize: 12 }}>@{v}</span>} />
          {series.map((s, i) => (
            <Line key={s.handle} type="monotone" dataKey={s.handle} stroke={SERIES[i % SERIES.length]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
