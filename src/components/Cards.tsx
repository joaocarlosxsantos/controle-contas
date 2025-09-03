import { ReceiptPercentIcon } from "@heroicons/react/24/outline";
import React from "react";

interface BaseCardProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "blue" | "green" | "neutral";
}

function BaseCard({ onClick, children, variant = "neutral" }: BaseCardProps) {
  const variantClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/30 border-blue-200/60 dark:border-blue-800/50",
    green: "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50",
    neutral: "from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700",
  }[variant];

  const isClickable = typeof onClick === 'function';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick!();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all ${variantClasses} card-shadow ${isClickable ? 'clickable' : ''}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_70%)]" />
      {children}
    </div>
  );
}

export function GroupCard({ name, phone, onClick }: { name: string; phone: string; onClick?: () => void }) {
  return (
    <BaseCard onClick={onClick} variant="blue">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg md:text-2xl text-blue-900 dark:text-blue-200 line-clamp-1">{name}</div>
          <div className="mt-0.5 text-sm md:text-base text-blue-700 dark:text-blue-300">
            <span className="truncate">{phone}</span>
          </div>
        </div>
          <div className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 md:text-xs">Ver detalhes →</div>
      </div>
    </BaseCard>
  );
}

export function BillCard({ name, value, onClick, children }: { name: string; value: number; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <BaseCard onClick={onClick} variant="green">
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-200/70 dark:bg-emerald-900/40">
          <ReceiptPercentIcon className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg md:text-2xl text-emerald-900 dark:text-emerald-200 line-clamp-1">{name}</div>
          <div className={`mt-0.5 text-sm md:text-lg ${value < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
            R$ {value < 0 ? `-${Math.abs(value).toFixed(2)}` : value.toFixed(2)}
          </div>
        </div>
      </div>

      {children && (
        <div className="mt-3 w-full flex flex-col gap-3">
          {children}
        </div>
      )}
    </BaseCard>
  );
}

