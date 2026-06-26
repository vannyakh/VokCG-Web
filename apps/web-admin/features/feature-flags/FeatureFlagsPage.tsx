"use client";

import { Button, Progress, Switch, Tag } from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { Page } from "@vokcg/ui";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import { useAdminFeatureFlags, useUpdateFeatureFlag } from "@/api";
import { useAppMessage } from "@vokcg/ui";
import type { FeatureFlag } from "@/types/platform";

type FeatureFlagFilters = {
  key?: string;
  enabled?: boolean;
};

const columnHelper = createColumnHelper<FeatureFlag>();

export function FeatureFlagsPage() {
  const message = useAppMessage();
  const { data, isLoading, refetch } = useAdminFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  const flags = data?.data ?? [];

  const toggleEnabled = async (flag: FeatureFlag, enabled: boolean) => {
    try {
      await updateFlag.mutateAsync({ id: flag.id, body: { enabled } });
    } catch {
      message.error("Failed to update feature flag");
    }
  };

  const formTable = useFormTable<FeatureFlag, FeatureFlagFilters>({
    data: flags,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: "No feature flags yet.",
    onRefresh: () => refetch(),
    formSchema: [
      { name: "key", label: "Key", placeholder: "Search flag key" },
      {
        name: "enabled",
        label: "Status",
        type: "select",
        placeholder: "All statuses",
        options: [
          { value: true, label: "Enabled" },
          { value: false, label: "Disabled" },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (
        filter.key &&
        !row.key.toLowerCase().includes(filter.key.toLowerCase())
      )
        return false;
      if (filter.enabled !== undefined && row.enabled !== filter.enabled)
        return false;
      return true;
    },
    columns: [
      columnHelper.accessor("key", {
        header: "Key",
        size: 200,
        cell: (info) => <code className="text-xs">{info.getValue()}</code>,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="text-sm text-secondary">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("rollout", {
        header: "Rollout",
        size: 160,
        cell: (info) => {
          const v = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <Progress
                percent={v}
                size="small"
                style={{ width: 80, margin: 0 }}
                showInfo={false}
              />
              <Tag>{v}%</Tag>
            </div>
          );
        },
      }),
      columnHelper.accessor("enabled", {
        header: "Enabled",
        size: 90,
        cell: (info) => (
          <Switch
            size="small"
            checked={info.getValue()}
            onChange={(checked) => toggleEnabled(info.row.original, checked)}
          />
        ),
      }),
    ],
  });

  return (
    <Page
      autoContentHeight
      title="Feature Flags"
      description="Gradual rollouts and feature toggles."
      extra={
        <Button type="primary" size="small">
          New flag
        </Button>
      }
    >
      <FormTableUI {...formTable} />
    </Page>
  );
}
