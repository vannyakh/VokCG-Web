"use client";

import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Tag,
} from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { Building2, CheckCircle, Clock, DollarSign, Users } from "lucide-react";
import { useState } from "react";
import { EntityCell, FormTablePage } from "@/components/admin";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import {
  useAdminPlans,
  useAdminTenants,
  useCreateTenant,
  useDeleteTenant,
  useUpdateTenant,
} from "@/api";
import { useAppMessage } from "@vokcg/ui";
import { formatAdminDate, formatCurrency } from "@vokcg/ui";
import type { Tenant, TenantCreateInput, TenantStatus } from "@/types/saas";

type TenantFilters = {
  name?: string;
  status?: TenantStatus;
};

const STATUS_COLOR: Record<TenantStatus, string> = {
  active: "green",
  trial: "blue",
  suspended: "red",
};

const STATUS_ACCENT: Record<TenantStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  trial: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const columnHelper = createColumnHelper<Tenant>();

export function TenantsPage() {
  const message = useAppMessage();
  const { data, isLoading, refetch } = useAdminTenants();
  const { data: plansData } = useAdminPlans();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const [form] = Form.useForm<TenantCreateInput>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  const tenants = data?.data ?? [];
  const plans = plansData?.data ?? [];
  const totalMrr = tenants.reduce((sum, t) => sum + Number(t.mrr), 0);
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const trialCount = tenants.filter((t) => t.status === "trial").length;
  const totalMembers = tenants.reduce((sum, t) => sum + Number(t.users), 0);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", members_count: 0 });
    setOpen(true);
  };

  const openEdit = (tenant: Tenant) => {
    setEditing(tenant);
    form.setFieldsValue({
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      plan_id: tenant.plan_id,
      members_count: tenant.users,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateTenant.mutateAsync({ id: editing.id, body: values });
        message.success("Tenant updated");
      } else {
        await createTenant.mutateAsync(values);
        message.success("Tenant created");
      }
      setOpen(false);
    } catch {
      message.error(
        editing ? "Failed to update tenant" : "Failed to create tenant",
      );
    }
  };

  const formTable = useFormTable<Tenant, TenantFilters>({
    data: tenants,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: "No tenants yet. Create your first organization.",
    onRefresh: () => refetch(),
    formSchema: [
      {
        name: "name",
        label: "Organization",
        placeholder: "Search name or slug",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "All statuses",
        options: [
          { value: "active", label: "Active" },
          { value: "trial", label: "Trial" },
          { value: "suspended", label: "Suspended" },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.name) {
        const q = filter.name.toLowerCase();
        if (
          !row.name.toLowerCase().includes(q) &&
          !row.slug.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filter.status && row.status !== filter.status) return false;
      return true;
    },
    columns: [
      columnHelper.display({
        id: "organization",
        header: "Organization",
        cell: ({ row }) => (
          <EntityCell
            name={row.original.name}
            subtitle={row.original.slug}
            accent={STATUS_ACCENT[row.original.status]}
          />
        ),
      }),
      columnHelper.accessor("plan", {
        header: "Plan",
        cell: (info) => {
          const plan = info.getValue();
          return plan ? (
            <Tag color="purple" className="m-0">
              {plan}
            </Tag>
          ) : (
            <span className="text-xs text-muted">No plan</span>
          );
        },
      }),
      columnHelper.accessor("users", {
        header: "Members",
        cell: (info) => (
          <div className="inline-flex items-center gap-1.5 text-sm text-secondary">
            <Users size={14} className="text-muted" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("mrr", {
        header: "MRR",
        cell: (info) => (
          <span className="text-sm font-medium text-primary">
            {formatCurrency(Number(info.getValue()), { prefix: "$" })}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as TenantStatus;
          return (
            <Tag color={STATUS_COLOR[status]} className="m-0 capitalize">
              {status}
            </Tag>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-muted">
            {formatAdminDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        size: 140,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              type="link"
              size="small"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this tenant?"
              description="All subscriptions for this tenant will be removed."
              onConfirm={async () => {
                try {
                  await deleteTenant.mutateAsync(row.original.id);
                  message.success("Tenant deleted");
                } catch {
                  message.error("Failed to delete tenant");
                }
              }}
            >
              <Button type="link" size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </div>
        ),
      }),
    ],
  });

  return (
    <FormTablePage
      title="Tenants"
      description="SaaS organizations, member seats, plans, and billing status."
      extra={
        <Button type="primary" onClick={openCreate}>
          Create tenant
        </Button>
      }
      stats={[
        { label: "Total tenants", value: tenants.length, icon: Building2 },
        {
          label: "Active",
          value: activeCount,
          icon: CheckCircle,
          accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Trial",
          value: trialCount,
          icon: Clock,
          accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
        {
          label: "Combined MRR",
          value: totalMrr,
          icon: DollarSign,
          prefix: "$",
        },
        {
          label: "Total members",
          value: totalMembers,
          icon: Users,
          accent: "bg-accent-muted text-accent",
        },
      ]}
      statsColumns={3}
      statsLoading={isLoading}
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? "Edit tenant" : "Create tenant"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createTenant.isPending || updateTenant.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Organization name"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Acme Studio"
              onChange={(e) => {
                if (!editing)
                  form.setFieldValue("slug", slugify(e.target.value));
              }}
            />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Lowercase letters, numbers, and hyphens only",
              },
            ]}
          >
            <Input placeholder="acme" disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="plan_id" label="Plan">
            <Select
              allowClear
              placeholder="Select plan"
              options={plans.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "active", label: "Active" },
                  { value: "trial", label: "Trial" },
                  { value: "suspended", label: "Suspended" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="members_count"
              label="Member seats"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </FormTablePage>
  );
}
