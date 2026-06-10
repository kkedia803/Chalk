import { Request, Response } from "express";
import { z } from "zod";

import { addJob } from "../workers/execute.worker";

const executeSchema = z.object({
  language: z.enum(["javascript","python","java","cpp"]),
  code: z.string().min(1, "code is required").max(50000, "code is too long"),
});

export const executeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedBody = executeSchema.parse(req.body);
        const { language, code } = validatedBody;

        const jobId = await addJob(language, code);

        res.status(200).json({ jobId });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.issues });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

import { query } from "../db";

export const getJobController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;
        const result = await query("SELECT id, language, status, output, error, created_at, updated_at FROM jobs WHERE id = $1", [jobId]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
