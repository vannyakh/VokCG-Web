"use client";

import { AppProviders } from "@vokcg/ui";

import { useAdminUiStore } from "@/store/admin-ui-store";

export function AdminAppProviders({ children }: { children: React.ReactNode }) {
  const primaryColor = useAdminUiStore((s) => s.primaryColor);
  return <AppProviders primaryColor={primaryColor}>{children}</AppProviders>;
}
