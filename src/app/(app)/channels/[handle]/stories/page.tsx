import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/lib/storage";
import { STICKER_LABEL, summarizeStories } from "@/lib/stories";
import { fmtDate, fmtNum, fmtPct } from "@/lib/format";
import { Kpi, Section } from "@/components/ui";
import { BarList } from "@/components/bar-list";
import { Term } from "@/components/term";
import { ChannelHeader } from "../channel-header";

export const dynamic = "force-dynamic";

const LIST_LIMIT = 30;
const pct0 = (x: number | null) => (x == null ? "–" : `${Math.round(x * 100)}%`);

export default async function StoriesPage(props: PageProps<"/channels/[handle]/stories">) {
  const { handle } = await props.params;
  const showAll = (await props.searchParams).all === "1";
  const snaps = await store.getSnapshots(handle);
  if (!snaps.length) notFound();
  const latest = snaps[snaps.length - 1];
  const own = latest.role === "own";
  const st = summarizeStories(snaps);
  const shownRows = showAll ? st.rows : st.rows.slice(0, LIST_LIMIT);

  const meta = st.collected ? (
    <>
      스토리 확인한 수집 {st.snapshotsChecked}회 · 프레임 {st.frames}장
      {st.firstSeen && ` · ${fmtDate(st.firstSeen)} ~ ${fmtDate(st.lastSeen)}`}
    </>
  ) : undefined;

  return (
    <div>
      <ChannelHeader latest={latest} active="stories" meta={meta} />

      <div className="card mt-4 text-sm text-ink-2">
        {own ? (
          <>
            <b className="text-ink">내 계정 스토리</b>는 수집할 때 Meta Business Suite 인사이트와 스토리 보관함에서 지난 스토리까지 읽어 옵니다.
            수집할 때마다 새 스토리가 더해지고, 이미 있던 스토리는 최신 수치로 바뀝니다.
          </>
        ) : (
          <>
            <b className="text-ink">경쟁 계정 스토리</b>는 24시간 뒤 사라지기 때문에 <b>수집하는 순간 올라와 있던 것만</b> 기록됩니다.
            스토리를 열어 보면 상대방의 <b>조회자 목록에 내 계정이 표시</b>되므로, 수집 화면에서 따로 켠 경우에만 수집합니다.
            하이라이트 제목은 프로필에서 바로 읽습니다.
          </>
        )}
      </div>

      {!st.collected ? (
        <div className="card mt-6 text-sm">
          <p className="font-medium">아직 수집된 스토리 정보가 없습니다.</p>
          <p className="mt-1 text-ink-2">
            수집 프롬프트에 스토리 단계가 추가됐습니다. 다시 수집하면 이 화면이 채워집니다.
          </p>
          <Link href={`/collect?handle=${handle}&role=${latest.role}${own ? "" : "&stories=1"}`} className="btn-primary mt-3">
            스토리 포함해서 다시 수집
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label={<Term k="storyFrame">수집한 스토리</Term>} value={`${st.frames}장`} sub={<><Term k="storyDays">올린 날</Term> {st.storyDays}일</>} />
            <Kpi label={<Term k="framesPerDay">하루 프레임 수</Term>} value={st.medianFramesPerDay != null ? `${st.medianFramesPerDay}장` : "–"} sub="중앙값" />
            {st.hasInsights ? (
              <>
                <Kpi label={<Term k="storyReachRate">스토리 도달률 (중앙)</Term>} value={fmtPct(st.medianReachRate, 1)} sub={<>도달 중앙값 {fmtNum(st.medianReach)}</>} />
                <Kpi label={<Term k="storyCompletion">완주율 (중앙)</Term>} value={pct0(st.medianCompletion)} sub={<><Term k="storyVsFeed">스토리÷피드 도달</Term> {st.storyVsFeed != null ? `${st.storyVsFeed.toFixed(2)}배` : "–"}</>} />
              </>
            ) : (
              <>
                <Kpi label={<Term k="sticker">스티커 사용</Term>} value={pct0(st.stickerShare)} sub={<>링크 포함 {pct0(st.linkShare)}</>} />
                <Kpi label={<Term k="reshare">공유 스토리</Term>} value={pct0(st.reshareShare)} sub={<>사진 {pct0(st.imageShare)} · 영상 {pct0(st.imageShare == null ? null : 1 - st.imageShare)}</>} />
              </>
            )}
          </div>

          {st.hasInsights && (
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi label={<Term k="storyReplyRate">답장률 (중앙)</Term>} value={fmtPct(st.medianReplyRate)} />
              <Kpi label={<Term k="storyExitRate">이탈률 (중앙)</Term>} value={fmtPct(st.medianExitRate, 1)} sub={<><Term k="storyForwardRate">넘기기</Term> {fmtPct(st.medianForwardRate, 1)}</>} />
              <Kpi label={<Term k="storyLinkClickRate">링크 클릭률 (중앙)</Term>} value={fmtPct(st.medianLinkClickRate)} />
              <Kpi label={<Term k="storyStickerTapRate">스티커 반응률 (중앙)</Term>} value={fmtPct(st.medianStickerTapRate)} sub={<>스티커 사용 {pct0(st.stickerShare)} · <Term k="reshare">공유</Term> {pct0(st.reshareShare)}</>} />
            </div>
          )}

          <div className="grid gap-x-6 lg:grid-cols-2">
            {st.hasInsights && st.positionCurve.length > 1 && (
              <Section title={<Term k="storyPosition">프레임 순서별 도달</Term>} desc="첫 장의 도달을 100%로 놓고 뒤로 갈수록 얼마나 남는지 (중앙값)">
                <div className="card">
                  <BarList
                    rows={st.positionCurve.map((p) => ({ label: p.label, value: p.medianRetention, note: `${p.days}일` }))}
                    format={(n) => `${Math.round(n * 100)}%`}
                    max={1}
                  />
                </div>
              </Section>
            )}

            <Section
              title={<><Term k="sticker">스티커</Term>별 {st.hasInsights ? "성과" : "사용"}</>}
              desc={st.hasInsights ? <>스티커 종류별 <Term k="storyReachRate">도달률</Term>과 <Term k="storyReplyRate">답장률</Term> (중앙값)</> : "어떤 스티커를 자주 쓰는지 (프레임 수)"}
            >
              <div className="card overflow-x-auto p-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th>스티커</th>
                      <th className="text-right"><Term k="n">프레임</Term></th>
                      {st.hasInsights && <th className="text-right">도달률</th>}
                      {st.hasInsights && <th className="text-right">답장률</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {st.bySticker.map((g) => (
                      <tr key={g.key}>
                        <td>{STICKER_LABEL[g.key as keyof typeof STICKER_LABEL] ?? g.key}</td>
                        <td className="num text-right">{g.count}</td>
                        {st.hasInsights && <td className="num text-right">{fmtPct(g.medianReachRate, 1)}</td>}
                        {st.hasInsights && <td className="num text-right">{fmtPct(g.medianReplyRate)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title={<><Term k="category">카테고리</Term>별 스토리</>} desc={st.hasInsights ? "카테고리별 프레임 수와 도달률 중앙값" : "카테고리별 프레임 수"}>
              <div className="card">
                <BarList
                  rows={st.byCategory.map((g) =>
                    st.hasInsights
                      ? { label: g.key, value: g.medianReachRate, note: `n=${g.count}` }
                      : { label: g.key, value: g.count },
                  )}
                  format={(n) => (st.hasInsights ? fmtPct(n, 1) : `${n}장`)}
                />
              </div>
            </Section>
          </div>

          <Section
            title="스토리 목록"
            desc={`최신순 · 같은 날 올린 순서를 '순서'로 표시${showAll || st.rows.length <= LIST_LIMIT ? "" : ` · 최근 ${LIST_LIMIT}장`}`}
            action={
              st.rows.length > LIST_LIMIT ? (
                <Link href={showAll ? `/channels/${handle}/stories` : `/channels/${handle}/stories?all=1`} className="btn" scroll={false}>
                  {showAll ? `최근 ${LIST_LIMIT}장만 보기` : `전체 ${st.rows.length}장 보기`}
                </Link>
              ) : undefined
            }
          >
            <div className="card overflow-x-auto p-0">
              <table className="table min-w-[48rem]">
                <thead>
                  <tr>
                    <th>게시 시각</th>
                    <th className="text-right"><Term k="storyPosition" iconOnly>순서</Term></th>
                    <th>내용</th>
                    {st.hasInsights && (
                      <>
                        <th className="text-right">도달</th>
                        <th className="text-right"><Term k="storyReplyRate" iconOnly>답장</Term></th>
                        <th className="text-right"><Term k="storyExitRate" iconOnly>이탈률</Term></th>
                        <th className="text-right"><Term k="storyForwardRate" iconOnly>넘기기</Term></th>
                        <th className="text-right"><Term k="storyLinkClickRate" iconOnly>링크 클릭</Term></th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {shownRows.map((r, i) => {
                    const ins = r.story.insights;
                    return (
                      <tr key={r.story.id ?? `${r.story.postedAt}-${i}`}>
                        <td className="num whitespace-nowrap">{fmtDate(r.story.postedAt, true)}</td>
                        <td className="num text-right">{r.position ?? "–"}</td>
                        <td className="max-w-sm">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="badge">{r.story.type === "video" ? "영상" : "사진"}</span>
                            <span className="badge">{r.category}</span>
                            {r.story.isReshare && <span className="badge">공유</span>}
                            {r.story.stickers.map((k) => (
                              <span key={k} className="badge">{STICKER_LABEL[k]}</span>
                            ))}
                          </div>
                          {(r.story.topic || r.story.text) && (
                            <p className="mt-1 line-clamp-2 text-ink-2">{r.story.topic ?? r.story.text}</p>
                          )}
                        </td>
                        {st.hasInsights && (
                          <>
                            <td className="num text-right">{fmtNum(ins?.reach)}</td>
                            <td className="num text-right">{fmtNum(ins?.replies)}</td>
                            <td className="num text-right">{fmtPct(r.exitRate, 1)}</td>
                            <td className="num text-right">{fmtPct(r.forwardRate, 1)}</td>
                            <td className="num text-right">{r.linkClickRate != null ? `${fmtNum(ins?.linkClicks)} (${fmtPct(r.linkClickRate, 1)})` : "–"}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {st.rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-muted">수집 시점에 올라와 있던 스토리가 없었습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      <Section title={<Term k="highlight">하이라이트</Term>} desc="프로필에 고정된 스토리 묶음 (가장 최근 수집 기준)">
        {st.highlights?.length ? (
          <div className="card overflow-x-auto p-0">
            <table className="table">
              <thead>
                <tr><th>제목</th><th className="text-right">스토리 수</th></tr>
              </thead>
              <tbody>
                {st.highlights.map((h, i) => (
                  <tr key={`${h.title}-${i}`}>
                    <td>{h.title}</td>
                    <td className="num text-right">{h.itemCount ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {st.highlights ? "하이라이트가 없습니다." : `수집된 하이라이트 정보가 없습니다. (프로필 하이라이트 개수: ${latest.profile.highlights ?? "–"})`}
          </p>
        )}
      </Section>
    </div>
  );
}
