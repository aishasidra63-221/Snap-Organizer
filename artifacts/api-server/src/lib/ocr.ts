import { createWorker } from "tesseract.js";
import { logger } from "./logger.js";

const CONCURRENCY = 3;

export async function runOcrBatch(
  items: { filePath: string; index: number }[],
  onProgress?: (done: number) => void
): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  let done = 0;

  const workers = await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, () =>
      createWorker("eng", 1, {
        logger: () => {},
        errorHandler: () => {},
      })
    )
  );

  const queue = [...items];

  const runWorker = async (worker: Awaited<ReturnType<typeof createWorker>>) => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        const {
          data: { text },
        } = await worker.recognize(item.filePath);
        results.set(item.index, text.toLowerCase());
      } catch (e) {
        logger.warn({ err: e, filePath: item.filePath }, "OCR failed for file");
        results.set(item.index, "");
      }
      done++;
      onProgress?.(done);
    }
  };

  await Promise.all(workers.map((w) => runWorker(w)));
  await Promise.all(workers.map((w) => w.terminate()));

  return results;
}
