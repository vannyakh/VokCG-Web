"use client";

import type { ReactNode } from "react";

import { AdminAuthGuard } from "@/guards";
import { useAdminConsoleLayout } from "@/hooks";

import { AdminConsoleLayout } from "./AdminConsoleLayout";

export function AdminConsoleLayoutClient({ children }: { children: ReactNode }) {
  const layout = useAdminConsoleLayout();
  return (
    <AdminAuthGuard>
      <AdminConsoleLayout {...layout}>{children}</AdminConsoleLayout>
    </AdminAuthGuard>
  );
}
