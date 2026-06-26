"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiResponse } from "@vokcg/types";

import {
  deleteApi,
  getApi,
  postApi,
  putApi,
  uploadFormData,
} from "@/api/request";
import { useAuthStore } from "@/store/auth-store";
import type { User, UserAuthData } from "@/types/auth";

export function useAuthMe(enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  return useQuery({
    queryKey: ["auth", "me"],
    enabled: enabled && Boolean(accessToken),
    queryFn: async () => {
      const response = await getApi<ApiResponse<User>>("/api/v1/auth/me");
      if (response.data) {
        setUser(response.data);
      }
      return response;
    },
  });
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      postApi<ApiResponse<UserAuthData>>("/api/v1/auth/login", body),
    onSuccess: (response) => {
      const payload = response.data;
      if (payload?.access_token && payload.refresh_token && payload.user) {
        setSession(payload.access_token, payload.refresh_token, payload.user);
      }
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (body: {
      email: string;
      username: string;
      password: string;
      full_name?: string;
    }) => postApi<ApiResponse<UserAuthData>>("/api/v1/auth/register", body),
    onSuccess: (response) => {
      const payload = response.data;
      if (payload?.access_token && payload.refresh_token && payload.user) {
        setSession(payload.access_token, payload.refresh_token, payload.user);
      }
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      postApi<ApiResponse<{ ok: boolean }>>("/api/v1/auth/logout", {
        refresh_token: refreshToken,
      }),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function useUpdateAvatar() {
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadFormData<ApiResponse<User>>(
        "/api/v1/auth/me/avatar",
        formData,
      );
    },
    onSuccess: (response) => {
      if (response.data && accessToken && refreshToken) {
        setSession(accessToken, refreshToken, response.data);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { full_name?: string | null; username?: string }) =>
      putApi<ApiResponse<User>>("/api/v1/auth/me", body),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
        if (accessToken && refreshToken) {
          setSession(accessToken, refreshToken, response.data);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
