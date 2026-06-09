import crypto from "crypto";
import { executeService } from "../services/execute.service";

import { Job , supportedLanguage} from "../types";

const jobQueue: Job[] = [];

let MAX_CONCURRENCY = 2;
let active_jobs = 0;

export const addJob = (language: supportedLanguage, code: string) => {
  return new Promise((resolve, reject) => {
    jobQueue.push({
      id: crypto.randomUUID(),
      language,
      code,
      resolve,
      reject,
    });

    processQueue();
  });
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
    const response = await executeService(job.language, job.code);
    job.resolve(response);
  } catch (err) {
    job.reject(err);
  } finally {
    active_jobs--;
    processQueue();
  }
};
