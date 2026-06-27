"use client";

import type { EChartsCoreOption } from "echarts/core";
import { EChart } from "@vokcg/ui/charts/echart";
import { ChartCard } from "./ChartCard";
import { OverviewSystemHealthCard } from "./OverviewSystemHealthCard";
import type { AdminOverview } from "@/types/auth";

type OverviewAuditSectionProps = {
  auditTimelineOption: EChartsCoreOption;
  auditActionOption: EChartsCoreOption;
  logsLoading: boolean;
  stats?: AdminOverview;
  overviewLoading: boolean;
  allHealthy: boolean;
};

export function OverviewAuditSection({
  auditTimelineOption,
  auditActionOption,
  logsLoading,
  stats,
  overviewLoading,
  allHealthy,
}: OverviewAuditSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <ChartCard
          title="Audit activity"
          subtitle="Daily events over the last 14 days"
        >
          <EChart
            option={auditTimelineOption}
            height={240}
            loading={logsLoading}
          />
        </ChartCard>
      </div>
      <div className="lg:col-span-4">
        <ChartCard
          title="Audit by action"
          subtitle="Log entries grouped by type"
        >
          <EChart
            option={auditActionOption}
            height={240}
            loading={logsLoading}
          />
        </ChartCard>
      </div>
      <div className="lg:col-span-3">
        <OverviewSystemHealthCard
          stats={stats}
          loading={overviewLoading}
          allHealthy={allHealthy}
        />
      </div>
    </div>
  );
}
