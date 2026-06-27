"use client";

import { useState, useRef, useEffect } from "react";
import { type Project } from "../types";
import { useAuth } from "../context/AuthContext";

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
}: {
  project: Project;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    onRename(project.id, trimmed || project.name);
    if (!trimmed) setDraft(project.name);
    setEditing(false);
  };

  return (
    <div
      className="flex flex-col items-center gap-2 p-2 rounded-lg cursor-default select-none hover:bg-white/5 transition-colors duration-150 w-24"
      onDoubleClick={() => setEditing(true)}
    >
      <FolderIcon size={56} />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(project.name);
              setEditing(false);
            }
          }}
          maxLength={40}
          className="w-20 bg-zinc-800 border border-zinc-600 rounded text-white text-[11px] text-center px-1 py-0.5 outline-none font-[inherit]"
        />
      ) : (
        <span className="text-[11.5px] text-zinc-400 text-center leading-snug break-words max-w-[88px]">
          {project.name}
        </span>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { authLoading, getUserData, userData } = useAuth();

  // ── Add your API call inside this function ──
  const createProject = (name: string = "Untitled"): Project => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
    // TODO: await yourApiCall(newProject)
  };

  const renameProject = (id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  useEffect(() => {
    getUserData();
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
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 pt-32">
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
              <FolderCard key={p.id} project={p} onRename={renameProject} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
