import { Router } from "express";
const executeRouter = Router();

import { executeController } from "../controllers/execute.controller";
import { getJobController } from "../controllers/getJob.controller";

executeRouter.post('/execute', executeController);
executeRouter.get('/execute/:jobId', getJobController);

export default executeRouter;