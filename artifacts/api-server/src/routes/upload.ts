import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { createJob, updateJob, getUploadDir, getJob } from "../lib/jobStore.js";
import { categorizeByFilename, categorizeByText } from "../lib/categorizer.js";
import { runOcrBatch } from "../lib/ocr.js";
import { scanQrCode } from "../lib/qr.js";
import { logger } from "../lib/logger.js";

const router = Router();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const jobId = (_req as { jobId?: string }).jobId ?? "unknown";
    const uploadDir = getUploadDir(jobId);
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 600 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_MIME.has(file.mimetype));
  },
});

function hashFile(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

router.post("/upload", (req, res, next) => {
  const jobId = uuidv4();
  (req as { jobId?: string }).jobId = jobId;
  const uploadDir = getUploadDir(jobId);
  ensureDir(uploadDir);
  createJob(jobId, uploadDir);

  upload.array("files", 600)(req, res, async (err) => {
    if (err) return next(err);

    const files = (req as { files?: Express.Multer.File[] }).files ?? [];

    if (!files.length) {
      res.status(400).json({ error: "No image files were uploaded" });
      return;
    }

    updateJob(jobId, { status: "processing", totalFiles: files.length });

    // Respond immediately — processing continues in background
    res.status(201).json({ jobId, totalFiles: files.length, status: "processing" });

    // ── Background processing ──────────────────────────────────────────────
    try {
      // Pass 1: hash + filename categorization (sync, fast)
      const seenHashes = new Map<string, string>();
      const fileEntries: {
        filename: string;
        originalName: string;
        category: string;
        hash: string;
        isDuplicate: boolean;
        size: number;
        tempPath: string;
        needsOcr: boolean;
        entryIndex: number;
        ocrText?: string | null;
      }[] = [];

      for (const file of files) {
        const hash = hashFile(file.path);
        const isDuplicate = seenHashes.has(hash);
        if (!isDuplicate) seenHashes.set(hash, file.originalname);

        const byFilename = isDuplicate ? "Duplicates" : categorizeByFilename(file.originalname);
        const needsOcr = !isDuplicate && byFilename === null;

        fileEntries.push({
          filename: file.filename,
          originalName: file.originalname,
          category: byFilename ?? "Unknown / Others",
          hash,
          isDuplicate,
          size: file.size,
          tempPath: file.path,
          needsOcr,
          entryIndex: fileEntries.length,
        });
      }

      const duplicateCount = fileEntries.filter(f => f.isDuplicate).length;

      // After pass 1 — store initial results and mark progress
      updateJob(jobId, {
        processedFiles: fileEntries.filter(f => !f.needsOcr).length,
        duplicateCount,
        files: fileEntries.map(f => ({
          filename: f.filename,
          originalName: f.originalName,
          category: f.category,
          hash: f.hash,
          isDuplicate: f.isDuplicate,
          size: f.size,
          tempPath: f.tempPath,
          ocrText: f.ocrText ?? null,
        })),
      });

      // Pass 2: QR scan on unknowns — fast, runs before expensive OCR
      const qrCandidates = fileEntries.filter(f => f.needsOcr);
      if (qrCandidates.length > 0) {
        logger.info({ count: qrCandidates.length, jobId }, "Starting QR scan pass");
        await Promise.all(
          qrCandidates.map(async (entry) => {
            const qrText = await scanQrCode(entry.tempPath);
            if (!qrText) return;
            const byQr = categorizeByText(qrText);
            if (byQr) {
              entry.category = byQr;
              entry.needsOcr = false;
              entry.ocrText = qrText;
              logger.info({ file: entry.originalName, category: byQr }, "QR classified");
            }
            // No keyword match — leave needsOcr=true so OCR still runs
          })
        );
        logger.info({ jobId }, "QR scan pass complete");
      }

      // Pass 3: OCR on files still unclassified after QR
      const ocrCandidates = fileEntries.filter(f => f.needsOcr);
      if (ocrCandidates.length > 0) {
        logger.info({ count: ocrCandidates.length, jobId }, "Starting OCR pass");

        const ocrItems = ocrCandidates.map(f => ({
          filePath: f.tempPath,
          index: f.entryIndex,
        }));

        let ocrDone = 0;
        const ocrResults = await runOcrBatch(ocrItems, () => {
          ocrDone++;
          // Update processedFiles incrementally so the frontend progress bar moves
          const job = updateJob(jobId, {
            processedFiles: fileEntries.length - ocrCandidates.length + ocrDone,
          });
          if (!job) return;
        });

        // Apply OCR reclassification
        for (const [entryIndex, text] of ocrResults.entries()) {
          const entry = fileEntries[entryIndex];
          if (!entry || !entry.needsOcr) continue;
          entry.ocrText = text || null;
          const byText = categorizeByText(text);
          if (byText) {
            entry.category = byText;
            logger.info({ file: entry.originalName, category: byText }, "OCR reclassified");
          }
        }

        logger.info({ jobId, ocrRun: ocrCandidates.length }, "OCR pass complete");
      }

      updateJob(jobId, {
        status: "awaiting_confirmation",
        processedFiles: fileEntries.length,
        duplicateCount,
        ocrCount: ocrCandidates.length,
        files: fileEntries.map(f => ({
          filename: f.filename,
          originalName: f.originalName,
          category: f.category,
          hash: f.hash,
          isDuplicate: f.isDuplicate,
          size: f.size,
          tempPath: f.tempPath,
          ocrText: f.ocrText ?? null,
        })),
      });
    } catch (e) {
      logger.error({ err: e, jobId }, "Processing failed");
      updateJob(jobId, {
        status: "error",
        errorMessage: e instanceof Error ? e.message : "Processing failed",
      });
    }
  });
});

export default router;
