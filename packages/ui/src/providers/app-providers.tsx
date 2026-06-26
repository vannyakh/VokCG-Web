"use client";

import type { ReactNode } from "react";

import { ColorModeProvider } from "../components/color-mode";
import { AntdProvider } from "./antd-provider";
import { QueryProvider } from "./query-provider";

type AppProvidersProps = {
  children: ReactNode;
  primaryColor?: string;
};

export function AppProviders({ children, primaryColor }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ColorModeProvider>
        <AntdProvider primaryColor={primaryColor}>{children}</AntdProvider>
      </ColorModeProvider>
    </QueryProvider>
  );
}
