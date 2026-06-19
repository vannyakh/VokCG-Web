"use client"

import { Button, Form, Input, Modal, Popconfirm, Select, Switch, Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { Building2, ShieldCheck, UserCheck, UserPlus, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { FormTablePage, UserCell } from '@vokcg/ui/admin'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAppMessage } from '@vokcg/ui/hooks/use-app-message'
import {
  useAdminRoles,
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  type AdminUserCreateInput,
  type AdminUserUpdateInput,
} from '@vokcg/api'
import { useAdminTenants } from '@vokcg/api/hooks/use-admin-saas'
import { formatAdminDate } from '@vokcg/ui/lib/admin-format'
import type { AuthUser, Role } from '@vokcg/types'

type UserFilters = {
  query?: string
  role?: string
  is_active?: boolean
}

type UserFormValues = AdminUserCreateInput & AdminUserUpdateInput

const columnHelper = createColumnHelper<AuthUser>()

function RoleTags({ roles, isSuperuser }: { roles: Role[]; isSuperuser: boolean }) {
  const visible = roles.slice(0, 2)
  const hidden = roles.length - visible.length

  if (roles.length === 0 && !isSuperuser) {
    return <span className="text-xs text-muted">—</span>
  }

  return (
    <div className="flex max-w-[220px] flex-wrap gap-1">
      {visible.map((role) => (
        <Tag key={role.id} className="m-0 border-default bg-subtle text-secondary">
          {role.slug}
        </Tag>
      ))}
      {hidden > 0 && (
        <Tag className="m-0 border-default bg-subtle text-muted">+{hidden}</Tag>
      )}
      {isSuperuser && (
        <Tag color="purple" className="m-0">
          superuser
        </Tag>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminUsers()
  const { data: rolesData } = useAdminRoles()
  const { data: tenantsData, isLoading: tenantsLoading } = useAdminTenants()
  const createUser = useCreateAdminUser()
  const updateUser = useUpdateAdminUser()
  const [form] = Form.useForm<UserFormValues>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AuthUser | null>(null)

  const users = useMemo(() => data?.data ?? [], [data?.data])
  const roles = useMemo(() => rolesData?.data ?? [], [rolesData?.data])
  const tenants = useMemo(() => tenantsData?.data ?? [], [tenantsData?.data])

  const roleOptions = useMemo(
    () => roles.map((role) => ({ value: role.slug, label: role.name })),
    [roles],
  )

  const stats = useMemo(() => {
    const activeCount = users.filter((u) => u.is_active).length
    const superuserCount = users.filter((u) => u.is_superuser).length
    const tenantMembers = tenants.reduce((sum, t) => sum + Number(t.users), 0)
    return { activeCount, superuserCount, tenantMembers }
  }, [users, tenants])

  const openCreate = useCallback(() => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      is_active: true,
      is_superuser: false,
      role_slugs: ['user'],
    })
    setOpen(true)
  }, [form])

  const openEdit = useCallback(
    (user: AuthUser) => {
      setEditing(user)
      form.setFieldsValue({
        full_name: user.full_name ?? undefined,
        is_active: user.is_active,
        is_superuser: user.is_superuser,
        role_slugs: user.roles.map((role) => role.slug),
      })
      setOpen(true)
    },
    [form],
  )

  const toggleActive = useCallback(
    async (user: AuthUser) => {
      try {
        await updateUser.mutateAsync({
          id: user.id,
          body: { is_active: !user.is_active },
        })
        message.success(user.is_active ? 'User deactivated' : 'User activated')
      } catch {
        message.error('Failed to update user status')
      }
    },
    [message, updateUser],
  )

  const formTable = useFormTable<AuthUser, UserFilters>({
    data: users,
    getRowId: (row) => row.id,
    loading: isLoading,
    enableRowSelection: true,
    emptyText: 'No platform users found.',
    onRefresh: () => refetch(),
    formSchema: [
      { name: 'query', label: 'Search', placeholder: 'Name, email, or username' },
      ...(roleOptions.length
        ? [{
            name: 'role' as const,
            label: 'Role',
            type: 'select' as const,
            placeholder: 'All roles',
            options: roleOptions,
          }]
        : []),
      {
        name: 'is_active',
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
      if (filter.query) {
        const q = filter.query.toLowerCase().trim()
        const haystack = [row.username, row.email, row.full_name ?? ''].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filter.role && !row.roles.some((r) => r.slug === filter.role)) return false
      if (filter.is_active !== undefined && row.is_active !== filter.is_active) return false
      return true
    },
    columns: [
      columnHelper.display({
        id: 'user',
        header: 'User',
        cell: ({ row }) => (
          <div className="min-w-0">
            <UserCell
              username={row.original.username}
              fullName={row.original.full_name}
              avatarUrl={row.original.avatar_url}
            />
            <p className="mt-1 truncate pl-[46px] text-xs text-muted">{row.original.email}</p>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
          <RoleTags roles={row.original.roles} isSuperuser={row.original.is_superuser} />
        ),
      }),
      columnHelper.accessor('is_active', {
        header: 'Status',
        size: 96,
        cell: (info) => (
          <Tag color={info.getValue() ? 'green' : 'red'} className="m-0 capitalize">
            {info.getValue() ? 'active' : 'inactive'}
          </Tag>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Joined',
        size: 112,
        cell: (info) => (
          <span className="text-sm text-muted">{formatAdminDate(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 148,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button type="link" size="small" className="px-1" onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Popconfirm
              title={row.original.is_active ? 'Deactivate this user?' : 'Activate this user?'}
              onConfirm={() => void toggleActive(row.original)}
            >
              <Button type="link" size="small" className="px-1">
                {row.original.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </Popconfirm>
          </div>
        ),
      }),
    ],
  })

  const selectedUsers = formTable.table.getFilteredSelectedRowModel().rows.map((row) => row.original)
  const selectedCount = selectedUsers.length

  const bulkSetActive = async (active: boolean) => {
    if (selectedCount === 0) return
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          updateUser.mutateAsync({ id: user.id, body: { is_active: active } }),
        ),
      )
      message.success(active ? 'Selected users activated' : 'Selected users deactivated')
      formTable.setRowSelection({})
    } catch {
      message.error('Failed to update some users')
    }
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          body: {
            full_name: values.full_name,
            is_active: values.is_active,
            is_superuser: values.is_superuser,
            role_slugs: values.role_slugs,
          },
        })
        message.success('User updated')
      } else {
        await createUser.mutateAsync({
          email: values.email!,
          username: values.username!,
          password: values.password!,
          full_name: values.full_name,
          is_active: values.is_active,
          is_superuser: values.is_superuser,
          role_slugs: values.role_slugs,
        })
        message.success('User created')
      }
      setOpen(false)
    } catch {
      message.error(editing ? 'Failed to update user' : 'Failed to create user')
    }
  }

  return (
    <FormTablePage
      title="Users"
      description="Create accounts, assign roles, and control access."
      extra={
        <Button type="primary" icon={<UserPlus size={14} />} onClick={openCreate}>
          Add user
        </Button>
      }
      stats={[
        { label: 'Total users', value: users.length, icon: Users },
        {
          label: 'Active',
          value: stats.activeCount,
          icon: UserCheck,
          accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Superusers',
          value: stats.superuserCount,
          icon: ShieldCheck,
          accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
        {
          label: 'Tenant members',
          value: stats.tenantMembers,
          icon: Building2,
          accent: 'bg-accent-muted text-accent',
        },
      ]}
      statsColumns={4}
      statsLoading={isLoading || tenantsLoading}
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
            <Button size="small" type="link" onClick={() => formTable.setRowSelection({})}>
              Clear
            </Button>
          </div>
        ) : null
      }
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? 'Edit user' : 'Add user'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={createUser.isPending || updateUser.isPending}
        destroyOnHidden
        width={480}
      >
        <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
          {editing ? (
            <div className="mb-4 rounded-lg border border-subtle bg-subtle/40 px-3 py-2.5">
              <p className="text-sm font-semibold text-primary">{editing.username}</p>
              <p className="text-xs text-muted">{editing.email}</p>
            </div>
          ) : (
            <>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
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

          <Form.Item name="role_slugs" label="Roles">
            <Select
              mode="multiple"
              allowClear
              placeholder="Assign roles"
              options={roleOptions}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch size="small" />
            </Form.Item>
            <Form.Item name="is_superuser" label="Superuser" valuePropName="checked">
              <Switch size="small" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </FormTablePage>
  )
}
