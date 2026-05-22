import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetJob,
  getGetJobQueryKey,
  useGetJobCategories,
  getGetJobCategoriesQueryKey,
  useGetJobStats,
  getGetJobStatsQueryKey,
  useConfirmJob,
  useCleanupJob,
} from "@workspace/api-client-react";
import { uploadFiles } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Moon, Sun, Download, CheckCircle, RotateCcw,
  AlertCircle, Loader2, ChevronRight, X, ArrowRight,
  Sparkles, Zap, Archive,
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
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "OTP / Security":       { Icon: OTPIcon,       color: "text-amber-500",   folderColor: "#f59e0b", gradient: "from-amber-500/20 to-amber-600/5",   bg: "bg-amber-500/10" },
  "Payments / Receipts":  { Icon: PaymentIcon,    color: "text-emerald-500", folderColor: "#10b981", gradient: "from-emerald-500/20 to-emerald-600/5", bg: "bg-emerald-500/10" },
  "WhatsApp / Chats":     { Icon: ChatIcon,       color: "text-green-400",   folderColor: "#4ade80", gradient: "from-green-400/20 to-green-500/5",    bg: "bg-green-400/10" },
  "Social Media":         { Icon: SocialIcon,     color: "text-pink-500",    folderColor: "#ec4899", gradient: "from-pink-500/20 to-pink-600/5",      bg: "bg-pink-500/10" },
  "Study / Notes":        { Icon: StudyIcon,      color: "text-blue-400",    folderColor: "#60a5fa", gradient: "from-blue-400/20 to-blue-500/5",      bg: "bg-blue-400/10" },
  "Photos":               { Icon: PhotoIcon,      color: "text-violet-400",  folderColor: "#a78bfa", gradient: "from-violet-400/20 to-violet-500/5",  bg: "bg-violet-400/10" },
  "Memes / Entertainment":{ Icon: MemeIcon,       color: "text-orange-400",  folderColor: "#fb923c", gradient: "from-orange-400/20 to-orange-500/5",  bg: "bg-orange-400/10" },
  "Documents":            { Icon: DocumentIcon,   color: "text-indigo-400",  folderColor: "#818cf8", gradient: "from-indigo-400/20 to-indigo-500/5",  bg: "bg-indigo-400/10" },
  "Unknown / Others":     { Icon: UnknownIcon,    color: "text-slate-400",   folderColor: "#94a3b8", gradient: "from-slate-400/20 to-slate-500/5",    bg: "bg-slate-400/10" },
  "Duplicates":           { Icon: DuplicateIcon,  color: "text-red-400",     folderColor: "#f87171", gradient: "from-red-400/20 to-red-500/5",        bg: "bg-red-400/10" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload Step ────────────────────────────────────────────────────────────
function UploadStep({ onUploadComplete }: { onUploadComplete: (jobId: string, files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-accent/20 to-background">
        {/* Background glow blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Rule-based · No AI required
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Organize your
                <span className="block bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  screenshots.
                </span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Upload 50–500 images at once. SnapVault detects duplicates via SHA-256 hashing and sorts everything into 10 smart folders automatically.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  { icon: Zap, label: "SHA-256 deduplication" },
                  { icon: Archive, label: "10 smart categories" },
                  { icon: Download, label: "Organized ZIP export" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: folder preview illustration */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_META).slice(0, 6).map(([name, meta]) => {
                const { Icon } = meta;
                return (
                  <div
                    key={name}
                    className={`rounded-xl border border-border bg-card p-3 space-y-2 bg-gradient-to-br ${meta.gradient}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <p className="text-xs font-medium leading-tight">{name}</p>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-7 flex-1 rounded bg-muted/60 border border-border/50" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold">Upload your images</h2>
            <p className="text-sm text-muted-foreground">Drag & drop or click to browse — PNG, JPG, WebP, GIF</p>
          </div>

          {/* Drop zone */}
          <div
            data-testid="dropzone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`
              relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              ${dragging
                ? "border-primary bg-accent/40 scale-[1.01] shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
              }
              ${uploading ? "cursor-not-allowed opacity-60" : ""}
            `}
          >
            {/* Subtle grid bg */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={onInputChange}
              disabled={uploading}
              data-testid="file-input"
            />

            <div className="relative flex flex-col items-center gap-5 px-8 py-14">
              {/* Upload icon ring */}
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${dragging ? "bg-primary/20 scale-110" : "bg-muted"}`}>
                <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all ${dragging ? "border-primary animate-spin" : "border-border/60"}`} style={{ animationDuration: "8s" }} />
                <svg viewBox="0 0 40 40" fill="none" className={`w-10 h-10 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`}>
                  <path d="M20 28V12M20 12l-6 6M20 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 30h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>

              {selectedFiles.length > 0 ? (
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{selectedFiles.length.toLocaleString()} images selected</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(totalSize)} total · ready to process</p>
                  {/* Mini file grid preview */}
                  <div className="flex items-center justify-center gap-1 mt-3 flex-wrap max-w-xs mx-auto">
                    {selectedFiles.slice(0, 8).map((f, i) => (
                      <div key={i} className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    ))}
                    {selectedFiles.length > 8 && (
                      <div className="w-8 h-8 rounded bg-muted border border-border text-[10px] font-medium text-muted-foreground flex items-center justify-center">
                        +{selectedFiles.length - 8}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium">
                    {dragging ? "Release to add images" : "Drop images here, or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">Supports PNG · JPG · WebP · GIF · HEIC — up to 500 files</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 text-destructive text-sm bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl" data-testid="upload-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2" data-testid="upload-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading to server...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            {selectedFiles.length > 0 && !uploading && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={e => { e.stopPropagation(); setSelectedFiles([]); }}
                data-testid="button-clear"
              >
                <X className="h-4 w-4 mr-1.5" /> Clear
              </Button>
            )}
            <Button
              className="flex-1 h-11 font-semibold shadow-sm shadow-primary/20"
              disabled={!selectedFiles.length || uploading}
              onClick={handleUpload}
              data-testid="button-upload"
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                : <><ArrowRight className="h-4 w-4 mr-2" /> Process {selectedFiles.length > 0 ? `${selectedFiles.length.toLocaleString()} images` : "images"}</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Processing Step ─────────────────────────────────────────────────────────
function ProcessingStep({ jobId }: { jobId: string }) {
  const { data: job } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId), refetchInterval: 800 },
  });

  const processed = job?.processedFiles ?? 0;
  const total = job?.totalFiles ?? 0;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

  const isOcrPhase = processed > 0 && processed < total && job?.status === "processing";
  const steps = [
    { label: "Files uploaded",                    done: true },
    { label: "Computing SHA-256 hashes",          done: processed > 0 },
    { label: "Detecting duplicates",              done: processed > 0 },
    { label: "Rule-based categorization",         done: processed > 0 },
    { label: "OCR text scan (unmatched files)",   done: !isOcrPhase && job?.status === "awaiting_confirmation" },
    { label: "Ready for review",                  done: job?.status === "awaiting_confirmation" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-6">
      <div className="w-full max-w-md space-y-10">

        {/* Spinner visual */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/10" />
            <svg className="absolute inset-0 w-full h-full -rotate-90 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeDasharray="200 64" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold font-mono text-primary">{progress}%</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Processing images</h2>
            <p className="text-sm text-muted-foreground mt-1">Analyzing {total.toLocaleString()} files</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="processing-progress" />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{processed.toLocaleString()} processed</span>
            <span>{total.toLocaleString()} total</span>
          </div>
        </div>

        {/* Step list */}
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${step.done ? "" : "opacity-40"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                step.done ? "bg-primary shadow-sm shadow-primary/30" : "bg-muted"
              }`}>
                {step.done
                  ? <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                }
              </div>
              <span className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {i === steps.filter(s => s.done).length - 1 && !steps[i + 1]?.done && (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>

        {/* Duplicate notice */}
        {(job?.duplicateCount ?? 0) > 0 && (
          <div className="flex items-center gap-2.5 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl" data-testid="duplicate-notice">
            <DuplicateIcon className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-foreground">Found <strong className="text-red-400">{job?.duplicateCount}</strong> duplicate{job?.duplicateCount !== 1 ? "s" : ""}</span>
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
    <div className="min-h-[calc(100vh-60px)] px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Review folders</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-foreground font-medium">{totalFiles.toLocaleString()}</span> files sorted into{" "}
              <span className="text-foreground font-medium">{categories.length}</span> categories
              {duplicateCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                  · <DuplicateIcon className="h-3.5 w-3.5" /> {duplicateCount} duplicates
                </span>
              )}
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 shadow-sm shadow-primary/20 font-semibold"
            onClick={handleConfirm}
            disabled={confirmJob.isPending}
            data-testid="button-confirm"
          >
            {confirmJob.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building ZIP...</>
              : <><CheckCircle className="h-4 w-4 mr-2" /> Approve &amp; Generate ZIP</>
            }
          </Button>
        </div>

        {confirmJob.isError && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl">
            <AlertCircle className="h-4 w-4" /> Failed to confirm — please try again
          </div>
        )}

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(group => {
            const meta = CATEGORY_META[group.category] ?? CATEGORY_META["Unknown / Others"];
            const { Icon } = meta;
            const previews = group.files.slice(0, 4);
            const isDup = group.category === "Duplicates";

            return (
              <div
                key={group.category}
                className={`relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md group ${
                  isDup ? "border-red-400/30" : "border-border hover:border-primary/30"
                }`}
                data-testid={`category-card-${group.category}`}
              >
                {/* Gradient tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-60 pointer-events-none`} />

                <div className="relative p-4 space-y-3">
                  {/* Top row: icon + count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center border border-white/10`}>
                        <Icon className={`h-4.5 w-4.5 ${meta.color}`} style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{group.category}</p>
                        <p className="text-xs text-muted-foreground">{group.count} file{group.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs tabular-nums"
                    >
                      {group.count}
                    </Badge>
                  </div>

                  {/* Folder SVG */}
                  <FolderSVG color={meta.folderColor} className="w-full h-14" />

                  {/* Thumbnails strip */}
                  <div className="flex gap-1.5">
                    {previews.map(file => {
                      const url = getPreviewUrl(file.originalName);
                      return (
                        <div
                          key={file.filename}
                          className="flex-1 h-14 rounded-lg bg-muted border border-border/60 overflow-hidden"
                          data-testid={`preview-${file.filename}`}
                        >
                          {url
                            ? <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            : <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="h-4 w-4 text-muted-foreground" /></div>
                          }
                        </div>
                      );
                    })}
                    {group.count > 4 && (
                      <div className="flex-1 h-14 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{group.count - 4}
                      </div>
                    )}
                  </div>

                  {/* File name hint */}
                  {group.files[0] && (
                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                      {group.files[0].originalName}
                    </p>
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-6 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Hero status */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
            <div className="absolute inset-0 rounded-full bg-primary/10" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2.5s" }} />
            {zipReady
              ? <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12"><circle cx="24" cy="24" r="20" fill="hsl(var(--primary) / 0.2)"/><path d="M14 24l8 8 12-14" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <Loader2 className="h-10 w-10 text-primary animate-spin" />
            }
          </div>
          <h2 className="text-3xl font-bold">
            {zipReady ? "Archive ready to download" : "Building your archive..."}
          </h2>
          <p className="text-muted-foreground">
            {zipReady
              ? "All images organized and compressed. Your folder structure is preserved."
              : "Compressing categorized folders. This takes a few seconds."
            }
          </p>
        </div>

        {/* Stats cards */}
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total files",  value: stats.totalFiles,    color: "text-foreground" },
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

        {/* Category breakdown */}
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
                      <Icon className={`${meta.color}`} style={{ width: 14, height: 14 }} />
                    </div>
                    <span className="flex-1 text-sm text-foreground truncate">{cat}</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
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
          <Button
            size="lg"
            className="w-full h-12 font-semibold shadow-md shadow-primary/20"
            disabled={!zipReady}
            onClick={handleDownload}
            data-testid="button-download"
          >
            {zipReady ? (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download ZIP{stats?.zipSizeBytes ? ` · ${formatBytes(stats.zipSizeBytes)}` : ""}
              </>
            ) : (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing download...</>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleStartOver}
            data-testid="button-start-over"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Start over
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
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

  const stepDefs: { key: Step; label: string }[] = [
    { key: "upload",     label: "Upload" },
    { key: "processing", label: "Process" },
    { key: "review",     label: "Review" },
    { key: "done",       label: "Download" },
  ];
  const currentIdx = stepDefs.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M3 6a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" fill="white" fillOpacity="0.9"/>
                <rect x="7" y="10" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight">SnapVault</span>
          </div>

          {/* Step breadcrumb */}
          {step !== "upload" && (
            <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
              {stepDefs.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    i === currentIdx
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : i < currentIdx
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}>
                    {i < currentIdx && <CheckCircle className="h-3 w-3" />}
                    {s.label}
                  </div>
                  {i < stepDefs.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
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

      {/* ── Page ── */}
      {step === "upload"     && <UploadStep onUploadComplete={handleUploadComplete} />}
      {step === "processing" && jobId && <ProcessingStep jobId={jobId} />}
      {step === "review"     && jobId && (
        <ReviewStep jobId={jobId} uploadedFiles={uploadedFiles} onConfirm={() => setStep("done")} />
      )}
      {step === "done"       && jobId && (
        <DoneStep jobId={jobId} onStartOver={() => { setJobId(null); setUploadedFiles([]); setStep("upload"); }} />
      )}
    </div>
  );
}
