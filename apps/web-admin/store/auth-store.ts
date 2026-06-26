import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@vokcg/config";

import type { AdminUser } from "@/types/auth";

type AdminAuthState = {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser | null;
  setSession: (
    accessToken: string,
    refreshToken: string,
    admin: AdminUser,
  ) => void;
  setAdmin: (admin: AdminUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  hasPermission: (code: string) => boolean;
  isAdmin: () => boolean;
};

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      accessToken: "",
      refreshToken: "",
      admin: null,
      setSession: (accessToken, refreshToken, admin) =>
        set({ accessToken, refreshToken, admin }),
      setAdmin: (admin) => set({ admin }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () =>
        set({ accessToken: "", refreshToken: "", admin: null }),
      hasPermission: (code) => {
        const admin = get().admin;
        if (!admin) return false;
        if (admin.is_superuser) return true;
        return admin.permissions.includes(code);
      },
      isAdmin: () => {
        const admin = get().admin;
        return Boolean(
          admin && (admin.is_superuser || admin.permissions.length > 0),
        );
      },
    }),
    { name: STORAGE_KEYS.adminAuth },
  ),
);
