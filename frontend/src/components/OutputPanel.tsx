import { useEffect, useRef } from "react";
import { useChalk } from "../context/ChalkContext"
import type { OutputLineType } from "../types";

const LINE_STYLE: Record<OutputLineType, { text: string; prefix: string; prefixColor: string; bg: string }> = {
  stdout: { text: "text-Chalk-primary",      prefix: "›", prefixColor: "text-Chalk-muted", bg: ""              },
  stderr: { text: "text-Chalk-red",          prefix: "✕", prefixColor: "text-Chalk-red",   bg: "bg-Chalk-red/5" },
  system: { text: "text-Chalk-muted italic", prefix: "·", prefixColor: "text-Chalk-muted", bg: ""              },
};

export default function OutputPanel() {
  const { outputLines, handleClear } = useChalk();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputLines]);

  return (
    <div className="h-[280px] flex-shrink-0 flex flex-col border-t border-Chalk-border bg-Chalk-surface">

      {/* Header */}
      <div className="flex items-center justify-between h-[34px] px-3 border-b border-Chalk-border flex-shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] uppercase text-Chalk-muted">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.1" fill="none"/>
            <path d="M3 4.5L5 6.5L3 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 8.5H9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          output
          {outputLines.length > 0 && (
            <span className="px-1.5 py-px rounded-full bg-Chalk-active text-Chalk-muted text-[10px] font-normal tracking-normal normal-case">
              {outputLines.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === "running" && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-Chalk-accent tracking-widest uppercase">
              <span className="w-[5px] h-[5px] rounded-full bg-Chalk-accent animate-pulse-dot" />
              executing
            </div>
          )}
          <button
            onClick={handleClear}
            disabled={outputLines.length === 0}
            title="Clear output"
            className="flex items-center justify-center w-7 h-7 rounded text-Chalk-secondary hover:bg-Chalk-hover hover:text-Chalk-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5 3.5v6M8 3.5v6M3 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7"
                stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto py-2">
        {outputLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-Chalk-muted font-mono text-xs opacity-40">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M9 10.5L13 14.5L9 18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 18.5H19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            run code to see output
          </div>
        ) : (
          <div className="px-1">
            {outputLines.map((line, i) => {
              const s = LINE_STYLE[line.type];
              return (
                <div
                  key={i}
                  className={`flex items-baseline gap-2.5 px-2.5 py-[3px] rounded font-mono text-[12.5px] leading-[1.7] hover:bg-Chalk-elevated animate-fade-in ${s.bg}`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <span className="text-Chalk-muted text-[10px] flex-shrink-0 opacity-50 select-none">
                    {line.timestamp.slice(11, 19)}
                  </span>
                  <span className={`flex-shrink-0 w-3 text-center select-none ${s.prefixColor}`}>
                    {s.prefix}
                  </span>
                  <span className={`flex-1 whitespace-pre-wrap break-all ${s.text}`}>
                    {line.text}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}