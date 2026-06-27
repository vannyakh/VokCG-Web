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
  primaryColor?: string;
};

export function AntdProvider({
  children,
  primaryColor = DEFAULT_PRIMARY_COLOR,
}: AntdProviderProps) {
  useAppTheme(primaryColor);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const antdTheme = useMemo(
    () => buildAntdTheme(isDark, primaryColor),
    [isDark, primaryColor],
  );

  return (
    <StyleProvider layer>
      <ConfigProvider
        locale={enUS}
        theme={antdTheme}
        componentSize="middle"
        getPopupContainer={(trigger) => trigger?.parentElement ?? document.body}
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
