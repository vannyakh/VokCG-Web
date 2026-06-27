"use client";

import type { LucideIcon } from "lucide-react";

type ServiceStatusProps = {
  label: string;
  online: boolean;
  icon: LucideIcon;
};

export function ServiceStatus({ label, online, icon: Icon }: ServiceStatusProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-default px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            online
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          <Icon size={13} />
        </div>
        <span className="text-[13px] font-medium text-primary">{label}</span>
      </div>
      <div
        className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          online
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            online ? "animate-pulse bg-emerald-500" : "bg-red-500"
          }`}
        />
        {online ? "Online" : "Offline"}
      </div>
    </div>
  );
}
