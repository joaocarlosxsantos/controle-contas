import { UserGroupIcon, PhoneIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";
import React from "react";

interface BaseCardProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "blue" | "green" | "neutral";
}

function BaseCard({ onClick, children, variant = "neutral" }: BaseCardProps) {
  const variantClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/30 border-blue-200/60 dark:border-blue-800/50 hover:shadow-blue-300/30 dark:hover:shadow-blue-900/40",
    green: "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50 hover:shadow-emerald-300/30 dark:hover:shadow-emerald-900/40",
    neutral: "from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700",
  }[variant];
  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm ring-1 ring-black/5 transition-all hover:scale-[1.015] hover:shadow-lg ${variantClasses}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_70%)]" />
      {children}
    </div>
  );
}

export function GroupCard({ name, phone, onClick }: { name: string; phone: string; onClick?: () => void }) {
  return (
    <BaseCard onClick={onClick} variant="blue">
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-200/70 backdrop-blur-sm dark:bg-blue-900/40">
        <UserGroupIcon className="h-7 w-7 text-blue-700 dark:text-blue-300" />
      </div>
      <div className="relative z-10 flex-1">
        <div className="font-semibold text-base md:text-lg text-blue-900 dark:text-blue-200 line-clamp-1">{name}</div>
        <div className="mt-0.5 flex items-center gap-1 text-xs md:text-sm text-blue-700 dark:text-blue-300">
          <PhoneIcon className="h-4 w-4" />
          {phone}
        </div>
      </div>
      <div className="relative z-10 text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 md:text-xs">Ver detalhes →</div>
    </BaseCard>
  );
}

export function BillCard({ name, value, onClick, children }: { name: string; value: number; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <BaseCard onClick={onClick} variant="green">
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-200/70 backdrop-blur-sm dark:bg-emerald-900/40">
        <ReceiptPercentIcon className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
      </div>
      <div className="relative z-10 flex-1">
        <div className="font-semibold text-base md:text-lg text-emerald-900 dark:text-emerald-200 line-clamp-1">{name}</div>
        <div className={`mt-0.5 text-xs md:text-sm ${value < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
          R$ {value < 0 ? `-${Math.abs(value).toFixed(2)}` : value.toFixed(2)}
        </div>
      </div>
      <div className="relative z-10 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400 md:text-xs">Detalhes</div>
      {children && <div className="relative z-10 ml-4 flex items-center">{children}</div>}
    </BaseCard>
  );
}

