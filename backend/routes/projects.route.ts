import { Router } from "express";
import {
  createFile,
  createProject,
  deleteFile,
  getProject,
  listProjects,
  renameProject,
  updateFile,
} from "../controllers/projects.controller";
import { verifyJwt } from "../middleware/verifyJwt";

const projectsRouter = Router();

projectsRouter.use(verifyJwt);
projectsRouter.get("/projects", listProjects);
projectsRouter.post("/projects", createProject);
projectsRouter.patch("/projects/:projectId", renameProject);
projectsRouter.get("/projects/:projectId", getProject);
projectsRouter.post("/projects/:projectId/files", createFile);
projectsRouter.patch("/projects/:projectId/files/:fileId", updateFile);
projectsRouter.delete("/projects/:projectId/files/:fileId", deleteFile);

export default projectsRouter;
