import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetJob, getGetJobQueryKey,
  useGetJobCategories, getGetJobCategoriesQueryKey,
  useGetJobStats, getGetJobStatsQueryKey,
  useConfirmJob, useCleanupJob,
} from "@workspace/api-client-react";
import { uploadFiles } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Moon, Sun, Download, CheckCircle, RotateCcw,
  AlertCircle, Loader2, X, ArrowRight,
  Upload, Cpu, FolderOpen, Settings2, ShieldCheck, Zap, ScanSearch,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  OTPIcon, PaymentIcon, ChatIcon, SocialIcon, StudyIcon,
  PhotoIcon, MemeIcon, DocumentIcon, UnknownIcon, DuplicateIcon,
  FolderSVG,
} from "@/components/CategoryIcons";

type Step = "upload" | "processing" | "review" | "done";

interface CategoryMeta {
  Icon: React.ElementType;
  color: string;
  folderColor: string;
  gradient: string;
  bg: string;
  textColor: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "OTP / Security":        { Icon: OTPIcon,      color: "text-amber-500",   folderColor: "#f59e0b", gradient: "from-amber-500/15 to-amber-600/5",   bg: "bg-amber-500/12",  textColor: "#f59e0b" },
  "Payments / Receipts":   { Icon: PaymentIcon,   color: "text-emerald-500", folderColor: "#10b981", gradient: "from-emerald-500/15 to-emerald-600/5", bg: "bg-emerald-500/12", textColor: "#10b981" },
  "WhatsApp / Chats":      { Icon: ChatIcon,      color: "text-green-500",   folderColor: "#22c55e", gradient: "from-green-500/15 to-green-600/5",    bg: "bg-green-500/12",  textColor: "#22c55e" },
  "Social Media":          { Icon: SocialIcon,    color: "text-pink-500",    folderColor: "#ec4899", gradient: "from-pink-500/15 to-pink-600/5",      bg: "bg-pink-500/12",   textColor: "#ec4899" },
  "Study / Notes":         { Icon: StudyIcon,     color: "text-blue-500",    folderColor: "#3b82f6", gradient: "from-blue-500/15 to-blue-600/5",      bg: "bg-blue-500/12",   textColor: "#3b82f6" },
  "Photos":                { Icon: PhotoIcon,     color: "text-violet-500",  folderColor: "#8b5cf6", gradient: "from-violet-500/15 to-violet-600/5",  bg: "bg-violet-500/12", textColor: "#8b5cf6" },
  "Memes / Entertainment": { Icon: MemeIcon,      color: "text-orange-500",  folderColor: "#f97316", gradient: "from-orange-500/15 to-orange-600/5",  bg: "bg-orange-500/12", textColor: "#f97316" },
  "Documents":             { Icon: DocumentIcon,  color: "text-indigo-500",  folderColor: "#6366f1", gradient: "from-indigo-500/15 to-indigo-600/5",  bg: "bg-indigo-500/12", textColor: "#6366f1" },
  "Unknown / Others":      { Icon: UnknownIcon,   color: "text-slate-400",   folderColor: "#94a3b8", gradient: "from-slate-400/15 to-slate-500/5",    bg: "bg-slate-400/12",  textColor: "#94a3b8" },
  "Duplicates":            { Icon: DuplicateIcon, color: "text-red-500",     folderColor: "#ef4444", gradient: "from-red-500/15 to-red-600/5",        bg: "bg-red-500/12",    textColor: "#ef4444" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload Step (full landing page) ────────────────────────────────────────
function UploadStep({ onUploadComplete }: { onUploadComplete: (jobId: string, files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setSelectedFiles(files);
    setError(null);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files ?? []));
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFiles(selectedFiles, (sent, total) => {
        setUploadProgress(Math.round((sent / total) * 100));
      });
      onUploadComplete(result.jobId, selectedFiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const totalSize = selectedFiles.reduce((a, f) => a + f.size, 0);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => inputRef.current?.click(), 400);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">

      {/* ══════════════════════════════════════════════════
          HERO — centered title + tagline
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-background to-background pt-16 pb-12 px-6 text-center">
        {/* Blurred blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -left-20 w-64 h-64 rounded-full bg-pink-500/6 blur-3xl" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" />
            Rule-based · No AI · No data leaves your browser
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.07]">
            Organize your<br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
              screenshots.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
            Upload up to <strong className="text-foreground">500 images</strong> at once.
            SnapVault deduplicates via SHA-256 and sorts into <strong className="text-foreground">10 smart folders</strong> — fully offline.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="h-12 px-7 text-base font-semibold shadow-lg shadow-primary/25" onClick={scrollToUpload}>
              <Upload className="h-5 w-5 mr-2" /> Upload Images
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> SHA-256 dedup</span>
              <span className="flex items-center gap-1.5"><ScanSearch className="h-4 w-4 text-blue-400" /> OCR fallback</span>
              <span className="flex items-center gap-1.5"><Download className="h-4 w-4 text-emerald-400" /> ZIP export</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ══════════════════════════════════════════════════ */}
      <section className="px-6 py-14 border-y border-border bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01", Icon: Upload,
                color: "text-primary", bg: "bg-primary/10",
                title: "Upload photos",
                desc: "Drag-and-drop or pick up to 500 screenshots. Any format: PNG, JPG, WebP, HEIC.",
              },
              {
                step: "02", Icon: Cpu,
                color: "text-violet-500", bg: "bg-violet-500/10",
                title: "Auto-process",
                desc: "SHA-256 deduplication removes exact copies. Rule-based + OCR categorization sorts the rest.",
              },
              {
                step: "03", Icon: Download,
                color: "text-emerald-500", bg: "bg-emerald-500/10",
                title: "Download ZIP",
                desc: "Review folder cards, approve, and download a structured ZIP with one folder per category.",
              },
            ].map(({ step, Icon, color, bg, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-border bg-card">
                <span className="absolute top-4 right-4 text-xs font-mono font-bold text-muted-foreground/40">{step}</span>
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-base">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          UPLOAD ZONE
      ══════════════════════════════════════════════════ */}
      <section ref={uploadRef} className="px-6 py-14">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Upload className="h-3.5 w-3.5" /> Upload section
            </div>
            <h2 className="text-2xl font-bold">Drop your images here</h2>
            <p className="text-sm text-muted-foreground">Supports PNG · JPG · WebP · GIF · HEIC — up to 500 files per batch</p>
          </div>

          {/* Drop zone */}
          <div
            data-testid="dropzone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={[
              "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
              dragging
                ? "border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/20",
              uploading ? "cursor-not-allowed opacity-60 pointer-events-none" : "",
            ].join(" ")}
          >
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)", backgroundSize: "28px 28px" }}
            />
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={onInputChange} disabled={uploading} data-testid="file-input" />

            <div className="relative flex flex-col items-center gap-5 px-8 py-14">
              {/* Icon ring */}
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${dragging ? "bg-primary/15 scale-110" : "bg-muted"}`}>
                <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all ${dragging ? "border-primary animate-spin" : "border-border/50"}`} style={{ animationDuration: "8s" }} />
                <Upload className={`w-8 h-8 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              {selectedFiles.length > 0 ? (
                <div className="text-center space-y-1 w-full">
                  <p className="text-2xl font-bold">{selectedFiles.length.toLocaleString()} images selected</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(totalSize)} total · click to change</p>
                  {/* Thumbnail preview strip */}
                  <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap max-w-sm mx-auto">
                    {selectedFiles.slice(0, 9).map((f, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shadow-sm">
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    ))}
                    {selectedFiles.length > 9 && (
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border text-[10px] font-semibold text-muted-foreground flex items-center justify-center">
                        +{selectedFiles.length - 9}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold">
                    {dragging ? "Release to add images" : "Drag & drop images here"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse from your device</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 text-destructive text-sm bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl" data-testid="upload-error">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2" data-testid="upload-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading to server...</span>
                <span className="font-mono font-semibold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2.5">
            {selectedFiles.length > 0 && !uploading && (
              <Button variant="outline" className="shrink-0" onClick={e => { e.stopPropagation(); setSelectedFiles([]); }} data-testid="button-clear">
                <X className="h-4 w-4 mr-1.5" /> Clear
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/20"
              disabled={!selectedFiles.length || uploading}
              onClick={handleUpload}
              data-testid="button-upload"
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                : <><ArrowRight className="h-4 w-4 mr-2" /> Process {selectedFiles.length > 0 ? `${selectedFiles.length.toLocaleString()} images` : "images"}</>}
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOLDERS — all 10 categories preview
      ══════════════════════════════════════════════════ */}
      <section className="px-6 py-14 border-t border-border bg-muted/10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" /> Folder section
            </div>
            <h2 className="text-2xl font-bold">10 smart categories</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Every screenshot is sorted into one of these folders using filename patterns and OCR text scanning.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(CATEGORY_META).map(([name, meta]) => {
              const { Icon } = meta;
              return (
                <div key={name} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 space-y-3 bg-gradient-to-br ${meta.gradient} hover:shadow-md hover:scale-[1.02] transition-all duration-200 group`}>
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center border border-white/10`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{name}</p>
                  </div>
                  <FolderSVG color={meta.folderColor} className="w-full h-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SETTINGS / FEATURES — how detection works
      ══════════════════════════════════════════════════ */}
      <section className="px-6 py-14 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Settings2 className="h-3.5 w-3.5" /> Detection engine
            </div>
            <h2 className="text-2xl font-bold">How detection works</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">No AI, no cloud APIs. A two-pass engine runs entirely on the server.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                Icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10",
                title: "Pass 1 — Filename rules",
                items: [
                  "WhatsApp images → WhatsApp / Chats (IMG-YYYYMMDD pattern)",
                  "Instagram/TikTok → Social Media",
                  "OTP only if filename has 'otp', not just 'password'",
                  "PaymentApp names → Payments / Receipts",
                ],
              },
              {
                Icon: ScanSearch, color: "text-violet-500", bg: "bg-violet-500/10",
                title: "Pass 2 — Tesseract OCR",
                items: [
                  "Unmatched files get OCR'd in batches of 3",
                  "Weighted keyword scoring per category",
                  "\"Your OTP is\" = 3pts, \"valid for\" = 1pt (needs 3+ to classify)",
                  "Highest-scoring category wins",
                ],
              },
              {
                Icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10",
                title: "Deduplication",
                items: [
                  "SHA-256 hash computed for every file",
                  "First occurrence wins, kept in its category",
                  "All subsequent exact duplicates → Duplicates folder",
                  "Zero false positives — byte-perfect matching",
                ],
              },
              {
                Icon: Download, color: "text-emerald-500", bg: "bg-emerald-500/10",
                title: "ZIP export",
                items: [
                  "One sub-folder per active category",
                  "Original filenames preserved",
                  "DEFLATE compression level 6",
                  "Temp files auto-cleaned from server after download",
                ],
              },
            ].map(({ Icon, color, bg, title, items }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="font-semibold text-sm">{title}</p>
                </div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground/70">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="none" className="w-3 h-3">
                <path d="M3 6a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            SnapVault
          </div>
          <p>No data stored · No cloud · No AI · Fully offline processing</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Processing Step ─────────────────────────────────────────────────────────
function ProcessingStep({ jobId, onReset }: { jobId: string; onReset: () => void }) {
  const { data: job, isError } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId), refetchInterval: 800, retry: 2 },
  });

  const processed = job?.processedFiles ?? 0;
  const total = job?.totalFiles ?? 0;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isOcrPhase = processed > 0 && processed < total && job?.status === "processing";

  const steps = [
    { label: "Files received",                  done: true },
    { label: "SHA-256 hashing",                 done: processed > 0 },
    { label: "Duplicate detection",             done: processed > 0 },
    { label: "Filename-rule categorization",    done: processed > 0 },
    { label: "OCR text scan (unmatched files)", done: !isOcrPhase && job?.status === "awaiting_confirmation" },
    { label: "Ready for review",                done: job?.status === "awaiting_confirmation" },
  ];

  if (isError || job?.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mx-auto">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Processing failed</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {job?.errorMessage ?? "The server lost track of your job — this happens if the server restarted. Please upload again."}
            </p>
          </div>
          <Button className="w-full h-11" onClick={onReset} data-testid="button-retry">
            <RotateCcw className="h-4 w-4 mr-2" /> Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
      <div className="w-full max-w-md space-y-8">

        {/* Ring + % */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-primary/8" />
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="6"/>
              <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={`${progress * 3.016} 302`}
                className="transition-all duration-500"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-primary">{progress}%</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Processing images</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total > 0 ? `${processed.toLocaleString()} of ${total.toLocaleString()} files` : "Starting…"}
            </p>
          </div>
        </div>

        {/* Steps list */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border" data-testid="processing-progress">
          {steps.map((s, i) => {
            const isActive = i === steps.filter(x => x.done).length - 1 && !steps[i + 1]?.done;
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${s.done ? "" : "opacity-35"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${s.done ? "bg-primary" : "bg-muted"}`}>
                  {s.done
                    ? <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                </div>
                <span className={`text-sm font-medium flex-1 ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {isActive && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />}
              </div>
            );
          })}
        </div>

        {/* Duplicate notice */}
        {(job?.duplicateCount ?? 0) > 0 && (
          <div className="flex items-center gap-2.5 text-sm bg-red-500/8 border border-red-500/20 px-4 py-3 rounded-xl" data-testid="duplicate-notice">
            <DuplicateIcon className="h-4 w-4 text-red-400 shrink-0" />
            <span>Found <strong className="text-red-400">{job?.duplicateCount}</strong> exact duplicate{job?.duplicateCount !== 1 ? "s" : ""} — moved to Duplicates folder</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Review Step ─────────────────────────────────────────────────────────────
function ReviewStep({ jobId, uploadedFiles, onConfirm }: {
  jobId: string;
  uploadedFiles: File[];
  onConfirm: () => void;
}) {
  const [overrides] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const confirmJob = useConfirmJob();

  const { data: breakdown, isLoading } = useGetJobCategories(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobCategoriesQueryKey(jobId) },
  });

  const fileMap = new Map(uploadedFiles.map(f => [f.name, f]));
  const getPreviewUrl = (originalName: string) => {
    const f = fileMap.get(originalName);
    return f ? URL.createObjectURL(f) : null;
  };

  const handleConfirm = () => {
    confirmJob.mutate(
      { jobId, data: { categoryOverrides: overrides } },
      { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) }); onConfirm(); } }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const categories = breakdown?.categories ?? [];
  const totalFiles = breakdown?.totalFiles ?? 0;
  const duplicateCount = breakdown?.duplicateCount ?? 0;

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              <FolderOpen className="h-3.5 w-3.5" /> Review folders
            </div>
            <h2 className="text-2xl font-bold">Review folders</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-foreground font-medium">{totalFiles.toLocaleString()}</span> files sorted into{" "}
              <span className="text-foreground font-medium">{categories.length}</span> categories
              {duplicateCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                  · <DuplicateIcon className="h-3.5 w-3.5" /> {duplicateCount} duplicates found
                </span>
              )}
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 h-11 px-6 font-semibold shadow-md shadow-primary/20"
            onClick={handleConfirm}
            disabled={confirmJob.isPending}
            data-testid="button-confirm"
          >
            {confirmJob.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building ZIP...</>
              : <><CheckCircle className="h-4 w-4 mr-2" /> Approve &amp; Generate ZIP</>}
          </Button>
        </div>

        {confirmJob.isError && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl">
            <AlertCircle className="h-4 w-4" /> Failed to confirm — please try again
          </div>
        )}

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(group => {
            const meta = CATEGORY_META[group.category] ?? CATEGORY_META["Unknown / Others"];
            const { Icon } = meta;
            const previews = group.files.slice(0, 4);
            const isDup = group.category === "Duplicates";

            return (
              <div
                key={group.category}
                className={`relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg group ${isDup ? "border-red-400/30" : "border-border hover:border-primary/25"}`}
                data-testid={`category-card-${group.category}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-70 pointer-events-none`} />
                <div className="relative p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} border border-white/10 flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${meta.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{group.category}</p>
                        <p className="text-xs text-muted-foreground">{group.count} file{group.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs tabular-nums">{group.count}</Badge>
                  </div>

                  {/* Folder SVG */}
                  <FolderSVG color={meta.folderColor} className="w-full h-12" />

                  {/* Thumbnails */}
                  <div className="flex gap-1.5">
                    {previews.map(file => {
                      const url = getPreviewUrl(file.originalName);
                      return (
                        <div key={file.filename} className="flex-1 h-14 rounded-lg bg-muted border border-border/60 overflow-hidden" data-testid={`preview-${file.filename}`}>
                          {url
                            ? <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            : <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="h-4 w-4 text-muted-foreground" /></div>}
                        </div>
                      );
                    })}
                    {group.count > 4 && (
                      <div className="flex-1 h-14 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{group.count - 4}
                      </div>
                    )}
                  </div>

                  {group.files[0] && (
                    <p className="text-[11px] text-muted-foreground truncate font-mono">{group.files[0].originalName}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Done Step ───────────────────────────────────────────────────────────────
function DoneStep({ jobId, onStartOver }: { jobId: string; onStartOver: () => void }) {
  const queryClient = useQueryClient();
  const cleanupJob = useCleanupJob();

  const { data: stats, isLoading: statsLoading } = useGetJobStats(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobStatsQueryKey(jobId),
      refetchInterval: q => (q.state.data?.zipSizeBytes == null ? 1000 : false),
    },
  });

  const { data: job } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId),
      refetchInterval: q => (q.state.data?.zipReady ? false : 800),
    },
  });

  const zipReady = job?.zipReady ?? false;

  const handleDownload = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.open(`${base}/api/jobs/${jobId}/download`, "_blank");
  };

  const handleStartOver = () => {
    cleanupJob.mutate({ jobId }, { onSuccess: () => queryClient.clear() });
    onStartOver();
  };

  const sortedCats = Object.entries(stats?.categoryCounts ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Status */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/10" />
            <div className={`absolute inset-0 rounded-full border-2 border-primary/20 ${zipReady ? "" : "animate-ping"}`} style={{ animationDuration: "2.5s" }} />
            {zipReady
              ? <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12"><circle cx="24" cy="24" r="20" fill="hsl(var(--primary) / 0.15)"/><path d="M13 24l8 9 14-15" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <Loader2 className="h-10 w-10 text-primary animate-spin" />}
          </div>
          <h2 className="text-3xl font-bold">
            {zipReady ? "Archive ready!" : "Building archive…"}
          </h2>
          <p className="text-muted-foreground">
            {zipReady
              ? "All images organized and compressed. Download your structured ZIP below."
              : "Compressing categorized folders — just a few seconds."}
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total files",  value: stats.totalFiles, color: "text-foreground" },
              { label: "Duplicates",   value: stats.duplicateCount, color: "text-red-400" },
              { label: "Categories",   value: Object.keys(stats.categoryCounts).length, color: "text-primary" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
                <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Breakdown */}
        {sortedCats.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Folder breakdown</p>
            </div>
            <div className="divide-y divide-border">
              {sortedCats.map(([cat, count]) => {
                const meta = CATEGORY_META[cat] ?? CATEGORY_META["Unknown / Others"];
                const { Icon } = meta;
                const pct = stats!.totalFiles > 0 ? Math.round((count / stats!.totalFiles) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`${meta.color}`} style={{ width: 15, height: 15 }} />
                    </div>
                    <span className="flex-1 text-sm text-foreground truncate">{cat}</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs tabular-nums w-8 justify-center">{count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          <Button size="lg" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
            disabled={!zipReady} onClick={handleDownload} data-testid="button-download">
            {zipReady
              ? <><Download className="h-5 w-5 mr-2" /> Download ZIP{stats?.zipSizeBytes ? ` · ${formatBytes(stats.zipSizeBytes)}` : ""}</>
              : <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing download...</>}
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleStartOver} data-testid="button-start-over">
            <RotateCcw className="h-4 w-4 mr-2" /> Start over
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
type StepDef = { key: Step; label: string; Icon: React.ElementType };

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { theme, toggleTheme } = useTheme();

  const { data: job } = useGetJob(jobId ?? "", {
    query: {
      enabled: !!jobId && step === "processing",
      queryKey: getGetJobQueryKey(jobId ?? ""),
      refetchInterval: q => {
        const d = q.state.data;
        if (d?.status === "awaiting_confirmation") return false;
        return 800;
      },
    },
  });

  if (step === "processing" && job?.status === "awaiting_confirmation") {
    setStep("review");
  }

  const handleUploadComplete = (jid: string, files: File[]) => {
    setJobId(jid);
    setUploadedFiles(files);
    setStep("processing");
  };

  const stepDefs: StepDef[] = [
    { key: "upload",     label: "Upload",   Icon: Upload },
    { key: "processing", label: "Process",  Icon: Cpu },
    { key: "review",     label: "Review",   Icon: FolderOpen },
    { key: "done",       label: "Download", Icon: Download },
  ];
  const currentIdx = stepDefs.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M3 6a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" fill="white" fillOpacity="0.95"/>
                <rect x="7" y="10" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.55"/>
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight">SnapVault</span>
          </div>

          {/* Step progress breadcrumb */}
          {step !== "upload" && (
            <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
              {stepDefs.map((s, i) => (
                <div key={s.key} className="flex items-center gap-0.5">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    i === currentIdx
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : i < currentIdx
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}>
                    {i < currentIdx
                      ? <CheckCircle className="h-3 w-3" />
                      : <s.Icon className="h-3 w-3" />}
                    {s.label}
                  </div>
                  {i < stepDefs.length - 1 && <div className="w-5 h-px bg-border mx-0.5" />}
                </div>
              ))}
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            data-testid="button-theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Pages */}
      {step === "upload" && <UploadStep onUploadComplete={handleUploadComplete} />}
      {step === "processing" && jobId && (
        <ProcessingStep jobId={jobId} onReset={() => { setJobId(null); setUploadedFiles([]); setStep("upload"); }} />
      )}
      {step === "review" && jobId && (
        <ReviewStep jobId={jobId} uploadedFiles={uploadedFiles} onConfirm={() => setStep("done")} />
      )}
      {step === "done" && jobId && (
        <DoneStep jobId={jobId} onStartOver={() => { setJobId(null); setUploadedFiles([]); setStep("upload"); }} />
      )}
    </div>
  );
}
