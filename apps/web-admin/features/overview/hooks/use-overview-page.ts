"use client";

import type { EChartsCoreOption } from "echarts/core";
import { useMemo } from "react";
import { useColorMode } from "@vokcg/ui";
import { useAdminLogs, useAdminOverview } from "@/api";
import {
  buildAuditActionOption,
  buildAuditTimelineOption,
  buildDistributionPieOption,
  buildEntitiesBarOption,
} from "@/lib/admin-dashboard-charts";
import type { AuditLog } from "@/types/auth";
import {
  buildSaasStatItems,
  resolveSaasColumns,
} from "../utils/stats";

const EMPTY_LOGS: AuditLog[] = [];
const EMPTY_CHART_OPTION = {} as EChartsCoreOption;

export function useOverviewPage() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const { data: overviewData, isLoading: overviewLoading } = useAdminOverview();
  const { data: logsData, isLoading: logsLoading } = useAdminLogs();

  const stats = overviewData?.data;
  const logItems = logsData?.data?.items;
  const logs = logItems ?? EMPTY_LOGS;

  const saasItems = useMemo(() => buildSaasStatItems(stats), [stats]);
  const saasColumns = resolveSaasColumns(saasItems.length);

  const entitiesBarOption = useMemo(
    () =>
      stats ? buildEntitiesBarOption(stats, isDark) : EMPTY_CHART_OPTION,
    [stats, isDark],
  );
  const distributionOption = useMemo(
    () =>
      stats ? buildDistributionPieOption(stats, isDark) : EMPTY_CHART_OPTION,
    [stats, isDark],
  );
  const auditActionOption = useMemo(
    () => buildAuditActionOption(logItems ?? EMPTY_LOGS, isDark),
    [logItems, isDark],
  );
  const auditTimelineOption = useMemo(
    () => buildAuditTimelineOption(logItems ?? EMPTY_LOGS, isDark),
    [logItems, isDark],
  );

  const allHealthy = Boolean(stats?.redis_connected && stats?.database_enabled);

  return {
    stats,
    logs,
    overviewLoading,
    logsLoading,
    saasItems,
    saasColumns,
    entitiesBarOption,
    distributionOption,
    auditActionOption,
    auditTimelineOption,
    allHealthy,
  };
}
