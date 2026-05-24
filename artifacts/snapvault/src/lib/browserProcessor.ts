import jsQR from "jsqr";
import { createWorker } from "tesseract.js";
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
}

async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

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

export async function processFiles(
  files: File[],
  onUpdate: (u: ProcessUpdate) => void
): Promise<BrowserFileEntry[]> {
  const entries: BrowserFileEntry[] = [];
  const seenHashes = new Map<string, string>();

  // Pass 1: SHA-256 hash + filename categorisation
  onUpdate({ phase: "hashing", processedFiles: 0, totalFiles: files.length, duplicateCount: 0 });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const hash = await hashFile(file);
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

    const dupes = entries.filter(e => e.isDuplicate).length;
    onUpdate({ processedFiles: i + 1, duplicateCount: dupes });
  }

  // Pass 2: QR scan on unknowns
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

  // Pass 3: OCR on still-unknown files
  const ocrCandidates = entries.filter(e => !e.isDuplicate && e.category === "Unknown / Others");
  if (ocrCandidates.length > 0) {
    onUpdate({ phase: "ocr", processedFiles: 0, totalFiles: ocrCandidates.length, ocrDone: 0, ocrTotal: ocrCandidates.length });
    const worker = await createWorker("eng", 1, { logger: () => {} } as Parameters<typeof createWorker>[2]);
    for (let i = 0; i < ocrCandidates.length; i++) {
      const entry = ocrCandidates[i];
      try {
        const { data: { text } } = await worker.recognize(entry.file);
        entry.ocrText = text;
        const byText = categorizeByText(text);
        if (byText) entry.category = byText;
      } catch { /* skip failed OCR */ }
      onUpdate({ processedFiles: i + 1, ocrDone: i + 1, ocrTotal: ocrCandidates.length });
    }
    await worker.terminate();
  }

  return entries;
}

export function getCategoryCounts(entries: BrowserFileEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.category] = (counts[e.category] ?? 0) + 1;
  return counts;
}

export async function generateAndDownloadZip(
  entries: BrowserFileEntry[],
  deletedFiles: Set<string>,
  overrides: Record<string, string>,
  zipName: string,
  onProgress: (pct: number) => void
): Promise<void> {
  const zip = new JSZip();
  for (const entry of entries) {
    if (deletedFiles.has(entry.originalName)) continue;
    const category = overrides[entry.originalName] ?? entry.category;
    const folderName = category.replace(/[/\\:*?"<>|]/g, "_");
    zip.folder(folderName)!.file(entry.originalName, await entry.file.arrayBuffer());
  }
  const blob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } },
    meta => onProgress(meta.percent)
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
