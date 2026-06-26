"use client";

import { Card } from "antd";
import { Activity, Database, FileText, Key, Shield, Users } from "lucide-react";
import { useMemo } from "react";
import { Page } from "@vokcg/ui";
import { StatGrid } from "@/components/admin";
import { EChart } from "@vokcg/ui/charts/echart";
import { useColorMode } from "@vokcg/ui";
import { useAdminLogs, useAdminOverview } from "@/api";
import {
  buildAuditActionOption,
  buildAuditTimelineOption,
  buildDistributionPieOption,
  buildEntitiesBarOption,
  buildHealthGaugeOption,
} from "@/lib/admin-dashboard-charts";
import type { AuditLog } from "@/types/auth";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="bg-surface border-default"
      size="small"
      title={
        <div className="flex flex-col gap-0.5 py-0.5">
          <span className="text-[13px] font-bold text-primary">{title}</span>
          {subtitle && (
            <span className="text-[11px] font-normal text-muted">
              {subtitle}
            </span>
          )}
        </div>
      }
      styles={{ body: { padding: "8px 12px 12px" } }}
    >
      {children}
    </Card>
  );
}

export function OverviewPage() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const { data: overviewData, isLoading: overviewLoading } = useAdminOverview();
  const { data: logsData, isLoading: logsLoading } = useAdminLogs();

  const stats = overviewData?.data;
  const logs = (logsData?.data?.items ?? []) as AuditLog[];

  const entitiesBarOption = useMemo(
    () => (stats ? buildEntitiesBarOption(stats, isDark) : {}),
    [stats, isDark],
  );

  const distributionOption = useMemo(
    () => (stats ? buildDistributionPieOption(stats, isDark) : {}),
    [stats, isDark],
  );

  const auditActionOption = useMemo(
    () => buildAuditActionOption(logs, isDark),
    [logs, isDark],
  );

  const auditTimelineOption = useMemo(
    () => buildAuditTimelineOption(logs, isDark),
    [logs, isDark],
  );

  const redisGaugeOption = useMemo(
    () =>
      buildHealthGaugeOption("Redis", stats?.redis_connected ?? false, isDark),
    [stats?.redis_connected, isDark],
  );

  const dbGaugeOption = useMemo(
    () =>
      buildHealthGaugeOption(
        "Database",
        stats?.database_enabled ?? false,
        isDark,
      ),
    [stats?.database_enabled, isDark],
  );

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <StatGrid
          columns={6}
          loading={overviewLoading}
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
              accent:
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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
              label: "Redis",
              value: stats?.redis_connected ? "Online" : "Offline",
              icon: Database,
              accent: stats?.redis_connected
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400",
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ChartCard
              title="Entity counts"
              subtitle="Users, roles, permissions, logs, and services"
            >
              <EChart
                option={entitiesBarOption}
                height={320}
                loading={overviewLoading}
              />
            </ChartCard>
          </div>
          <div className="xl:col-span-5">
            <ChartCard
              title="Resource distribution"
              subtitle="Share of total entities"
            >
              <EChart
                option={distributionOption}
                height={320}
                loading={overviewLoading}
              />
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ChartCard
            title="Audit by action"
            subtitle="Recent log entries grouped by action type"
          >
            <EChart
              option={auditActionOption}
              height={280}
              loading={logsLoading}
            />
          </ChartCard>
          <ChartCard
            title="Audit activity"
            subtitle="Daily events over the last 14 days"
          >
            <EChart
              option={auditTimelineOption}
              height={280}
              loading={logsLoading}
            />
          </ChartCard>
          <ChartCard title="Redis status" subtitle="Cache connectivity">
            <EChart
              option={redisGaugeOption}
              height={280}
              loading={overviewLoading}
            />
          </ChartCard>
          <ChartCard title="Database status" subtitle="PostgreSQL availability">
            <EChart
              option={dbGaugeOption}
              height={280}
              loading={overviewLoading}
            />
          </ChartCard>
        </div>
      </div>
    </Page>
  );
}
