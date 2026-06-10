import type { ReactNode } from "react";

export function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick?: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded text-Chalk-secondary hover:bg-Chalk-hover hover:text-Chalk-primary transition-colors duration-100 flex-shrink-0"
    >
      {children}
    </button>
  );
}
