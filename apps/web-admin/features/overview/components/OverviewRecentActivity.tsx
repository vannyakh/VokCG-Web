"use client";

import { Card, Skeleton } from "antd";
import type { AuditLog } from "@/types/auth";
import { ActivityRow } from "./ActivityRow";

type OverviewRecentActivityProps = {
  logs: AuditLog[];
  loading: boolean;
  limit?: number;
};

export function OverviewRecentActivity({
  logs,
  loading,
  limit = 8,
}: OverviewRecentActivityProps) {
  const recentLogs = logs.slice(0, limit);

  return (
    <Card
      className="bg-surface border-default"
      size="small"
      title={
        <div className="flex items-center justify-between py-0.5">
          <div>
            <span className="text-[13px] font-bold text-primary">
              Recent Activity
            </span>
            <p className="text-[11px] font-normal text-muted">
              Latest audit log entries
            </p>
          </div>
          {!loading && logs.length > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              {logs.length} entries
            </span>
          )}
        </div>
      }
      styles={{ body: { padding: "0 16px" } }}
    >
      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Input key={i} active size="small" block />
          ))}
        </div>
      ) : recentLogs.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-muted">
          No audit logs yet
        </p>
      ) : (
        <div className="divide-y divide-border">
          {recentLogs.map((log) => (
            <ActivityRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </Card>
  );
}
