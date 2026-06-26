"use client";

import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { DEFAULT_COLOR_MODE } from "@vokcg/config";

export type ColorModeProviderProps = ThemeProviderProps;

export function ColorModeProvider({
  children,
  ...props
}: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={DEFAULT_COLOR_MODE}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme();
  const colorMode = (resolvedTheme ?? "dark") as ColorMode;
  return {
    colorMode,
    setColorMode: (mode) => setTheme(mode),
    toggleColorMode: () => setTheme(colorMode === "dark" ? "light" : "dark"),
  };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}
