export const SESSION_COOKIE = "marubit_session";

/** SITE_PASSWORD로부터 세션 토큰을 만든다. 비밀번호가 바뀌면 기존 세션은 무효. */
export async function sessionToken(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`marubit:${password}`));
  return Buffer.from(buf).toString("hex");
}

export const authEnabled = () => Boolean(process.env.SITE_PASSWORD);
