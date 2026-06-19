import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  adminDeleteApi,
  adminGetApi,
  adminPostApi,
  adminPutApi,
  adminUploadFormData,
  deleteApi,
  getApi,
  postApi,
  putApi,
  uploadFormData,
} from '../client'
import { useAdminAuthStore, useAuthStore } from '@vokcg/store'
import type { ApiResponse } from '@vokcg/types'
import type {
  AdminAuthData,
  AdminOverview,
  AdminUser,
  AuditLog,
  Permission,
  Role,
  ServiceConfig,
  User,
  UserAuthData,
} from '@vokcg/types'

// ─── User auth hooks ──────────────────────────────────────────────────────────

export function useAuthMe(enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setUser = useAuthStore((state) => state.setUser)
  return useQuery({
    queryKey: ['auth', 'me'],
    enabled: enabled && Boolean(accessToken),
    queryFn: async () => {
      const response = await getApi<ApiResponse<User>>('/api/v1/auth/me')
      if (response.data) {
        setUser(response.data)
      }
      return response
    },
  })
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      postApi<ApiResponse<UserAuthData>>('/api/v1/auth/login', body),
    onSuccess: (response) => {
      const payload = response.data
      if (payload?.access_token && payload.refresh_token && payload.user) {
        setSession(payload.access_token, payload.refresh_token, payload.user)
      }
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (body: {
      email: string
      username: string
      password: string
      full_name?: string
    }) => postApi<ApiResponse<UserAuthData>>('/api/v1/auth/register', body),
    onSuccess: (response) => {
      const payload = response.data
      if (payload?.access_token && payload.refresh_token && payload.user) {
        setSession(payload.access_token, payload.refresh_token, payload.user)
      }
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      postApi<ApiResponse<{ ok: boolean }>>('/api/v1/auth/logout', {
        refresh_token: refreshToken,
      }),
    onSettled: () => {
      clearSession()
      queryClient.clear()
    },
  })
}

export function useUpdateAvatar() {
  const setSession = useAuthStore((state) => state.setSession)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadFormData<ApiResponse<User>>('/api/v1/auth/me/avatar', formData)
    },
    onSuccess: (response) => {
      if (response.data && accessToken && refreshToken) {
        setSession(accessToken, refreshToken, response.data)
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { full_name?: string | null; username?: string }) =>
      putApi<ApiResponse<User>>('/api/v1/auth/me', body),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data)
        if (accessToken && refreshToken) {
          setSession(accessToken, refreshToken, response.data)
        }
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

// ─── Admin auth hooks ─────────────────────────────────────────────────────────

export function useAdminMe(enabled = true) {
  const accessToken = useAdminAuthStore((state) => state.accessToken)
  const setAdmin = useAdminAuthStore((state) => state.setAdmin)
  return useQuery({
    queryKey: ['admin', 'auth', 'me'],
    enabled: enabled && Boolean(accessToken),
    queryFn: async () => {
      const response = await adminGetApi<ApiResponse<AdminUser>>('/api/v1/admin/auth/me')
      if (response.data) {
        setAdmin(response.data)
      }
      return response
    },
  })
}

export function useAdminLogin() {
  const setSession = useAdminAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      adminPostApi<ApiResponse<AdminAuthData>>('/api/v1/admin/auth/login', body),
    onSuccess: (response) => {
      const payload = response.data
      if (payload?.access_token && payload.refresh_token && payload.admin) {
        setSession(payload.access_token, payload.refresh_token, payload.admin)
      }
    },
  })
}

export function useAdminLogout() {
  const clearSession = useAdminAuthStore((state) => state.clearSession)
  const refreshToken = useAdminAuthStore((state) => state.refreshToken)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      adminPostApi<ApiResponse<{ ok: boolean }>>('/api/v1/admin/auth/logout', {
        refresh_token: refreshToken,
      }),
    onSettled: () => {
      clearSession()
      queryClient.clear()
    },
  })
}

// ─── Admin management hooks ───────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminGetApi<ApiResponse<AdminOverview>>('/api/v1/admin/overview'),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminGetApi<ApiResponse<User[]>>('/api/v1/admin/users'),
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
      adminPostApi<ApiResponse<User>>('/api/v1/admin/users', body),
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
      adminPutApi<ApiResponse<User>>(`/api/v1/admin/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminGetApi<ApiResponse<Role[]>>('/api/v1/admin/roles'),
  })
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminGetApi<ApiResponse<Permission[]>>('/api/v1/admin/permissions'),
  })
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () =>
      adminGetApi<ApiResponse<{ items: AuditLog[]; page: number; page_size: number; total: number }>>(
        '/api/v1/admin/logs',
      ),
  })
}

export function useAdminServices() {
  return useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => adminGetApi<ApiResponse<ServiceConfig[]>>('/api/v1/admin/services'),
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
      adminPutApi<ApiResponse<ServiceConfig>>(`/api/v1/admin/services/${encodeURIComponent(key)}`, {
        value,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
    },
  })
}

// ─── Admin staff hooks (new endpoint) ────────────────────────────────────────

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
    queryFn: () => adminGetApi<ApiResponse<AdminUser[]>>('/api/v1/admin/staff'),
  })
}

export function useCreateAdminStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdminStaffCreateInput) =>
      adminPostApi<ApiResponse<AdminUser>>('/api/v1/admin/staff', body),
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
      adminPutApi<ApiResponse<AdminUser>>(`/api/v1/admin/staff/${id}`, body),
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
      adminDeleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}
