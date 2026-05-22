export interface UploadResult {
  jobId: string;
  totalFiles: number;
  status: string;
}

export async function uploadFiles(
  files: File[],
  onProgress?: (sent: number, total: number) => void
): Promise<UploadResult> {
  const CHUNK = 100;
  let jobId: string | null = null;
  let totalFiles = 0;

  for (let i = 0; i < files.length; i += CHUNK) {
    const slice = files.slice(i, i + CHUNK);
    const fd = new FormData();
    for (const f of slice) {
      fd.append("files", f);
    }
    if (jobId) {
      fd.append("jobId", jobId);
    }

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${base}/api/upload`, { method: "POST", body: fd });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error((err as { error?: string }).error ?? "Upload failed");
    }

    const data: UploadResult = await res.json();
    jobId = data.jobId;
    totalFiles += slice.length;
    onProgress?.(Math.min(i + CHUNK, files.length), files.length);
  }

  return { jobId: jobId!, totalFiles, status: "processing" };
}
