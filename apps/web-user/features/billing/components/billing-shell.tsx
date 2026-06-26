"use client";

import type { ReactNode } from "react";

import { StudioListShell } from "@vokcg/ui";

type Props = {
  description?: string;
  badge?: string;
  extra?: ReactNode;
  children: ReactNode;
};

export function BillingShell({ description, badge, extra, children }: Props) {
  return (
    <StudioListShell description={description} badge={badge} extra={extra}>
      {children}
    </StudioListShell>
  );
}
