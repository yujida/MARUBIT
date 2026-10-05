const nf = new Intl.NumberFormat("ko-KR");

/** 12345 → "1.2만", 980 → "980" */
export function fmtNum(n: number | null | undefined): string {
  if (n == null) return "–";
  const abs = Math.abs(n);
  if (abs >= 1e8) return `${trim(n / 1e8)}억`;
  if (abs >= 1e4) return `${trim(n / 1e4)}만`;
  return nf.format(Math.round(n));
}

export function fmtInt(n: number | null | undefined): string {
  return n == null ? "–" : nf.format(Math.round(n));
}

const trim = (x: number) => (Math.abs(x) >= 100 ? Math.round(x).toString() : x.toFixed(1).replace(/\.0$/, ""));

/** 0.0345 → "3.45%" */
export function fmtPct(x: number | null | undefined, digits = 2): string {
  return x == null ? "–" : `${(x * 100).toFixed(digits)}%`;
}

export function fmtSignedPct(x: number | null | undefined, digits = 2): string {
  if (x == null) return "–";
  return `${x >= 0 ? "+" : ""}${(x * 100).toFixed(digits)}%`;
}

export function fmtX(x: number | null | undefined): string {
  return x == null ? "–" : `${x.toFixed(1)}×`;
}

export function fmtDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(iso));
}
