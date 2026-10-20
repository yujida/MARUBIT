import Link from "next/link";
import type { ReactNode } from "react";
import type { Snapshot } from "@/lib/schema";
import { RoleBadge } from "@/components/ui";

const TABS = [
  { key: "feed", label: "피드", href: (h: string) => `/channels/${h}` },
  { key: "stories", label: "스토리", href: (h: string) => `/channels/${h}/stories` },
] as const;

/** 채널 상단 공통 영역: 이름·소개·버튼 + 피드/스토리 탭 */
export function ChannelHeader({
  latest,
  active,
  meta,
}: {
  latest: Snapshot;
  active: (typeof TABS)[number]["key"];
  meta?: ReactNode;
}) {
  const handle = latest.handle;
  return (
    <>
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
      <nav className="mt-5 flex gap-1 border-b border-line" aria-label="채널 보기">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href(handle)}
            aria-current={active === t.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              active === t.key ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {meta && <p className="mt-3 text-xs text-muted">{meta}</p>}
    </>
  );
}
