import { useChalk } from "../context/ChalkContext";

import { GoSidebarExpand } from "react-icons/go";
import { RiSplitCellsVertical } from "react-icons/ri";
import { FaPlay } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "../context/AuthContext";

function ProfileMenu() {
  const { userData, logout } = useAuth();

  if (!userData?.avatar_url) return <GoogleSignInButton />;

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex h-8 w-8 overflow-hidden rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Open profile menu"
      >
        <img src={userData.avatar_url} alt={userData.name} className="h-full w-full object-cover" />
      </button>
      <div className="invisible absolute right-0 top-9 z-[60] min-w-36 rounded-lg border border-zinc-800 bg-zinc-950 p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <p className="mb-2 truncate px-2 text-[11px] text-zinc-400">{userData.name}</p>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Topbar({ title, onCreateProject }: { title?: string; onCreateProject?: () => void }) {
  const { language, handleRun, toggleSidebar, toggleOutput, executionStatus } =
    useChalk();

  return (
    <header className="flex items-center justify-between h-12 px-2.5 border-b border-Chalk-border bg-Chalk-surface flex-shrink-0 z-50 gap-3">
      {/* Left */}
      <div className="flex items-center gap-1 flex-1">
        <GoSidebarExpand
          onClick={toggleSidebar}
          size={17}
          className="cursor-pointer hover:text-blue-400 "
        />

        <div className="flex items-center gap-1.5 px-1">
          <span className="font-mono font-medium text-sm tracking-tight text-Chalk-primary">
            Chalk
          </span>
        </div>

        <div className="w-px h-4 bg-Chalk-border mx-1.5" />

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-Chalk-active border border-Chalk-bright text-Chalk-secondary">
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
        {executionStatus !== "running" && (
          <div className="flex gap-4 items-center">
            {onCreateProject && (
              <button
                onClick={onCreateProject}
                className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-indigo-300 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150"
              >
                + project
              </button>
            )}
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-green-500 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150"
            >
              <FaPlay />
              run
            </button>

            <ProfileMenu />
          </div>
        )}

        {executionStatus === "running" && (
          <button className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-green-500 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150">
            <FiLoader className="animate-spin" />
            running
          </button>
        )}
      </div>
    </header>
  );
}
