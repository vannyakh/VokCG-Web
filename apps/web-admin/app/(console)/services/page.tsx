"use client"

import { createColumnHelper } from '@tanstack/react-table'
import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminServices } from '@vokcg/api'

type Service = {
  id: string
  key: string
  value?: unknown
  description?: string | null
  updated_at: string
}

type ServiceFilters = {
  key?: string
}

const columnHelper = createColumnHelper<Service>()

export default function AdminServicesPage() {
  const { data, isLoading, refetch } = useAdminServices()
  const services = (data?.data ?? []) as Service[]

  const formTable = useFormTable<Service, ServiceFilters>({
    data: services,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No service configs found.',
    onRefresh: () => refetch(),
    formSchema: [{ name: 'key', label: 'Key', placeholder: 'Search config key' }],
    filterFn: (filter, row) => {
      if (filter.key && !row.key.toLowerCase().includes(filter.key.toLowerCase())) return false
      return true
    },
    columns: [
      columnHelper.accessor('key', {
        header: 'Key',
        size: 220,
        cell: (info) => (
          <span className="font-mono text-sm font-semibold text-primary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => <span className="text-sm text-secondary">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('updated_at', {
        header: 'Updated',
        size: 140,
        cell: (info) => (
          <span className="text-sm text-muted">{new Date(info.getValue()).toLocaleDateString()}</span>
        ),
      }),
      columnHelper.display({
        id: 'value',
        header: 'Value',
        cell: ({ row }) =>
          row.original.value != null ? (
            <code className="text-xs text-muted">{JSON.stringify(row.original.value)}</code>
          ) : (
            <span className="text-xs text-muted">—</span>
          ),
      }),
    ],
  })

  return (
    <Page
      autoContentHeight
      title="Services"
      description="Application service configuration keys and values."
    >
      <FormTableUI {...formTable} />
    </Page>
  )
}
