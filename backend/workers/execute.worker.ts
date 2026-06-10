import crypto from "crypto";
import { executeService } from "../services/execute.service";
import { db } from "../db";

import { Job , supportedLanguage } from "../types";
import { Jobs } from "../db/schema";
import { eq } from "drizzle-orm";

const jobQueue: Job[] = [];

let MAX_CONCURRENCY = 2;
let active_jobs = 0;

export const addJob = async (language: supportedLanguage, code: string): Promise<string> => {
  const jobId = crypto.randomUUID();

  await db.insert(Jobs).values({
    id:jobId,
    language,
    code,
    status:"queued",
    createdAt:new Date(),
  })

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

    await db.update(Jobs).set({
      status:"running",
      updatedAt:new Date(),
    })
    .where(eq(Jobs.id, job.id))

    const response = await executeService(job.language, job.code);

    await db.update(Jobs).set({
      status:"completed",
      output:response,
      updatedAt:new Date(),
    })
    .where(eq(Jobs.id,job.id))

  } catch (err: any) {

    const errorMsg = err?.message || String(err);
 
    await db.update(Jobs).set({
      status:"failed",
      error:errorMsg,
      updatedAt:new Date(),
    })
    .where(eq(Jobs.id,job.id))

  } finally {
    active_jobs--;
    processQueue();
  }
};
