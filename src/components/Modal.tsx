"use client";
import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    let previousActive: Element | null = null;
    if (open) {
      previousActive = document.activeElement;
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      // set focus to first focusable element inside the modal (or the dialog container)
      requestAnimationFrame(() => {
        try {
          const el = containerRef.current;
          if (!el) return;
          const focusable = el.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length) focusable[0].focus();
          else el.focus();
        } catch {
          // ignore
        }
      });
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      try {
        if (previousActive && (previousActive as HTMLElement).focus) {
          (previousActive as HTMLElement).focus();
        }
      } catch {
        // ignore
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`relative w-full ${sizeClass[size]} animate-in fade-in zoom-in rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] overflow-hidden ring-1 ring-transparent focus:outline-none`}
      >
        <div className="flex items-center gap-4 px-6 py-4 border-b border-transparent dark:border-neutral-800">
          {title && <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 flex-1 truncate">{title}</h3>}
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-auto max-h-[70vh] text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          {children}
        </div>
      </div>
    </div>
  );
}
