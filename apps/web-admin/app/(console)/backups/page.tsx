"use client"

import { Button, Dropdown, Popconfirm, Tag } from 'antd'
import type { MenuProps } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminBackups, useDeleteBackup, useRunBackup } from '@vokcg/api/hooks/use-admin-platform'
import { useAppMessage } from '@vokcg/ui/hooks/use-app-message'
import type { Backup, BackupStatus, BackupType } from '@vokcg/types'

type BackupFilters = {
  type?: BackupType
  status?: BackupStatus
}

const STATUS_COLOR: Record<BackupStatus, string> = {
  completed: 'green',
  running: 'blue',
  failed: 'red',
}

const columnHelper = createColumnHelper<Backup>()

export default function AdminBackupsPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminBackups()
  const runBackup = useRunBackup()
  const deleteBackup = useDeleteBackup()
  const backups = data?.data ?? []

  const runMenu: MenuProps['items'] = [
    { key: 'full', label: 'Full backup' },
    { key: 'incremental', label: 'Incremental backup' },
  ]

  const handleRun = async (type: BackupType) => {
    try {
      await runBackup.mutateAsync(type)
      message.success(`${type} backup started`)
    } catch {
      message.error('Failed to run backup')
    }
  }

  const formTable = useFormTable<Backup, BackupFilters>({
    data: backups,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No backups yet.',
    onRefresh: () => refetch(),
    formSchema: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        placeholder: 'All types',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'incremental', label: 'Incremental' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: 'completed', label: 'Completed' },
          { value: 'running', label: 'Running' },
          { value: 'failed', label: 'Failed' },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.type && row.type !== filter.type) return false
      if (filter.status && row.status !== filter.status) return false
      return true
    },
    columns: [
      columnHelper.accessor('type', {
        header: 'Type',
        size: 120,
        cell: (info) => {
          const v = info.getValue()
          return (
            <Tag color={v === 'full' ? 'purple' : 'cyan'} className="capitalize">
              {v}
            </Tag>
          )
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        size: 120,
        cell: (info) => {
          const v = info.getValue() as BackupStatus
          return (
            <Tag color={STATUS_COLOR[v]} className="capitalize">
              {v}
            </Tag>
          )
        },
      }),
      columnHelper.accessor('size_mb', {
        header: 'Size (MB)',
        size: 120,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <Popconfirm
            title="Delete this backup record?"
            onConfirm={async () => {
              try {
                await deleteBackup.mutateAsync(row.original.id)
                message.success('Backup deleted')
              } catch {
                message.error('Failed to delete backup')
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
      title="Backups"
      description="Database and asset backup history."
      extra={
        <Dropdown menu={{ items: runMenu, onClick: ({ key }) => handleRun(key as BackupType) }}>
          <Button type="primary" size="small" loading={runBackup.isPending}>
            Run backup
          </Button>
        </Dropdown>
      }
    >
      <FormTableUI {...formTable} />
    </Page>
  )
}
