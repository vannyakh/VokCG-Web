"use client";

import { App, ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import enUS from "antd/locale/en_US";
import { DEFAULT_PRIMARY_COLOR } from "@vokcg/config";
import { useTheme } from "next-themes";
import { useMemo, type ReactNode } from "react";

import { useAppTheme } from "../hooks/use-app-theme";
import { buildAntdTheme } from "../theme/antd-theme";

type AntdProviderProps = {
  children: ReactNode;
  /** Override brand primary colour (hex). Defaults to DEFAULT_PRIMARY_COLOR. */
  primaryColor?: string;
};

/**
 * Wraps the whole app with:
 *  • Ant Design ConfigProvider — synced to light/dark mode and the brand colour
 *  • @ant-design/cssinjs StyleProvider — ensures CSS-in-JS rules are injected
 *    before any Tailwind layers so component styles always win specificity races
 *  • Ant Design App — gives access to `useApp()` message / notification / modal
 *    hooks without requiring component-level context drilling
 */
export function AntdProvider({
  children,
  primaryColor = DEFAULT_PRIMARY_COLOR,
}: AntdProviderProps) {
  // Apply CSS custom properties (semantic tokens) to <html> whenever
  // the resolved theme or brand colour changes.
  useAppTheme(primaryColor);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const antdTheme = useMemo(
    () => buildAntdTheme(isDark, primaryColor),
    [isDark, primaryColor],
  );

  return (
    // StyleProvider insertionPoint="body" ensures Ant Design's generated styles
    // sit at the end of <head> but above any Tailwind utility classes so that
    // component-specific overrides (e.g. Modal, Dropdown) don't get clobbered.
    <StyleProvider layer>
      <ConfigProvider
        locale={enUS}
        theme={antdTheme}
        componentSize="middle"
        // Render Ant Design's static (tooltip, message, notification) portals
        // inside the document body for correct z-index stacking.
        getPopupContainer={(trigger) => trigger?.parentElement ?? document.body}
        // Global Modal default: always reset internal state when a modal closes.
        modal={{ destroyOnHidden: true }}
      >
        <App
          message={{ maxCount: 3, top: 56 }}
          notification={{ placement: "topRight", top: 56, maxCount: 5 }}
        >
          {children}
        </App>
      </ConfigProvider>
    </StyleProvider>
  );
}
