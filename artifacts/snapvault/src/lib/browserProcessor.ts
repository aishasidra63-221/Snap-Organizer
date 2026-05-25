import jsQR from "jsqr";
import { createWorker, createScheduler } from "tesseract.js";
import JSZip from "jszip";
import { categorizeByFilename, categorizeByText } from "./categorizer";

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

// ─── QR scanning (canvas, runs on main thread but is fast) ───────────────────
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

// ─── How many OCR workers to spin up ─────────────────────────────────────────
// Cap at 4 — beyond that memory pressure outweighs the gains.
// Also cap at the number of files so we don't over-provision.
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
  // Hashes in parallel batches of 8 — keeps memory manageable on mobile.
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
  const ocrCandidates = entries.filter(e => !e.isDuplicate && e.category === "Unknown / Others");
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

    // Build scheduler with N parallel workers
    const scheduler = createScheduler();
    const workerInits = Array.from({ length: numWorkers }, () =>
      createWorker("eng", 1, { logger: () => {} } as Parameters<typeof createWorker>[2])
    );
    const workers = await Promise.all(workerInits);
    workers.forEach(w => scheduler.addWorker(w));

    let ocrDone = 0;

    await Promise.all(
      ocrCandidates.map(async entry => {
        try {
          // scheduler.addJob automatically routes to the next free worker
          const { data: { text } } = await scheduler.addJob("recognize", entry.file);
          entry.ocrText = text;
          const byText = categorizeByText(text);
          if (byText) entry.category = byText;
        } catch { /* skip on error */ }

        ocrDone++;
        onUpdate({ processedFiles: ocrDone, ocrDone, ocrTotal: ocrCandidates.length });
      })
    );

    await scheduler.terminate(); // terminates all workers cleanly
  }

  return entries;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function getCategoryCounts(entries: BrowserFileEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return counts;
}

/** Build the ZIP blob without triggering a download. Useful for pre-building so the size is known upfront. */
export async function buildZipBlob(
  entries: BrowserFileEntry[],
  deletedFiles: Set<string>,
  overrides: Record<string, string>,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  for (const entry of entries) {
    if (deletedFiles.has(entry.originalName)) continue;
    const category = overrides[entry.originalName] ?? entry.category;
    const folderName = category.replace(/[/\\:*?"<>|]/g, "_");
    zip.folder(folderName)!.file(entry.originalName, await entry.file.arrayBuffer());
  }
  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } },
    meta => onProgress(meta.percent)
  );
}

/** Trigger a browser download from a pre-built Blob. */
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

/** Convenience: build then immediately download. */
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
