import { Router } from "express";
const router = Router();

import { executeController, getJobController } from "../controllers/execute.controller";

router.post('/execute', executeController);
router.get('/execute/:jobId', getJobController);

export default router;