import crypto from "crypto";
import { db } from "../db";
import { codeQueue } from "../queue/codeQueue";

import { supportedLanguage } from "../types";
import { Jobs } from "../db/schema";

export const addJob = async (
  language: supportedLanguage,
  code: string,
): Promise<string> => {
  const jobId = crypto.randomUUID();

  await db.insert(Jobs).values({
    id: jobId,
    language,
    code,
    status: "queued",
    createdAt: new Date(),
  });

  codeQueue.add("execute", {
    id: jobId,
    language,
    code,
  },{
    removeOnComplete:100,
    removeOnFail:100
  });

  return jobId;
};
