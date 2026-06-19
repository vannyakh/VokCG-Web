"use client"

import { Button, Input, Modal, Popconfirm, Tag } from 'antd'
import { Copy, Plus } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { useState } from 'react'

import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminApiKeys, useCreateApiKey, useDeleteApiKey } from '@vokcg/api/hooks/use-admin-platform'
import { useAppMessage } from '@vokcg/ui'
import type { ApiKey } from '@vokcg/types'

type ApiKeyFilters = {
  name?: string
}

const columnHelper = createColumnHelper<ApiKey>()

export function ApiKeysPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminApiKeys()
  const createApiKey = useCreateApiKey()
  const deleteApiKey = useDeleteApiKey()
  const apiKeys = data?.data ?? []

  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)

  const handleCreate = async () => {
    const name = keyName.trim()
    if (!name) {
      message.error('Enter a name for this key')
      return
    }

    try {
      const response = await createApiKey.mutateAsync({ name, scopes: [] })
      const secret = response.data?.secret
      if (!secret) {
        message.error('Could not create API key')
        return
      }
      setCreateOpen(false)
      setKeyName('')
      setCreatedSecret(secret)
      message.success('API key created')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Could not create API key')
    }
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      message.success('Copied to clipboard')
    } catch {
      message.error('Could not copy')
    }
  }

  const formTable = useFormTable<ApiKey, ApiKeyFilters>({
    data: apiKeys,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No API keys yet.',
    onRefresh: () => refetch(),
    formSchema: [{ name: 'name', label: 'Name', placeholder: 'Search key name' }],
    filterFn: (filter, row) => {
      if (filter.name && !row.name.toLowerCase().includes(filter.name.toLowerCase())) return false
      return true
    },
    columns: [
      columnHelper.accessor('name', {
        header: 'Name',
        size: 180,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('prefix', {
        header: 'Prefix',
        size: 140,
        cell: (info) => <code className="text-xs">{info.getValue()}***</code>,
      }),
      columnHelper.accessor('scopes', {
        header: 'Scopes',
        cell: (info) => info.getValue().map((s: string) => <Tag key={s}>{s}</Tag>),
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        size: 120,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('last_used', {
        header: 'Last used',
        size: 160,
        cell: (info) => {
          const v = info.getValue()
          return v ? new Date(v).toLocaleString() : <span className="text-muted">Never</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <Popconfirm
            title="Revoke this API key?"
            onConfirm={async () => {
              try {
                await deleteApiKey.mutateAsync(row.original.id)
                message.success('API key revoked')
              } catch {
                message.error('Failed to revoke API key')
              }
            }}
          >
            <Button type="link" size="small" danger>
              Revoke
            </Button>
          </Popconfirm>
        ),
      }),
    ],
  })

  return (
    <Page
      autoContentHeight
      title="API Keys"
      description="Platform-wide programmatic access tokens."
      extra={
        <Button type="primary" size="small" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          Generate key
        </Button>
      }
    >
      <FormTableUI {...formTable} />

      <Modal
        title="Generate API key"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false)
          setKeyName('')
        }}
        onOk={handleCreate}
        confirmLoading={createApiKey.isPending}
        okText="Generate key"
        destroyOnClose
      >
        <p className="mb-3 text-sm text-muted">Give this key a name so you can recognize it later.</p>
        <Input
          value={keyName}
          onChange={(event) => setKeyName(event.target.value)}
          placeholder="e.g. CI pipeline"
          maxLength={120}
          onPressEnter={handleCreate}
        />
      </Modal>

      <Modal
        title="Copy your API key"
        open={Boolean(createdSecret)}
        onCancel={() => setCreatedSecret(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setCreatedSecret(null)}>
            I saved my key
          </Button>,
        ]}
        destroyOnClose
      >
        <p className="mb-3 text-sm text-muted">This is the only time the full key will be shown. Copy it now.</p>
        <div className="flex items-center gap-2 rounded-xl bg-subtle/60 p-3">
          <code className="min-w-0 flex-1 break-all text-xs text-primary">{createdSecret}</code>
          <Button
            type="text"
            icon={<Copy size={16} />}
            aria-label="Copy"
            onClick={() => createdSecret && handleCopy(createdSecret)}
          />
        </div>
      </Modal>
    </Page>
  )
}
