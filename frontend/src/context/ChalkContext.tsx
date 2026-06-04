import { createContext, useContext, useState, useCallback } from "react";
import type {ReactNode} from 'react';
import {
  type Language,
  type OutputLine,
  type UIState,
  type ChalkContextValue,
  DEFAULT_CODE,
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
  const [code, setCode]               = useState(DEFAULT_CODE["javascript"]);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [ui, setUI] = useState<UIState>({ sidebarOpen: true, outputOpen: true });

  // ── Language change resets editor + output ──────────────────────────────
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutputLines([]);
  }, []);

  // ── Run ─────────────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    setOutputLines([{
      type: "system",
      text: `▶ Running ${language} · ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
    }]);
    // TODO: call POST /execute, stream SSE chunks into setOutputLines
    // On complete: setStatus("success" | "error") and push to setHistory
  }, [language]);

  // ── Clear output ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setOutputLines([]);
  }, []);

  // ── UI toggles ──────────────────────────────────────────────────────────
  const toggleSidebar = useCallback(() =>
    setUI(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen })), []);

  const toggleOutput = useCallback(() =>
    setUI(prev => ({ ...prev, outputOpen: !prev.outputOpen })), []);

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
  };

  return (
    <ChalkContext.Provider value={value}>
      {children}
    </ChalkContext.Provider>
  );
}