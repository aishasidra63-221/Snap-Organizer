export interface JobHistoryEntry {
  jobId: string;
  totalFiles: number;
  duplicateCount: number;
  ocrCount: number;
  createdAt: string;
  categoryCounts: Record<string, number>;
}

const LS_KEY = "sv_job_history_v2";
const MAX = 50;

export function loadHistory(): JobHistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as JobHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendToHistory(entry: JobHistoryEntry): void {
  const history = loadHistory();
  const updated = [entry, ...history.filter(j => j.jobId !== entry.jobId)].slice(0, MAX);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch {
    // storage quota — silently skip
  }
}

export function clearHistory(): void {
  localStorage.removeItem(LS_KEY);
}

export function getAggregateStats(history: JobHistoryEntry[]) {
  let totalCleaned = 0;
  let totalDuplicates = 0;
  let totalOcr = 0;
  const totalCategoryCounts: Record<string, number> = {};

  for (const job of history) {
    totalCleaned += job.totalFiles;
    totalDuplicates += job.duplicateCount;
    totalOcr += job.ocrCount;
    for (const [cat, count] of Object.entries(job.categoryCounts)) {
      totalCategoryCounts[cat] = (totalCategoryCounts[cat] ?? 0) + count;
    }
  }

  return {
    totalCleaned,
    totalDuplicates,
    jobsRun: history.length,
    totalOcr,
    totalCategoryCounts,
  };
}
