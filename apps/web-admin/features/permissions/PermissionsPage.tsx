"use client";

import { Button, Tag } from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { Page } from "@vokcg/ui";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import { useAdminPermissions } from "@/api";
import type { Permission } from "@/types/auth";

type PermissionFilters = {
  code?: string;
  resource?: string;
};

const columnHelper = createColumnHelper<Permission>();

export function PermissionsPage() {
  const { data, isLoading, refetch } = useAdminPermissions();
  const permissions = data?.data ?? [];

  const formTable = useFormTable<Permission, PermissionFilters>({
    data: permissions,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: "No permissions found.",
    onRefresh: () => refetch(),
    formSchema: [
      { name: "code", label: "Code", placeholder: "e.g. users:read" },
      { name: "resource", label: "Resource", placeholder: "e.g. users" },
    ],
    filterFn: (filter, row) => {
      if (
        filter.code &&
        !row.code.toLowerCase().includes(filter.code.toLowerCase())
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
      columnHelper.accessor("code", {
        header: "Code",
        size: 200,
        cell: (info) => (
          <Tag color="blue" className="font-mono text-xs">
            {info.getValue()}
          </Tag>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="text-sm font-medium text-primary">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("resource", {
        header: "Resource",
        size: 140,
        cell: (info) => (
          <span className="text-sm text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("action", {
        header: "Action",
        size: 100,
        cell: (info) => <Tag className="text-xs">{info.getValue()}</Tag>,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="text-sm text-muted">{info.getValue() ?? "—"}</span>
        ),
      }),
    ],
  });

  return (
    <Page
      autoContentHeight
      title="Permissions"
      description="Catalog of RBAC permission codes assigned to roles."
      extra={
        <Button type="primary" disabled>
          Add permission
        </Button>
      }
    >
      <FormTableUI {...formTable} />
    </Page>
  );
}
