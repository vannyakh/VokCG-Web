"use client";

import { Button, Form, Input, Modal, Popconfirm, Switch, Tag } from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { UserCheck, UserPlus, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FormTablePage, UserCell } from "@/components/admin";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import { useAppMessage } from "@vokcg/ui";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  type AdminUserCreateInput,
  type AdminUserUpdateInput,
} from "@/api";
import { formatAdminDate } from "@vokcg/ui";
import type { User } from "@/types/auth";

type UserFilters = {
  query?: string;
  is_active?: boolean;
};

type UserFormValues = AdminUserCreateInput & AdminUserUpdateInput;

const columnHelper = createColumnHelper<User>();

export function UsersPage() {
  const message = useAppMessage();
  const { data, isLoading, refetch } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const [form] = Form.useForm<UserFormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const users = useMemo(() => data?.data ?? [], [data?.data]);

  const stats = useMemo(() => {
    const activeCount = users.filter((u) => u.is_active).length;
    return { activeCount };
  }, [users]);

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (user: User) => {
      setEditing(user);
      form.setFieldsValue({
        full_name: user.full_name ?? undefined,
        is_active: user.is_active,
      });
      setOpen(true);
    },
    [form],
  );

  const toggleActive = useCallback(
    async (user: User) => {
      try {
        await updateUser.mutateAsync({
          id: user.id,
          body: { is_active: !user.is_active },
        });
        message.success(user.is_active ? "User deactivated" : "User activated");
      } catch {
        message.error("Failed to update user status");
      }
    },
    [message, updateUser],
  );

  const formTable = useFormTable<User, UserFilters>({
    data: users,
    getRowId: (row) => row.id,
    loading: isLoading,
    enableRowSelection: true,
    emptyText: "No app users found.",
    onRefresh: () => refetch(),
    formSchema: [
      {
        name: "query",
        label: "Search",
        placeholder: "Name, email, or username",
      },
      {
        name: "is_active",
        label: "Status",
        type: "select",
        placeholder: "All statuses",
        options: [
          { value: true, label: "Active" },
          { value: false, label: "Inactive" },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.query) {
        const q = filter.query.toLowerCase().trim();
        const haystack = [row.username, row.email, row.full_name ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filter.is_active !== undefined && row.is_active !== filter.is_active)
        return false;
      return true;
    },
    columns: [
      columnHelper.display({
        id: "user",
        header: "User",
        cell: ({ row }) => (
          <div className="min-w-0">
            <UserCell
              username={row.original.username}
              fullName={row.original.full_name}
              avatarUrl={row.original.avatar_url}
            />
            <p className="mt-1 truncate pl-[46px] text-xs text-muted">
              {row.original.email}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("is_active", {
        header: "Status",
        size: 96,
        cell: (info) => (
          <Tag
            color={info.getValue() ? "green" : "red"}
            className="m-0 capitalize"
          >
            {info.getValue() ? "active" : "inactive"}
          </Tag>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Joined",
        size: 112,
        cell: (info) => (
          <span className="text-sm text-muted">
            {formatAdminDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        size: 148,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              type="link"
              size="small"
              className="px-1"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </Button>
            <Popconfirm
              title={
                row.original.is_active
                  ? "Deactivate this user?"
                  : "Activate this user?"
              }
              onConfirm={() => void toggleActive(row.original)}
            >
              <Button type="link" size="small" className="px-1">
                {row.original.is_active ? "Deactivate" : "Activate"}
              </Button>
            </Popconfirm>
          </div>
        ),
      }),
    ],
  });

  const selectedUsers = formTable.table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const selectedCount = selectedUsers.length;

  const bulkSetActive = async (active: boolean) => {
    if (selectedCount === 0) return;
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          updateUser.mutateAsync({ id: user.id, body: { is_active: active } }),
        ),
      );
      message.success(
        active ? "Selected users activated" : "Selected users deactivated",
      );
      formTable.setRowSelection({});
    } catch {
      message.error("Failed to update some users");
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          body: {
            full_name: values.full_name,
            is_active: values.is_active,
          },
        });
        message.success("User updated");
      } else {
        await createUser.mutateAsync({
          email: values.email!,
          username: values.username!,
          password: values.password!,
          full_name: values.full_name,
          is_active: values.is_active,
        });
        message.success("User created");
      }
      setOpen(false);
    } catch {
      message.error(
        editing ? "Failed to update user" : "Failed to create user",
      );
    }
  };

  return (
    <FormTablePage
      title="Users"
      description="Manage app user accounts."
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
        { label: "Total users", value: users.length, icon: Users },
        {
          label: "Active",
          value: stats.activeCount,
          icon: UserCheck,
          accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
      ]}
      statsColumns={2}
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

      <Modal
        title={editing ? "Edit user" : "Add user"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={createUser.isPending || updateUser.isPending}
        destroyOnHidden
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          requiredMark={false}
        >
          {editing ? (
            <div className="mb-4 rounded-lg border border-subtle bg-subtle/40 px-3 py-2.5">
              <p className="text-sm font-semibold text-primary">
                {editing.username}
              </p>
              <p className="text-xs text-muted">{editing.email}</p>
            </div>
          ) : (
            <>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, min: 3, max: 64 }]}
              >
                <Input placeholder="jane" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password placeholder="Minimum 6 characters" />
              </Form.Item>
            </>
          )}

          <Form.Item name="full_name" label="Display name">
            <Input placeholder="Jane Doe" />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch size="small" />
          </Form.Item>
        </Form>
      </Modal>
    </FormTablePage>
  );
}
