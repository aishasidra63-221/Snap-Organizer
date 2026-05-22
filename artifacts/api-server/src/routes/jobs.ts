import { Router } from "express";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { getJob, updateJob, deleteJob, type FileEntry } from "../lib/jobStore.js";

const router = Router();

router.get("/jobs/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({
    jobId: job.jobId,
    status: job.status,
    totalFiles: job.totalFiles,
    processedFiles: job.processedFiles,
    duplicateCount: job.duplicateCount,
    createdAt: job.createdAt,
    zipReady: job.zipReady,
    errorMessage: job.errorMessage ?? null,
  });
});

router.get("/jobs/:jobId/categories", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const grouped = new Map<string, FileEntry[]>();
  for (const file of job.files) {
    const cat = file.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(file);
  }

  const categories = Array.from(grouped.entries()).map(([category, files]) => ({
    category,
    count: files.length,
    files: files.map((f) => ({
      filename: f.filename,
      originalName: f.originalName,
      category: f.category,
      hash: f.hash,
      isDuplicate: f.isDuplicate,
      size: f.size,
    })),
  }));

  res.json({
    jobId: job.jobId,
    categories,
    totalFiles: job.totalFiles,
    duplicateCount: job.duplicateCount,
  });
});

router.post("/jobs/:jobId/confirm", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status !== "awaiting_confirmation") {
    res.status(400).json({ error: `Job is not ready for confirmation (status: ${job.status})` });
    return;
  }

  const overrides: Record<string, string> = req.body?.categoryOverrides ?? {};

  updateJob(job.jobId, { status: "zipping" });

  setImmediate(async () => {
    try {
      const zip = new JSZip();

      for (const file of job.files) {
        if (!fs.existsSync(file.tempPath)) continue;

        const category = overrides[file.originalName] ?? file.category;
        const folderName = category.replace(/[/\\?%*:|"<>]/g, "-");
        const fileData = fs.readFileSync(file.tempPath);
        zip.folder(folderName)?.file(file.originalName, fileData);
      }

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const zipPath = path.join(job.uploadDir, "snapvault-organized.zip");
      fs.writeFileSync(zipPath, zipBuffer);

      updateJob(job.jobId, {
        status: "ready",
        zipReady: true,
        zipPath,
      });
    } catch (e) {
      updateJob(job.jobId, {
        status: "error",
        errorMessage: e instanceof Error ? e.message : "ZIP creation failed",
      });
    }
  });

  res.json({
    jobId: job.jobId,
    status: "zipping",
    message: "Processing started — poll job status until ready",
  });
});

router.get("/jobs/:jobId/download", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (!job.zipReady || !job.zipPath) {
    res.status(400).json({ error: "ZIP is not ready yet" });
    return;
  }

  if (!fs.existsSync(job.zipPath)) {
    res.status(404).json({ error: "ZIP file not found" });
    return;
  }

  res.download(job.zipPath, "snapvault-organized.zip");
});

router.delete("/jobs/:jobId/cleanup", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  try {
    if (fs.existsSync(job.uploadDir)) {
      fs.rmSync(job.uploadDir, { recursive: true, force: true });
    }
    deleteJob(job.jobId);
    res.json({ jobId: job.jobId, deleted: true, message: "Cleaned up successfully" });
  } catch (e) {
    res.status(500).json({ error: "Cleanup failed" });
  }
});

router.get("/jobs/:jobId/stats", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const categoryCounts: Record<string, number> = {};
  for (const file of job.files) {
    categoryCounts[file.category] = (categoryCounts[file.category] ?? 0) + 1;
  }

  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown / Others";

  let zipSizeBytes: number | null = null;
  if (job.zipPath && fs.existsSync(job.zipPath)) {
    zipSizeBytes = fs.statSync(job.zipPath).size;
  }

  res.json({
    jobId: job.jobId,
    totalFiles: job.totalFiles,
    duplicateCount: job.duplicateCount,
    categoryCounts,
    topCategory,
    zipSizeBytes,
  });
});

export default router;
