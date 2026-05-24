import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, XCircle, Clock, Zap, ScanSearch,
  Activity as ActivityIcon, Loader2, Files, Copy, Timer,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface JobSummary {
  jobId: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  duplicateCount: number;
  ocrCount: number;
  createdAt: string;
  completedAt: string | null;
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

function formatDuration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null;
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms < 0) return null;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

function jobLabel(status: string): string {
  if (status === "ready") return "Completed";
  if (status === "error") return "Failed";
  if (status === "processing") return "Processing…";
  if (status === "uploading") return "Uploading…";
  if (status === "zipping") return "Zipping…";
  if (status === "awaiting_confirmation") return "Ready for review";
  return status;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready" || status === "awaiting_confirmation") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
        <CheckCircle2 className="h-2.5 w-2.5" /> {jobLabel(status)}
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/12 text-red-500 text-[10px] font-semibold">
        <XCircle className="h-2.5 w-2.5" /> Failed
      </span>
    );
  }
  if (isActive(status)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/12 text-blue-500 text-[10px] font-semibold">
        <Loader2 className="h-2.5 w-2.5 animate-spin" /> {jobLabel(status)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
      <Clock className="h-2.5 w-2.5" /> {jobLabel(status)}
    </span>
  );
}

function JobCard({ job, index, total }: { job: JobSummary; index: number; total: number }) {
  const active = isActive(job.status);
  const progress = job.totalFiles > 0 ? Math.round((job.processedFiles / job.totalFiles) * 100) : 0;
  const duration = formatDuration(job.createdAt, job.completedAt);
  const cleaned = job.totalFiles - job.duplicateCount;

  return (
    <div className={`px-4 py-4 ${index < total - 1 ? "border-b border-border" : ""}`}>
      {/* Top row: status badge + timestamp */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StatusBadge status={job.status} />
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatRelativeTime(job.createdAt)}
        </span>
      </div>

      {/* Stat chips */}
      {!active && job.totalFiles > 0 && (
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-2.5 py-1.5">
            <Files className="h-3 w-3 text-muted-foreground shrink-0" />
            <div>
              <div className="text-xs font-semibold text-foreground leading-none">{job.totalFiles.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Files processed</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-2.5 py-1.5">
            <Copy className="h-3 w-3 text-red-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-foreground leading-none">{job.duplicateCount.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Duplicates</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-2.5 py-1.5">
            <ScanSearch className="h-3 w-3 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-foreground leading-none">{job.ocrCount.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground leading-none mt-0.5">OCR scanned</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-2.5 py-1.5">
            <Timer className="h-3 w-3 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-foreground leading-none">{duration ?? "–"}</div>
              <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Time taken</div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaned summary line */}
      {!active && job.totalFiles > 0 && (
        <div className="text-[10px] text-muted-foreground">
          {cleaned > 0
            ? <><span className="text-foreground font-medium">{cleaned}</span> file{cleaned !== 1 ? "s" : ""} organized</>
            : "No files organized"}
          {job.duplicateCount > 0 && (
            <> · <span className="text-red-400 font-medium">{job.duplicateCount}</span> duplicate{job.duplicateCount !== 1 ? "s" : ""} removed</>
          )}
        </div>
      )}

      {/* Progress bar (active only) */}
      {active && job.totalFiles > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{job.processedFiles} / {job.totalFiles} processed</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {job.status === "error" && job.errorMessage && (
        <div className="mt-1 text-[10px] text-red-400 truncate">{job.errorMessage}</div>
      )}
    </div>
  );
}

export default function Activity() {
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

  useEffect(() => { fetch_(); }, [fetch_]);

  // Poll every 2s while any job is active
  useEffect(() => {
    const hasActive = data?.jobs.some(j => isActive(j.status));
    if (!hasActive) return;
    const id = setInterval(fetch_, 2000);
    return () => clearInterval(id);
  }, [data, fetch_]);

  // Poll every 5s to keep tab fresh
  useEffect(() => {
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, [fetch_]);

  const stats_ = data?.stats ?? { totalCleaned: 0, totalDuplicates: 0, jobsRun: 0, totalOcr: 0 };
  const jobs = data?.jobs ?? [];

  const statCards = [
    { label: "Total Cleaned",  value: stats_.totalCleaned,    icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Duplicates",     value: stats_.totalDuplicates,  icon: <XCircle className="h-4 w-4" />,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Jobs Run",       value: stats_.jobsRun,          icon: <Zap className="h-4 w-4" />,          color: "text-amber-400",   bg: "bg-amber-400/10" },
    { label: "OCR Scanned",    value: stats_.totalOcr,         icon: <ScanSearch className="h-4 w-4" />,   color: "text-blue-500",    bg: "bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Lifetime stats · last {Math.min(jobs.length, 20)} jobs</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Lifetime stat cards */}
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
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Jobs</span>
          {jobs.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{jobs.length} / 20 slots</span>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`px-4 py-4 ${i < 2 ? "border-b border-border" : ""}`}>
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-muted animate-pulse rounded-full w-24" />
                  <div className="h-3 bg-muted animate-pulse rounded w-12" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[0,1,2,3].map(j => (
                    <div key={j} className="h-10 bg-muted animate-pulse rounded-xl" />
                  ))}
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
            {jobs.map((job, i) => (
              <JobCard key={job.jobId} job={job} index={i} total={jobs.length} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
