import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiResponse } from '@vokcg/types'

import { deleteApi, getApi, postApi, putApi } from '@/api/request'
import type {
  AdminOverview,
  AdminUser,
  AuditLog,
  Permission,
  Role,
  ServiceConfig,
  User,
} from '@/types/auth'

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => getApi<ApiResponse<AdminOverview>>('/api/v1/admin/overview'),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => getApi<ApiResponse<User[]>>('/api/v1/admin/users'),
  })
}

export type AdminUserCreateInput = {
  email: string
  username: string
  password: string
  full_name?: string | null
  is_active?: boolean
}

export type AdminUserUpdateInput = {
  full_name?: string | null
  is_active?: boolean
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdminUserCreateInput) =>
      postApi<ApiResponse<User>>('/api/v1/admin/users', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdminUserUpdateInput }) =>
      putApi<ApiResponse<User>>(`/api/v1/admin/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => getApi<ApiResponse<Role[]>>('/api/v1/admin/roles'),
  })
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => getApi<ApiResponse<Permission[]>>('/api/v1/admin/permissions'),
  })
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () =>
      getApi<
        ApiResponse<{ items: AuditLog[]; page: number; page_size: number; total: number }>
      >('/api/v1/admin/logs'),
  })
}

export function useAdminServices() {
  return useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => getApi<ApiResponse<ServiceConfig[]>>('/api/v1/admin/services'),
  })
}

export function useUpdateServiceConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      key,
      value,
      description,
    }: {
      key: string
      value: Record<string, unknown>
      description?: string
    }) =>
      putApi<ApiResponse<ServiceConfig>>(`/api/v1/admin/services/${encodeURIComponent(key)}`, {
        value,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
    },
  })
}

export type AdminStaffCreateInput = {
  email: string
  username: string
  password: string
  full_name?: string | null
  is_active?: boolean
  is_superuser?: boolean
  role_slugs?: string[]
}

export type AdminStaffUpdateInput = {
  full_name?: string | null
  is_active?: boolean
  is_superuser?: boolean
  role_slugs?: string[]
}

export function useAdminStaff() {
  return useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => getApi<ApiResponse<AdminUser[]>>('/api/v1/admin/staff'),
  })
}

export function useCreateAdminStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdminStaffCreateInput) =>
      postApi<ApiResponse<AdminUser>>('/api/v1/admin/staff', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useUpdateAdminStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdminStaffUpdateInput }) =>
      putApi<ApiResponse<AdminUser>>(`/api/v1/admin/staff/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useDeleteAdminStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}
