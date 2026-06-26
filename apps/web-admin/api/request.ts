import axios from "axios";

import { createRequestClient, type ApiResponse } from "@vokcg/api";
import { API_BASE_URL } from "@vokcg/config";

import { useAdminAuthStore } from "@/store/auth-store";
import type { AdminAuthData } from "@/types/auth";

export const adminRequest = createRequestClient({
  baseURL: API_BASE_URL,
  auth: {
    getAccessToken: () => useAdminAuthStore.getState().accessToken,
    getRefreshToken: () => useAdminAuthStore.getState().refreshToken,
    refreshPath: "/api/v1/admin/auth/refresh",
    clearSession: () => useAdminAuthStore.getState().clearSession(),
    refresh: async (refreshToken) => {
      const { setSession, clearSession } = useAdminAuthStore.getState();
      try {
        const response = await axios.post<ApiResponse<AdminAuthData>>(
          `${API_BASE_URL}/api/v1/admin/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );
        const payload = response.data;
        if (
          response.status >= 400 ||
          (payload.status !== undefined && payload.status >= 400) ||
          !payload.data?.access_token
        ) {
          clearSession();
          return null;
        }
        setSession(
          payload.data.access_token,
          payload.data.refresh_token,
          payload.data.admin,
        );
        return payload.data.access_token;
      } catch {
        clearSession();
        return null;
      }
    },
  },
});

export const { getApi, postApi, putApi, deleteApi, uploadFormData } =
  adminRequest;
