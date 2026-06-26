"use client";

import { Tag } from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { Page } from "@vokcg/ui";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import { useAdminLogs } from "@/api";

type Log = {
  id: string;
  action: string;
  resource: string;
  ip_address?: string | null;
  created_at: string;
};

type LogFilters = {
  action?: string;
  resource?: string;
};

const ACTION_COLOR: Record<string, string> = {
  login: "green",
  logout: "default",
  register: "blue",
  refresh: "orange",
};

const columnHelper = createColumnHelper<Log>();

export function LogsPage() {
  const { data, isLoading, refetch } = useAdminLogs();
  const logs = (data?.data?.items ?? []) as Log[];

  const formTable = useFormTable<Log, LogFilters>({
    data: logs,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: "No audit logs yet.",
    onRefresh: () => refetch(),
    formSchema: [
      { name: "action", label: "Action", placeholder: "e.g. login" },
      { name: "resource", label: "Resource", placeholder: "e.g. users" },
    ],
    filterFn: (filter, row) => {
      if (
        filter.action &&
        !row.action.toLowerCase().includes(filter.action.toLowerCase())
      )
        return false;
      if (
        filter.resource &&
        !row.resource.toLowerCase().includes(filter.resource.toLowerCase())
      )
        return false;
      return true;
    },
    columns: [
      columnHelper.accessor("created_at", {
        header: "Time",
        size: 180,
        cell: (info) => (
          <span className="font-mono text-xs text-secondary">
            {new Date(info.getValue()).toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("action", {
        header: "Action",
        size: 120,
        cell: (info) => {
          const action = info.getValue();
          return <Tag color={ACTION_COLOR[action] ?? "default"}>{action}</Tag>;
        },
      }),
      columnHelper.accessor("resource", {
        header: "Resource",
        cell: (info) => (
          <span className="text-sm text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("ip_address", {
        header: "IP",
        size: 140,
        cell: (info) => (
          <span className="font-mono text-xs text-muted">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
    ],
  });

  return (
    <Page
      autoContentHeight
      title="Audit Logs"
      description="Security and activity trail across the platform."
    >
      <FormTableUI {...formTable} />
    </Page>
  );
}
