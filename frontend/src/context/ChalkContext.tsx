import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  type Language,
  type OutputLine,
  type UIState,
  type ChalkContextValue,
  DEFAULT_CODE,
  type ExecutionStatus,
} from "../types";

// ─── Context ─────────────────────────────────────────────────────────────────

const ChalkContext = createContext<ChalkContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChalk(): ChalkContextValue {
  const ctx = useContext(ChalkContext);
  if (!ctx) throw new Error("useChalk must be used inside <ChalkProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ChalkProviderProps {
  children: ReactNode;
}

export function ChalkProvider({ children }: ChalkProviderProps) {
  const [language, setLanguageState] = useState<Language>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE["javascript"]);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [ui, setUI] = useState<UIState>({
    sidebarOpen: true,
    outputOpen: true,
  });
  const [jobId, setJobId] = useState<string>("");

  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>("idle");
  const [runtime, setRunTime] = useState(0);


  // ── Language change resets editor + output ──────────────────────────────
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutputLines([]);
    setExecutionStatus("idle");
  }, []);

  // ── Run ─────────────────────────────────────────────────────────────────

  const handleRun = async () => {
    try {
      setExecutionStatus("running");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/execute`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      const dat = await res.json();
      setJobId(dat.jobId);
    } catch (err: any) {
      setExecutionStatus("error");
      setOutputLines([
        ...outputLines,
        {
          type: "system",
          text: err.message,
          timestamp: new Date().toLocaleTimeString("en-GB", {
            hourCycle: "h12",
          }),
        },
      ]);
    }
  };

  const pollJob = useCallback(async (jobId: string) => {
    let completed = false;

    while (!completed) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/execute/${jobId}`,
        );

        const job = await res.json();

        // setStatus(job.status);

        if (job.status === "completed") {
          setOutputLines([
            {
              type: "stdout",
              text: job.output ?? "",
              timestamp: new Date().toLocaleTimeString("en-GB", {
                hourCycle: "h12",
              }),
            },
          ]);

          setExecutionStatus("success");
          setRunTime(job.runtime);

          completed = true;
        }

        if (job.status === "failed") {
          setOutputLines([
            {
              type: "stderr",
              text: job.error ?? "Execution failed",
              timestamp: new Date().toLocaleTimeString("en-GB", {
                hourCycle: "h12",
              }),
            },
          ]);

          setExecutionStatus("error");

          completed = true;
        }

        if (!completed) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error(err);

        setOutputLines([
          {
            type: "stderr",
            text: "Failed to fetch job status",
            timestamp: new Date().toLocaleTimeString("en-GB", {
              hourCycle: "h12",
            }),
          },
        ]);

        setExecutionStatus("error");

        completed = true;
      }
    }
  }, []);



  // ── Clear output ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setOutputLines([]);
    setExecutionStatus("idle");
  }, []);

  // ── UI toggles ──────────────────────────────────────────────────────────
  const toggleSidebar = useCallback(
    () => setUI((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen })),
    [],
  );

  const toggleOutput = useCallback(
    () => setUI((prev) => ({ ...prev, outputOpen: !prev.outputOpen })),
    [],
  );

  const value: ChalkContextValue = {
    language,
    code,
    setCode,
    setLanguage,
    outputLines,
    handleRun,
    handleClear,
    ui,
    toggleSidebar,
    toggleOutput,
    jobId,
    pollJob,
    executionStatus,
    runtime,
    // handleGoogleLogin,
    // userData
  };

  return (
    <ChalkContext.Provider value={value}>{children}</ChalkContext.Provider>
  );
}
