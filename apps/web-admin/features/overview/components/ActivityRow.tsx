"use client";

import type { AuditLog } from "@/types/auth";
import { actionClass, logAgo } from "../utils/format";

type ActivityRowProps = {
  log: AuditLog;
};

export function ActivityRow({ log }: ActivityRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className={`shrink-0 rounded-md px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${actionClass(log.action)}`}
      >
        {log.action}
      </span>
      <div className="min-w-0 flex-1">
        <span className="truncate text-[12px] font-medium text-primary">
          {log.resource}
          {log.resource_id
            ? ` · ${log.resource_id.length > 10 ? `${log.resource_id.slice(0, 8)}…` : log.resource_id}`
            : ""}
        </span>
        {log.ip_address && (
          <span className="ml-2 font-mono text-[11px] text-muted">
            {log.ip_address}
          </span>
        )}
      </div>
      <span className="shrink-0 text-[11px] text-muted">
        {logAgo(log.created_at)}
      </span>
    </div>
  );
}
