import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { DEFAULT_COLOR_MODE } from "@vokcg/config";

export type ColorModeProviderProps = ThemeProviderProps;

/**
 * Server-safe wrapper around next-themes ThemeProvider.
 * Must be rendered in a Server Component (e.g. root layout) so the inline
 * flash-prevention <script> next-themes injects is processed server-side.
 * Client hooks live in color-mode-hooks.tsx.
 */
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
