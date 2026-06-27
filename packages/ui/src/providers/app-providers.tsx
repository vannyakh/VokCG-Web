"use client";

import type { ReactNode } from "react";

import { AntdProvider } from "./antd-provider";
import { QueryProvider } from "./query-provider";

type AppProvidersProps = {
  children: ReactNode;
  primaryColor?: string;
};

export function AppProviders({ children, primaryColor }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AntdProvider primaryColor={primaryColor}>{children}</AntdProvider>
    </QueryProvider>
  );
}
