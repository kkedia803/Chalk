import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

import { db } from "../db";
import { Files, Projects } from "../db/schema";

const languageSchema = z.enum(["javascript", "python", "java", "cpp"]);
const projectSchema = z.object({ projectName: z.string().trim().min(1) });
const fileCreateSchema = z.object({
  fileName: z.string().trim().min(1),
  language: languageSchema,
  code: z.string().max(50000),
});
const filePatchSchema = fileCreateSchema.partial().refine((value) => Object.keys(value).length > 0);

const routeParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value ?? "";

const requireUserId = (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }
  return req.userId;
};

const getOwnedProject = async (projectId: string, userId: string) => {
  const [project] = await db
    .select()
    .from(Projects)
    .where(and(eq(Projects.id, projectId), eq(Projects.userId, userId)))
    .limit(1);
  return project;
};

export const listProjects = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const projects = await db.select().from(Projects).where(eq(Projects.userId, userId));
  res.json({ projects });
};

export const createProject = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid project payload", errors: parsed.error.flatten() });
    return;
  }

  const [project] = await db
    .insert(Projects)
    .values({ id: randomUUID(), userId, projectName: parsed.data.projectName })
    .returning();
  res.status(201).json({ project });
};

export const renameProject = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid project payload", errors: parsed.error.flatten() });
    return;
  }

  const [project] = await db
    .update(Projects)
    .set({ projectName: parsed.data.projectName })
    .where(and(eq(Projects.id, routeParam(req.params.projectId)), eq(Projects.userId, userId)))
    .returning();

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  res.json({ project });
};

export const getProject = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const project = await getOwnedProject(routeParam(req.params.projectId), userId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const files = await db.select().from(Files).where(eq(Files.projectId, project.id));
  res.json({ project, files });
};

export const createFile = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const project = await getOwnedProject(routeParam(req.params.projectId), userId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const parsed = fileCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid file payload", errors: parsed.error.flatten() });
    return;
  }

  const [file] = await db
    .insert(Files)
    .values({ id: randomUUID(), projectId: project.id, ...parsed.data })
    .returning();
  res.status(201).json({ file });
};

export const updateFile = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const project = await getOwnedProject(routeParam(req.params.projectId), userId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const parsed = filePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid file payload", errors: parsed.error.flatten() });
    return;
  }

  const [file] = await db
    .update(Files)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(Files.id, routeParam(req.params.fileId)), eq(Files.projectId, project.id)))
    .returning();

  if (!file) {
    res.status(404).json({ message: "File not found" });
    return;
  }

  res.json({ file });
};

export const deleteFile = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const project = await getOwnedProject(routeParam(req.params.projectId), userId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const [file] = await db
    .delete(Files)
    .where(and(eq(Files.id, routeParam(req.params.fileId)), eq(Files.projectId, project.id)))
    .returning();

  if (!file) {
    res.status(404).json({ message: "File not found" });
    return;
  }

  res.status(204).send();
};
