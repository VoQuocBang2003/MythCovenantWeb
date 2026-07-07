"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type FeedbackContextValue = {
  toast: (input: Omit<Toast, "id" | "variant"> & { variant?: ToastVariant }) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const toastIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = (input: Omit<Toast, "id" | "variant"> & { variant?: ToastVariant }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextToast: Toast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "info",
    };

    setToasts((current) => [...current, nextToast]);
  };

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  };

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [toasts]);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toastItem) => toastItem.id !== id));
  };

  const closeConfirm = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const value = useMemo<FeedbackContextValue>(
    () => ({ toast, confirm }),
    []
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[140] flex w-[min(92vw,24rem)] flex-col gap-2">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              "pointer-events-auto animate-fade-in-up rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
              toastItem.variant === "success" && "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
              toastItem.variant === "error" && "border-red-400/25 bg-red-500/10 text-red-100",
              toastItem.variant === "info" && "border-white/10 bg-slate-900/95 text-slate-100"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{toastIcons[toastItem.variant]}</div>
              <div className="flex-1">
                <p className="font-semibold">{toastItem.title}</p>
                {toastItem.description ? (
                  <p className="mt-1 text-sm opacity-80">{toastItem.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toastItem.id)}
                className="rounded-full p-1 text-current/70 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmState ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200/70">Xác nhận</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{confirmState.title}</h3>
            {confirmState.description ? (
              <p className="mt-2 text-sm leading-6 text-slate-400">{confirmState.description}</p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {confirmState.cancelText ?? "Hủy"}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  confirmState.confirmVariant === "destructive"
                    ? "bg-rose-500 text-white hover:bg-rose-400"
                    : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                )}
              >
                {confirmState.confirmText ?? "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useAppFeedback must be used within a FeedbackProvider");
  }

  return context;
}
