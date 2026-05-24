import { useEffect, useState, useCallback } from "react";
import {
  FolderOpen, Archive, Copy, FileSearch, Download,
  Loader2, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface JobSummary {
  jobId: string;
  status: string;
  totalFiles: number;
  duplicateCount: number;
  createdAt: string;
  zipReady: boolean;
  categoryCounts: Record<string, number>;
}

interface FilesData {
  jobs: JobSummary[];
  stats: {
    totalCleaned: number;
    totalDuplicates: number;
    totalCategoryCounts: Record<string, number>;
  };
}

const CATEGORY_CONFIG: { label: string; color: string; bg: string }[] = [
  { label: "OTP / Security",        color: "#f59e0b", bg: "bg-amber-500/10" },
  { label: "Payments / Receipts",   color: "#10b981", bg: "bg-emerald-500/10" },
  { label: "WhatsApp / Chats",      color: "#22c55e", bg: "bg-green-500/10" },
  { label: "Social Media",          color: "#ec4899", bg: "bg-pink-500/10" },
  { label: "Study / Notes",         color: "#3b82f6", bg: "bg-blue-500/10" },
  { label: "Photos",                color: "#8b5cf6", bg: "bg-violet-500/10" },
  { label: "Memes / Entertainment", color: "#f97316", bg: "bg-orange-500/10" },
  { label: "Documents",             color: "#6366f1", bg: "bg-indigo-500/10" },
  { label: "Unknown / Others",      color: "#94a3b8", bg: "bg-slate-400/10" },
];

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function BatchStatusIcon({ status }: { status: string }) {
  if (status === "ready") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "error") return <AlertCircle className="h-4 w-4 text-red-400" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

export default function Files({ isVisible = true }: { isVisible?: boolean }) {
  const [data, setData] = useState<FilesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/jobs`);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isVisible) fetch_();
  }, [isVisible, fetch_]);

  const handleDownload = async (jobId: string) => {
    setDownloading(jobId);
    try {
      const res = await fetch(`${BASE}/api/jobs/${jobId}/download`);
      if (!res.ok) throw new Error("Not ready");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "snapvault-organized.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    finally { setDownloading(null); }
  };

  const totals = data?.stats.totalCategoryCounts ?? {};
  const totalDuplicates = data?.stats.totalDuplicates ?? 0;
  const completedJobs = (data?.jobs ?? []).filter(j => j.status === "ready" || j.status === "awaiting_confirmation");
  const hasAnyData = Object.keys(totals).length > 0 || totalDuplicates > 0 || completedJobs.length > 0;

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Your Files</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Organised folders from processed batches</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* ── Duplicates row ── */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
          <Copy className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">Duplicates</div>
          <div className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${totalDuplicates} duplicate${totalDuplicates !== 1 ? "s" : ""} found across all batches`}
          </div>
        </div>
        {!loading && (
          <div className="text-lg font-extrabold text-red-500 tabular-nums">{totalDuplicates}</div>
        )}
      </div>

      {/* ── Category Folders ── */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Category Folders
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {CATEGORY_CONFIG.map((f, i) => {
            const count = totals[f.label] ?? 0;
            return (
              <div
                key={f.label}
                className={`flex items-center gap-3 px-4 py-3 ${i < CATEGORY_CONFIG.length - 1 ? "border-b border-border/60" : ""} ${count === 0 ? "opacity-45" : ""}`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                  <FolderOpen className="h-[18px] w-[18px]" style={{ color: f.color }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{f.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {loading ? "–" : `${count} file${count !== 1 ? "s" : ""}`}
                  </div>
                </div>
                {!loading && count > 0 && (
                  <div className="text-sm font-bold tabular-nums" style={{ color: f.color }}>{count}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Batches ── */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Recent Batches
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {[0, 1].map(i => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i === 0 ? "border-b border-border" : ""}`}>
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-muted animate-pulse rounded w-36" />
                  <div className="h-3 bg-muted animate-pulse rounded w-20" />
                </div>
                <div className="w-20 h-8 bg-muted animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No batches yet</p>
              <p className="text-xs text-muted-foreground">Processed batches will appear here for re-download.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {completedJobs.map((job, i) => (
              <div
                key={job.jobId}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < completedJobs.length - 1 ? "border-b border-border" : ""}`}
              >
                <BatchStatusIcon status={job.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {job.totalFiles} file{job.totalFiles !== 1 ? "s" : ""}
                    {job.duplicateCount > 0 && (
                      <span className="text-muted-foreground font-normal"> · {job.duplicateCount} dupes</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatRelativeTime(job.createdAt)}</div>
                </div>
                {job.zipReady && (
                  <button
                    onClick={() => handleDownload(job.jobId)}
                    disabled={downloading === job.jobId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 shrink-0"
                  >
                    {downloading === job.jobId
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Download className="h-3.5 w-3.5" />
                    }
                    ZIP
                  </button>
                )}
                {!job.zipReady && job.status === "awaiting_confirmation" && (
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-xl shrink-0">Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {!loading && !hasAnyData && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
            <FileSearch className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No processed files yet</p>
          <p className="text-xs text-muted-foreground">Upload and process screenshots from the Home tab to see organised folders here.</p>
        </div>
      )}
    </div>
  );
}
