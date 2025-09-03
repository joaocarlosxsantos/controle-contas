"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
let _id = 0;
function nextId() { _id += 1; return String(Date.now()) + "-" + _id }

type ToastType = "info" | "success" | "error";
interface Toast { id: string; type: ToastType; title?: string; message: string }

interface ToastContextValue {
  push: (t: { type?: ToastType; title?: string; message: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(t: { type?: ToastType; title?: string; message: string }) {
    const id = nextId();
    const toast: Toast = { id, type: t.type || "info", title: t.title, message: t.message };
    setToasts((s) => [...s, toast]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 4500);
  }

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-xs w-full rounded-md px-4 py-3 shadow-lg text-white ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-neutral-700'}`}>
            {t.title && <div className="font-bold mb-1">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    info: (opts: { title?: string; message: string }) => ctx.push({ ...opts, type: "info" }),
    success: (opts: { title?: string; message: string }) => ctx.push({ ...opts, type: "success" }),
    error: (opts: { title?: string; message: string }) => ctx.push({ ...opts, type: "error" }),
  };
}
