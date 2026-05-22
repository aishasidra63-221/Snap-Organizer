import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { createJob, updateJob, getUploadDir } from "../lib/jobStore.js";
import { categorizeByFilename } from "../lib/categorizer.js";

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
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
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

  upload.array("files", 600)(req, res, (err) => {
    if (err) {
      return next(err);
    }

    const files = (req as { files?: Express.Multer.File[] }).files ?? [];

    if (!files.length) {
      res.status(400).json({ error: "No image files were uploaded" });
      return;
    }

    const job = updateJob(jobId, {
      status: "processing",
      totalFiles: files.length,
    });

    if (!job) {
      res.status(500).json({ error: "Job creation failed" });
      return;
    }

    setImmediate(() => {
      try {
        const seenHashes = new Map<string, string>();
        const fileEntries = [];

        for (const file of files) {
          const hash = hashFile(file.path);
          const isDuplicate = seenHashes.has(hash);

          if (!isDuplicate) {
            seenHashes.set(hash, file.originalname);
          }

          const category = isDuplicate
            ? "Duplicates"
            : categorizeByFilename(file.originalname);

          fileEntries.push({
            filename: file.filename,
            originalName: file.originalname,
            category,
            hash,
            isDuplicate,
            size: file.size,
            tempPath: file.path,
          });
        }

        const duplicateCount = fileEntries.filter((f) => f.isDuplicate).length;

        updateJob(jobId, {
          status: "awaiting_confirmation",
          processedFiles: fileEntries.length,
          duplicateCount,
          files: fileEntries,
        });
      } catch (e) {
        updateJob(jobId, {
          status: "error",
          errorMessage: e instanceof Error ? e.message : "Processing failed",
        });
      }
    });

    res.status(201).json({
      jobId,
      totalFiles: files.length,
      status: "processing",
    });
  });
});

export default router;
