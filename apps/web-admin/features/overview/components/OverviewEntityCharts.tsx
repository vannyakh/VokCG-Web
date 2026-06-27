"use client";

import type { EChartsCoreOption } from "echarts/core";
import { EChart } from "@vokcg/ui/charts/echart";
import { ChartCard } from "./ChartCard";

type OverviewEntityChartsProps = {
  entitiesBarOption: EChartsCoreOption;
  distributionOption: EChartsCoreOption;
  loading: boolean;
};

export function OverviewEntityCharts({
  entitiesBarOption,
  distributionOption,
  loading,
}: OverviewEntityChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <ChartCard
          title="Entity counts"
          subtitle="Users · Roles · Permissions · Audit Logs · Services"
        >
          <EChart option={entitiesBarOption} height={300} loading={loading} />
        </ChartCard>
      </div>
      <div className="xl:col-span-5">
        <ChartCard
          title="Resource distribution"
          subtitle="Share of total entities"
        >
          <EChart option={distributionOption} height={300} loading={loading} />
        </ChartCard>
      </div>
    </div>
  );
}
