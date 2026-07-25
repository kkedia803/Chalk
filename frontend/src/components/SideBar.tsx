import { useEditorMeta } from "../context/ChalkContext";
import { LANGUAGES, type Language, type ProjectFile } from "../types";
import { useAuth } from "../context/AuthContext";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-Chalk-muted mb-2">
      {children}
    </p>
  );
}

type SidebarProps = {
  files?: ProjectFile[];
  selectedFileId?: string | null;
  onCreateFile?: () => void;
  onCreateProject?: () => void;
  onSelectFile?: (file: ProjectFile) => void;
  onSelectLanguage?: (language: Language) => void;
};

export default function Sidebar({
  files = [],
  selectedFileId,
  onCreateFile,
  onCreateProject,
  onSelectFile,
  onSelectLanguage,
}: SidebarProps) {
  const { language, setLanguage } = useEditorMeta();
  const { userData, authLoading } = useAuth();
  const handleSelectLanguage = onSelectLanguage ?? setLanguage;

  return (
    <aside className="h-screen flex-shrink-0 flex flex-col bg-Chalk-surface border-r border-Chalk-border overflow-hidden animate-slide-left">
      <div className="px-3 pt-3.5 pb-2.5 border-b border-Chalk-border">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>FILES</SectionLabel>
          <div className="flex items-center gap-1">
          {onCreateProject && (
            <button
              onClick={onCreateProject}
              className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-Chalk-secondary hover:bg-zinc-700"
              title="Create project from this workspace"
            >
              + project
            </button>
          )}
          {onCreateFile && (
            <button
              onClick={onCreateFile}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-Chalk-secondary hover:bg-zinc-700"
              title="Create file"
            >
              +
            </button>
          )}
          </div>
        </div>
        <div className="flex flex-col gap-px">
          {files.length === 0 ? (
            <p className="text-xs text-Chalk-muted">No files yet.</p>
          ) : (
            files.map((file) => (
              <button
                key={file.id}
                onClick={() => onSelectFile?.(file)}
                className={`cursor-pointer text-left px-2 py-1.5 rounded text-[12.5px] transition-colors duration-100 ${
                  selectedFileId === file.id
                    ? "bg-indigo-500/15 text-indigo-200"
                    : "text-Chalk-secondary hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {file.fileName}
              </button>
            ))
          )}
        </div>
      </div>

      {!authLoading && !userData && (
      <div className="px-3 pt-3.5 pb-2.5">
        <SectionLabel>LANGUAGE</SectionLabel>
        <div className="flex flex-col gap-px">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleSelectLanguage(lang.id)}
              className={`
                cursor-pointer flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-[12.5px]
                transition-colors duration-100
                ${
                  language === lang.id
                    ? "bg-indigo-500/15 text-indigo-200"
                    : "text-Chalk-secondary hover:bg-zinc-800 hover:text-zinc-100"
                }
              `}
            >
              <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: lang.dot }} />
              <span className="flex-1 font-sans">{lang.label}</span>
              <span className="font-mono text-[10px] text-Chalk-muted">{lang.ext}</span>
            </button>
          ))}
        </div>
      </div>
      )}
    </aside>
  );
}
