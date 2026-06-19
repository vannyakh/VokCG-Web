"use client"

import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { CheckCircle, Layers, Users, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EntityCell, FormTablePage } from '@/components/admin'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminPlans, useCreatePlan, useDeletePlan, useUpdatePlan } from '@vokcg/api/hooks/use-admin-saas'
import { useAppMessage } from '@vokcg/ui'
import { formatCurrency } from '@vokcg/ui'
import type { Plan, PlanCreateInput } from '@vokcg/types'

type PlanFormValues = PlanCreateInput

type PlanFilters = {
  name?: string
  active?: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const columnHelper = createColumnHelper<Plan>()

export function PlansPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminPlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()
  const [form] = Form.useForm<PlanFormValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)

  const plans = data?.data ?? []

  const stats = useMemo(() => {
    const activePlans = plans.filter((p) => p.active).length
    const totalSubscribers = plans.reduce((sum, p) => sum + Number(p.subscribers), 0)
    const avgPrice =
      plans.length > 0
        ? plans.reduce((sum, p) => sum + Number(p.price), 0) / plans.length
        : 0
    return { activePlans, totalSubscribers, avgPrice }
  }, [plans])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ interval: 'month', active: true, features: [] })
    setOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setEditing(plan)
    form.setFieldsValue({
      name: plan.name,
      slug: plan.slug,
      price: Number(plan.price),
      interval: plan.interval,
      features: plan.features,
      active: plan.active,
      stripe_price_id: plan.stripe_price_id,
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        await updatePlan.mutateAsync({ id: editing.id, body: values })
        message.success('Plan updated')
      } else {
        await createPlan.mutateAsync(values)
        message.success('Plan created')
      }
      setOpen(false)
    } catch {
      message.error(editing ? 'Failed to update plan' : 'Failed to create plan')
    }
  }

  const formTable = useFormTable<Plan, PlanFilters>({
    data: plans,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No plans yet. Create your first plan.',
    onRefresh: () => refetch(),
    formSchema: [
      { name: 'name', label: 'Name', placeholder: 'Search plan name' },
      {
        name: 'active',
        label: 'Status',
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.name && !row.name.toLowerCase().includes(filter.name.toLowerCase())) return false
      if (filter.active !== undefined && row.active !== filter.active) return false
      return true
    },
    columns: [
      columnHelper.display({
        id: 'plan',
        header: 'Plan',
        cell: ({ row }) => (
          <EntityCell
            name={row.original.name}
            subtitle={row.original.slug}
            accent={
              row.original.active
                ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'bg-subtle text-muted'
            }
          />
        ),
      }),
      columnHelper.display({
        id: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-primary">
            {formatCurrency(Number(row.original.price), { prefix: '$' })}/{row.original.interval}
          </span>
        ),
      }),
      columnHelper.accessor('features', {
        header: 'Features',
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue().length === 0 && (
              <span className="text-xs text-muted">—</span>
            )}
            {info.getValue().map((f: string) => (
              <Tag key={f} className="m-0 text-xs">
                {f}
              </Tag>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor('subscribers', {
        header: 'Subscribers',
        cell: (info) => (
          <div className="inline-flex items-center gap-1.5 text-sm text-secondary">
            <Users size={14} className="text-muted" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('active', {
        header: 'Active',
        size: 90,
        cell: (info) => <Switch checked={info.getValue()} size="small" disabled />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 140,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button type="link" size="small" onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this plan?"
              description="Plans with subscriptions cannot be deleted."
              onConfirm={async () => {
                try {
                  await deletePlan.mutateAsync(row.original.id)
                  message.success('Plan deleted')
                } catch {
                  message.error('Failed to delete plan')
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
  })

  return (
    <FormTablePage
      title="Plans"
      description="Pricing tiers, entitlements, and subscriber counts for SaaS tenants."
      extra={
        <Button type="primary" onClick={openCreate}>
          New plan
        </Button>
      }
      stats={[
        { label: 'Total plans', value: plans.length, icon: Layers },
        {
          label: 'Active plans',
          value: stats.activePlans,
          icon: CheckCircle,
          accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Total subscribers',
          value: stats.totalSubscribers,
          icon: Users,
          accent: 'bg-accent-muted text-accent',
        },
        {
          label: 'Avg. price',
          value: stats.avgPrice,
          icon: Zap,
          prefix: '$',
          precision: 0,
        },
      ]}
      statsColumns={4}
      statsLoading={isLoading}
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? 'Edit plan' : 'New plan'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createPlan.isPending || updatePlan.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input
              placeholder="Pro"
              onChange={(e) => {
                if (!editing) form.setFieldValue('slug', slugify(e.target.value))
              }}
            />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: 'Slug is required' },
              { pattern: /^[a-z0-9-]+$/, message: 'Lowercase letters, numbers, and hyphens only' },
            ]}
          >
            <Input placeholder="pro" disabled={Boolean(editing)} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="price" label="Price (USD)" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" prefix="$" />
            </Form.Item>
            <Form.Item name="interval" label="Interval" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'month', label: 'Monthly' },
                  { value: 'year', label: 'Yearly' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="features" label="Features">
            <Select mode="tags" placeholder="Add feature and press Enter" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="stripe_price_id" label="Stripe Price ID">
            <Input placeholder="price_..." />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </FormTablePage>
  )
}
