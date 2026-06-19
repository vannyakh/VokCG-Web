import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteApi, getApi, postApi, putApi } from '@/api/request'
import { useAdminAuthStore } from '@/store/auth-store'
import type { ApiResponse } from '@vokcg/types'
import type {
  Plan,
  PlanCreateInput,
  PlanUpdateInput,
  Subscription,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  Tenant,
  TenantCreateInput,
  TenantUpdateInput,
} from '@/types/saas'

export function useAdminPlans(options?: { enabled?: boolean }) {
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => getApi<ApiResponse<Plan[]>>('/api/v1/admin/plans'),
    enabled: (options?.enabled ?? true) && Boolean(accessToken),
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PlanCreateInput) =>
      postApi<ApiResponse<Plan>>('/api/v1/admin/plans', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PlanUpdateInput }) =>
      putApi<ApiResponse<Plan>>(`/api/v1/admin/plans/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useAdminTenants(options?: { enabled?: boolean }) {
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => getApi<ApiResponse<Tenant[]>>('/api/v1/admin/tenants'),
    enabled: (options?.enabled ?? true) && Boolean(accessToken),
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: TenantCreateInput) =>
      postApi<ApiResponse<Tenant>>('/api/v1/admin/tenants', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TenantUpdateInput }) =>
      putApi<ApiResponse<Tenant>>(`/api/v1/admin/tenants/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useAdminSubscriptions(options?: { enabled?: boolean }) {
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => getApi<ApiResponse<Subscription[]>>('/api/v1/admin/subscriptions'),
    enabled: (options?.enabled ?? true) && Boolean(accessToken),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SubscriptionCreateInput) =>
      postApi<ApiResponse<Subscription>>('/api/v1/admin/subscriptions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SubscriptionUpdateInput }) =>
      putApi<ApiResponse<Subscription>>(`/api/v1/admin/subscriptions/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    },
  })
}
