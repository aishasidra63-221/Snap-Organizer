import { CheckCircle2, XCircle, Clock, Zap, ScanSearch, Activity as ActivityIcon } from "lucide-react";

const stats = [
  { label: "Total Cleaned",  value: "0",  icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Duplicates",     value: "0",  icon: <XCircle className="h-4 w-4" />,      color: "text-red-400",     bg: "bg-red-400/10" },
  { label: "Jobs Run",       value: "0",  icon: <Zap className="h-4 w-4" />,          color: "text-amber-400",   bg: "bg-amber-400/10" },
  { label: "OCR Scanned",    value: "0",  icon: <ScanSearch className="h-4 w-4" />,   color: "text-blue-500",    bg: "bg-blue-500/10" },
];

export default function Activity() {
  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Activity</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Your processing history and job logs</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Recent Jobs</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {[
            { status: "completed", label: "Batch processed", time: "–", count: "–", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
            { status: "failed",    label: "Processing failed", time: "–", count: "–", icon: <XCircle className="h-4 w-4 text-red-400" /> },
            { status: "pending",   label: "Awaiting upload",  time: "–", count: "–", icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
          ].map((job, i, arr) => (
            <div
              key={job.status}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""} opacity-40`}
            >
              <span className="shrink-0">{job.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{job.label}</div>
                <div className="text-xs text-muted-foreground">{job.time} · {job.count} files</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
          <ActivityIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground">Once you process screenshots, your jobs and history will appear here.</p>
      </div>
    </div>
  );
}
