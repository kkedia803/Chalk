import { useChalk } from "../hooks/useChalk";
import { IconBtn } from "./ui/IconBtn";

export default function Topbar() {
  const { language, handleRun, toggleSidebar, toggleOutput, status } = useChalk();

  return (
    <header className="flex items-center justify-between h-12 px-2.5 border-b border-Chalk-border bg-Chalk-surface flex-shrink-0 z-50 gap-3">

      {/* Left */}
      <div className="flex items-center gap-1 flex-1">
        <IconBtn onClick={toggleSidebar} title="Toggle sidebar">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="3"  width="11" height="1.2" rx="0.6" fill="currentColor"/>
            <rect x="2" y="7"  width="7"  height="1.2" rx="0.6" fill="currentColor"/>
            <rect x="2" y="11" width="9"  height="1.2" rx="0.6" fill="currentColor"/>
          </svg>
        </IconBtn>

        <div className="flex items-center gap-1.5 px-1">
          <span className="font-mono font-medium text-sm tracking-tight text-Chalk-primary">Chalk</span>
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
        <IconBtn onClick={toggleOutput} title="Toggle output">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1.5" y="9.5" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <rect x="1.5" y="1.5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        </IconBtn>

        <button
          onClick={handleRun}
          disabled={status === "running"}
          className={`
            flex items-center gap-1.5 px-3.5 h-[30px] rounded ml-1.5
            font-mono text-xs font-medium tracking-wider border transition-all duration-150
            ${status === "running"
              ? "border-Chalk-bright text-Chalk-muted bg-transparent cursor-not-allowed"
              : "border-Chalk-accent text-Chalk-accent bg-Chalk-accent/10 hover:bg-Chalk-accent hover:text-Chalk-base hover:shadow-[0_0_16px_rgba(228,255,71,0.2)] cursor-pointer"
            }
          `}
        >
          {status === "running" ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full border border-Chalk-bright border-t-Chalk-secondary animate-spin-fast" />
              running
            </>
          ) : (
            <>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M1 1L9 6L1 11V1Z" fill="currentColor"/>
              </svg>
              run
            </>
          )}
        </button>
      </div>
    </header>
  );
}