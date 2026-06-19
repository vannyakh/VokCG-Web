"use client"

import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { AlertTriangle, Clock, CreditCard, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { EntityCell, FormTablePage } from '@/components/admin'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useCreateStripeCheckout } from '@vokcg/api/hooks/use-admin-platform'
import { ADMIN_ROUTES } from '@vokcg/constants'
import { useAppMessage } from '@vokcg/ui'
import {
  useAdminPlans,
  useAdminSubscriptions,
  useAdminTenants,
  useCreateSubscription,
  useDeleteSubscription,
  useUpdateSubscription,
} from '@vokcg/api/hooks/use-admin-saas'
import { formatAdminDate, formatCurrency } from '@vokcg/ui'
import type { Subscription, SubscriptionCreateInput, SubscriptionStatus } from '@vokcg/types'

type SubscriptionFilters = {
  tenant?: string
  status?: SubscriptionStatus
}

const STATUS_COLOR: Record<SubscriptionStatus, string> = {
  active: 'green',
  trialing: 'blue',
  past_due: 'orange',
  canceled: 'default',
}

type SubscriptionFormValues = {
  tenant_id: string
  plan_id: string
  status: SubscriptionStatus
  amount?: number
  renews_at?: string | null
}

const columnHelper = createColumnHelper<Subscription>()

export function SubscriptionsPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminSubscriptions()
  const { data: tenantsData } = useAdminTenants()
  const { data: plansData } = useAdminPlans()
  const createSubscription = useCreateSubscription()
  const updateSubscription = useUpdateSubscription()
  const deleteSubscription = useDeleteSubscription()
  const stripeCheckout = useCreateStripeCheckout()
  const [form] = Form.useForm<SubscriptionFormValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const subscriptions = data?.data ?? []
  const tenants = tenantsData?.data ?? []
  const plans = plansData?.data ?? []

  const activeCount = subscriptions.filter((s) => s.status === 'active').length
  const trialingCount = subscriptions.filter((s) => s.status === 'trialing').length
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length
  const activeRevenue = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.amount), 0)

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setOpen(true)
  }

  const openEdit = (sub: Subscription) => {
    setEditing(sub)
    form.setFieldsValue({
      tenant_id: sub.tenant_id,
      plan_id: sub.plan_id,
      status: sub.status,
      amount: Number(sub.amount),
      renews_at: sub.renews_at ? sub.renews_at.slice(0, 10) : null,
    })
    setOpen(true)
  }

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (plan && !form.getFieldValue('amount')) {
      form.setFieldValue('amount', Number(plan.price))
    }
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload: SubscriptionCreateInput = {
      tenant_id: values.tenant_id,
      plan_id: values.plan_id,
      status: values.status,
      amount: values.amount,
      renews_at: values.renews_at ? new Date(values.renews_at).toISOString() : null,
    }

    try {
      if (editing) {
        await updateSubscription.mutateAsync({
          id: editing.id,
          body: {
            plan_id: payload.plan_id,
            status: payload.status,
            amount: payload.amount,
            renews_at: payload.renews_at,
          },
        })
        message.success('Subscription updated')
      } else {
        await createSubscription.mutateAsync(payload)
        message.success('Subscription created')
      }
      setOpen(false)
    } catch {
      message.error(editing ? 'Failed to update subscription' : 'Failed to create subscription')
    }
  }

  const handleStripeCheckout = async (subscriptionId: string) => {
    const base = `${window.location.origin}${ADMIN_ROUTES.subscriptions}`
    try {
      const res = await stripeCheckout.mutateAsync({
        subscriptionId,
        successUrl: `${base}?checkout=success`,
        cancelUrl: `${base}?checkout=cancel`,
      })
      if (res.data?.url) window.location.href = res.data.url
    } catch {
      message.error('Stripe checkout failed — configure billing first')
    }
  }

  const formTable = useFormTable<Subscription, SubscriptionFilters>({
    data: subscriptions,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No subscriptions yet.',
    onRefresh: () => refetch(),
    formSchema: [
      { name: 'tenant', label: 'Tenant', placeholder: 'Search tenant name' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'trialing', label: 'Trialing' },
          { value: 'past_due', label: 'Past due' },
          { value: 'canceled', label: 'Canceled' },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.tenant && !row.tenant.toLowerCase().includes(filter.tenant.toLowerCase())) return false
      if (filter.status && row.status !== filter.status) return false
      return true
    },
    columns: [
      columnHelper.display({
        id: 'tenant',
        header: 'Tenant',
        cell: ({ row }) => (
          <EntityCell
            name={row.original.tenant}
            accent="bg-accent-muted text-accent"
          />
        ),
      }),
      columnHelper.accessor('plan', {
        header: 'Plan',
        cell: (info) => <Tag color="purple" className="m-0">{info.getValue()}</Tag>,
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <span className="text-sm font-medium text-primary">
            {formatCurrency(Number(info.getValue()), { prefix: '$' })}/mo
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as SubscriptionStatus
          return (
            <Tag color={STATUS_COLOR[status]} className="m-0 capitalize">
              {status.replace('_', ' ')}
            </Tag>
          )
        },
      }),
      columnHelper.accessor('renews_at', {
        header: 'Renews',
        cell: (info) => (
          <span className="text-sm text-muted">{formatAdminDate(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: 'stripe',
        header: 'Stripe',
        cell: ({ row }) =>
          row.original.stripe_subscription_id ? (
            <Tag color="green" className="m-0 text-xs">
              Linked
            </Tag>
          ) : (
            <Tag className="m-0 text-xs">Manual</Tag>
          ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button type="link" size="small" onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            {!row.original.stripe_subscription_id && (
              <Button type="link" size="small" onClick={() => handleStripeCheckout(row.original.id)}>
                Checkout
              </Button>
            )}
            <Popconfirm
              title="Delete subscription?"
              onConfirm={async () => {
                try {
                  await deleteSubscription.mutateAsync(row.original.id)
                  message.success('Subscription deleted')
                } catch {
                  message.error('Failed to delete subscription')
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
      title="Subscriptions"
      description="Billing status, renewals, and recurring revenue across tenant organizations."
      extra={
        <Button type="primary" onClick={openCreate}>
          New subscription
        </Button>
      }
      stats={[
        {
          label: 'Active',
          value: activeCount,
          icon: CreditCard,
          accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Trialing',
          value: trialingCount,
          icon: Clock,
          accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
          label: 'Past due',
          value: pastDueCount,
          icon: AlertTriangle,
          accent: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        },
        { label: 'Monthly recurring', value: activeRevenue, icon: DollarSign, prefix: '$' },
      ]}
      statsColumns={4}
      statsLoading={isLoading}
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? 'Edit subscription' : 'New subscription'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createSubscription.isPending || updateSubscription.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="tenant_id" label="Tenant" rules={[{ required: true }]}>
            <Select
              disabled={Boolean(editing)}
              placeholder="Select tenant"
              options={tenants.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>
          <Form.Item name="plan_id" label="Plan" rules={[{ required: true }]}>
            <Select
              placeholder="Select plan"
              options={plans.map((p) => ({ value: p.id, label: `${p.name} ($${p.price}/mo)` }))}
              onChange={handlePlanChange}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'trialing', label: 'Trialing' },
                  { value: 'past_due', label: 'Past due' },
                  { value: 'canceled', label: 'Canceled' },
                ]}
              />
            </Form.Item>
            <Form.Item name="amount" label="Amount (USD/mo)">
              <InputNumber min={0} className="w-full" prefix="$" />
            </Form.Item>
          </div>
          <Form.Item name="renews_at" label="Renews at">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </FormTablePage>
  )
}
