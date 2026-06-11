import { useChalk } from "../context/ChalkContext";
import { LANGUAGES } from "../types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-Chalk-muted mb-2">
      {children}
    </p>
  );
}

export default function Sidebar() {
  const { language, setLanguage } = useChalk();

  return (
    <aside className="h-screen flex-shrink-0 flex flex-col bg-Chalk-surface border-r border-Chalk-border overflow-hidden animate-slide-left">

      {/* Language selector */}
      <div className="px-3 pt-3.5 pb-2.5">
        <SectionLabel>LANGUAGE</SectionLabel>
        <div className="flex flex-col gap-px">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`
                cursor-pointer flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-[12.5px]
                transition-colors duration-100
                ${language === lang.id
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
    </aside>
  );
}