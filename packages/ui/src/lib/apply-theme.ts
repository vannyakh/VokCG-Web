import { SEMANTIC_TOKENS_DARK, SEMANTIC_TOKENS_LIGHT } from "@vokcg/config";

import { adjustHex, hexAlpha } from "./color-utils";

export function applyAccentTokens(hex: string, isDark: boolean) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", hex);
  root.style.setProperty("--bg-active", hexAlpha(hex, isDark ? 0.14 : 0.08));
  root.style.setProperty(
    "--text-nav-active",
    isDark ? adjustHex(hex, 0.35) : adjustHex(hex, -0.18),
  );
  root.style.setProperty(
    "--border-accent",
    hexAlpha(hex, isDark ? 0.45 : 0.35),
  );
}

export function applyAppTheme(isDark: boolean, primaryColor: string) {
  const tokens = isDark ? SEMANTIC_TOKENS_DARK : SEMANTIC_TOKENS_LIGHT;
  const root = document.documentElement;

  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }

  applyAccentTokens(primaryColor, isDark);
}
