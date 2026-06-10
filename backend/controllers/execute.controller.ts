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

