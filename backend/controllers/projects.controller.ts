import { Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

import { db } from "../db";
import { Files, Projects } from "../db/schema";

const languageSchema = z.enum(["javascript", "python", "java", "cpp"]);
const fileCreateSchema = z.object({
  fileName: z.string().trim().min(1),
  language: languageSchema,
  code: z.string().max(50000),
});
const projectSchema = z.object({ projectName: z.string().trim().min(1) });
const projectCreateSchema = projectSchema.extend({
  initialFile: fileCreateSchema.optional(),
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

const getUniqueFileName = (
  requestedName: string,
  files: Array<{ id: string; fileName: string }>,
  excludedFileId?: string,
) => {
  const existingNames = new Set(
    files
      .filter((file) => file.id !== excludedFileId)
      .map((file) => file.fileName.toLocaleLowerCase()),
  );

  if (!existingNames.has(requestedName.toLocaleLowerCase())) return requestedName;

  const dotIndex = requestedName.lastIndexOf(".");
  const extension = dotIndex > 0 ? requestedName.slice(dotIndex) : "";
  const stem = dotIndex > 0 ? requestedName.slice(0, dotIndex) : requestedName;
  const numberedStem = stem.match(/^(.*?)(\d+)$/);
  const baseStem = numberedStem?.[1] || stem;
  let suffix = numberedStem ? Math.max(Number(numberedStem[2]) + 1, 2) : 2;
  let candidate = `${baseStem}${suffix}${extension}`;

  while (existingNames.has(candidate.toLocaleLowerCase())) {
    suffix += 1;
    candidate = `${baseStem}${suffix}${extension}`;
  }

  return candidate;
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

  const parsed = projectCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid project payload", errors: parsed.error.flatten() });
    return;
  }

  const result = await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(Projects)
      .values({ id: randomUUID(), userId, projectName: parsed.data.projectName })
      .returning();

    if (!parsed.data.initialFile) return { project, file: null };

    const [file] = await tx
      .insert(Files)
      .values({
        id: randomUUID(),
        projectId: project.id,
        ...parsed.data.initialFile,
      })
      .returning();

    return { project, file };
  });

  res.status(201).json(result);
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

export const deleteProject = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const projectId = routeParam(req.params.projectId);
  const project = await getOwnedProject(projectId, userId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  await db.transaction(async (tx) => {
    await tx.delete(Files).where(eq(Files.projectId, project.id));
    await tx
      .delete(Projects)
      .where(and(eq(Projects.id, project.id), eq(Projects.userId, userId)));
  });

  res.status(204).send();
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

  const file = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${project.id}))`);
    const existingFiles = await tx
      .select({ id: Files.id, fileName: Files.fileName })
      .from(Files)
      .where(eq(Files.projectId, project.id));
    const fileName = getUniqueFileName(parsed.data.fileName, existingFiles);

    const [createdFile] = await tx
      .insert(Files)
      .values({ id: randomUUID(), projectId: project.id, ...parsed.data, fileName })
      .returning();
    return createdFile;
  });
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

  const fileId = routeParam(req.params.fileId);
  const file = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${project.id}))`);
    let patch = parsed.data;

    if (parsed.data.fileName) {
      const existingFiles = await tx
        .select({ id: Files.id, fileName: Files.fileName })
        .from(Files)
        .where(eq(Files.projectId, project.id));
      patch = {
        ...parsed.data,
        fileName: getUniqueFileName(parsed.data.fileName, existingFiles, fileId),
      };
    }

    const [updatedFile] = await tx
      .update(Files)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(Files.id, fileId), eq(Files.projectId, project.id)))
      .returning();
    return updatedFile;
  });

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
