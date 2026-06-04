// ─── Language ────────────────────────────────────────────────────────────────

export type Language = "javascript" | "typescript" | "python" | "go" | "rust";

export interface LanguageMeta {
  id: Language;
  label: string;
  ext: string;
  dot: string;         // hex color for the language indicator dot
  monacoLang: string;  // monaco editor language identifier
}

export const LANGUAGES: LanguageMeta[] = [
  { id: "javascript", label: "JavaScript", ext: ".js", dot: "#f7df1e", monacoLang: "javascript" },
  { id: "typescript", label: "TypeScript", ext: ".ts", dot: "#3178c6", monacoLang: "typescript" },
  { id: "python",     label: "Python",     ext: ".py", dot: "#3776ab", monacoLang: "python"     },
  { id: "go",         label: "Go",         ext: ".go", dot: "#00add8", monacoLang: "go"         },
  { id: "rust",       label: "Rust",       ext: ".rs", dot: "#ce422b", monacoLang: "rust"       },
];

export const DEFAULT_CODE: Record<Language, string> = {
  javascript: `// Welcome to Chalk\nconsole.log("Hello, world!");\n\nconst add = (a, b) => a + b;\nconsole.log(add(2, 3));`,
  typescript: `// Welcome to Chalk\nconst greet = (name: string): string => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("Chalk"));`,
  python:     `# Welcome to Chalk\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("Chalk"))`,
  go:         `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, Chalk!")\n}`,
  rust:       `fn main() {\n    println!("Hello, Chalk!");\n}`,
};

// ─── Execution ───────────────────────────────────────────────────────────────

export type OutputLineType = "stdout" | "stderr" | "system";

export interface OutputLine {
  type: OutputLineType;
  text: string;
  timestamp: string;  // ISO string
}

export interface ExecutionResult {
  exitCode: number;
  durationMs: number;
  lines: OutputLine[];
}


// ─── UI state ────────────────────────────────────────────────────────────────

export interface UIState {
  sidebarOpen: boolean;
  outputOpen: boolean;
}

// ─── Context shape ───────────────────────────────────────────────────────────

export interface ChalkContextValue {
  // editor
  language: Language;
  code: string;
  setCode: (code: string) => void;
  setLanguage: (lang: Language) => void;

  // execution
  outputLines: OutputLine[];
  handleRun: () => void;
  handleClear: () => void;

  // ui
  ui: UIState;
  toggleSidebar: () => void;
  toggleOutput: () => void;

}