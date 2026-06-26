"use client";

import { AdminAuthGuard } from "../../components/admin-auth-guard";
import { AdminShell } from "@/components/layout";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
