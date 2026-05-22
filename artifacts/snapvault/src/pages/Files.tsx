import {
  FolderOpen, Archive, Copy, Image, FileSearch,
  ChevronRight, Download,
} from "lucide-react";

const folders = [
  { label: "OTP / Security",        count: 0, color: "#f59e0b", bg: "bg-amber-500/10" },
  { label: "Payments / Receipts",   count: 0, color: "#10b981", bg: "bg-emerald-500/10" },
  { label: "WhatsApp / Chats",      count: 0, color: "#22c55e", bg: "bg-green-500/10" },
  { label: "Social Media",          count: 0, color: "#ec4899", bg: "bg-pink-500/10" },
  { label: "Study / Notes",         count: 0, color: "#3b82f6", bg: "bg-blue-500/10" },
  { label: "Photos",                count: 0, color: "#8b5cf6", bg: "bg-violet-500/10" },
  { label: "Memes / Entertainment", count: 0, color: "#f97316", bg: "bg-orange-500/10" },
  { label: "Documents",             count: 0, color: "#6366f1", bg: "bg-indigo-500/10" },
  { label: "Unknown / Others",      count: 0, color: "#94a3b8", bg: "bg-slate-400/10" },
];

const specials = [
  {
    icon: <Copy className="h-5 w-5" />,
    label: "Duplicates",
    desc: "Duplicate screenshots found",
    color: "#ef4444",
    bg: "bg-red-500/10",
  },
  {
    icon: <Archive className="h-5 w-5" />,
    label: "Exported ZIPs",
    desc: "Download your processed batches",
    color: "#6366f1",
    bg: "bg-indigo-500/10",
  },
];

export default function Files() {
  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Your Files</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Organised folders from processed batches</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {specials.map((s) => (
          <button
            key={s.label}
            className="flex items-center gap-3 w-full rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm hover:bg-muted/50 transition-colors text-left"
          >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`} style={{ color: s.color }}>
              {s.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Category Folders</div>
        <div className="grid grid-cols-1 gap-2">
          {folders.map((f) => (
            <button
              key={f.label}
              className="flex items-center gap-3 w-full rounded-2xl border border-border bg-card px-4 py-3 shadow-sm hover:bg-muted/50 transition-colors text-left"
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                <FolderOpen className="h-4.5 w-4.5" style={{ color: f.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.count} files</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
          <FileSearch className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No processed files yet</p>
        <p className="text-xs text-muted-foreground">Upload and process screenshots from the Home tab to see organised folders here.</p>
      </div>
    </div>
  );
}
