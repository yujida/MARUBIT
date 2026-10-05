import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { snapshotSchema, type Snapshot } from "./schema";

export interface Report {
  id: string;
  handle: string;
  createdAt: string;
  title: string;
  markdown: string;
}

interface Store {
  listHandles(): Promise<string[]>;
  getSnapshots(handle: string): Promise<Snapshot[]>;
  saveSnapshot(s: Snapshot): Promise<void>;
  deleteSnapshot(handle: string, collectedAt: string): Promise<void>;
  listReports(handle: string): Promise<Report[]>;
  getReport(handle: string, id: string): Promise<Report | null>;
  saveReport(r: Omit<Report, "id">): Promise<Report>;
}

const reportId = (createdAt: string) => createdAt.replace(/[^0-9]/g, "").slice(0, 14);

/* ---------------- 파일 저장소 (로컬 개발 / DATABASE_URL 없을 때) ---------------- */

const DATA_DIR = path.join(process.cwd(), "data");

const fileStore: Store = {
  async listHandles() {
    try {
      return (await fs.readdir(path.join(DATA_DIR, "channels"))).sort();
    } catch {
      return [];
    }
  },
  async getSnapshots(handle) {
    const dir = path.join(DATA_DIR, "channels", handle);
    let files: string[] = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
    const snaps = await Promise.all(
      files.map(async (f) => snapshotSchema.parse(JSON.parse(await fs.readFile(path.join(dir, f), "utf8")))),
    );
    return snaps.sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt));
  },
  async saveSnapshot(s) {
    const dir = path.join(DATA_DIR, "channels", s.handle);
    await fs.mkdir(dir, { recursive: true });
    // 같은 날 두 번 수집하면 덮어쓴다.
    await fs.writeFile(path.join(dir, `${s.collectedAt.slice(0, 10)}.json`), JSON.stringify(s, null, 2) + "\n");
  },
  async deleteSnapshot(handle, collectedAt) {
    await fs.rm(path.join(DATA_DIR, "channels", handle, `${collectedAt.slice(0, 10)}.json`), { force: true });
  },
  async listReports(handle) {
    const dir = path.join(DATA_DIR, "reports", handle);
    let files: string[] = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
    const reports = await Promise.all(
      files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as Report),
    );
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getReport(handle, id) {
    try {
      return JSON.parse(await fs.readFile(path.join(DATA_DIR, "reports", handle, `${id}.json`), "utf8"));
    } catch {
      return null;
    }
  },
  async saveReport(r) {
    const report = { ...r, id: reportId(r.createdAt) };
    const dir = path.join(DATA_DIR, "reports", r.handle);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${report.id}.json`), JSON.stringify(report, null, 2) + "\n");
    return report;
  },
};

/* ---------------- Postgres 저장소 (배포: Neon) ---------------- */

function pgStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= Promise.all([
      sql`CREATE TABLE IF NOT EXISTS snapshots (
            handle text NOT NULL,
            collected_at timestamptz NOT NULL,
            data jsonb NOT NULL,
            PRIMARY KEY (handle, collected_at))`,
      sql`CREATE TABLE IF NOT EXISTS reports (
            handle text NOT NULL,
            id text NOT NULL,
            created_at timestamptz NOT NULL,
            title text NOT NULL,
            markdown text NOT NULL,
            PRIMARY KEY (handle, id))`,
    ]));

  return {
    async listHandles() {
      await init();
      const rows = await sql`SELECT DISTINCT handle FROM snapshots ORDER BY handle`;
      return rows.map((r) => r.handle as string);
    },
    async getSnapshots(handle) {
      await init();
      const rows = await sql`SELECT data FROM snapshots WHERE handle = ${handle} ORDER BY collected_at`;
      return rows.map((r) => snapshotSchema.parse(r.data));
    },
    async saveSnapshot(s) {
      await init();
      // 같은 날(KST 무관, ISO 날짜 기준) 재수집은 덮어쓰기
      await sql`DELETE FROM snapshots WHERE handle = ${s.handle}
                AND collected_at::date = ${s.collectedAt}::timestamptz::date`;
      await sql`INSERT INTO snapshots (handle, collected_at, data)
                VALUES (${s.handle}, ${s.collectedAt}, ${JSON.stringify(s)}::jsonb)`;
    },
    async deleteSnapshot(handle, collectedAt) {
      await init();
      await sql`DELETE FROM snapshots WHERE handle = ${handle} AND collected_at = ${collectedAt}`;
    },
    async listReports(handle) {
      await init();
      const rows = await sql`SELECT id, handle, created_at, title, markdown FROM reports
                             WHERE handle = ${handle} ORDER BY created_at DESC`;
      return rows.map(toReport);
    },
    async getReport(handle, id) {
      await init();
      const rows = await sql`SELECT id, handle, created_at, title, markdown FROM reports
                             WHERE handle = ${handle} AND id = ${id}`;
      return rows[0] ? toReport(rows[0]) : null;
    },
    async saveReport(r) {
      await init();
      const id = reportId(r.createdAt);
      await sql`INSERT INTO reports (handle, id, created_at, title, markdown)
                VALUES (${r.handle}, ${id}, ${r.createdAt}, ${r.title}, ${r.markdown})
                ON CONFLICT (handle, id) DO UPDATE SET title = EXCLUDED.title, markdown = EXCLUDED.markdown`;
      return { ...r, id };
    },
  };
}

function toReport(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    handle: r.handle as string,
    createdAt: new Date(r.created_at as string).toISOString(),
    title: r.title as string,
    markdown: r.markdown as string,
  };
}

export const store: Store = process.env.DATABASE_URL ? pgStore(process.env.DATABASE_URL) : fileStore;
export const storageKind = process.env.DATABASE_URL ? "postgres" : "file";

export async function latestSnapshots(): Promise<Snapshot[]> {
  const handles = await store.listHandles();
  const all = await Promise.all(handles.map((h) => store.getSnapshots(h)));
  return all.filter((s) => s.length).map((s) => s[s.length - 1]);
}
