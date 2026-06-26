import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApi, postApi } from "@/api/request";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@vokcg/types";
import type { WorkspaceContext, WorkspacePlan } from "@/types/workspace";

export const WORKSPACE_KEY = ["workspace", "me"] as const;

export function useWorkspaceContext(tenantId?: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const query = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : "";

  return useQuery({
    queryKey: [...WORKSPACE_KEY, tenantId ?? "default"],
    queryFn: () =>
      getApi<ApiResponse<WorkspaceContext>>(`/api/v1/workspace/me${query}`),
    select: (res) => res.data,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useWorkspacePlans() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["workspace", "plans"],
    queryFn: () =>
      getApi<ApiResponse<WorkspacePlan[]>>("/api/v1/workspace/plans"),
    select: (res) => res.data,
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

type PlanChangeInput = {
  plan_id: string;
  tenant_id?: string;
};

export type CheckoutInput = PlanChangeInput & {
  success_url: string;
  cancel_url: string;
  payment_method?: "stripe" | "bakong";
};

export type WorkspaceCheckoutResult = {
  url: string | null;
  upgraded: boolean;
  payment_method?: "stripe" | "bakong";
  payment_id?: string | null;
  qr_code?: string | null;
  deeplink?: string | null;
  expires_at?: string | null;
  amount?: number | null;
  currency?: string | null;
};

export function useChangeWorkspacePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PlanChangeInput) =>
      postApi<ApiResponse<WorkspaceContext>>("/api/v1/workspace/me/plan", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
}

export function useWorkspaceCheckout() {
  return useMutation({
    mutationFn: (body: CheckoutInput) =>
      postApi<ApiResponse<WorkspaceCheckoutResult>>(
        "/api/v1/workspace/me/checkout",
        body,
      ),
  });
}
