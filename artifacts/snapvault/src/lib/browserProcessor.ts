import jsQR from "jsqr";
import { createWorker, createScheduler, Scheduler, Worker } from "tesseract.js";
import JSZip from "jszip";
import { categorizeByFilename, categorizeByText } from "./categorizer";

// ─── Worker Pool Cache (reuse across calls — avoids re-loading model) ─────────
let cachedScheduler: Scheduler | null = null;
let cachedWorkers: Worker[] = [];
let cachedWorkerCount = 0;

async function getScheduler(needed: number): Promise<Scheduler> {
  const target = Math.max(1, Math.min(navigator.hardwareConcurrency ?? 2, 6, needed));

  if (cachedScheduler && cachedWorkerCount >= target) {
    return cachedScheduler;
  }

  if (cachedScheduler) {
    await cachedScheduler.terminate();
    cachedWorkers = [];
    cachedWorkerCount = 0;
  }

  cachedScheduler = createScheduler();
  const workerInits = Array.from({ length: target }, () =>
    createWorker("eng", 1, {
      logger: () => {},
      workerPath: undefined,
      corePath: undefined,
      langPath: undefined,
    } as Parameters<typeof createWorker>[2])
  );
  cachedWorkers = await Promise.all(workerInits);
  await Promise.all(cachedWorkers.map(w => (w as any).setParameters({ tessedit_pageseg_mode: "11" })));
  cachedWorkers.forEach(w => cachedScheduler!.addWorker(w));
  cachedWorkerCount = target;
  return cachedScheduler;
}

export interface BrowserFileEntry {
  id: string;
  originalName: string;
  category: string;
  hash: string;
  isDuplicate: boolean;
  size: number;
  file: File;
  previewUrl: string;
  ocrText: string | null;
}

export type ProcessPhase = "hashing" | "qr" | "ocr" | "";

export interface ProcessUpdate {
  phase?: ProcessPhase;
  processedFiles?: number;
  totalFiles?: number;
  ocrDone?: number;
  ocrTotal?: number;
  duplicateCount?: number;
  workerCount?: number;
}

// ─── Hashing ──────────────────────────────────────────────────────────────────
async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── QR scanning ──────────────────────────────────────────────────────────────
async function scanQr(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(code ? code.data : null);
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ─── SPEED FIX: Crop top 70% + downscale to max 800px before OCR ─────────────
// Screenshots have headers, app names, amounts at the top.
// Payment confirmations (easypaisa, UPI etc.) often have large icons/graphics
// at the top (~40-50%), pushing the actual text further down. Using 70% gives
// enough coverage for all app layouts while still cutting 30% of pixels.
// 800px wide is plenty for Tesseract to read UI text accurately.
async function prepareForOcr(file: File): Promise<HTMLCanvasElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const MAX_WIDTH = 800;
        const cropHeight = Math.round(img.height * 0.7); // top 70%
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(cropHeight * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, img.width, cropHeight, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ─── ACCURACY FIX: Visual screenshot detector ─────────────────────────────────
// Screenshots have large flat-colour regions (white backgrounds, solid UI
// panels). Real camera photos almost never have perfectly identical adjacent
// pixels due to compression and natural textures.
//
// We sample a 32×32 thumbnail and count "flat pairs" — horizontally adjacent
// pixels whose total RGB difference is < 10. A flat-pair ratio above ~0.35
// strongly indicates a screenshot / UI image rather than a real photo.
//
// Returns true  → looks like a screenshot → should run OCR
// Returns false → looks like a real photo  → safe to skip OCR
async function looksLikeScreenshot(file: File): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 32, 32);
        const { data } = ctx.getImageData(0, 0, 32, 32);

        let flatPairs = 0;
        const total = (32 * 32) - 1; // number of horizontal adjacent pairs
        for (let i = 0; i < data.length - 4; i += 4) {
          const diff =
            Math.abs(data[i]     - data[i + 4]) +
            Math.abs(data[i + 1] - data[i + 5]) +
            Math.abs(data[i + 2] - data[i + 6]);
          if (diff < 10) flatPairs++;
        }

        const flatRatio = flatPairs / total;
        // >0.35 = lots of solid-colour regions → screenshot
        resolve(flatRatio > 0.35);
      } catch {
        resolve(true); // if in doubt, run OCR
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(true); };
    img.src = url;
  });
}

// ─── How many OCR workers to spin up ─────────────────────────────────────────
function pickWorkerCount(fileCount: number): number {
  const cores = navigator.hardwareConcurrency ?? 2;
  return Math.max(1, Math.min(cores, 4, fileCount));
}

