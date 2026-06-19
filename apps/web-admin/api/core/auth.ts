'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiResponse } from '@vokcg/types'

import { getApi, postApi } from '@/api/request'
import { useAdminAuthStore } from '@/store/auth-store'
import type { AdminAuthData, AdminUser } from '@/types/auth'

export function useAdminMe(enabled = true) {
  const accessToken = useAdminAuthStore((state) => state.accessToken)
  const setAdmin = useAdminAuthStore((state) => state.setAdmin)
  return useQuery({
    queryKey: ['admin', 'auth', 'me'],
    enabled: enabled && Boolean(accessToken),
    queryFn: async () => {
      const response = await getApi<ApiResponse<AdminUser>>('/api/v1/admin/auth/me')
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
      postApi<ApiResponse<AdminAuthData>>('/api/v1/admin/auth/login', body),
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
      postApi<ApiResponse<{ ok: boolean }>>('/api/v1/admin/auth/logout', {
        refresh_token: refreshToken,
      }),
    onSettled: () => {
      clearSession()
      queryClient.clear()
    },
  })
}
