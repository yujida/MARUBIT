import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/lib/storage";
import { growth, summarize, TYPE_LABEL } from "@/lib/metrics";
import { fmtDate, fmtNum, fmtPct, fmtSignedPct } from "@/lib/format";
import { Delta, Kpi, RoleBadge, Section } from "@/components/ui";
import { FollowerChart } from "@/components/charts";
import { BarList } from "@/components/bar-list";
import { Heatmap } from "@/components/heatmap";
import { PostsTable } from "@/components/posts-table";
import { Term } from "@/components/term";

export const dynamic = "force-dynamic";

export default async function ChannelPage(props: PageProps<"/channels/[handle]">) {
  const { handle } = await props.params;
  const snaps = await store.getSnapshots(handle);
  if (!snaps.length) notFound();
  const latest = snaps[snaps.length - 1];
  const s = summarize(latest);
  const g = growth(snaps);
  const reports = await store.listReports(handle);
  const own = latest.role === "own";
  const ai = latest.accountInsights;

  const topTags = s.hashtags.filter((h) => h.count >= 2).slice(0, 12);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{latest.profile.displayName ?? handle}</h1>
            <RoleBadge role={latest.role} />
            {latest.source === "sample" && <span className="badge">데모</span>}
          </div>
          <a href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-accent">
            @{handle} ↗
          </a>
          {latest.profile.bio && <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-ink-2">{latest.profile.bio}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/collect?handle=${handle}&role=${latest.role}`} className="btn">다시 수집</Link>
          <Link href={`/channels/${handle}/analyze`} className="btn-primary">AI 분석 리포트</Link>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        최근 수집 {fmtDate(latest.collectedAt, true)} · 분석 게시물 {s.postsAnalyzed}개 · 스냅샷 {snaps.length}개
        {s.likesHiddenCount > 0 && ` · 좋아요 숨김 ${s.likesHiddenCount}개는 참여율 계산 제외`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label={<Term k="followers" />} value={fmtNum(s.followers)} sub={<><Term k="followerDelta">누적</Term> <Delta value={g.followerDelta} format={fmtNum} /> · <Term k="weeklyGrowth">주간</Term> {fmtSignedPct(g.weeklyGrowthRate)}</>} />
        <Kpi label={<Term k="medianEr" />} value={fmtPct(s.medianEr)} sub={<><Term k="meanEr">평균</Term> {fmtPct(s.meanEr)}</>} />
        <Kpi label={<Term k="viewRate">릴스 조회율 (중앙값)</Term>} value={s.medianViewRate != null ? `${(s.medianViewRate * 100).toFixed(0)}%` : "–"} sub={<><Term k="reelViews">릴스 중앙 조회</Term> {fmtNum(s.medianReelViews)}</>} />
        <Kpi label={<Term k="postsPerWeek" />} value={`${s.postsPerWeek?.toFixed(1) ?? "–"}회/주`} sub={<><Term k="commentLike">댓글/좋아요</Term> {fmtPct(s.commentToLikeRatio, 1)}</>} />
      </div>

      {own && (ai || s.medianErReach != null) && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label={<Term k="erReach">도달 기준 참여율 (중앙)</Term>} value={fmtPct(s.medianErReach)} />
          {ai && <Kpi label={<Term k="accountsReached">도달 계정 ({ai.periodDays}일)</Term>} value={fmtNum(ai.accountsReached)} sub={ai.nonFollowerReachPct != null ? <><Term k="nonFollowerReach">비팔로워</Term> {ai.nonFollowerReachPct}%</> : undefined} />}
          {ai && <Kpi label={<Term k="accountsEngaged">참여 계정 ({ai.periodDays}일)</Term>} value={fmtNum(ai.accountsEngaged)} />}
          {ai && <Kpi label={<Term k="profileVisits">프로필 방문 ({ai.periodDays}일)</Term>} value={fmtNum(ai.profileVisits)} sub={ai.followerChange != null ? `팔로워 ${ai.followerChange >= 0 ? "+" : ""}${fmtNum(ai.followerChange)}` : undefined} />}
        </div>
      )}

      <Section title="팔로워 추이" desc={<>수집할 때마다 <Term k="snapshot">스냅샷</Term>이 한 점씩 쌓입니다 (주 2회 권장)</>}>
        <div className="card">
          {g.points.length > 1 ? <FollowerChart points={g.points} /> : <p className="text-sm text-muted">스냅샷이 2개 이상 쌓이면 추이가 표시됩니다.</p>}
        </div>
      </Section>

      <div className="grid gap-x-6 lg:grid-cols-2">
        <Section title={<><Term k="format">포맷</Term>별 성과</>} desc={<><Term k="format">포맷</Term>별 <Term k="medianEr">중앙 참여율</Term> (<Term k="n">n</Term> = 게시물 수)</>}>
          <div className="card">
            <BarList rows={s.byType.map((t) => ({ label: TYPE_LABEL[t.key as keyof typeof TYPE_LABEL], value: t.medianEr, note: `n=${t.count}` }))} format={(n) => fmtPct(n)} />
          </div>
        </Section>
        <Section title={<><Term k="category">카테고리</Term>별 성과</>} desc={<>교육 · 대중문화 · 춤 등 · <Term k="medianEr">중앙 참여율</Term></>}>
          <div className="card">
            <BarList rows={s.byCategory.map((t) => ({ label: t.key, value: t.medianEr, note: `n=${t.count}` }))} format={(n) => fmtPct(n)} />
          </div>
        </Section>
      </div>

      <div className="grid gap-x-6 lg:grid-cols-2">
        <Section title={<Term k="heatmap" />} desc="언제 올렸고, 그때 반응이 어땠는지">
          <div className="card">
            <Heatmap cells={s.heatmap} />
          </div>
        </Section>
        <Section title={<><Term k="captionLength">캡션 길이</Term>별 성과</>} desc={<><Term k="medianEr">중앙 참여율</Term> 기준</>}>
          <div className="card">
            <BarList rows={s.byCaptionLength.map((t) => ({ label: t.key, value: t.medianEr, note: `n=${t.count}` }))} format={(n) => fmtPct(n)} />
            <p className="mt-3 text-xs text-muted">상관관계일 뿐 인과가 아닙니다. 게시물 수가 적은 구간은 참고만 하세요.</p>
          </div>
        </Section>
      </div>

      <Section title={<Term k="hashtag">해시태그</Term>} desc="2회 이상 쓴 태그, 사용 횟수 순">
        <div className="card overflow-x-auto p-0">
          {topTags.length ? (
            <table className="table">
              <thead>
                <tr><th>태그</th><th className="text-right">사용</th><th className="text-right"><Term k="medianEr">중앙 참여율</Term></th><th className="text-right"><Term k="interactions">중앙 반응수</Term></th></tr>
              </thead>
              <tbody>
                {topTags.map((t) => (
                  <tr key={t.tag}>
                    <td>#{t.tag}</td>
                    <td className="num text-right">{t.count}</td>
                    <td className="num text-right">{fmtPct(t.medianEr)}</td>
                    <td className="num text-right">{fmtNum(t.medianInteractions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-sm text-muted">반복 사용한 해시태그가 없습니다.</p>
          )}
        </div>
      </Section>

      <Section title="게시물" desc={<><Term k="vsMedian">중앙 대비</Term> 2배 이상은 초록, 절반 미만은 빨강</>}>
        <PostsTable rows={s.rows} own={own} />
      </Section>

      <Section title="AI 분석 리포트" action={<Link href={`/channels/${handle}/analyze`} className="btn">새 리포트</Link>}>
        {reports.length ? (
          <ul className="card divide-y divide-line p-0">
            {reports.map((r) => (
              <li key={r.id}>
                <Link href={`/channels/${handle}/reports/${r.id}`} className="flex justify-between gap-4 px-4 py-3 hover:bg-page">
                  <span>{r.title}</span>
                  <span className="text-sm text-muted">{fmtDate(r.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">아직 리포트가 없습니다.</p>
        )}
      </Section>
    </div>
  );
}
