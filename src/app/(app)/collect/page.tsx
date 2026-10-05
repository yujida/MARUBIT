import { collectPrompt, DEFAULT_POST_COUNT } from "@/lib/prompts";
import { siteUrl } from "@/lib/site-url";
import { CopyBox } from "@/components/copy-box";

export default async function CollectPage(props: PageProps<"/collect">) {
  const sp = await props.searchParams;
  const handle = String(sp.handle ?? "").trim().replace(/^@/, "").toLowerCase();
  const role = sp.role === "own" ? "own" : "competitor";
  const postCount = Math.min(40, Math.max(5, Number(sp.n) || DEFAULT_POST_COUNT));
  const valid = /^[a-z0-9._]{1,30}$/.test(handle);
  const prompt = valid ? collectPrompt({ handle, role, postCount, siteUrl: await siteUrl() }) : null;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">채널 수집하기</h1>
      <p className="mt-1 text-sm text-muted">
        분석 1회 = 계정 1개. 주 2회 수집하면 팔로워 추이와 게시물 반응 변화가 쌓입니다.
      </p>

      <form className="card mt-6 grid gap-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <label className="block">
          <span className="text-sm font-medium">인스타 계정</span>
          <input name="handle" defaultValue={handle} placeholder="@계정이름" required className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">구분</span>
          <select name="role" defaultValue={role} className="input mt-1">
            <option value="own">내 계정 (인사이트 포함)</option>
            <option value="competitor">경쟁·벤치마크</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">게시물 수</span>
          <input name="n" type="number" min={5} max={40} defaultValue={postCount} className="input mt-1 block w-24" />
        </label>
        <button className="btn-primary">프롬프트 만들기</button>
      </form>

      {handle && !valid && <p className="mt-3 text-sm text-bad">계정 이름 형식이 올바르지 않습니다 (영문 소문자, 숫자, 마침표, 밑줄).</p>}

      {prompt && (
        <div className="mt-6 space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
            <li>Chrome에서 인스타그램에 로그인되어 있는지 확인합니다.</li>
            <li>아래 프롬프트를 복사해 <b>Claude in Chrome</b> 사이드패널에 붙여 넣습니다.</li>
            <li>Claude가 계정을 둘러보고, 마지막에 이 사이트의 <b>가져오기</b> 화면에 결과를 저장합니다. (계정당 5~10분)</li>
            <li>저장되면 채널 화면에서 결과를 확인하고, <b>AI 분석 리포트</b>를 만듭니다.</li>
          </ol>
          <CopyBox text={prompt} />
        </div>
      )}
    </div>
  );
}
