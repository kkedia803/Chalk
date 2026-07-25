/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_CODE,
  type ExecutionStatus,
  type Language,
  type OutputLine,
  type UIState,
} from "../types";

type EditorCodeContextValue = {
  code: string;
  setCode: (code: string) => void;
};

type EditorMetaContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  loadCode: (language: Language, code: string) => void;
};

type ExecutionContextValue = {
  outputLines: OutputLine[];
  handleRun: () => void;
  handleClear: () => void;
  jobId: string;
  pollJob: (jobId: string) => void;
  executionStatus: ExecutionStatus;
  runtime: number;
};

type LayoutContextValue = {
  ui: UIState;
  toggleSidebar: () => void;
  toggleOutput: () => void;
};

const EditorCodeContext = createContext<EditorCodeContextValue | null>(null);
const EditorMetaContext = createContext<EditorMetaContextValue | null>(null);
const ExecutionContext = createContext<ExecutionContextValue | null>(null);
const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useEditorCode() {
  const context = useContext(EditorCodeContext);
  if (!context) throw new Error("useEditorCode must be used inside ChalkProvider");
  return context;
}

export function useEditorMeta() {
  const context = useContext(EditorMetaContext);
  if (!context) throw new Error("useEditorMeta must be used inside ChalkProvider");
  return context;
}

export function useExecution() {
  const context = useContext(ExecutionContext);
  if (!context) throw new Error("useExecution must be used inside ChalkProvider");
  return context;
}

export function useChalkLayout() {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useChalkLayout must be used inside ChalkProvider");
  return context;
}

export function ChalkProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const editorSnapshot = useRef({ language, code });
  useEffect(() => {
    editorSnapshot.current = { language, code };
  }, [code, language]);

  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [jobId, setJobId] = useState("");
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [runtime, setRuntime] = useState(0);
  const [ui, setUI] = useState<UIState>({ sidebarOpen: true, outputOpen: true });

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    setCode(DEFAULT_CODE[nextLanguage]);
    setOutputLines([]);
    setExecutionStatus("idle");
  }, []);

  const loadCode = useCallback((nextLanguage: Language, nextCode: string) => {
    setLanguageState(nextLanguage);
    setCode(nextCode);
    setOutputLines([]);
    setExecutionStatus("idle");
  }, []);

  const handleRun = useCallback(async () => {
    try {
      setExecutionStatus("running");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorSnapshot.current),
      });

      if (!response.ok) throw new Error("Could not start execution");
      const data = await response.json();
      setJobId(data.jobId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed";
      setExecutionStatus("error");
      setOutputLines((current) => [
        ...current,
        {
          type: "system",
          text: message,
          timestamp: new Date().toLocaleTimeString("en-GB", { hourCycle: "h12" }),
        },
      ]);
    }
  }, []);

  const pollJob = useCallback(async (nextJobId: string) => {
    let completed = false;

    while (!completed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/execute/${nextJobId}`);
        if (!response.ok) throw new Error("Failed to fetch job status");
        const job = await response.json();

        if (job.status === "completed") {
          setOutputLines([{
            type: "stdout",
            text: job.output ?? "",
            timestamp: new Date().toLocaleTimeString("en-GB", { hourCycle: "h12" }),
          }]);
          setExecutionStatus("success");
          setRuntime(job.runtime);
          completed = true;
        } else if (job.status === "failed") {
          setOutputLines([{
            type: "stderr",
            text: job.error ?? "Execution failed",
            timestamp: new Date().toLocaleTimeString("en-GB", { hourCycle: "h12" }),
          }]);
          setExecutionStatus("error");
          completed = true;
        }

        if (!completed) await new Promise((resolve) => window.setTimeout(resolve, 800));
      } catch {
        setOutputLines([{
          type: "stderr",
          text: "Failed to fetch job status",
          timestamp: new Date().toLocaleTimeString("en-GB", { hourCycle: "h12" }),
        }]);
        setExecutionStatus("error");
        completed = true;
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    setOutputLines([]);
    setExecutionStatus("idle");
  }, []);

  const toggleSidebar = useCallback(() => {
    setUI((current) => ({ ...current, sidebarOpen: !current.sidebarOpen }));
  }, []);

  const toggleOutput = useCallback(() => {
    setUI((current) => ({ ...current, outputOpen: !current.outputOpen }));
  }, []);

  const editorCodeValue = useMemo<EditorCodeContextValue>(() => ({
    code,
    setCode,
  }), [code]);

  const editorMetaValue = useMemo<EditorMetaContextValue>(() => ({
    language,
    setLanguage,
    loadCode,
  }), [language, loadCode, setLanguage]);

  const executionValue = useMemo<ExecutionContextValue>(() => ({
    outputLines,
    handleRun,
    handleClear,
    jobId,
    pollJob,
    executionStatus,
    runtime,
  }), [executionStatus, handleClear, handleRun, jobId, outputLines, pollJob, runtime]);

  const layoutValue = useMemo<LayoutContextValue>(() => ({
    ui,
    toggleSidebar,
    toggleOutput,
  }), [toggleOutput, toggleSidebar, ui]);

  return (
    <EditorCodeContext.Provider value={editorCodeValue}>
      <EditorMetaContext.Provider value={editorMetaValue}>
        <ExecutionContext.Provider value={executionValue}>
          <LayoutContext.Provider value={layoutValue}>{children}</LayoutContext.Provider>
        </ExecutionContext.Provider>
      </EditorMetaContext.Provider>
    </EditorCodeContext.Provider>
  );
}
