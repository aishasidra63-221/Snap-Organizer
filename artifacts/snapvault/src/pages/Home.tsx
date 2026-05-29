import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Moon, Sun, Download, CheckCircle, RotateCcw,
  AlertCircle, Loader2, X, Check,
  Upload, Cpu, FolderOpen, ShieldCheck, Zap, ScanSearch, Eye,
  Trash2, Search, FolderSymlink, ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  OTPIcon, PaymentIcon, ChatIcon, SocialIcon, StudyIcon,
  PhotoIcon, MemeIcon, DocumentIcon, UnknownIcon, DuplicateIcon,
  FolderSVG,
} from "@/components/CategoryIcons";
import {
  processFiles as runBrowserProcess,
  buildZipBlob,
  downloadBlob,
  getCategoryCounts,
  warmUpOcr,
  type BrowserFileEntry,
  type ProcessPhase,
  type ProcessUpdate,
} from "@/lib/browserProcessor";
import { appendToHistory } from "@/lib/jobHistory";

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

// ─── Upload Step ──────────────────────────────────────────────────────────────
function UploadStep({ onReady }: { onReady: (files: File[]) => void }) {
  const [, navigate] = useLocation();
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = new Set([
    "image/jpeg", "image/jpg", "image/png", "image/gif",
    "image/webp", "image/bmp", "image/tiff", "image/heic", "image/heif",
  ]);

  const filterImages = (files: File[]) =>
    files.filter(f => ALLOWED_TYPES.has(f.type) || f.name.match(/\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif)$/i));

  const MAX_FILES = 100;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const filtered = filterImages(Array.from(e.dataTransfer.files));
    if (filtered.length > MAX_FILES) {
      setError(`Maximum 100 screenshots allowed per batch. You selected ${filtered.length}.`);
      return;
    }
    setSelectedFiles(filtered);
    setError(null);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterImages(Array.from(e.target.files ?? []));
    if (filtered.length > MAX_FILES) {
      setError(`Maximum 100 screenshots allowed per batch. You selected ${filtered.length}.`);
      e.target.value = "";
      return;
    }
    setSelectedFiles(filtered);
    setError(null);
  };

  const handleOrganize = () => {
    if (!selectedFiles.length) return;
    if (selectedFiles.length > MAX_FILES) {
      setError(`Maximum 100 screenshots allowed per batch`);
      return;
    }
    onReady(selectedFiles);
  };

  const totalSize = selectedFiles.reduce((a, f) => a + f.size, 0);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-background to-background pt-14 pb-7 px-6 text-center">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -left-20 w-64 h-64 rounded-full bg-pink-500/6 blur-3xl" />

        <div className="relative max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% browser-based · Private
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.07]">
            Organize your<br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
              screenshots.
            </span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
            Drop up to <strong className="text-foreground">100 screenshots</strong> and OrganizeShots sorts everything into <strong className="text-foreground">smart folders</strong> — entirely in your browser.
          </p>

          <div className="space-y-4 pt-2 text-left">
            <div
              data-testid="dropzone"
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
                dragging ? "border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10" : "border-muted-foreground/40 dark:border-muted-foreground/65 hover:border-primary/60 hover:bg-muted/20",
              ].join(" ")}
            >
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
              <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
                onChange={onInputChange} data-testid="file-input" />

              <div className="relative flex flex-col items-center gap-5 px-8 py-12">
                <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${dragging ? "bg-primary/15 scale-110" : "bg-muted"}`}>
                  <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all ${dragging ? "border-primary animate-spin" : "border-border/50"}`} style={{ animationDuration: "8s" }} />
                  <Upload className={`w-8 h-8 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>

                {selectedFiles.length > 0 ? (
                  <div className="text-center space-y-1 w-full">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-bold">{selectedFiles.length.toLocaleString()} images selected</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedFiles.length >= 100 ? "bg-red-500/15 text-red-500" : selectedFiles.length >= 80 ? "bg-amber-500/15 text-amber-500" : "bg-primary/10 text-primary"}`}>
                        {selectedFiles.length} / 100
                      </span>
                    </div>
                    <div className="w-full max-w-xs mx-auto mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${selectedFiles.length >= 100 ? "bg-red-500" : selectedFiles.length >= 80 ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${Math.min((selectedFiles.length / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{formatBytes(totalSize)} total · click to change</p>
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
                    <p className="text-sm text-muted-foreground">or click to browse · PNG · JPG · WebP · HEIC</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-destructive text-sm bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex gap-2.5">
              {selectedFiles.length > 0 && (
                <Button variant="outline" className="shrink-0" onClick={e => { e.stopPropagation(); setSelectedFiles([]); }}>
                  <X className="h-4 w-4 mr-1.5" /> Clear
                </Button>
              )}
              <Button
                className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/20"
                disabled={!selectedFiles.length}
                onClick={handleOrganize}
                data-testid="button-upload"
              >
                {selectedFiles.length > 0 ? `Organize ${selectedFiles.length.toLocaleString()} images Now` : "Organize Now"}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400" /> SHA-256 dedup</span>
              <span className="flex items-center gap-1.5"><ScanSearch className="h-3.5 w-3.5 text-blue-400" /> OCR fallback</span>
              <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-emerald-400" /> ZIP export</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 border-y border-border bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "01", Icon: Upload, color: "text-primary", bg: "bg-primary/10", title: "Select photos", desc: "Drag-and-drop or pick up to 100 screenshots. PNG, JPG, WebP, HEIC — anything works." },
              { step: "02", Icon: Cpu, color: "text-violet-500", bg: "bg-violet-500/10", title: "Auto-process", desc: "SHA-256 deduplication + rule-based + OCR categorisation — all in your browser. Nothing uploaded." },
              { step: "03", Icon: Download, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Download ZIP", desc: "Review folder cards, approve, and download a structured ZIP with one folder per category." },
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

      <footer className="border-t border-border px-6 py-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OrganizeShots" className="h-5 w-auto opacity-80" />
            <span className="font-semibold text-foreground">OrganizeShots</span>
          </div>
          <p className="text-center">100% in-browser · No server · No cloud · No AI · Private by default</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <button onClick={() => navigate("/settings/privacy")} className="hover:text-foreground transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/settings/terms")} className="hover:text-foreground transition-colors">Terms & Conditions</button>
            <button onClick={() => navigate("/settings/faq")} className="hover:text-foreground transition-colors">FAQ</button>
            <button onClick={() => navigate("/blog")} className="hover:text-foreground transition-colors">Blog</button>
            <button onClick={() => navigate("/settings/guide")} className="hover:text-foreground transition-colors">Guide</button>
          </div>
          <p className="text-[10px] opacity-60">© {new Date().getFullYear()} OrganizeShots. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Processing Step ──────────────────────────────────────────────────────────
