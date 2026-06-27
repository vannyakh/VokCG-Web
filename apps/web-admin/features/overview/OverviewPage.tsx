"use client";

import { Page } from "@vokcg/ui";
import {
  OverviewAuditSection,
  OverviewEntityCharts,
  OverviewKpiSection,
  OverviewRecentActivity,
} from "./components";
import { useOverviewPage } from "./hooks";

export function OverviewPage() {
  const ctx = useOverviewPage();

  return (
    <Page>
      <div className="flex flex-col gap-5 pt-5 pb-6">
        <OverviewKpiSection
          stats={ctx.stats}
          saasItems={ctx.saasItems}
          saasColumns={ctx.saasColumns}
          loading={ctx.overviewLoading}
        />

        <OverviewEntityCharts
          entitiesBarOption={ctx.entitiesBarOption}
          distributionOption={ctx.distributionOption}
          loading={ctx.overviewLoading}
        />

        <OverviewAuditSection
          auditTimelineOption={ctx.auditTimelineOption}
          auditActionOption={ctx.auditActionOption}
          logsLoading={ctx.logsLoading}
          stats={ctx.stats}
          overviewLoading={ctx.overviewLoading}
          allHealthy={ctx.allHealthy}
        />

        <OverviewRecentActivity logs={ctx.logs} loading={ctx.logsLoading} />
      </div>
    </Page>
  );
}