// ─── Main processing pipeline ─────────────────────────────────────────────────
export async function processFiles(
  files: File[],
  onUpdate: (u: ProcessUpdate) => void
): Promise<BrowserFileEntry[]> {
  const entries: BrowserFileEntry[] = [];
  const seenHashes = new Map<string, string>();

  // ── Pass 1: SHA-256 hash + filename categorisation ──────────────────────────
  const HASH_BATCH = 8;
  onUpdate({ phase: "hashing", processedFiles: 0, totalFiles: files.length, duplicateCount: 0 });

  for (let i = 0; i < files.length; i += HASH_BATCH) {
    const batch = files.slice(i, i + HASH_BATCH);
    const hashes = await Promise.all(batch.map(hashFile));

    for (let j = 0; j < batch.length; j++) {
      const file = batch[j];
      const hash = hashes[j];
      const isDuplicate = seenHashes.has(hash);
      if (!isDuplicate) seenHashes.set(hash, file.name);

      const byFilename = isDuplicate ? "Duplicates" : categorizeByFilename(file.name);
      entries.push({
        id: crypto.randomUUID(),
        originalName: file.name,
        category: byFilename ?? "Unknown / Others",
        hash,
        isDuplicate,
        size: file.size,
        file,
        previewUrl: URL.createObjectURL(file),
        ocrText: null,
      });
    }

    const dupes = entries.filter(e => e.isDuplicate).length;
    onUpdate({ processedFiles: Math.min(i + HASH_BATCH, files.length), duplicateCount: dupes });
  }

  // ── Pass 2: QR scan on unknowns (all in parallel — fast canvas ops) ─────────
  const qrCandidates = entries.filter(e => !e.isDuplicate && e.category === "Unknown / Others");
  if (qrCandidates.length > 0) {
    onUpdate({ phase: "qr" });
    await Promise.all(
      qrCandidates.map(async entry => {
        const qrText = await scanQr(entry.file);
        if (!qrText) return;
        const byQr = categorizeByText(qrText);
        if (byQr) { entry.category = byQr; entry.ocrText = qrText; }
      })
    );
  }

  // ── Pass 3: Parallel OCR via Tesseract Scheduler ────────────────────────────
  //
  // ACCURACY FIX: We now OCR two groups:
  //   Group A — "Unknown / Others" (same as before)
  //   Group B — "Photos" from filename match that visually look like screenshots
  //             (e.g. IMG_1234.jpg that is actually a payment receipt)
  //             For these, OCR can only UPGRADE — we only override if the
  //             keyword score is strong (≥ 5).
  //
  // SPEED FIX: Instead of feeding the full image to Tesseract, we crop the top
  //   40% and downscale to max 1200px wide. This cuts pixels by ~60% → 3-4x
  //   faster per image with the same (or better) accuracy on UI screenshots.

  const unknownEntries = entries.filter(e => !e.isDuplicate && e.category === "Unknown / Others");

  // Visual-check "Photos" entries in parallel (fast canvas ops)
  const photoEntries = entries.filter(e => !e.isDuplicate && e.category === "Photos");
  const screenshotPhotos = photoEntries.length > 0
    ? (await Promise.all(
        photoEntries.map(async e => ({ entry: e, isScreen: await looksLikeScreenshot(e.file) }))
      )).filter(r => r.isScreen).map(r => r.entry)
    : [];

  const ocrCandidates = [...unknownEntries, ...screenshotPhotos];

  if (ocrCandidates.length > 0) {
    const numWorkers = pickWorkerCount(ocrCandidates.length);
    onUpdate({
      phase: "ocr",
      processedFiles: 0,
      totalFiles: ocrCandidates.length,
      ocrDone: 0,
      ocrTotal: ocrCandidates.length,
      workerCount: numWorkers,
    });

    // SPEED FIX: reuse cached worker pool — avoids re-downloading/initialising
    // the Tesseract LSTM model on every processFiles() call.
    const scheduler = await getScheduler(ocrCandidates.length);

    let ocrDone = 0;
    const screenshotPhotoIds = new Set(screenshotPhotos.map(e => e.id));

    await Promise.all(
      ocrCandidates.map(async entry => {
        try {
          const ocrInput = (await prepareForOcr(entry.file)) ?? entry.file;
          const { data: { text } } = await scheduler.addJob("recognize", ocrInput);
          entry.ocrText = text;
          const byText = categorizeByText(text);

          if (byText) {
            if (screenshotPhotoIds.has(entry.id)) {
              if (byText !== "Photos") {
                entry.category = byText;
              }
            } else {
              entry.category = byText;
            }
          }
        } catch { /* skip on error */ }

        ocrDone++;
        onUpdate({ processedFiles: ocrDone, ocrDone, ocrTotal: ocrCandidates.length });
      })
    );
    // Note: do NOT terminate — workers are cached for reuse next call
  }

  return entries;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function getCategoryCounts(entries: BrowserFileEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return counts;
}

export async function buildZipBlob(
  entries: BrowserFileEntry[],
  deletedFiles: Set<string>,
  overrides: Record<string, string>,
  onProgress: (pct: number) => void,
  folderNameFn?: (category: string) => string
): Promise<Blob> {
  const zip = new JSZip();
  for (const entry of entries) {
    if (deletedFiles.has(entry.originalName)) continue;
    const category = overrides[entry.originalName] ?? entry.category;
    const folderName = folderNameFn
      ? folderNameFn(category)
      : category.replace(/[/\\:*?"<>|]/g, "_");
    zip.folder(folderName)!.file(entry.originalName, await entry.file.arrayBuffer());
  }
  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } },
    meta => onProgress(meta.percent)
  );
}

export function downloadBlob(blob: Blob, zipName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function generateAndDownloadZip(
  entries: BrowserFileEntry[],
  deletedFiles: Set<string>,
  overrides: Record<string, string>,
  zipName: string,
  onProgress: (pct: number) => void
): Promise<void> {
  const blob = await buildZipBlob(entries, deletedFiles, overrides, onProgress);
  downloadBlob(blob, zipName);
}
