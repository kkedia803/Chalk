import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ChalkContext } from "./ChalkContext";
import {
  type Language,
  type OutputLine,
  type UIState,
  type ExecutionStatus,
  DEFAULT_CODE,
} from "../types";

interface ChalkProviderProps {
  children: ReactNode;
}

export function ChalkProvider({ children }: ChalkProviderProps) {
  const [language, setLanguageState] = useState<Language>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE["javascript"]);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [ui, setUI] = useState<UIState>({ sidebarOpen: true, outputOpen: true });
  const [status, setStatus] = useState<ExecutionStatus>("idle");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutputLines([]);
    setStatus("idle");
  }, []);

  const handleRun = useCallback(() => {
    setStatus("running");
    setOutputLines([{
      type: "system",
      text: `▶ Running ${language} · ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
    }]);
    // TODO: call POST /execute, stream SSE chunks into setOutputLines
    // On complete: setStatus("success" | "error") and push to setHistory
    // Mocking finish for now to reset status if needed or keeping it simple
    setTimeout(() => setStatus("success"), 1000);
  }, [language]);

  const handleClear = useCallback(() => {
    setOutputLines([]);
    setStatus("idle");
  }, []);

  const toggleSidebar = useCallback(() =>
    setUI(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen })), []);

  const toggleOutput = useCallback(() =>
    setUI(prev => ({ ...prev, outputOpen: !prev.outputOpen })), []);

  const value = {
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
    status,
  };

  return (
    <ChalkContext.Provider value={value}>
      {children}
    </ChalkContext.Provider>
  );
}
