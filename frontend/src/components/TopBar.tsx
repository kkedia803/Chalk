import { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useChalkLayout, useEditorMeta, useExecution } from "../context/ChalkContext";
import { useAuth } from "../context/AuthContext";

import { GoSidebarExpand } from "react-icons/go";
import { RiSplitCellsVertical } from "react-icons/ri";
import { FaPlay } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

import { GoogleSignInButton } from "./GoogleSignInButton";

function Topbar({
  title,
  saveStatus,
}: {
  title?: string;
  saveStatus?: "idle" | "saving" | "saved" | "error";
}) {
  const { language } = useEditorMeta();
  const { handleRun, executionStatus } = useExecution();
  const { toggleSidebar, toggleOutput } = useChalkLayout();
  const { userData, authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  return (
    <header className="flex items-center justify-between h-12 px-2.5 border-b border-Chalk-border bg-Chalk-surface flex-shrink-0 z-50 gap-3">
      {/* Left */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <GoSidebarExpand
          onClick={toggleSidebar}
          size={17}
          className="cursor-pointer hover:text-blue-400 "
        />

        <div className="flex shrink-0 items-center gap-1.5 px-1">
          <img
            src="/chalkIcon.webp"
            alt="Chalk"
            className="h-9 w-9 min-h-9 min-w-9 shrink-0 rounded-lg object-cover"
          />
        </div>

        <div className="mx-1.5 h-4 w-px shrink-0 bg-Chalk-border" />

        <div className="flex min-w-0 items-center gap-1.5 font-mono text-xs">
          <span
            className="max-w-[min(36vw,320px)] truncate rounded-full border border-Chalk-bright bg-Chalk-active px-1.5 py-0.5 text-[11px] text-Chalk-secondary"
            title={title ? `${title} · ${language}` : language}
          >
            {title ? `${title} · ${language}` : language}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <RiSplitCellsVertical
          size={20}
          className="cursor-pointer hover:text-blue-400"
          onClick={toggleOutput}
        />
        {saveStatus && saveStatus !== "idle" && (
          <span
            className={`font-mono text-[10px] transition-colors ${
              saveStatus === "error"
                ? "text-red-400"
                : saveStatus === "saved"
                  ? "text-emerald-500"
                  : "text-zinc-600"
            }`}
          >
            {saveStatus === "saving" ? "saving…" : saveStatus}
          </span>
        )}
        {executionStatus !== "running" && (
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-green-500 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150"
          >
            <FaPlay />
            run
          </button>
        )}

        {executionStatus === "running" && (
          <button className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-green-500 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150">
            <FiLoader className="animate-spin" />
            running
          </button>
        )}

        {!authLoading && !userData && <GoogleSignInButton />}
        {userData && (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded border border-zinc-700 px-3 py-1.5 font-mono text-[11px] text-zinc-400 transition-colors hover:border-indigo-500/60 hover:text-indigo-300"
            >
              Dashboard
            </button>
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors hover:border-indigo-400"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name} className="h-full w-full object-cover" />
                ) : (
                  userData.name.slice(0, 1).toUpperCase()
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-10 w-56 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <p className="truncate text-xs font-medium text-zinc-200">{userData.name}</p>
                    <p className="mt-1 truncate text-[11px] text-zinc-600">{userData.email}</p>
                  </div>
                  <button
                    onClick={() => void logout()}
                    className="w-full px-4 py-2.5 text-left text-xs text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default memo(Topbar);
