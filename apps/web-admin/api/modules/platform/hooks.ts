import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteApi, getApi, postApi, putApi } from "@/api/request";
import type { ApiResponse } from "@vokcg/types";
import type {
  ApiKey,
  ApiKeyCreateResponse,
  Backup,
  BackupType,
  FeatureFlag,
  NotificationTemplate,
  ScheduledJob,
  StripeSettings,
  StripeSettingsInput,
  Webhook,
} from "@/types/platform";

export function useAdminWebhooks() {
  return useQuery({
    queryKey: ["admin", "webhooks"],
    queryFn: () => getApi<ApiResponse<Webhook[]>>("/api/v1/admin/webhooks"),
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { url: string; events: string[]; status?: string }) =>
      postApi<ApiResponse<Webhook>>("/api/v1/admin/webhooks", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      putApi<ApiResponse<Webhook>>(`/api/v1/admin/webhooks/${id}`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/webhooks/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
}

export function useAdminApiKeys() {
  return useQuery({
    queryKey: ["admin", "api-keys"],
    queryFn: () => getApi<ApiResponse<ApiKey[]>>("/api/v1/admin/api-keys"),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; scopes: string[] }) =>
      postApi<ApiResponse<ApiKeyCreateResponse>>(
        "/api/v1/admin/api-keys",
        body,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] }),
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      putApi<ApiResponse<ApiKey>>(`/api/v1/admin/api-keys/${id}`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] }),
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/api-keys/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] }),
  });
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: () =>
      getApi<ApiResponse<FeatureFlag[]>>("/api/v1/admin/feature-flags"),
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      key: string;
      description?: string;
      enabled: boolean;
      rollout: number;
    }) =>
      postApi<ApiResponse<FeatureFlag>>("/api/v1/admin/feature-flags", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      putApi<ApiResponse<FeatureFlag>>(
        `/api/v1/admin/feature-flags/${id}`,
        body,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(
        `/api/v1/admin/feature-flags/${id}`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useStripeSettings() {
  return useQuery({
    queryKey: ["admin", "billing", "stripe"],
    queryFn: () =>
      getApi<ApiResponse<StripeSettings>>("/api/v1/admin/billing/stripe"),
  });
}

export function useUpdateStripeSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StripeSettingsInput) =>
      putApi<ApiResponse<StripeSettings>>("/api/v1/admin/billing/stripe", body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "billing", "stripe"],
      }),
  });
}

export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: ({
      subscriptionId,
      successUrl,
      cancelUrl,
    }: {
      subscriptionId: string;
      successUrl: string;
      cancelUrl: string;
    }) =>
      postApi<ApiResponse<{ url: string }>>(
        `/api/v1/admin/subscriptions/${subscriptionId}/stripe/checkout`,
        { success_url: successUrl, cancel_url: cancelUrl },
      ),
  });
}

export function useAdminBackups() {
  return useQuery({
    queryKey: ["admin", "backups"],
    queryFn: () => getApi<ApiResponse<Backup[]>>("/api/v1/admin/backups"),
  });
}

export function useRunBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: BackupType = "full") =>
      postApi<ApiResponse<Backup>>("/api/v1/admin/backups/run", { type }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "backups"] }),
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/backups/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "backups"] }),
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: () => getApi<ApiResponse<ScheduledJob[]>>("/api/v1/admin/jobs"),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; cron: string; status?: string }) =>
      postApi<ApiResponse<ScheduledJob>>("/api/v1/admin/jobs", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      putApi<ApiResponse<ScheduledJob>>(`/api/v1/admin/jobs/${id}`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] }),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/admin/jobs/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] }),
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () =>
      getApi<ApiResponse<NotificationTemplate[]>>(
        "/api/v1/admin/notifications",
      ),
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      channel: string;
      enabled: boolean;
      sent_30d?: number;
    }) =>
      postApi<ApiResponse<NotificationTemplate>>(
        "/api/v1/admin/notifications",
        body,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      putApi<ApiResponse<NotificationTemplate>>(
        `/api/v1/admin/notifications/${id}`,
        body,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(
        `/api/v1/admin/notifications/${id}`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}
