// ─── Language ────────────────────────────────────────────────────────────────

export type Language = "javascript" | "java" | "python" | "cpp";

export interface LanguageMeta {
  id: Language;
  label: string;
  ext: string;
  dot: string; // hex color for the language indicator dot
  monacoLang: string; // monaco editor language identifier
}

export const LANGUAGES: LanguageMeta[] = [
  {
    id: "javascript",
    label: "JavaScript",
    ext: ".js",
    dot: "#f7df1e",
    monacoLang: "javascript",
  },
  { id: "java", label: "Java", ext: ".java", dot: "#3178c6", monacoLang: "java" },
  {
    id: "python",
    label: "Python",
    ext: ".py",
    dot: "#3776ab",
    monacoLang: "python",
  },
  { id: "cpp", label: "C++", ext: ".cpp", dot: "#9b113d", monacoLang: "cpp" },
];

export const DEFAULT_CODE: Record<Language, string> = {
  javascript: `// Welcome to Chalk
console.log("Hello, world!");

const add = (a, b) => a + b;
console.log(add(2, 3));`,

  python: `# Welcome to Chalk
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Chalk"))`,

  java: `// Welcome to Chalk
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Chalk!");

        int a = 2;
        int b = 3;

        System.out.println(a + b);
    }
}`,

  cpp: `// Welcome to Chalk
#include <iostream>

int main() {
    std::cout << "Hello, Chalk!" << std::endl;

    int a = 2;
    int b = 3;

    std::cout << a + b << std::endl;

    return 0;
}`,
};

// ─── Execution ───────────────────────────────────────────────────────────────

export type OutputLineType = "stdout" | "stderr" | "system";

export interface OutputLine {
  type: OutputLineType;
  text: string;
  timestamp: string; // ISO string
}

export interface ExecutionResult {
  exitCode: number;
  durationMs: number;
  lines: OutputLine[];
}


// ─── Execution Status ────────────────────────────────────────────────────────────────

export type ExecutionStatus = "idle" | "running" | "success" | "error";

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

  //jobid

  jobId:string

  pollJob: (jobId:string) => void;

  executionStatus: ExecutionStatus
}
