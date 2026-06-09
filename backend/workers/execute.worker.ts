import crypto from "crypto";
import { executeService } from "../services/execute.service";
import { query } from "../db";

import { Job , supportedLanguage } from "../types";

const jobQueue: Job[] = [];

let MAX_CONCURRENCY = 2;
let active_jobs = 0;

export const addJob = async (language: supportedLanguage, code: string): Promise<string> => {
  const jobId = crypto.randomUUID();

  await query(
    `INSERT INTO jobs (id, language, code, status) VALUES ($1, $2, $3, $4)`,
    [jobId, language, code, "queued"]
  );

  jobQueue.push({
    id: jobId,
    language,
    code,
  });

  processQueue();

  return jobId;
};

const processQueue = () => {
  while (active_jobs < MAX_CONCURRENCY && jobQueue.length > 0) {
    let job = jobQueue.shift();

    if (!job) return;

    active_jobs++;

    executeJob(job);
  }
};

const executeJob = async (job: Job) => {
  try {
    await query(
      `UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ["running", job.id]
    );

    const response = await executeService(job.language, job.code);

    await query(
      `UPDATE jobs SET status = $1, output = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      ["completed", response, job.id]
    );
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    await query(
      `UPDATE jobs SET status = $1, error = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      ["failed", errorMsg, job.id]
    );
  } finally {
    active_jobs--;
    processQueue();
  }
};
