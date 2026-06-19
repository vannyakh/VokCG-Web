"use client"

import { Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminRoles } from '@vokcg/api'

type Permission = { id: string; code: string }
type Role = {
  id: string
  name: string
  slug: string
  description?: string | null
  permissions: Permission[]
}

type RoleFilters = {
  name?: string
  slug?: string
}

const columnHelper = createColumnHelper<Role>()

export default function AdminRolesPage() {
  const { data, isLoading, refetch } = useAdminRoles()
  const roles = (data?.data ?? []) as Role[]

  const formTable = useFormTable<Role, RoleFilters>({
    data: roles,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No roles found.',
    onRefresh: () => refetch(),
    formSchema: [
      { name: 'name', label: 'Name', placeholder: 'Search role name' },
      { name: 'slug', label: 'Slug', placeholder: 'Search slug' },
    ],
    filterFn: (filter, row) => {
      if (filter.name && !row.name.toLowerCase().includes(filter.name.toLowerCase())) return false
      if (filter.slug && !row.slug.toLowerCase().includes(filter.slug.toLowerCase())) return false
      return true
    },
    columns: [
      columnHelper.display({
        id: 'role',
        header: 'Role',
        size: 180,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0">
            <span className="text-sm font-semibold text-primary">{row.original.name}</span>
            <Tag color="blue" className="mt-1 w-fit font-mono text-xs">
              {row.original.slug}
            </Tag>
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => <span className="text-sm text-muted">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.display({
        id: 'permissions',
        header: 'Permissions',
        cell: ({ row }) =>
          row.original.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.permissions.map((perm) => (
                <Tag key={perm.id} className="text-xs">
                  {perm.code}
                </Tag>
              ))}
            </div>
          ) : (
            <span className="text-xs italic text-muted">None assigned</span>
          ),
      }),
      columnHelper.display({
        id: 'count',
        header: 'Count',
        size: 80,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-secondary">{row.original.permissions.length}</span>
        ),
      }),
    ],
  })

  return (
    <Page autoContentHeight title="Roles" description="Role definitions and assigned permission codes.">
      <FormTableUI {...formTable} />
    </Page>
  )
}
