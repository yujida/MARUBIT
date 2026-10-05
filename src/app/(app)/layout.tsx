import Link from "next/link";
import { storageKind } from "@/lib/storage";

const NAV = [
  { href: "/", label: "채널" },
  { href: "/compare", label: "비교" },
  { href: "/collect", label: "수집하기" },
  { href: "/import", label: "가져오기" },
];

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
          <Link href="/" className="mr-4 font-bold tracking-tight">MARUBIT</Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-sm text-ink-2 hover:bg-page hover:text-ink">
              {n.label}
            </Link>
          ))}
          <span className="ml-auto hidden text-xs text-muted sm:inline">저장소: {storageKind === "postgres" ? "DB" : "로컬 파일"}</span>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
