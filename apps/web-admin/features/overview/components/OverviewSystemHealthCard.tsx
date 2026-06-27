"use client";

import { Card, Skeleton } from "antd";
import { CheckCircle2, Database, XCircle, Zap } from "lucide-react";
import type { AdminOverview } from "@/types/auth";
import { ServiceStatus } from "./ServiceStatus";

type OverviewSystemHealthCardProps = {
  stats?: AdminOverview;
  loading: boolean;
  allHealthy: boolean;
};

export function OverviewSystemHealthCard({
  stats,
  loading,
  allHealthy,
}: OverviewSystemHealthCardProps) {
  return (
    <Card
      className="h-full bg-surface border-default"
      size="small"
      title={
        <div className="py-0.5">
          <span className="text-[13px] font-bold text-primary">System Health</span>
          <p className="text-[11px] font-normal text-muted">
            Infrastructure services
          </p>
        </div>
      }
      styles={{ body: { padding: "12px 16px 16px" } }}
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton.Input active size="small" block />
          <Skeleton.Input active size="small" block />
          <Skeleton.Input active size="small" block />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <ServiceStatus
            label="Redis"
            online={stats?.redis_connected ?? false}
            icon={Zap}
          />
          <ServiceStatus
            label="Database"
            online={stats?.database_enabled ?? false}
            icon={Database}
          />
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
              allHealthy
                ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/8"
                : "border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/8"
            }`}
          >
            {allHealthy ? (
              <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
            ) : (
              <XCircle size={13} className="shrink-0 text-red-500" />
            )}
            <span
              className={`text-[12px] font-medium ${
                allHealthy
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {allHealthy ? "All systems operational" : "Service degradation"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
