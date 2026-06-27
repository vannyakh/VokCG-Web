"use client";

import {
  Activity,
  Database,
  FileText,
  Key,
  Shield,
  Users,
} from "lucide-react";
import { StatGrid } from "@/components/admin";
import type { StatGridItem } from "@/components/admin";
import type { AdminOverview } from "@/types/auth";

type OverviewKpiSectionProps = {
  stats?: AdminOverview;
  saasItems: StatGridItem[];
  saasColumns: 2 | 3 | 4;
  loading: boolean;
};

export function OverviewKpiSection({
  stats,
  saasItems,
  saasColumns,
  loading,
}: OverviewKpiSectionProps) {
  return (
    <>
      <StatGrid
        columns={6}
        loading={loading}
        items={[
          { label: "Users", value: stats?.users, icon: Users },
          {
            label: "Roles",
            value: stats?.roles,
            icon: Shield,
            accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
          },
          {
            label: "Permissions",
            value: stats?.permissions,
            icon: Key,
            accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Audit Logs",
            value: stats?.logs,
            icon: FileText,
            accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Services",
            value: stats?.services,
            icon: Activity,
            accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
          },
          {
            label: "Database",
            value: stats?.database_enabled ? "Online" : "Offline",
            icon: Database,
            accent: stats?.database_enabled
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400",
          },
        ]}
      />

      {saasItems.length > 0 && (
        <StatGrid columns={saasColumns} loading={loading} items={saasItems} />
      )}
    </>
  );
}
