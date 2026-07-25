"use client";

import { useState, useRef, useEffect } from "react";
import { type Project } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { IoClose } from "react-icons/io5";
import { useFeedback } from "../context/FeedbackContext";
import { useProjects } from "../context/ProjectsContext";
import ChalkLoader from "../components/ChalkLoader";

function FolderIcon({ size = 56 }: { size?: number }) {
  const h = Math.round(size * 0.82);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 64 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="8" width="64" height="44" rx="5" fill="#4A90D9" />
      <path d="M0 8 Q0 4 4 4 L22 4 Q26 4 28 8 L28 8 H0 Z" fill="#5BA0E8" />
      <rect x="0" y="14" width="64" height="38" rx="5" fill="#5BAEF8" />
      <rect
        x="0"
        y="14"
        width="64"
        height="14"
        rx="5"
        fill="white"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Folder Card ──────────────────────────────────────────────────────────────

function FolderCard({
  project,
  onRename,
  onOpen,
  onDelete,
  onPrefetch,
}: {
  project: Project;
  onRename: (id: string, name: string) => void;
  onOpen: (id: string) => void;
  onDelete: (project: Project) => void;
  onPrefetch: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    onRename(project.id, trimmed || project.projectName);
    if (!trimmed) setDraft(project.projectName);
    setEditing(false);
  };

  return (
    <div
      className="group flex flex-col items-center gap-2 p-2 rounded-lg cursor-default select-none hover:bg-white/5 transition-colors duration-150 w-24"
      onDoubleClick={() => onOpen(project.id)}
      onMouseEnter={() => onPrefetch(project.id)}
      onFocus={() => onPrefetch(project.id)}
    >
      <div className="relative">
        <FolderIcon size={56} />
        {!editing && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(project);
              }}
              className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full border border-red-500/70 bg-red-500 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-red-400"
              aria-label={`Delete ${project.projectName}`}
              title="Delete project"
            >
              <IoClose size={14} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(true);
              }}
              className="absolute -right-2 bottom-0 rounded bg-blue-500 px-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-400"
              aria-label={`Rename ${project.projectName}`}
            >
              ✎
            </button>
          </>
        )}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(project.projectName);
              setEditing(false);
            }
          }}
          maxLength={40}
          className="w-20 bg-zinc-800 border border-zinc-600 rounded text-white text-[11px] text-center px-1 py-0.5 outline-none font-[inherit]"
        />
      ) : (
        <span className="text-[11.5px] text-zinc-400 text-center leading-snug break-words max-w-[88px]">
          {project.projectName}
        </span>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { authLoading, userData, logout } = useAuth();
  const { confirm, toast } = useFeedback();
  const {
    projects: cachedProjects,
    projectsLoading,
    loadProjects,
    loadProject,
    createProject: createCachedProject,
    renameProject: renameCachedProject,
    deleteProject: deleteCachedProject,
  } = useProjects();
  const navigate = useNavigate();
  const projects = cachedProjects ?? [];

  const createProject = async (name: string = "Untitled") => {
    setPendingAction("create");
    try {
      const data = await createCachedProject(name);
      toast(`Created "${data.project.projectName}".`, "success");
    } catch {
      toast("Could not create the project.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const renameProject = async (id: string, name: string) => {
    try {
      await renameCachedProject(id, name);
      toast("Project renamed.", "success");
    } catch {
      toast("Could not rename the project.", "error");
    }
  };

  const deleteProject = async (project: Project) => {
    const confirmed = await confirm({
      title: "Delete project?",
      message: `Delete "${project.projectName}" and all of its files? This cannot be undone.`,
      confirmLabel: "Delete project",
      destructive: true,
    });
    if (!confirmed) return;

    setPendingAction(project.id);
    try {
      await deleteCachedProject(project.id);
      toast(`Deleted "${project.projectName}".`, "success");
    } catch {
      toast("Could not delete the project.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !userData) {
      navigate("/");
      return;
    }
    if (userData) void loadProjects().catch(() => toast("Could not load your projects.", "error"));
  }, [authLoading, loadProjects, navigate, toast, userData]);

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  if (authLoading || (projectsLoading && cachedProjects === null)) {
    return <ChalkLoader />;
  }

  return (
    <div className="page-enter min-h-screen bg-black text-zinc-200 flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
        <img src="/chalkIcon.webp" alt="Chalk" className="h-14 w-14 rounded-2xl object-cover" />
        <div className="flex items-center gap-10">
          <button
            onClick={() => createProject(`Project ${projects.length + 1}`)}
            disabled={pendingAction === "create" || authLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:text-white rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer disabled:cursor-wait disabled:opacity-50"
          >
            <span className="text-sm leading-none">+</span>
            New Folder
          </button>

          {userData && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open profile menu"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-zinc-800 text-sm hover:border-indigo-400"
              >
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name} className="h-full w-full object-cover" />
                ) : (
                  userData.name.slice(0, 1).toUpperCase()
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left shadow-2xl">
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <p className="truncate text-xs font-medium text-zinc-200">{userData.name}</p>
                    <p className="mt-1 truncate text-[11px] text-zinc-600">{userData.email}</p>
                  </div>
                  <button
                    onClick={() => void logout()}
                    className="w-full px-4 py-2.5 text-left text-xs text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-8">
        {projects.length === 0 ? (
          <div className="group flex flex-col items-center justify-center h-full gap-3 opacity-40 pt-32">
            <FolderIcon size={48} />
            <p className="text-sm font-medium text-zinc-500">
              No projects yet.
            </p>
            <p className="text-xs text-zinc-600">
              Click <strong className="text-zinc-400">New Folder</strong> to get
              started.
            </p>
          </div>
        ) : (
          <div
            className="grid gap-x-6 gap-y-8"
            style={{ gridTemplateColumns: "repeat(auto-fill, 96px)" }}
          >
            {projects.map((p) => (
              <FolderCard
                key={p.id}
                project={p}
                onRename={renameProject}
                onOpen={(id) => navigate(`/projects/${id}`)}
                onDelete={deleteProject}
                onPrefetch={(id) => void loadProject(id).catch(() => undefined)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
