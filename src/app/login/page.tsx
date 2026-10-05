import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const password = process.env.SITE_PASSWORD;
  const next = String(formData.get("next") || "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!password) redirect(safeNext);
  if (formData.get("password") !== password) redirect(`/login?error=1&next=${encodeURIComponent(safeNext)}`);
  (await cookies()).set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(safeNext);
}

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  return (
    <div className="mx-auto mt-24 w-full max-w-sm px-4">
      <h1 className="text-2xl font-bold">MARUBIT</h1>
      <p className="mt-1 text-sm text-muted">인스타그램 채널 분석</p>
      <form action={login} className="card mt-6 space-y-3">
        <input type="hidden" name="next" value={String(sp.next ?? "/")} />
        <label className="block text-sm font-medium" htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoFocus required className="input" />
        {sp.error && <p className="text-sm text-red-500">비밀번호가 틀렸습니다.</p>}
        <button className="btn-primary w-full">들어가기</button>
      </form>
    </div>
  );
}
