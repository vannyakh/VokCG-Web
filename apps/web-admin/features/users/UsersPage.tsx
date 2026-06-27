"use client";

import { Button, Tag } from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import {
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { FormTablePage, UserCell } from "@/components/admin";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import { formatAdminDate } from "@vokcg/ui";
import type { User } from "@/types/auth";
import { useUsersPage } from "./hooks/use-users-page";
import type { UserFilters } from "./hooks/use-users-page";
import { UserActionsMenu } from "./components/UserActionsMenu";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { UserFormModal } from "./components/UserFormModal";
import { UserPasswordResetModal } from "./components/UserPasswordResetModal";

const columnHelper = createColumnHelper<User>();

const USER_FORM_SCHEMA = [
  {
    name: "query",
    label: "Search",
    placeholder: "Name, email, or username",
  },
  {
    name: "is_active",
    label: "Status",
    type: "select" as const,
    placeholder: "All statuses",
    options: [
      { value: true, label: "Active" },
      { value: false, label: "Inactive" },
    ],
  },
];

function filterUsers(filter: UserFilters, row: User) {
  if (filter.query) {
    const q = filter.query.toLowerCase().trim();
    const hay = [row.username, row.email, row.full_name ?? ""]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filter.is_active !== undefined && row.is_active !== filter.is_active)
    return false;
  return true;
}

export function UsersPage() {
  const {
    users,
    isLoading,
    stats,
    refetch,
    form,
    modalOpen,
    editingUser,
    openCreate,
    openEdit,
    closeModal,
    drawerOpen,
    detailUser,
    closeDrawer,
    pwdModalOpen,
    pwdUser,
    openDetail,
    openPasswordReset,
    closePasswordReset,
    toggleActive,
    setUserActive,
    handleDelete,
    handlePasswordReset,
    handleSubmit,
    isSubmitting,
    isDeleting,
    isResettingPassword,
    isTogglingActive,
  } = useUsersPage();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "user",
        header: "User",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openDetail(row.original)}
            className="min-w-0 text-left transition-opacity hover:opacity-80"
          >
            <UserCell
              username={row.original.username}
              fullName={row.original.full_name}
              avatarUrl={row.original.avatar_url}
            />
          </button>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="font-mono text-[12px] text-muted">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("is_active", {
        header: "Status",
        size: 96,
        cell: (info) => (
          <Tag
            color={info.getValue() ? "green" : "default"}
            className="m-0 capitalize"
          >
            {info.getValue() ? "Active" : "Inactive"}
          </Tag>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Joined",
        size: 116,
        cell: (info) => (
          <span className="text-[12px] text-muted">
            {formatAdminDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        size: 52,
        cell: ({ row }) => (
          <UserActionsMenu
            user={row.original}
            onDetail={openDetail}
            onEdit={openEdit}
            onToggleActive={toggleActive}
            onDelete={handleDelete}
            onResetPassword={openPasswordReset}
          />
        ),
      }),
    ],
    [
      openDetail,
      openEdit,
      toggleActive,
      handleDelete,
      openPasswordReset,
    ],
  );

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  const formTable = useFormTable<User, UserFilters>({
    data: users,
    getRowId: (row) => row.id,
    loading: isLoading,
    enableRowSelection: true,
    emptyText: "No app users found.",
    onRefresh: handleRefresh,
    formSchema: USER_FORM_SCHEMA,
    filterFn: filterUsers,
    columns,
  });

  /* ── Bulk actions ─────────────────────────────────────────────── */
  const selectedUsers = formTable.table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original);
  const selectedCount = selectedUsers.length;

  const bulkSetActive = useCallback(
    async (active: boolean) => {
      if (selectedCount === 0) return;
      await Promise.allSettled(
        selectedUsers.map((u) => setUserActive(u, active)),
      );
      formTable.setRowSelection({});
    },
    [formTable, selectedCount, selectedUsers, setUserActive],
  );

  return (
    <>
      <FormTablePage
        title="Users"
        description="Manage app user accounts and access."
        extra={
          <Button
            type="primary"
            icon={<UserPlus size={14} />}
            onClick={openCreate}
          >
            Add user
          </Button>
        }
        stats={[
          {
            label: "Total users",
            value: stats.total,
            icon: Users,
          },
          {
            label: "Active",
            value: stats.activeCount,
            icon: UserCheck,
            accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Inactive",
            value: stats.inactiveCount,
            icon: UserMinus,
            accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          },
        ]}
        statsColumns={3}
        statsLoading={isLoading}
        statsExtra={
          selectedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent-muted/20 px-3 py-2">
              <span className="text-sm font-medium text-primary">
                {selectedCount} selected
              </span>
              <Button size="small" onClick={() => void bulkSetActive(true)}>
                Activate
              </Button>
              <Button size="small" onClick={() => void bulkSetActive(false)}>
                Deactivate
              </Button>
              <Button
                size="small"
                type="link"
                onClick={() => formTable.setRowSelection({})}
              >
                Clear
              </Button>
            </div>
          ) : null
        }
      >
        <FormTableUI {...formTable} />
      </FormTablePage>

      {/* Create / Edit modal */}
      <UserFormModal
        open={modalOpen}
        editing={editingUser}
        form={form}
        confirmLoading={isSubmitting}
        onOk={() => void handleSubmit()}
        onCancel={closeModal}
      />

      <UserDetailDrawer
        open={drawerOpen}
        user={detailUser}
        onClose={closeDrawer}
        onEdit={openEdit}
        onToggleActive={toggleActive}
        onDelete={handleDelete}
        onResetPassword={openPasswordReset}
        isTogglingActive={isTogglingActive}
        isDeleting={isDeleting}
      />

      <UserPasswordResetModal
        open={pwdModalOpen}
        user={pwdUser}
        confirmLoading={isResettingPassword}
        onOk={(pwd) => void handlePasswordReset(pwd)}
        onCancel={closePasswordReset}
      />
    </>
  );
}
