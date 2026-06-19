"use client"

import { Button, Popconfirm, Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminWebhooks, useDeleteWebhook } from '@vokcg/api/hooks/use-admin-platform'
import { useAppMessage } from '@vokcg/ui/hooks/use-app-message'
import type { Webhook, WebhookStatus } from '@vokcg/types'

type WebhookFilters = {
  status?: WebhookStatus
}

const STATUS_COLOR: Record<WebhookStatus, string> = {
  active: 'green',
  disabled: 'default',
  failing: 'red',
}

const columnHelper = createColumnHelper<Webhook>()

export default function AdminWebhooksPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminWebhooks()
  const deleteWebhook = useDeleteWebhook()
  const webhooks = data?.data ?? []

  const formTable = useFormTable<Webhook, WebhookFilters>({
    data: webhooks,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No webhooks configured.',
    onRefresh: () => refetch(),
    formSchema: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'disabled', label: 'Disabled' },
          { value: 'failing', label: 'Failing' },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.status && row.status !== filter.status) return false
      return true
    },
    columns: [
      columnHelper.accessor('url', {
        header: 'URL',
        cell: (info) => <span className="truncate text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('events', {
        header: 'Events',
        size: 240,
        cell: (info) => info.getValue().map((e: string) => <Tag key={e}>{e}</Tag>),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        size: 100,
        cell: (info) => {
          const v = info.getValue() as WebhookStatus
          return (
            <Tag color={STATUS_COLOR[v]} className="capitalize">
              {v}
            </Tag>
          )
        },
      }),
      columnHelper.accessor('last_delivery', {
        header: 'Last delivery',
        size: 180,
        cell: (info) => {
          const v = info.getValue()
          return v ? new Date(v).toLocaleString() : '—'
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <Popconfirm
            title="Delete this webhook?"
            onConfirm={async () => {
              try {
                await deleteWebhook.mutateAsync(row.original.id)
                message.success('Webhook deleted')
              } catch {
                message.error('Failed to delete webhook')
              }
            }}
          >
            <Button type="link" size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        ),
      }),
    ],
  })

  return (
    <Page
      autoContentHeight
      title="Webhooks"
      description="Outbound event delivery endpoints."
      extra={
        <Button type="primary" size="small">
          Add webhook
        </Button>
      }
    >
      <FormTableUI {...formTable} />
    </Page>
  )
}
