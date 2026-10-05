import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { store } from "@/lib/storage";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportPage(props: PageProps<"/channels/[handle]/reports/[id]">) {
  const { handle, id } = await props.params;
  const report = await store.getReport(handle, id);
  if (!report) notFound();
  return (
    <div className="max-w-3xl">
      <Link href={`/channels/${handle}`} className="text-sm text-muted hover:text-accent">← @{handle}</Link>
      <p className="mt-1 text-xs text-muted">{fmtDate(report.createdAt, true)} 저장</p>
      <article className="prose-report card mt-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
