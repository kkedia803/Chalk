import { useEffect, useRef } from "react";
import { useChalk } from "../context/ChalkContext";
import type { OutputLineType } from "../types";

import { IoTerminalOutline } from "react-icons/io5";
import { MdOutlineDeleteForever } from "react-icons/md";

const LINE_STYLE: Record<
  OutputLineType,
  { text: string; prefix: string; prefixColor: string; bg: string }
> = {
  stdout: {
    text: "text-zinc-100",
    prefix: "›",
    prefixColor: "text-Chalk-muted",
    bg: "",
  },
  stderr: {
    text: "ext-red-400",
    prefix: "✕",
    prefixColor: "text-Chalk-red",
    bg: "",
  },
  system: {
    text: "text-zinc-500 italic",
    prefix: "·",
    prefixColor: "text-Chalk-muted",
    bg: "",
  },
};

export default function OutputPanel() {
  const { outputLines, handleClear, jobId, pollJob, executionStatus, runtime } =
    useChalk();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputLines]);

  useEffect(() => {
    if (!jobId) return;

    void pollJob(jobId);
  }, [jobId]);

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between h-10 px-4 border-y border-zinc-400 flex-shrink-0 bg-zinc-900">
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] uppercase text-Chalk-muted">
          <IoTerminalOutline size={16} />
          output
          {outputLines.length > 0 && (
            <span className="px-1.5 py-px rounded-full bg-Chalk-active text-Chalk-muted text-[10px] font-normal tracking-normal normal-case">
              {outputLines.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Status:</span>

          <span className={executionStatus === "error" ? "text-red-500" : "text-emerald-400"}>{executionStatus}</span>

          {executionStatus === "success" && (
            <div>
              <span className="text-zinc-500">Runtime: </span>

              <span className="text-emerald-400">{runtime} ms</span>
            </div>
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
            className="flex items-center hover:text-red-500 justify-center cursor-pointer disabled:cursor-not-allowed "
          >
            <MdOutlineDeleteForever size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-black py-2">
        {executionStatus === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-Chalk-muted font-mono text-xs opacity-60">
            <IoTerminalOutline size={25} />
            run code to see output
          </div>
        )}

        {executionStatus === "running" && (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-Chalk-muted font-mono text-xs opacity-70">
            <IoTerminalOutline className="animate-pulse" size={25} />
            executing... please wait...
          </div>
        )}

        {(executionStatus === "success" || executionStatus === "error") && (
          <div className="px-1">
            {outputLines.map((line, i) => {
              const s = LINE_STYLE[line.type];
              return (
                <div
                  key={i}
                  className={`flex items-baseline gap-2.5 px-2.5 py-[3px] rounded font-mono text-[12.5px] leading-[1.7] hover:bg-zinc-900/60 animate-fade-in ${s.bg}`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <span className="text-Chalk-muted text-[10px] flex-shrink-0 opacity-50 select-none">
                    {line.timestamp}
                  </span>
                  <span
                    className={`flex-shrink-0 w-3 text-center select-none ${s.prefixColor}`}
                  >
                    {s.prefix}
                  </span>
                  <span
                    className={`flex-1 whitespace-pre-wrap break-all ${s.text}`}
                  >
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
