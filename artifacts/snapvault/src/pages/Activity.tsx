import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, Zap, ScanSearch, Activity as ActivityIcon, Loader2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface JobSummary {
  jobId: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  duplicateCount: number;
  ocrCount: number;
  createdAt: string;
  errorMessage: string | null;
}

interface ActivityData {
  jobs: JobSummary[];
  stats: {
    totalCleaned: number;
    totalDuplicates: number;
    jobsRun: number;
    totalOcr: number;
  };
}

function isActive(status: string) {
  return status === "processing" || status === "uploading" || status === "zipping";
}

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

function JobStatusIcon({ status }: { status: string }) {
  if (status === "ready") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-red-400" />;
  if (isActive(status)) return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
  if (status === "awaiting_confirmation") return <Clock className="h-4 w-4 text-amber-400" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

function jobLabel(status: string): string {
  if (status === "ready") return "Completed";
  if (status === "error") return "Failed";
  if (status === "processing") return "Processing…";
  if (status === "uploading") return "Uploading…";
  if (status === "zipping") return "Zipping…";
  if (status === "awaiting_confirmation") return "Awaiting review";
  return status;
}

export default function Activity({ isVisible = true }: { isVisible?: boolean }) {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/jobs`);
      if (res.ok) {
        const json: ActivityData = await res.json();
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once when tab becomes visible
  useEffect(() => {
    if (isVisible) fetch_();
  }, [isVisible, fetch_]);

  // Poll every 2s while any job is active and tab is visible
  useEffect(() => {
    if (!isVisible) return;
    const hasActive = data?.jobs.some(j => isActive(j.status));
    if (!hasActive) return;
    const id = setInterval(fetch_, 2000);
    return () => clearInterval(id);
  }, [data, fetch_, isVisible]);

  // Refresh every 10s when tab is visible (relaxed from 5s since tab stays mounted)
  useEffect(() => {
    if (!isVisible) return;
    const id = setInterval(fetch_, 10000);
    return () => clearInterval(id);
  }, [isVisible, fetch_]);

  const stats_ = data?.stats ?? { totalCleaned: 0, totalDuplicates: 0, jobsRun: 0, totalOcr: 0 };
  const jobs = data?.jobs ?? [];

  const statCards = [
    { label: "Total Cleaned",  value: stats_.totalCleaned,   icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Duplicates",     value: stats_.totalDuplicates, icon: <XCircle className="h-4 w-4" />,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Jobs Run",       value: stats_.jobsRun,         icon: <Zap className="h-4 w-4" />,          color: "text-amber-400",   bg: "bg-amber-400/10" },
    { label: "OCR Scanned",    value: stats_.totalOcr,        icon: <ScanSearch className="h-4 w-4" />,   color: "text-blue-500",    bg: "bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your processing history and job logs</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {loading && s.value === 0 ? (
                <span className="inline-block w-8 h-7 rounded bg-muted animate-pulse" />
              ) : (
                s.value.toLocaleString()
              )}
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

        {loading ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < 2 ? "border-b border-border" : ""}`}>
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-muted animate-pulse rounded w-32" />
                  <div className="h-3 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
              <ActivityIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground">Once you process screenshots, your jobs and history will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {jobs.slice(0, 20).map((job, i, arr) => {
              const active = isActive(job.status);
              const progress = job.totalFiles > 0
                ? Math.round((job.processedFiles / job.totalFiles) * 100)
                : 0;

              return (
                <div
                  key={job.jobId}
                  className={`flex items-start gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="shrink-0 mt-0.5">
                    <JobStatusIcon status={job.status} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-foreground truncate">
                        {jobLabel(job.status)}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(job.createdAt)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {job.totalFiles > 0
                        ? `${job.totalFiles} file${job.totalFiles !== 1 ? "s" : ""}${job.duplicateCount > 0 ? ` · ${job.duplicateCount} duplicate${job.duplicateCount !== 1 ? "s" : ""}` : ""}`
                        : "–"}
                    </div>
                    {active && job.totalFiles > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{job.processedFiles} / {job.totalFiles} processed</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {job.status === "error" && job.errorMessage && (
                      <div className="text-xs text-red-400 mt-0.5 truncate">{job.errorMessage}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
