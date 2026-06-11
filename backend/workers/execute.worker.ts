import { Worker } from "bullmq";
import { connection } from "../queue/redis";

import { db } from "../db";
import { Jobs } from "../db/schema";
import { eq } from "drizzle-orm";
import { executeService } from "../services/execute.service";

new Worker(
  "code-execution",
  async (job) => {
    const { id, language, code } = job.data;
    try {
      console.log("Worker received job:", id);
      await db
        .update(Jobs)
        .set({
          status: "running",
          updatedAt: new Date(),
        })
        .where(eq(Jobs.id, id));

      const response = await executeService(language, code);

      await db
        .update(Jobs)
        .set({
          status: "completed",
          output: response.stdout,
          error: response.stderr || null,
          runtime: response.runtime,
          updatedAt: new Date(),
        })
        .where(eq(Jobs.id, id));
    } catch (err: any) {
      const errorMsg = err || String(err);

      await db
        .update(Jobs)
        .set({
          status: "failed",
          error: errorMsg,
          updatedAt: new Date(),
        })
        .where(eq(Jobs.id, id));
    }
  },
  {
    connection,
    concurrency: 2,
  },
);
