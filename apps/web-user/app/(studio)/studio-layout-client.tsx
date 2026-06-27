"use client";

import { AuthGuard } from "../../components/auth-guard";
import { StudioShell } from "../../components/layout";

export function StudioLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <StudioShell>{children}</StudioShell>
    </AuthGuard>
  );
}
