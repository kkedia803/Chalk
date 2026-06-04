import { Router } from "express";
const router = Router();

import { executeController } from "../controllers/execute.controller";

router.post('/execute', executeController)

export default router;