import Link from "next/link";
import { store } from "@/lib/storage";
import { growth, summarize, TYPE_LABEL } from "@/lib/metrics";
import { fmtNum, fmtPct, fmtSignedPct } from "@/lib/format";
import { Section } from "@/components/ui";
import { IndexedGrowthChart } from "@/components/charts";

export const dynamic = "force-dynamic";
const MAX = 5;

export default async function ComparePage(props: PageProps<"/compare">) {
  const sp = await props.searchParams;
  const all = await Promise.all((await store.listHandles()).map(async (h) => ({ h, snaps: await store.getSnapshots(h) })));
  const available = all.filter((a) => a.snaps.length);
  const requested = sp.h === undefined ? [] : ([] as string[]).concat(sp.h);
  // 기본: 내 계정 먼저, 그다음 경쟁 계정 (최대 5개)
  const defaults = [...available].sort((a, b) => (a.snaps.at(-1)!.role === "own" ? -1 : 1) - (b.snaps.at(-1)!.role === "own" ? -1 : 1)).map((a) => a.h);
  const selected = (requested.length ? requested : defaults).filter((h) => available.some((a) => a.h === h)).slice(0, MAX);

  const rows = selected.map((h) => {
    const snaps = available.find((a) => a.h === h)!.snaps;
    const latest = snaps.at(-1)!;
    return { h, latest, s: summarize(latest), g: growth(snaps), snaps };
  });

  const metrics: { label: string; get: (r: (typeof rows)[number]) => number | null; fmt: (n: number | null) => string; hint?: string }[] = [
    { label: "팔로워", get: (r) => r.s.followers, fmt: fmtNum },
    { label: "주간 팔로워 성장률", get: (r) => r.g.weeklyGrowthRate, fmt: (n) => fmtSignedPct(n) },
    { label: "참여율 (중앙)", get: (r) => r.s.medianEr, fmt: (n) => fmtPct(n) },
    { label: "릴스 조회율 (중앙)", get: (r) => r.s.medianViewRate, fmt: (n) => (n == null ? "–" : `${(n * 100).toFixed(0)}%`) },
    { label: "릴스 중앙 조회수", get: (r) => r.s.medianReelViews, fmt: fmtNum },
    { label: "중앙 반응수 (좋아요+댓글)", get: (r) => r.s.medianInteractions, fmt: fmtNum },
    { label: "댓글/좋아요", get: (r) => r.s.commentToLikeRatio, fmt: (n) => fmtPct(n, 1) },
    { label: "주간 게시 수", get: (r) => r.s.postsPerWeek, fmt: (n) => (n == null ? "–" : n.toFixed(1)) },
    ...(["reel", "carousel", "image"] as const).map((t) => ({
      label: `${TYPE_LABEL[t]} 비중`,
      get: (r: (typeof rows)[number]) => (r.s.postsAnalyzed ? (r.s.byType.find((b) => b.key === t)?.count ?? 0) / r.s.postsAnalyzed : null),
      fmt: (n: number | null) => fmtPct(n, 0),
    })),
    ...["춤", "교육", "대중문화"].map((c) => ({
      label: `${c} 콘텐츠 참여율`,
      get: (r: (typeof rows)[number]) => r.s.byCategory.find((b) => b.key === c)?.medianEr ?? null,
      fmt: (n: number | null) => fmtPct(n),
    })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">계정 비교</h1>
      <p className="mt-1 text-sm text-muted">최대 {MAX}개 계정의 최근 스냅샷을 나란히 봅니다. 팔로워 규모가 달라도 비교할 수 있도록 비율 지표 위주입니다.</p>

      <form className="card mt-6">
        <div className="flex flex-wrap gap-3">
          {available.map(({ h, snaps }) => (
            <label key={h} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="h" value={h} defaultChecked={selected.includes(h)} />
              @{h} {snaps.at(-1)!.role === "own" && <span className="badge">내 계정</span>}
            </label>
          ))}
        </div>
        <button className="btn mt-3">비교하기</button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">비교할 계정이 없습니다. <Link className="text-accent underline" href="/collect">먼저 수집하세요.</Link></p>
      ) : (
        <>
          <Section title="지표 비교" desc="각 행에서 가장 높은 값을 굵게 표시">
            <div className="card overflow-x-auto p-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>지표</th>
                    {rows.map((r) => (
                      <th key={r.h} className="text-right">
                        <Link href={`/channels/${r.h}`} className="hover:text-accent">@{r.h}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const vals = rows.map(m.get);
                    const best = Math.max(...vals.filter((v): v is number => v != null));
                    return (
                      <tr key={m.label}>
                        <td className="whitespace-nowrap text-ink-2">{m.label}</td>
                        {vals.map((v, i) => (
                          <td key={rows[i].h} className={`num text-right ${v === best && rows.length > 1 ? "font-semibold" : ""}`}>{m.fmt(v)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="팔로워 증가율" desc="각 계정의 첫 수집일 대비 증가율(%) — 규모가 다른 계정을 같은 축에서 비교">
            <div className="card">
              <IndexedGrowthChart series={rows.map((r) => ({ handle: r.h, points: growth(r.snaps).points }))} />
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
