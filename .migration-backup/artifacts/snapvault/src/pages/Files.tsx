import { useEffect, useState } from "react";
import { FolderOpen, Archive, Copy, FileSearch } from "lucide-react";
import { loadHistory, getAggregateStats, type JobHistoryEntry } from "@/lib/jobHistory";

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

export default function Files({ isVisible = true }: { isVisible?: boolean }) {
  const [history, setHistory] = useState<JobHistoryEntry[]>([]);

  useEffect(() => {
    if (isVisible) setHistory(loadHistory());
  }, [isVisible]);

  const stats = getAggregateStats(history);
  const totalDuplicates = stats.totalDuplicates;
  const totals = stats.totalCategoryCounts;
  const hasAnyData = history.length > 0;

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Your Files</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Organised folders from processed batches</p>
      </div>

      {/* Duplicates row */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
          <Copy className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">Duplicates</div>
          <div className="text-xs text-muted-foreground">
            {`${totalDuplicates} duplicate${totalDuplicates !== 1 ? "s" : ""} found across all batches`}
          </div>
        </div>
        <div className="text-lg font-extrabold text-red-500 tabular-nums">{totalDuplicates}</div>
      </div>

      {/* Category Folders */}
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
                    {`${count} file${count !== 1 ? "s" : ""}`}
                  </div>
                </div>
                {count > 0 && (
                  <div className="text-sm font-bold tabular-nums" style={{ color: f.color }}>{count}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Batches */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Recent Batches
        </div>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No batches yet</p>
              <p className="text-xs text-muted-foreground">Processed batches will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {history.slice(0, 10).map((job, i) => (
              <div
                key={job.jobId}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < Math.min(history.length, 10) - 1 ? "border-b border-border" : ""}`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {job.totalFiles} file{job.totalFiles !== 1 ? "s" : ""}
                    {job.duplicateCount > 0 && (
                      <span className="text-muted-foreground font-normal"> · {job.duplicateCount} dupes</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatRelativeTime(job.createdAt)}</div>
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                  {Object.entries(job.categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([cat]) => {
                      const cfg = CATEGORY_CONFIG.find(c => c.label === cat);
                      return cfg ? (
                        <div
                          key={cat}
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.bg}`}
                        >
                          <FolderOpen className="h-3 w-3" style={{ color: cfg.color }} />
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!hasAnyData && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
            <FileSearch className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No processed files yet</p>
          <p className="text-xs text-muted-foreground">Upload and process screenshots from the Home tab to see organised folders here.</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center px-4">
        All data is stored locally on your device · Nothing is uploaded to any server
      </p>
    </div>
  );
}
