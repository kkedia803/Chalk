"use client";

import { useState, useRef, useEffect } from "react";
import { type Project } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

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
}: {
  project: Project;
  onRename: (id: string, name: string) => void;
  onOpen: (id: string) => void;
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
    >
      <div className="relative">
        <FolderIcon size={56} />
        {!editing && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setEditing(true);
            }}
            className="absolute -right-2 -top-2 rounded bg-zinc-800 px-1 text-[10px] text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
            aria-label={`Rename ${project.projectName}`}
          >
            ✎
          </button>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const { authLoading, getUserData, userData } = useAuth();
  const navigate = useNavigate();

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("chalkToken") ?? ""}`,
  });

  const fetchProjects = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
      headers: authHeaders(),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
    }
  };

  const createProject = async (name: string = "Untitled") => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
      method: "post",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({ projectName: name }),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects((prev) => [...prev, data.project]);
    }
  };

  const renameProject = async (id: string, name: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({ projectName: name }),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
    }
  };

  useEffect(() => {
    getUserData();
    fetchProjects();
  }, []);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  console.log(userData);

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
        <span className="text-sm font-medium tracking-widest text-zinc-600 uppercase">
          Chalk
        </span>
        <div className="flex items-center gap-10">
          <button
            onClick={() => createProject(`Project ${projects.length + 1}`)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:text-white rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer"
          >
            <span className="text-sm leading-none">+</span>
            New Folder
          </button>

          <div>
            <div>
              <img src={userData?.avatar_url!} alt={userData?.name}  className="h-10 w-10 rounded-full border border-white/30 "/>
            </div>
          </div>
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
