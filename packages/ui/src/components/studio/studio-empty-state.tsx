"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function StudioEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: Props) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl border border-divider bg-surface px-6 py-12 text-center"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
        }}
      >
        <Icon size={22} className="text-muted" />
      </div>
      <div className="max-w-md space-y-1">
        <p className="text-[15px] font-semibold text-primary">{title}</p>
        {description ? (
          <p className="text-[13px] text-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
