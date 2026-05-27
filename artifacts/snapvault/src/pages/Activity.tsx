import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Zap, ScanSearch, Activity as ActivityIcon, Loader2, Clock } from "lucide-react";
import { loadHistory, getAggregateStats, type JobHistoryEntry, type JobStatus } from "@/lib/jobHistory";

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

const STATUS_CONFIG: Record<JobStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  spin?: boolean;
}> = {
  processing: {
    label: "Processing",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  ready_for_review: {
    label: "Ready for Review",
    icon: <Clock className="h-4 w-4" />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
};

function JobStatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function Activity({ isVisible = true }: { isVisible?: boolean }) {
  const [history, setHistory] = useState<JobHistoryEntry[]>([]);

  useEffect(() => {
    if (!isVisible) return;
    setHistory(loadHistory());

    const hasActive = loadHistory().some(j => j.status === "processing" || j.status === "ready_for_review");
    if (!hasActive) return;
    const interval = setInterval(() => setHistory(loadHistory()), 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const stats = getAggregateStats(history);

  const statCards = [
    { label: "Total Cleaned",  value: stats.totalCleaned,   icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Duplicates",     value: stats.totalDuplicates, icon: <XCircle className="h-4 w-4" />,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Jobs Run",       value: stats.jobsRun,         icon: <Zap className="h-4 w-4" />,          color: "text-amber-400",   bg: "bg-amber-400/10" },
    { label: "OCR Scanned",    value: stats.totalOcr,        icon: <ScanSearch className="h-4 w-4" />,   color: "text-blue-500",    bg: "bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Activity</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Your processing history and job logs</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
              {s.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Recent Jobs
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
              <ActivityIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground">Once you process screenshots, your jobs and history will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {history.slice(0, 20).map((job, i, arr) => {
              const cfg = STATUS_CONFIG[job.status ?? "completed"];
              return (
                <div
                  key={job.jobId}
                  className={`flex items-start gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className={`shrink-0 mt-0.5 ${cfg.color}`}>
                    {cfg.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <JobStatusBadge status={job.status ?? "completed"} />
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(job.createdAt)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {job.totalFiles} file{job.totalFiles !== 1 ? "s" : ""}
                      {job.duplicateCount > 0 && ` · ${job.duplicateCount} duplicate${job.duplicateCount !== 1 ? "s" : ""}`}
                      {job.ocrCount > 0 && ` · ${job.ocrCount} OCR`}
                    </div>

                    {/* Category breakdown mini bars */}
                    {Object.keys(job.categoryCounts).length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {Object.entries(job.categoryCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 4)
                          .map(([cat, count]) => (
                            <span
                              key={cat}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                            >
                              {cat.split(" / ")[0]} · {count}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <p className="text-[11px] text-muted-foreground text-center px-4">
          History is saved locally on this device · All processing happens in your browser
        </p>
      )}
    </div>
  );
}
