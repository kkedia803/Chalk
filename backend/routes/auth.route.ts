import { Router } from "express";
const authRouter = Router();

import { loginController } from "../controllers/login.controller";

authRouter.post('/', loginController)

export default authRouter;