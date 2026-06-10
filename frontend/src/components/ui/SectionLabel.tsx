import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-Chalk-muted mb-2">
      {children}
    </p>
  );
}
