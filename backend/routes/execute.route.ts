import { Router } from "express";
const router = Router();

import { executeController } from "../controllers/execute.controller";
import { getJobController } from "../controllers/getJob.controller";

router.post('/execute', executeController);
router.get('/execute/:jobId', getJobController);

export default router;