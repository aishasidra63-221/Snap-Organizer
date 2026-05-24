import path from "path";
import os from "os";

export type JobStatus =
  | "uploading"
  | "processing"
  | "awaiting_confirmation"
  | "zipping"
  | "ready"
  | "error";

export interface FileEntry {
  filename: string;
  originalName: string;
  category: string;
  hash: string;
  isDuplicate: boolean;
  size: number;
  tempPath: string;
  ocrText?: string | null;
}

export interface Job {
  jobId: string;
  status: JobStatus;
  totalFiles: number;
  processedFiles: number;
  duplicateCount: number;
  ocrCount: number;
  createdAt: string;
  completedAt: string | null;
  zipReady: boolean;
  errorMessage: string | null;
  files: FileEntry[];
  zipPath: string | null;
  uploadDir: string;
}

const MAX_JOBS = 20;
const jobs = new Map<string, Job>();

export function createJob(jobId: string, uploadDir: string): Job {
  // Enforce 20-job cap — evict the oldest job when limit is reached
  if (jobs.size >= MAX_JOBS) {
    const oldest = Array.from(jobs.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
    if (oldest) jobs.delete(oldest.jobId);
  }

  const job: Job = {
    jobId,
    status: "uploading",
    totalFiles: 0,
    processedFiles: 0,
    duplicateCount: 0,
    ocrCount: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    zipReady: false,
    errorMessage: null,
    files: [],
    zipPath: null,
    uploadDir,
  };
  jobs.set(jobId, job);
  return job;
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function updateJob(jobId: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;
  Object.assign(job, updates);
  return job;
}

export function deleteJob(jobId: string): boolean {
  return jobs.delete(jobId);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUploadDir(jobId: string): string {
  return path.join(os.tmpdir(), "snapvault", jobId);
}
