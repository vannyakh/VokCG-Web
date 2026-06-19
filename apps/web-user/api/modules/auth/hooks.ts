import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteApi, getApi, postApi } from '@/api/request'
import { useAuthStore } from '@/store/auth-store'
import type { ApiResponse } from '@vokcg/types'
import type { ApiKey, ApiKeyCreateResponse, AuthSession, PaginatedApiAccessLogs } from '@/types/settings'

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      postApi<ApiResponse<{ ok: boolean }>>('/api/v1/auth/me/password', body),
  })
}

export function useAuthSessions(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  return useQuery({
    queryKey: ['auth', 'sessions'],
    enabled: enabled && Boolean(accessToken),
    queryFn: () =>
      getApi<ApiResponse<AuthSession[]>>('/api/v1/auth/me/sessions', undefined, {
        headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : undefined,
      }),
    select: (res) => res.data,
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/auth/me/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
    },
  })
}

export function useRevokeOtherSessions() {
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      postApi<ApiResponse<{ ok: boolean; revoked: number }>>('/api/v1/auth/me/sessions/revoke-others', {
        refresh_token: refreshToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
    },
  })
}

export function useUserApiKeys(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['auth', 'api-keys'],
    enabled: enabled && Boolean(accessToken),
    queryFn: () => getApi<ApiResponse<ApiKey[]>>('/api/v1/auth/me/api-keys'),
    select: (res) => res.data,
  })
}

export function useCreateUserApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string }) =>
      postApi<ApiResponse<ApiKeyCreateResponse>>('/api/v1/auth/me/api-keys', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-access-logs'] })
    },
  })
}

export function useDeleteUserApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keyId: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/auth/me/api-keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-access-logs'] })
    },
  })
}

export function useUserApiAccessLogs(apiKeyId?: string, page = 1) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['auth', 'api-access-logs', apiKeyId ?? 'all', page],
    enabled: Boolean(accessToken),
    queryFn: () =>
      getApi<ApiResponse<PaginatedApiAccessLogs>>('/api/v1/auth/me/api-access-logs', {
        page,
        page_size: 15,
        api_key_id: apiKeyId,
      }),
    select: (res) => res.data,
  })
}
