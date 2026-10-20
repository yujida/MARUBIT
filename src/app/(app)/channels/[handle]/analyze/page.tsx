import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/lib/storage";
import { analyzePrompt } from "@/lib/prompts";
import { CopyBox } from "@/components/copy-box";
import { Section } from "@/components/ui";
import { ReportForm } from "./report-form";

export const dynamic = "force-dynamic";

export default async function AnalyzePage(props: PageProps<"/channels/[handle]/analyze">) {
  const { handle } = await props.params;
  const sp = await props.searchParams;
  const target = await store.getSnapshots(handle);
  if (!target.length) notFound();
  const role = target[target.length - 1].role;

  // 비교 대상: 기본은 반대 역할 계정 (내 계정 → 경쟁 계정들, 경쟁 계정 → 내 계정)
  const others = (await store.listHandles()).filter((h) => h !== handle);
  const otherSnaps = await Promise.all(others.map(async (h) => ({ h, snaps: await store.getSnapshots(h) })));
  const chosen = sp.peer === undefined
    ? otherSnaps.filter((o) => o.snaps.at(-1)?.role !== role).map((o) => o.h)
    : ([] as string[]).concat(sp.peer).filter((h) => others.includes(h));
  const prompt = analyzePrompt(target, otherSnaps.filter((o) => chosen.includes(o.h)).map((o) => o.snaps));

  return (
    <div className="max-w-3xl">
      <Link href={`/channels/${handle}`} className="text-sm text-muted hover:text-accent">← @{handle}</Link>
      <h1 className="mt-1 text-2xl font-bold">AI 분석 리포트 만들기</h1>
      <p className="mt-1 text-sm text-muted">
        계산된 지표와 상·하위 게시물을 담은 프롬프트입니다. Claude(claude.ai 또는 Claude in Chrome)에 붙여 넣고, 받은 리포트를 아래에 저장하세요.
      </p>

      {others.length > 0 && (
        <form className="card mt-6">
          <div className="text-sm font-medium">비교 계정</div>
          <div className="mt-2 flex flex-wrap gap-3">
            {others.map((h) => (
              <label key={h} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="peer" value={h} defaultChecked={chosen.includes(h)} />@{h}
              </label>
            ))}
          </div>
          <button className="btn mt-3">프롬프트 다시 만들기</button>
        </form>
      )}

      <Section title="1. 분석 프롬프트">
        <CopyBox text={prompt} rows={12} />
      </Section>
      <Section title="2. 리포트 저장">
        <ReportForm handle={handle} />
      </Section>
    </div>
  );
}
