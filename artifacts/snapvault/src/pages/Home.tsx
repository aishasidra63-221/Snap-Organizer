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
  Shield,
  CreditCard,
  MessageCircle,
  Image,
  BookOpen,
  Camera,
  Laugh,
  FileText,
  HelpCircle,
  Copy,
  Upload,
  Moon,
  Sun,
  Download,
  CheckCircle,
  RotateCcw,
  Folder,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

type Step = "upload" | "processing" | "review" | "done";

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  "OTP / Security": { icon: Shield, color: "text-amber-500" },
  "Payments / Receipts": { icon: CreditCard, color: "text-green-500" },
  "WhatsApp / Chats": { icon: MessageCircle, color: "text-emerald-400" },
  "Social Media": { icon: Image, color: "text-pink-500" },
  "Study / Notes": { icon: BookOpen, color: "text-blue-400" },
  "Photos": { icon: Camera, color: "text-violet-400" },
  "Memes / Entertainment": { icon: Laugh, color: "text-orange-400" },
  "Documents": { icon: FileText, color: "text-indigo-400" },
  "Unknown / Others": { icon: HelpCircle, color: "text-muted-foreground" },
  "Duplicates": { icon: Copy, color: "text-red-400" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ——— Step 1: Upload ———
function UploadStep({
  onUploadComplete,
}: {
  onUploadComplete: (jobId: string, files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setSelectedFiles(files);
    setError(null);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Drop your screenshots here
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload 50–500 images. SnapVault deduplicates and organizes them automatically.
          </p>
        </div>

        <div
          data-testid="dropzone"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200
            ${dragging
              ? "border-primary bg-accent scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-muted/30"
            }
            ${uploading ? "cursor-not-allowed opacity-70" : ""}
          `}
        >
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
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${dragging ? "bg-primary/20" : "bg-muted"}`}>
              <Upload className={`h-10 w-10 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            {selectedFiles.length > 0 ? (
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {selectedFiles.length} images selected
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(selectedFiles.reduce((a, f) => a + f.size, 0))} total
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xl font-medium text-foreground">
                  {dragging ? "Release to add images" : "Drag images here, or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, WebP, GIF — up to 500 files at once
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg" data-testid="upload-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {uploading && (
          <div className="space-y-2" data-testid="upload-progress">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="flex gap-3">
          {selectedFiles.length > 0 && !uploading && (
            <Button
              variant="outline"
              onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }}
              data-testid="button-clear"
            >
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
          <Button
            className="flex-1"
            size="lg"
            disabled={!selectedFiles.length || uploading}
            onClick={handleUpload}
            data-testid="button-upload"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Process {selectedFiles.length > 0 ? `${selectedFiles.length} images` : "images"}</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: "Hash deduplication", desc: "SHA-256 exact match" },
            { label: "10 categories", desc: "Rule-based sorting" },
            { label: "ZIP export", desc: "Organized folders" },
          ].map((item) => (
            <div key={item.label} className="text-center space-y-1 p-4 rounded-lg bg-card border border-border">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ——— Step 2: Processing ———
function ProcessingStep({ jobId }: { jobId: string }) {
  const { data: job } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId),
      refetchInterval: 800,
    },
  });

  const processed = job?.processedFiles ?? 0;
  const total = job?.totalFiles ?? 0;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

  const steps = [
    { label: "Uploading files", done: true },
    { label: "Computing SHA-256 hashes", done: processed > 0 },
    { label: "Detecting duplicates", done: processed === total && total > 0 },
    { label: "Categorizing images", done: job?.status === "awaiting_confirmation" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-3xl font-bold">Processing your images</h2>
          <p className="text-muted-foreground">
            Analyzing {total} files for duplicates and categories
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-medium">{processed} / {total}</span>
          </div>
          <Progress value={progress} className="h-3" data-testid="processing-progress" />
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                step.done ? "bg-primary" : "bg-muted"
              }`}>
                {step.done
                  ? <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                  : <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                }
              </div>
              <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {job?.duplicateCount != null && job.duplicateCount > 0 && (
          <div className="bg-accent/50 border border-accent-border rounded-lg px-4 py-3 text-sm flex items-center gap-2" data-testid="duplicate-notice">
            <Copy className="h-4 w-4 text-accent-foreground" />
            <span>Found <strong>{job.duplicateCount}</strong> duplicate{job.duplicateCount !== 1 ? "s" : ""} so far</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ——— Step 3: Review ———
function ReviewStep({
  jobId,
  uploadedFiles,
  onConfirm,
}: {
  jobId: string;
  uploadedFiles: File[];
  onConfirm: () => void;
}) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const confirmJob = useConfirmJob();

  const { data: breakdown, isLoading } = useGetJobCategories(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobCategoriesQueryKey(jobId),
    },
  });

  const fileMap = new Map(uploadedFiles.map((f) => [f.name, f]));
  const getPreviewUrl = (originalName: string) => {
    const f = fileMap.get(originalName);
    return f ? URL.createObjectURL(f) : null;
  };

  const handleConfirm = () => {
    confirmJob.mutate(
      { jobId, data: { categoryOverrides: overrides } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
          onConfirm();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  const categories = breakdown?.categories ?? [];
  const totalFiles = breakdown?.totalFiles ?? 0;
  const duplicateCount = breakdown?.duplicateCount ?? 0;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Review organization</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {totalFiles} files sorted into {categories.length} categories
              {duplicateCount > 0 && ` · ${duplicateCount} duplicates detected`}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={confirmJob.isPending}
            data-testid="button-confirm"
          >
            {confirmJob.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building ZIP...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Approve & Generate ZIP</>
            )}
          </Button>
        </div>

        {confirmJob.isError && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            Failed to confirm — please try again
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((group) => {
            const meta = CATEGORY_META[group.category] ?? { icon: HelpCircle, color: "text-muted-foreground" };
            const IconComp = meta.icon;
            const previews = group.files.slice(0, 3);
            const isDuplicates = group.category === "Duplicates";

            return (
              <div
                key={group.category}
                className={`rounded-xl border border-border bg-card p-4 space-y-3 transition-all ${
                  isDuplicates ? "border-red-400/30 bg-red-50/5" : ""
                }`}
                data-testid={`category-card-${group.category}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComp className={`h-4 w-4 ${meta.color}`} />
                    <span className="font-medium text-sm">{group.category}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {group.count}
                  </Badge>
                </div>

                <div className="flex gap-1.5">
                  {previews.map((file) => {
                    const url = getPreviewUrl(file.originalName);
                    return url ? (
                      <img
                        key={file.filename}
                        src={url}
                        alt={file.originalName}
                        className="h-16 w-16 object-cover rounded-md bg-muted shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        data-testid={`preview-${file.filename}`}
                      />
                    ) : (
                      <div key={file.filename} className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    );
                  })}
                  {group.count > 3 && (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0 text-xs text-muted-foreground font-medium">
                      +{group.count - 3}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground truncate">
                  {group.files[0]?.originalName}
                  {group.count > 1 && ` and ${group.count - 1} more`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ——— Step 4: Done ———
function DoneStep({
  jobId,
  onStartOver,
}: {
  jobId: string;
  onStartOver: () => void;
}) {
  const queryClient = useQueryClient();
  const cleanupJob = useCleanupJob();

  const { data: stats, isLoading } = useGetJobStats(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobStatsQueryKey(jobId),
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.zipSizeBytes == null ? 1000 : false;
      },
    },
  });

  const { data: job } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId),
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.zipReady ? false : 800;
      },
    },
  });

  const zipReady = job?.zipReady ?? false;

  const handleDownload = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.open(`${base}/api/jobs/${jobId}/download`, "_blank");
  };

  const handleStartOver = () => {
    cleanupJob.mutate({ jobId }, {
      onSuccess: () => {
        queryClient.clear();
        onStartOver();
      },
    });
    onStartOver();
  };

  const categoryCount = stats ? Object.keys(stats.categoryCounts).length : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-xl text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">
            {zipReady ? "Your archive is ready" : "Building your archive..."}
          </h2>
          <p className="text-muted-foreground">
            {zipReady
              ? "All images have been organized and compressed into a ZIP."
              : "Compressing categorized folders into a ZIP file."
            }
          </p>
        </div>

        {!zipReady && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Compressing files...</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-3xl font-bold text-foreground">{stats.totalFiles}</p>
              <p className="text-xs text-muted-foreground">Total files</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-3xl font-bold text-red-400">{stats.duplicateCount}</p>
              <p className="text-xs text-muted-foreground">Duplicates found</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-3xl font-bold text-primary">{categoryCount}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        ) : null}

        {stats && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-left">
            <p className="text-sm font-medium text-muted-foreground mb-3">Category breakdown</p>
            {Object.entries(stats.categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => {
                const meta = CATEGORY_META[cat] ?? { icon: HelpCircle, color: "text-muted-foreground" };
                const IconComp = meta.icon;
                const pct = stats.totalFiles > 0 ? Math.round((count / stats.totalFiles) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3 text-sm">
                    <IconComp className={`h-4 w-4 shrink-0 ${meta.color}`} />
                    <span className="flex-1 text-foreground">{cat}</span>
                    <span className="font-mono text-muted-foreground text-xs">{pct}%</span>
                    <Badge variant="secondary" className="font-mono text-xs">{count}</Badge>
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            disabled={!zipReady}
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="h-5 w-5 mr-2" />
            {zipReady
              ? `Download ZIP${stats?.zipSizeBytes ? ` (${formatBytes(stats.zipSizeBytes)})` : ""}`
              : "Preparing download..."
            }
          </Button>
          <Button
            variant="ghost"
            className="w-full"
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

// ——— Main ———
export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { theme, toggleTheme } = useTheme();

  const { data: job } = useGetJob(jobId ?? "", {
    query: {
      enabled: !!jobId && step === "processing",
      queryKey: getGetJobQueryKey(jobId ?? ""),
      refetchInterval: (query) => {
        const data = query.state.data;
        if (data?.status === "awaiting_confirmation") return false;
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

  const stepLabels: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Process" },
    { key: "review", label: "Review" },
    { key: "done", label: "Download" },
  ];
  const currentIdx = stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Folder className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg tracking-tight">SnapVault</span>
            </div>
            {step !== "upload" && (
              <div className="hidden sm:flex items-center gap-1 ml-4">
                {stepLabels.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      i === currentIdx
                        ? "bg-primary text-primary-foreground"
                        : i < currentIdx
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}>
                      {s.label}
                    </span>
                    {i < stepLabels.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-testid="button-theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Steps */}
      {step === "upload" && (
        <UploadStep onUploadComplete={handleUploadComplete} />
      )}
      {step === "processing" && jobId && (
        <ProcessingStep jobId={jobId} />
      )}
      {step === "review" && jobId && (
        <ReviewStep
          jobId={jobId}
          uploadedFiles={uploadedFiles}
          onConfirm={() => setStep("done")}
        />
      )}
      {step === "done" && jobId && (
        <DoneStep
          jobId={jobId}
          onStartOver={() => {
            setJobId(null);
            setUploadedFiles([]);
            setStep("upload");
          }}
        />
      )}
    </div>
  );
}
