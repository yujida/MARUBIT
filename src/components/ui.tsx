import type { ReactNode } from "react";

export function Kpi({ label, value, sub }: { label: ReactNode; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-2">{sub}</div>}
    </div>
  );
}

export function Section({ title, desc, children, action }: { title: ReactNode; desc?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="h2">{title}</h2>
          {desc && <div className="mt-0.5 text-sm text-muted">{desc}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Delta({ value, format }: { value: number | null; format: (n: number) => string }) {
  if (value == null) return <span className="text-muted">–</span>;
  const up = value > 0;
  return (
    <span className={value === 0 ? "text-muted" : up ? "text-good" : "text-bad"}>
      {up ? "▲" : value < 0 ? "▼" : ""} {format(Math.abs(value))}
    </span>
  );
}

export function RoleBadge({ role }: { role: "own" | "competitor" }) {
  return <span className="badge">{role === "own" ? "내 계정" : "경쟁·벤치마크"}</span>;
}
