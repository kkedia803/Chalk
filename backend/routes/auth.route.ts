import { Router } from "express";
const authRouter = Router();

import { loginController, logoutController } from "../controllers/login.controller";

authRouter.post('/', loginController)
authRouter.post('/logout', logoutController)

export default authRouter;
