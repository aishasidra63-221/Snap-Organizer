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
}

export interface Job {
  jobId: string;
  status: JobStatus;
  totalFiles: number;
  processedFiles: number;
  duplicateCount: number;
  createdAt: string;
  zipReady: boolean;
  errorMessage: string | null;
  files: FileEntry[];
  zipPath: string | null;
  uploadDir: string;
}

const jobs = new Map<string, Job>();

export function createJob(jobId: string, uploadDir: string): Job {
  const job: Job = {
    jobId,
    status: "uploading",
    totalFiles: 0,
    processedFiles: 0,
    duplicateCount: 0,
    createdAt: new Date().toISOString(),
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

export function getUploadDir(jobId: string): string {
  return path.join(os.tmpdir(), "snapvault", jobId);
}
