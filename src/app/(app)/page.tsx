import Link from "next/link";
import { store } from "@/lib/storage";
import { growth, summarize } from "@/lib/metrics";
import { fmtDate, fmtNum, fmtPct } from "@/lib/format";
import { Delta, RoleBadge } from "@/components/ui";
import { Term } from "@/components/term";

export const dynamic = "force-dynamic";

export default async function Home() {
  const handles = await store.listHandles();
  const channels = (
    await Promise.all(
      handles.map(async (h) => {
        const snaps = await store.getSnapshots(h);
        if (!snaps.length) return null;
        const latest = snaps[snaps.length - 1];
        const prev = snaps.length > 1 ? snaps[snaps.length - 2] : null;
        return {
          latest,
          summary: summarize(latest),
          g: growth(snaps),
          prevDelta:
            prev && prev.profile.followers != null && latest.profile.followers != null
              ? latest.profile.followers - prev.profile.followers
              : null,
          count: snaps.length,
        };
      }),
    )
  ).filter((c) => c !== null);

  const groups = [
    { title: "내 계정", items: channels.filter((c) => c.latest.role === "own") },
    { title: "경쟁·벤치마크 계정", items: channels.filter((c) => c.latest.role === "competitor") },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">채널</h1>
          <p className="mt-1 text-sm text-muted">Claude in Chrome으로 수집한 스냅샷을 기준으로 분석합니다.</p>
        </div>
        <Link href="/collect" className="btn-primary">+ 채널 수집하기</Link>
      </div>

      {channels.length === 0 && (
        <div className="card mt-6 text-sm text-ink-2">
          아직 데이터가 없습니다. <Link className="text-accent underline" href="/collect">수집하기</Link>에서 Claude in Chrome용 프롬프트를 만들고,
          결과 JSON을 <Link className="text-accent underline" href="/import">가져오기</Link>에 붙여 넣으세요.
        </div>
      )}

      {groups.map((g) =>
        g.items.length ? (
          <section key={g.title} className="mt-8">
            <h2 className="h2 mb-3">{g.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map(({ latest, summary: s, prevDelta, count }) => (
                <Link key={latest.handle} href={`/channels/${latest.handle}`} className="card block hover:border-accent">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{latest.profile.displayName ?? latest.handle}</div>
                      <div className="truncate text-sm text-muted">@{latest.handle}</div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {latest.source === "sample" && <span className="badge">데모</span>}
                      <RoleBadge role={latest.role} />
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted"><Term k="followers" /></dt>
                      <dd className="font-semibold">{fmtNum(s.followers)}</dd>
                      <dd className="text-xs"><Delta value={prevDelta} format={(n) => fmtNum(n)} /></dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted"><Term k="medianEr">참여율(중앙)</Term></dt>
                      <dd className="font-semibold">{fmtPct(s.medianEr)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted"><Term k="postsPerWeek">주간 게시</Term></dt>
                      <dd className="font-semibold">{s.postsPerWeek?.toFixed(1) ?? "–"}회</dd>
                    </div>
                  </dl>
                  <div className="mt-3 text-xs text-muted">최근 수집 {fmtDate(latest.collectedAt)} · 스냅샷 {count}개</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