interface ProcessingState {
  phase: ProcessPhase;
  processedFiles: number;
  totalFiles: number;
  ocrDone: number;
  ocrTotal: number;
  duplicateCount: number;
  workerCount: number;
}

function ProcessingStep({
  progress,
  error,
  onReset,
}: {
  progress: ProcessingState;
  error: string | null;
  onReset: () => void;
}) {
  const phaseLabel: Record<ProcessPhase, string> = {
    "hashing": "SHA-256 hashing + filename classification",
    "qr":      "QR code scanning",
    "ocr":     "OCR text recognition",
    "":        "Starting…",
  };

  const steps = [
    { label: "Files received",                   done: progress.processedFiles > 0 || progress.phase !== "" },
    { label: "SHA-256 hashing + deduplication",  done: progress.phase === "qr" || progress.phase === "ocr" || (progress.phase === "hashing" && progress.processedFiles === progress.totalFiles && progress.totalFiles > 0) },
    { label: "Filename-rule categorisation",     done: progress.phase === "qr" || progress.phase === "ocr" },
    { label: "QR code scanning",                 done: progress.phase === "ocr" },
    { label: `OCR text scan${progress.workerCount > 1 ? ` · ${progress.workerCount} workers` : ""} (unmatched files)`, done: false },
  ];

  const displayPct = (() => {
    if (!progress.totalFiles) return 0;
    if (progress.phase === "hashing") return Math.round((progress.processedFiles / progress.totalFiles) * 60);
    if (progress.phase === "qr") return 65;
    if (progress.phase === "ocr" && progress.ocrTotal > 0)
      return 70 + Math.round((progress.ocrDone / progress.ocrTotal) * 28);
    return 10;
  })();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mx-auto">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Processing failed</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{error}</p>
          </div>
          <Button className="w-full h-11" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-primary/8" />
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="6"/>
              <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={`${displayPct * 3.016} 302`}
                className="transition-all duration-500"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-primary">{displayPct}%</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Processing images</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {progress.phase === "ocr" && progress.ocrTotal > 0
                ? `OCR: ${progress.ocrDone} / ${progress.ocrTotal} files · ${progress.workerCount} parallel worker${progress.workerCount !== 1 ? "s" : ""}`
                : progress.totalFiles > 0
                ? `${progress.processedFiles.toLocaleString()} of ${progress.totalFiles.toLocaleString()} files`
                : "Starting…"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Processing in your browser — nothing uploaded
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {steps.map((s, i) => {
            const isActive = !s.done && (
              (i === 0 && progress.phase === "hashing" && progress.processedFiles === 0) ||
              (i === 1 && progress.phase === "hashing" && progress.processedFiles > 0) ||
              (i === 2 && progress.phase === "hashing" && progress.processedFiles === progress.totalFiles) ||
              (i === 3 && progress.phase === "qr") ||
              (i === 4 && progress.phase === "ocr")
            );
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${s.done || isActive ? "" : "opacity-35"}`}>
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

        {progress.duplicateCount > 0 && (
          <div className="flex items-center gap-2.5 text-sm bg-red-500/8 border border-red-500/20 px-4 py-3 rounded-xl">
            <DuplicateIcon className="h-4 w-4 text-red-400 shrink-0" />
            <span>Found <strong className="text-red-400">{progress.duplicateCount}</strong> exact duplicate{progress.duplicateCount !== 1 ? "s" : ""} — moved to Duplicates folder</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared types for Review ───────────────────────────────────────────────────
interface FileItem {
  filename: string;
  originalName: string;
  category: string;
  hash: string;
  isDuplicate: boolean;
  size: number;
  ocrText?: string | null;
}

interface EffectiveGroup {
  category: string;
  count: number;
  files: FileItem[];
}

// ─── Folder Detail Page ───────────────────────────────────────────────────────
function FolderDetailPage({
  group,
  getPreviewUrl,
  onBack,
  onDelete,
  onMove,
}: {
  group: EffectiveGroup;
  getPreviewUrl: (name: string) => string | null;
  onBack: () => void;
  onDelete: (originalNames: string[]) => void;
  onMove: (originalName: string, newCategory: string) => void;
}) {
  const meta = CATEGORY_META[group.category] ?? CATEGORY_META["Unknown / Others"];
  const { Icon } = meta;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [moveTarget, setMoveTarget] = useState<string | null>(null);
  const [movedConfirm, setMovedConfirm] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return group.files;
    const q = searchQuery.toLowerCase();
    return group.files.filter(f =>
      f.originalName.toLowerCase().includes(q) ||
      (f.ocrText?.toLowerCase().includes(q) ?? false)
    );
  }, [group.files, searchQuery]);

  const toggleSelect = (name: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const handleBulkDelete = () => {
    onDelete(Array.from(selectedFiles));
    setSelectedFiles(new Set());
    setIsSelectMode(false);
  };

  const handleMoveConfirm = (newCategory: string) => {
    if (!moveTarget) return;
    onMove(moveTarget, newCategory);
    setMoveTarget(null);
    setMovedConfirm(newCategory);
    setTimeout(() => setMovedConfirm(null), 2000);
  };

  const q = searchQuery.toLowerCase();

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          {isSelectMode ? (
            <button onClick={() => { setIsSelectMode(false); setSelectedFiles(new Set()); }}
              className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors shrink-0">
              <X className="h-4 w-4 text-foreground" />
            </button>
          ) : (
            <button onClick={onBack}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-muted hover:bg-muted/70 transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">Back</span>
            </button>
          )}

          {isSelectMode ? (
            <>
              <p className="flex-1 text-sm font-semibold text-foreground">
                {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : "Tap to select"}
              </p>
              <button onClick={() => setSelectedFiles(new Set(filteredFiles.map(f => f.originalName)))}
                className="text-xs text-primary font-semibold px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors">
                Select all
              </button>
              {selectedFiles.size > 0 && (
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold transition-all hover:opacity-90 active:scale-95">
                  <Trash2 className="h-3.5 w-3.5" /> Delete ({selectedFiles.size})
                </button>
              )}
            </>
          ) : (
            <>
              <div className={`w-9 h-9 rounded-xl ${meta.bg} border border-white/10 flex items-center justify-center shrink-0`}>
                <Icon className={`h-4.5 w-4.5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">{group.category}</p>
                <p className="text-xs text-muted-foreground">{group.count} file{group.count !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setIsSelectMode(true)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors shrink-0">
                Select
              </button>
              <Badge variant="secondary" className="font-mono text-xs tabular-nums shrink-0" style={{ color: meta.textColor }}>
                {group.count}
              </Badge>
            </>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by filename or text in image…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm bg-muted/60 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/50 transition-all" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted-foreground/20 transition-colors">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-1.5 pl-1">
              {filteredFiles.length} result{filteredFiles.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            {searchQuery ? (
              <>
                <Search className="h-10 w-10 opacity-25" />
                <p className="text-sm font-medium">No files match "{searchQuery}"</p>
                <button onClick={() => setSearchQuery("")} className="text-xs text-primary underline">Clear search</button>
              </>
            ) : (
              <>
                <PhotoIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">No files in this folder</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredFiles.map(file => {
              const url = getPreviewUrl(file.originalName);
              const isSelected = selectedFiles.has(file.originalName);
              const nameHighlight = searchQuery && file.originalName.toLowerCase().includes(q);
              const ocrHighlight = searchQuery && (file.ocrText?.toLowerCase().includes(q) ?? false);

              return (
                <div key={file.filename} className="flex flex-col gap-1">
                  <div
                    className={`relative aspect-square rounded-xl bg-muted overflow-hidden cursor-pointer transition-all duration-150 ${
                      isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-lg" : "border border-border/60 hover:border-border"
                    }`}
                    onClick={() => isSelectMode && toggleSelect(file.originalName)}
                  >
                    {url ? (
                      <img src={url} alt={file.originalName} className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    {ocrHighlight && !nameHighlight && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-[9px] font-semibold text-white">OCR</div>
                    )}
                    {isSelectMode && (
                      <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                        isSelected ? "bg-primary border-primary" : "bg-background/80 border-muted-foreground/40"
                      }`}>
                        {isSelected && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    )}
                    {!isSelectMode && (
                      <button
                        onClick={e => { e.stopPropagation(); setMoveTarget(file.originalName); }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center opacity-60 hover:opacity-100 active:opacity-100 active:scale-95 transition-all shadow-sm"
                        title="Move to another folder"
                      >
                        <FolderSymlink className="h-3 w-3 text-foreground" />
                      </button>
                    )}
                  </div>
                  <p className={`text-[10px] truncate px-0.5 font-mono leading-tight ${nameHighlight ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {file.originalName}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {movedConfirm && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white text-sm font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle className="h-4 w-4 shrink-0" /> Moved to {movedConfirm}
          </div>
        </div>
      )}

      {moveTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMoveTarget(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-card w-full max-w-lg rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-250" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
            <div className="px-5 pt-2 pb-3 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FolderSymlink className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Move to folder</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{moveTarget}</p>
              </div>
              <button onClick={() => setMoveTarget(null)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors shrink-0">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[55vh] py-2">
              {Object.entries(CATEGORY_META)
                .filter(([cat]) => cat !== group.category && cat !== "Duplicates")
                .map(([cat, catMeta], i, arr) => {
                  const CatIcon = catMeta.Icon;
                  return (
                    <button key={cat} onClick={() => handleMoveConfirm(cat)}
                      className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-muted/70 hover:bg-muted/50 ${i < arr.length - 1 ? "border-b border-border/50" : ""}`}>
                      <div className={`w-9 h-9 rounded-xl ${catMeta.bg} flex items-center justify-center shrink-0`}>
                        <CatIcon className={`h-4 w-4 ${catMeta.color}`} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">{cat}</span>
                      <FolderSymlink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    </button>
                  );
                })}
            </div>
            <div className="px-4 py-3 border-t border-border">
              <button onClick={() => setMoveTarget(null)}
                className="w-full py-3 text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/70 rounded-2xl transition-colors active:scale-[0.98]">
                Cancel
              </button>
            </div>
            <div className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Start Over Confirm Toast ─────────────────────────────────────────────────
function StartOverConfirmToast({
  show,
  onConfirm,
  onCancel,
}: {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 z-[99] transition-all duration-300"
        style={{ background: "rgba(0,0,0,0.45)", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none" }}
        onClick={onCancel}
      />
      {/* Card */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        style={{ pointerEvents: show ? "auto" : "none" }}
      >
        <div
          className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden transition-all duration-300 ease-out"
          style={{
            transform: show ? "scale(1) translateY(0)" : "scale(0.88) translateY(24px)",
            opacity: show ? 1 : 0,
          }}
        >
          {/* Icon area */}
          <div className="flex flex-col items-center pt-6 pb-4 px-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground">Start over?</p>
              <p className="text-sm text-muted-foreground leading-snug">
                All uploaded files and results will be removed.
              </p>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-2.5 px-5 pb-5">
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-2xl border border-border bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-11 rounded-2xl bg-destructive text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors active:scale-95 shadow-md shadow-destructive/20"
            >
              Yes, reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Review Step ──────────────────────────────────────────────────────────────
function ReviewStep({
  entries,
  onConfirm,
  onReset,
}: {
  entries: BrowserFileEntry[];
  onConfirm: (overrides: Record<string, string>, deletedFiles: Set<string>) => void;
  onReset: () => void;
}) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showStartOverToast, setShowStartOverToast] = useState(false);

  // Build a preview URL map from entries
  const previewMap = useMemo(() =>
    new Map(entries.map(e => [e.originalName, e.previewUrl])),
    [entries]
  );

  const getPreviewUrl = (originalName: string) => previewMap.get(originalName) ?? null;

  const effectiveGroups = useMemo((): EffectiveGroup[] => {
    const grouped = new Map<string, FileItem[]>();
    for (const entry of entries) {
      if (deletedFiles.has(entry.originalName)) continue;
      const effectiveCategory = overrides[entry.originalName] ?? entry.category;
      if (!grouped.has(effectiveCategory)) grouped.set(effectiveCategory, []);
      grouped.get(effectiveCategory)!.push({
        filename: entry.id,
        originalName: entry.originalName,
        category: effectiveCategory,
        hash: entry.hash,
        isDuplicate: entry.isDuplicate,
        size: entry.size,
        ocrText: entry.ocrText,
      });
    }
    return Array.from(grouped.entries())
      .map(([category, files]) => ({ category, count: files.length, files }))
      .filter(g => g.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [entries, deletedFiles, overrides]);

  useEffect(() => {
    if (selectedCategory === null) return;
    const group = effectiveGroups.find(g => g.category === selectedCategory);
    if (!group || group.count === 0) setSelectedCategory(null);
  }, [effectiveGroups, selectedCategory]);

  const handleDelete = (originalNames: string[]) => {
    setDeletedFiles(prev => {
      const next = new Set(prev);
      originalNames.forEach(n => next.add(n));
      return next;
    });
    const remaining = (effectiveGroups.find(g => g.category === selectedCategory)?.count ?? 0) - originalNames.length;
    if (remaining <= 0) setSelectedCategory(null);
  };

  const handleMove = (originalName: string, newCategory: string) => {
    setOverrides(prev => ({ ...prev, [originalName]: newCategory }));
  };

  const totalFiles = entries.length;
  const effectiveTotalFiles = totalFiles - deletedFiles.size;
  const duplicateCount = entries.filter(e => e.isDuplicate).length;
  const pendingChanges = deletedFiles.size + Object.keys(overrides).length;

  if (selectedCategory !== null) {
    const group = effectiveGroups.find(g => g.category === selectedCategory)
      ?? { category: selectedCategory, count: 0, files: [] };
    return (
      <FolderDetailPage
        group={group}
        getPreviewUrl={getPreviewUrl}
        onBack={() => setSelectedCategory(null)}
        onDelete={handleDelete}
        onMove={handleMove}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border">
          <div>
            <button onClick={() => setShowStartOverToast(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors group">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Start over</span>
            </button>
            <h2 className="text-2xl font-bold">Review folders</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-foreground font-medium">{effectiveTotalFiles.toLocaleString()}</span> files in{" "}
              <span className="text-foreground font-medium">{effectiveGroups.length}</span> categories
              {duplicateCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                  · <DuplicateIcon className="h-3.5 w-3.5" /> {duplicateCount} duplicates
                </span>
              )}
            </p>
            {pendingChanges > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <span className="font-semibold">{pendingChanges}</span> pending change{pendingChanges !== 1 ? "s" : ""}
                {deletedFiles.size > 0 && <span>· {deletedFiles.size} deleted</span>}
                {Object.keys(overrides).length > 0 && <span>· {Object.keys(overrides).length} moved</span>}
              </div>
            )}
          </div>
          <Button
            size="lg"
            className="shrink-0 h-11 px-6 font-semibold shadow-md shadow-primary/20"
            onClick={() => onConfirm(overrides, deletedFiles)}
            data-testid="button-confirm"
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Approve &amp; Generate ZIP
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border">
            <Search className="h-3 w-3" /> Tap folder → search files
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border">
            <FolderSymlink className="h-3 w-3" /> Tap ⇄ icon to move
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border">
            <Eye className="h-3 w-3" /> Tap → select to bulk delete
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {effectiveGroups.map(group => {
            const meta = CATEGORY_META[group.category] ?? CATEGORY_META["Unknown / Others"];
            const { Icon } = meta;
            const previews = group.files.slice(0, 4);

            return (
              <button
                key={group.category}
                onClick={() => setSelectedCategory(group.category)}
                data-testid={`folder-${group.category}`}
                className={`relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:border-primary/30 active:scale-[0.99] group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-70 pointer-events-none`} />
                <div className="relative p-4 space-y-3">
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
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="font-mono text-xs tabular-nums">{group.count}</Badge>
                      <div className="w-6 h-6 rounded-lg bg-muted/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <FolderSVG color={meta.folderColor} className="w-full h-12" />

                  <div className="flex gap-1.5">
                    {previews.map(file => {
                      const url = getPreviewUrl(file.originalName);
                      return (
                        <div key={file.filename} className="flex-1 h-14 rounded-lg bg-muted border border-border/60 overflow-hidden">
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
              </button>
            );
          })}
        </div>
      </div>

      <StartOverConfirmToast
        show={showStartOverToast}
        onConfirm={onReset}
        onCancel={() => setShowStartOverToast(false)}
      />
    </div>
  );
}

// ─── Done Step ────────────────────────────────────────────────────────────────
function DoneStep({
  entries,
  overrides,
  deletedFiles,
  onStartOver,
}: {
  entries: BrowserFileEntry[];
  overrides: Record<string, string>;
  deletedFiles: Set<string>;
  onStartOver: () => void;
}) {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [zipName, setZipName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showStartOverToast, setShowStartOverToast] = useState(false);

  // Pre-build the ZIP in the background as soon as this screen mounts
  const [prebuiltBlob, setPrebuiltBlob] = useState<Blob | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildDone, setBuildDone] = useState(false);

  const defaultZipName = `OrganizeShots_Export_${new Date().toISOString().slice(0, 10)}`;

  function getFolderName(category: string): string {
    const style = (localStorage.getItem("folderNaming") ?? "category") as "category" | "date" | "custom";
    const prefix = localStorage.getItem("folderNamingPrefix") ?? "";
    const clean = category
      .replace(/[/\\:*?"<>|]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (style === "date") {
      const date = new Date().toISOString().slice(0, 10);
      return `${date}_${clean}`;
    }
    if (style === "custom" && prefix.trim()) {
      const safePrefix = prefix.trim().replace(/[/\\:*?"<>|]/g, "");
      return `${safePrefix}_${clean}`;
    }
    return clean;
  }

  useEffect(() => {
    let cancelled = false;
    setBuildProgress(0);
    setBuildDone(false);
    setPrebuiltBlob(null);

    buildZipBlob(entries, deletedFiles, overrides, pct => {
      if (!cancelled) setBuildProgress(pct);
    }, getFolderName).then(blob => {
      if (!cancelled) { setPrebuiltBlob(blob); setBuildDone(true); }
    }).catch(() => {
      if (!cancelled) setBuildDone(true);
    });

    return () => { cancelled = true; };
  }, []); // intentionally run once on mount only

  const effectiveEntries = entries.filter(e => !deletedFiles.has(e.originalName));
  const categoryCounts: Record<string, number> = {};
  for (const e of effectiveEntries) {
    const cat = overrides[e.originalName] ?? e.category;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  const totalFiles = effectiveEntries.length;
  const dupeCount = entries.filter(e => e.isDuplicate && !deletedFiles.has(e.originalName)).length;
  const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  const zipSizeLabel = prebuiltBlob ? ` · ${formatBytes(prebuiltBlob.size)}` : !buildDone ? " · estimating…" : "";

  const handleDownload = async () => {
    const name = (zipName.trim() || defaultZipName).replace(/\.zip$/i, "");
    setDownloading(true);
    try {
      if (prebuiltBlob) {
        downloadBlob(prebuiltBlob, name); // instant — already built
      } else {
        // fallback: build now (shouldn't normally happen)
        const blob = await buildZipBlob(entries, deletedFiles, overrides, () => {}, getFolderName);
        downloadBlob(blob, name);
      }
    } finally {
      setDownloading(false);
      setShowNameDialog(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-24 h-24">
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full bg-primary/10"
              style={{ animation: "successRingPulse 1.8s ease-out forwards" }} />
            <div className="absolute inset-0 rounded-full border-2 border-primary/30"
              style={{ animation: "successRingExpand 0.6s ease-out 0.1s both" }} />
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12"
              style={{ animation: "successIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>
              <circle cx="24" cy="24" r="20" fill="hsl(var(--primary) / 0.15)"
                style={{ animation: "successCircleFill 0.4s ease-out 0.05s both" }} />
              <path
                d="M13 24l8 9 14-15"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="32"
                strokeDashoffset="32"
                style={{ animation: "successCheckDraw 0.5s ease-out 0.35s forwards" }}
              />
            </svg>
            <style>{`
              @keyframes successRingPulse {
                0%   { transform: scale(0.6); opacity: 0; }
                50%  { transform: scale(1.08); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes successRingExpand {
                0%   { transform: scale(0.5); opacity: 0; }
                60%  { transform: scale(1.15); opacity: 0.6; }
                100% { transform: scale(1); opacity: 0; }
              }
              @keyframes successIconPop {
                0%   { transform: scale(0.4); opacity: 0; }
                70%  { transform: scale(1.12); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes successCircleFill {
                0%   { opacity: 0; }
                100% { opacity: 1; }
              }
              @keyframes successCheckDraw {
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </div>
          <h2 className="text-3xl font-bold">Ready to download!</h2>
          <p className="text-muted-foreground">Your screenshots are organised. Download the ZIP below.</p>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> ZIP built in your browser — nothing uploaded
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total files",  value: totalFiles, color: "text-foreground" },
            { label: "Duplicates",   value: dupeCount,  color: "text-red-400" },
            { label: "Categories",   value: sortedCats.length, color: "text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
              <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {sortedCats.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Folder breakdown</p>
            </div>
            <div className="divide-y divide-border">
              {sortedCats.map(([cat, count]) => {
                const meta = CATEGORY_META[cat] ?? CATEGORY_META["Unknown / Others"];
                const { Icon } = meta;
                const pct = totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={meta.color} style={{ width: 15, height: 15 }} />
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

        {/* Background ZIP build progress */}
        {!buildDone && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Preparing ZIP in background…
              </span>
              <span className="font-mono">{Math.round(buildProgress)}%</span>
            </div>
            <Progress value={buildProgress} className="h-1.5" />
          </div>
        )}

        <div className="space-y-2.5">
          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
            disabled={downloading}
            onClick={() => { setZipName(defaultZipName); setShowNameDialog(true); }}
            data-testid="button-download"
          >
            {buildDone ? (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download ZIP{zipSizeLabel}
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing{zipSizeLabel}
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setShowStartOverToast(true)} data-testid="button-start-over">
            <RotateCcw className="h-4 w-4 mr-2" /> Start over
          </Button>
        </div>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Name your ZIP file</DialogTitle>
            <DialogDescription>
              Choose a name for your download. The <span className="font-mono text-xs">.zip</span> extension will be added automatically.
              {prebuiltBlob && (
                <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  File size: {formatBytes(prebuiltBlob.size)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <Input
              value={zipName}
              onChange={e => setZipName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !downloading) handleDownload(); }}
              placeholder={defaultZipName}
              className="font-mono text-sm"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2 truncate">
              File: <span className="text-foreground">{(zipName.trim() || defaultZipName).replace(/\.zip$/i, "")}.zip</span>
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNameDialog(false)} disabled={downloading}>Cancel</Button>
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Downloading…</>
                : <><Download className="h-4 w-4 mr-2" /> Download{prebuiltBlob ? ` · ${formatBytes(prebuiltBlob.size)}` : ""}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StartOverConfirmToast
        show={showStartOverToast}
        onConfirm={onStartOver}
        onCancel={() => setShowStartOverToast(false)}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const DEFAULT_PROGRESS: ProcessingState = {
  phase: "", processedFiles: 0, totalFiles: 0, ocrDone: 0, ocrTotal: 0, duplicateCount: 0, workerCount: 1,
};

export default function Home() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [entries, setEntries] = useState<BrowserFileEntry[]>([]);
  const [progress, setProgress] = useState<ProcessingState>(DEFAULT_PROGRESS);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [confirmedOverrides, setConfirmedOverrides] = useState<Record<string, string>>({});
  const [confirmedDeletes, setConfirmedDeletes] = useState<Set<string>>(new Set());
  const { theme, toggleTheme } = useTheme();

  // Pre-warm Tesseract workers on mount so model is cached before user uploads
  useEffect(() => { warmUpOcr(); }, []);

  // Start browser processing when step becomes "processing"
  useEffect(() => {
    if (step !== "processing" || !pendingFiles.length) return;
    let cancelled = false;

    const run = async () => {
      try {
        setProcessingError(null);
        const result = await runBrowserProcess(pendingFiles, (update: ProcessUpdate) => {
          if (!cancelled) setProgress(prev => ({ ...prev, ...update }));
        });
        if (!cancelled) {
          setEntries(result);
          setStep("review");
          appendToHistory({
            jobId: crypto.randomUUID(),
            totalFiles: result.length,
            duplicateCount: result.filter(e => e.isDuplicate).length,
            ocrCount: result.filter(e => e.ocrText !== null && !e.isDuplicate).length,
            createdAt: new Date().toISOString(),
            categoryCounts: getCategoryCounts(result),
          });
        }
      } catch (e) {
        if (!cancelled) setProcessingError(e instanceof Error ? e.message : "Processing failed");
      }
    };

    run();
    return () => { cancelled = true; };
  }, [step, pendingFiles]);

  const handleReady = (files: File[]) => {
    setPendingFiles(files);
    setProgress(DEFAULT_PROGRESS);
    setStep("processing");
  };

  const handleConfirm = (overrides: Record<string, string>, deletes: Set<string>) => {
    setConfirmedOverrides(overrides);
    setConfirmedDeletes(deletes);
    setStep("done");
  };

  const resetAll = () => {
    // Revoke object URLs to free memory
    entries.forEach(e => { try { URL.revokeObjectURL(e.previewUrl); } catch {} });
    setStep("upload");
    setPendingFiles([]);
    setEntries([]);
    setProgress(DEFAULT_PROGRESS);
    setProcessingError(null);
    setConfirmedOverrides({});
    setConfirmedDeletes(new Set());
  };

  const stepDefs = [
    { key: "upload" as Step,     label: "Upload",   Icon: Upload },
    { key: "processing" as Step, label: "Process",  Icon: Cpu },
    { key: "review" as Step,     label: "Review",   Icon: FolderOpen },
    { key: "done" as Step,       label: "Download", Icon: Download },
  ];
  const currentIdx = stepDefs.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-3 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="OrganizeShots" className="h-8 w-auto" />
            <span className="font-semibold text-base text-foreground">OrganizeShots</span>
          </div>

          {step !== "upload" && (
            <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
              {stepDefs.map((s, i) => (
                <div key={s.key} className="flex items-center gap-0.5">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    i === currentIdx ? "bg-primary text-primary-foreground shadow-sm"
                    : i < currentIdx ? "text-primary"
                    : "text-muted-foreground"
                  }`}>
                    {i < currentIdx ? <CheckCircle className="h-3 w-3" /> : <s.Icon className="h-3 w-3" />}
                    {s.label}
                  </div>
                  {i < stepDefs.length - 1 && <div className="w-5 h-px bg-border mx-0.5" />}
                </div>
              ))}
            </div>
          )}

          <button onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {step === "upload" && <UploadStep onReady={handleReady} />}
      {step === "processing" && <ProcessingStep progress={progress} error={processingError} onReset={resetAll} />}
      {step === "review" && <ReviewStep entries={entries} onConfirm={handleConfirm} onReset={resetAll} />}
      {step === "done" && (
        <DoneStep entries={entries} overrides={confirmedOverrides} deletedFiles={confirmedDeletes} onStartOver={resetAll} />
      )}
    </div>
  );
}
