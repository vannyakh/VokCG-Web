import axios from "axios";

import { createRequestClient, type ApiResponse } from "@vokcg/api";
import { API_BASE_URL } from "@vokcg/config";

import { useAuthStore } from "@/store/auth-store";
import type { UserAuthData } from "@/types/auth";

export const userRequest = createRequestClient({
  baseURL: API_BASE_URL,
  auth: {
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    refreshPath: "/api/v1/auth/refresh",
    clearSession: () => useAuthStore.getState().clearSession(),
    refresh: async (refreshToken) => {
      const { setSession, clearSession } = useAuthStore.getState();
      try {
        const response = await axios.post<ApiResponse<UserAuthData>>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
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
          payload.data.user,
        );
        return payload.data.access_token;
      } catch {
        clearSession();
        return null;
      }
    },
  },
});

export const { getApi, postApi, putApi, deleteApi, uploadFormData, postBlob } =
  userRequest;
