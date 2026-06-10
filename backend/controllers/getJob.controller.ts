import { Request, Response } from "express";
import { getJobService } from "../services/getJob.service";

export const getJobController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    if (!jobId) {
      res.status(400).json({ message: "Invalid job id" });
      return;
    }

    const job = await getJobService(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
