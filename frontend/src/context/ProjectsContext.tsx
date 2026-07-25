/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Language, Project, ProjectFile } from "../types";
import { useAuth } from "./AuthContext";

type ProjectDetail = {
  project: Project;
  files: ProjectFile[];
};

type InitialFile = {
  fileName: string;
  language: Language;
  code: string;
};

type ProjectsContextValue = {
  projects: Project[] | null;
  projectsLoading: boolean;
  projectDetails: Record<string, ProjectDetail>;
  loadingProjectIds: Set<string>;
  loadProjects: (force?: boolean) => Promise<Project[]>;
  loadProject: (projectId: string, force?: boolean) => Promise<ProjectDetail>;
  createProject: (projectName: string, initialFile?: InitialFile) => Promise<{ project: Project; file: ProjectFile | null }>;
  renameProject: (projectId: string, projectName: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  createFile: (projectId: string, file: InitialFile) => Promise<ProjectFile>;
  updateFile: (projectId: string, fileId: string, patch: Partial<InitialFile>) => Promise<ProjectFile>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("chalkToken") ?? ""}`,
});

const apiRequest = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? `Request failed (${response.status})`);
  }

  return response.status === 204 ? (undefined as T) : response.json();
};

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState<Record<string, ProjectDetail>>({});
  const [loadingProjectIds, setLoadingProjectIds] = useState<Set<string>>(new Set());
  const projectsRequest = useRef<Promise<Project[]> | null>(null);
  const projectRequests = useRef(new Map<string, Promise<ProjectDetail>>());
  const fileMutationVersions = useRef(new Map<string, number>());
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const nextUserId = userData?.id ?? null;
    if (previousUserId.current !== nextUserId) {
      previousUserId.current = nextUserId;
      setProjects(null);
      setProjectDetails({});
      projectsRequest.current = null;
      projectRequests.current.clear();
    }
  }, [userData?.id]);

  const loadProjects = useCallback(async (force = false) => {
    if (!force && projects) return projects;
    if (!force && projectsRequest.current) return projectsRequest.current;

    setProjectsLoading(true);
    const request = apiRequest<{ projects: Project[] }>("/projects")
      .then((data) => {
        setProjects(data.projects);
        return data.projects;
      })
      .finally(() => {
        projectsRequest.current = null;
        setProjectsLoading(false);
      });

    projectsRequest.current = request;
    return request;
  }, [projects]);

  const loadProject = useCallback(async (projectId: string, force = false) => {
    if (!force && projectDetails[projectId]) return projectDetails[projectId];
    if (!force && projectRequests.current.has(projectId)) return projectRequests.current.get(projectId)!;

    setLoadingProjectIds((current) => new Set(current).add(projectId));
    const request = apiRequest<ProjectDetail>(`/projects/${projectId}`)
      .then((detail) => {
        setProjectDetails((current) => ({ ...current, [projectId]: detail }));
        setProjects((current) => {
          if (!current) return current;
          return current.map((project) => project.id === detail.project.id ? detail.project : project);
        });
        return detail;
      })
      .finally(() => {
        projectRequests.current.delete(projectId);
        setLoadingProjectIds((current) => {
          const next = new Set(current);
          next.delete(projectId);
          return next;
        });
      });

    projectRequests.current.set(projectId, request);
    return request;
  }, [projectDetails]);

  const createProject = useCallback(async (projectName: string, initialFile?: InitialFile) => {
    const result = await apiRequest<{ project: Project; file: ProjectFile | null }>("/projects", {
      method: "POST",
      body: JSON.stringify({ projectName, initialFile }),
    });
    setProjects((current) => [...(current ?? []), result.project]);
    setProjectDetails((current) => ({
      ...current,
      [result.project.id]: { project: result.project, files: result.file ? [result.file] : [] },
    }));
    return result;
  }, []);

  const renameProject = useCallback(async (projectId: string, projectName: string) => {
    let previousName = "";
    setProjects((current) => current?.map((project) => {
      if (project.id !== projectId) return project;
      previousName = project.projectName;
      return { ...project, projectName };
    }) ?? null);
    setProjectDetails((current) => {
      const detail = current[projectId];
      if (!detail) return current;
      previousName ||= detail.project.projectName;
      return { ...current, [projectId]: { ...detail, project: { ...detail.project, projectName } } };
    });

    try {
      const { project } = await apiRequest<{ project: Project }>(`/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ projectName }),
      });
      return project;
    } catch (error) {
      if (previousName) {
        setProjects((current) => current?.map((project) => project.id === projectId ? { ...project, projectName: previousName } : project) ?? null);
        setProjectDetails((current) => {
          const detail = current[projectId];
          return detail ? { ...current, [projectId]: { ...detail, project: { ...detail.project, projectName: previousName } } } : current;
        });
      }
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    let removedProject: Project | undefined;
    let removedDetail: ProjectDetail | undefined;
    setProjects((current) => {
      removedProject = current?.find((project) => project.id === projectId);
      return current?.filter((project) => project.id !== projectId) ?? null;
    });
    setProjectDetails((current) => {
      removedDetail = current[projectId];
      const next = { ...current };
      delete next[projectId];
      return next;
    });

    try {
      await apiRequest<void>(`/projects/${projectId}`, { method: "DELETE" });
    } catch (error) {
      if (removedProject) setProjects((current) => [...(current ?? []), removedProject!]);
      if (removedDetail) setProjectDetails((current) => ({ ...current, [projectId]: removedDetail! }));
      throw error;
    }
  }, []);

  const createFile = useCallback(async (projectId: string, file: InitialFile) => {
    const { file: createdFile } = await apiRequest<{ file: ProjectFile }>(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify(file),
    });
    setProjectDetails((current) => {
      const detail = current[projectId];
      return detail
        ? { ...current, [projectId]: { ...detail, files: [...detail.files, createdFile] } }
        : current;
    });
    return createdFile;
  }, []);

  const updateFile = useCallback(async (projectId: string, fileId: string, patch: Partial<InitialFile>) => {
    const version = (fileMutationVersions.current.get(fileId) ?? 0) + 1;
    fileMutationVersions.current.set(fileId, version);
    let previousFile: ProjectFile | undefined;

    setProjectDetails((current) => {
      const detail = current[projectId];
      if (!detail) return current;
      previousFile = detail.files.find((file) => file.id === fileId);
      return {
        ...current,
        [projectId]: {
          ...detail,
          files: detail.files.map((file) => file.id === fileId ? { ...file, ...patch } : file),
        },
      };
    });

    try {
      const { file } = await apiRequest<{ file: ProjectFile }>(`/projects/${projectId}/files/${fileId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (fileMutationVersions.current.get(fileId) === version) {
        setProjectDetails((current) => {
          const detail = current[projectId];
          return detail
            ? { ...current, [projectId]: { ...detail, files: detail.files.map((item) => item.id === file.id ? file : item) } }
            : current;
        });
      }
      return file;
    } catch (error) {
      if (previousFile && fileMutationVersions.current.get(fileId) === version) {
        setProjectDetails((current) => {
          const detail = current[projectId];
          return detail
            ? { ...current, [projectId]: { ...detail, files: detail.files.map((item) => item.id === fileId ? previousFile! : item) } }
            : current;
        });
      }
      throw error;
    }
  }, []);

  const deleteFile = useCallback(async (projectId: string, fileId: string) => {
    let removedFile: ProjectFile | undefined;
    setProjectDetails((current) => {
      const detail = current[projectId];
      if (!detail) return current;
      removedFile = detail.files.find((file) => file.id === fileId);
      return { ...current, [projectId]: { ...detail, files: detail.files.filter((file) => file.id !== fileId) } };
    });

    try {
      await apiRequest<void>(`/projects/${projectId}/files/${fileId}`, { method: "DELETE" });
    } catch (error) {
      if (removedFile) {
        setProjectDetails((current) => {
          const detail = current[projectId];
          return detail ? { ...current, [projectId]: { ...detail, files: [...detail.files, removedFile!] } } : current;
        });
      }
      throw error;
    }
  }, []);

  const value = useMemo<ProjectsContextValue>(() => ({
    projects,
    projectsLoading,
    projectDetails,
    loadingProjectIds,
    loadProjects,
    loadProject,
    createProject,
    renameProject,
    deleteProject,
    createFile,
    updateFile,
    deleteFile,
  }), [
    createFile,
    createProject,
    deleteFile,
    deleteProject,
    loadProject,
    loadProjects,
    loadingProjectIds,
    projectDetails,
    projects,
    projectsLoading,
    renameProject,
    updateFile,
  ]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error("useProjects must be used inside ProjectsProvider");
  return context;
}
