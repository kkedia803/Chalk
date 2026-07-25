/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";

type ToastKind = "success" | "error" | "info";
type DialogKind = "alert" | "confirm" | "prompt";

type DialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  defaultValue?: string;
  placeholder?: string;
};

type DialogState = DialogOptions & { kind: DialogKind };

type FeedbackContextValue = {
  alert: (options: DialogOptions) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
  prompt: (options: DialogOptions) => Promise<string | null>;
  toast: (message: string, kind?: ToastKind) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback must be used inside FeedbackProvider");
  return context;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; kind: ToastKind }>>([]);
  const resolver = useRef<((value: boolean | string | null) => void) | null>(null);
  const toastId = useRef(0);

  const openDialog = useCallback(
    (kind: DialogKind, options: DialogOptions) =>
      new Promise<boolean | string | null>((resolve) => {
        resolver.current = resolve;
        setPromptValue(options.defaultValue ?? "");
        setDialog({ ...options, kind });
      }),
    [],
  );

  const closeDialog = (value: boolean | string | null) => {
    resolver.current?.(value);
    resolver.current = null;
    setDialog(null);
  };

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value: FeedbackContextValue = {
    alert: async (options) => {
      await openDialog("alert", options);
    },
    confirm: async (options) => Boolean(await openDialog("confirm", options)),
    prompt: async (options) => {
      const result = await openDialog("prompt", options);
      return typeof result === "string" ? result : null;
    },
    toast,
  };

  const toastIcon = {
    success: FiCheckCircle,
    error: FiXCircle,
    info: FiInfo,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-5 top-5 z-[200] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((item) => {
          const Icon = toastIcon[item.kind];
          return (
            <div
              key={item.id}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/95 px-4 py-3 text-sm text-zinc-300 shadow-2xl backdrop-blur"
            >
              <Icon
                className={item.kind === "success" ? "text-emerald-400" : item.kind === "error" ? "text-red-400" : "text-indigo-400"}
                size={17}
              />
              <span className="flex-1 text-xs leading-5">{item.message}</span>
              <button
                onClick={() => setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))}
                className="text-zinc-600 hover:text-white"
                aria-label="Dismiss notification"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && dialog.kind !== "alert") closeDialog(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-200 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-lg p-2 ${dialog.destructive ? "bg-red-500/10 text-red-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                {dialog.destructive ? <FiAlertTriangle /> : <FiInfo />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="feedback-dialog-title" className="text-sm font-medium text-zinc-100">{dialog.title}</h2>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{dialog.message}</p>
              </div>
            </div>

            {dialog.kind === "prompt" && (
              <input
                autoFocus
                value={promptValue}
                placeholder={dialog.placeholder}
                onChange={(event) => setPromptValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && promptValue.trim()) closeDialog(promptValue.trim());
                  if (event.key === "Escape") closeDialog(null);
                }}
                className="mt-5 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-500"
              />
            )}

            <div className="mt-6 flex justify-end gap-2">
              {dialog.kind !== "alert" && (
                <button
                  onClick={() => closeDialog(dialog.kind === "prompt" ? null : false)}
                  className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-white"
                >
                  {dialog.cancelLabel ?? "Cancel"}
                </button>
              )}
              <button
                autoFocus={dialog.kind !== "prompt"}
                onClick={() => closeDialog(dialog.kind === "prompt" ? promptValue.trim() : true)}
                disabled={dialog.kind === "prompt" && !promptValue.trim()}
                className={`rounded-lg px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 ${
                  dialog.destructive ? "bg-red-500 hover:bg-red-400" : "bg-indigo-500 hover:bg-indigo-400"
                }`}
              >
                {dialog.confirmLabel ?? (dialog.kind === "alert" ? "Got it" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
