import { useChalk } from "../context/ChalkContext";

import { GoSidebarExpand } from "react-icons/go";
import { RiSplitCellsVertical } from "react-icons/ri";
import { FaPlay } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";


export default function Topbar() {
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
            {language}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 flex-1 justify-end">
        <RiSplitCellsVertical
          size={20}
          className="cursor-pointer hover:text-blue-400"
          onClick={toggleOutput}
        />
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
          <button
            className="flex items-center gap-1.5 px-3.5 h-[30px] cursor-pointer hover:text-green-500 rounded ml-1.5 font-mono text-xs font-medium tracking-wider border transition-all duration-150"
          >
            <FiLoader className="animate-spin" />
            running
          </button>
        )}
      </div>
    </header>
  );
}
