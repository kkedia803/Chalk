import { useRef } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useEditorCode, useEditorMeta } from "../context/ChalkContext";

export default function EditorPanel() {
  const { language } = useEditorMeta();
  const { code, setCode } = useEditorCode();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme("Chalk-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment",   foreground: "52525b", fontStyle: "italic" },
        { token: "keyword",   foreground: "e4ff47" },
        { token: "string",    foreground: "4ade80" },
        { token: "number",    foreground: "fb923c" },
        { token: "type",      foreground: "60a5fa" },
        { token: "function",  foreground: "c4b5fd" },
        { token: "variable",  foreground: "fafafa" },
        { token: "operator",  foreground: "a1a1aa" },
        { token: "delimiter", foreground: "71717a" },
      ],
      colors: {
        "editor.background":                     "#0a0a0b",
        "editor.foreground":                     "#fafafa",
        "editor.lineHighlightBackground":        "#18181b",
        "editor.selectionBackground":            "#27272b",
        "editorCursor.foreground":               "#e4ff47",
        "editorLineNumber.foreground":           "#3f3f46",
        "editorLineNumber.activeForeground":     "#71717a",
        "editor.inactiveSelectionBackground":    "#1e1e22",
        "editorIndentGuide.background":          "#1e1e22",
        "editorIndentGuide.activeBackground":    "#27272b",
        "editorWidget.background":               "#111113",
        "editorWidget.border":                   "#27272b",
        "editorSuggestWidget.background":        "#111113",
        "editorSuggestWidget.border":            "#27272b",
        "editorSuggestWidget.selectedBackground":"#1e1e22",
        "input.background":                      "#18181b",
        "input.border":                          "#27272b",
        "scrollbarSlider.background":            "#27272b80",
        "scrollbarSlider.hoverBackground":       "#3f3f4680",
        "minimap.background":                    "#0a0a0b",
        "scrollbar.shadow":                      "#00000000",
      },
    });

    monaco.editor.setTheme("Chalk-dark");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-Chalk-base">
      {/* Monaco */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={v => setCode(v ?? "")}
          onMount={handleMount}
          options={{
            fontSize: 13.5,
            fontFamily: "'Geist Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            folding: true,
            wordWrap: "off",
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderWhitespace: "none",
            scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
          }}
        />
      </div>
    </div>
  );
}
