import { eq } from "drizzle-orm";
import { db } from "../db";
import { Jobs } from "../db/schema";

export const getJobService = async (jobId: string) => {
  try {
    const job = await db.query.Jobs.findFirst({
      where: eq(Jobs.id, jobId),
    });

    return job;
  } catch (err) {
    console.log(err);
  }
};
