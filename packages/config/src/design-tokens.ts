/** Border radius scale — shared by Ant Design + custom UI */
export const DESIGN_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
} as const;

/** Typography */
export const DESIGN_FONT = {
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  mono: '"JetBrains Mono", ui-monospace, monospace',
  sizeSm: 12,
  sizeBase: 13,
  sizeLg: 15,
} as const;

/** Motion durations — expressed as strings for CSS, used directly in Ant Design tokens */
export const DESIGN_MOTION = {
  fast: "0.12s",
  mid: "0.18s",
  slow: "0.26s",
} as const;

/** Ant Design ConfigProvider key for CSS variable prefix */
export const ANT_CSS_VAR_KEY = "mpt";

/**
 * Semantic CSS custom properties — light mode.
 * Keep in sync with globals.css :root fallbacks.
 */
export const SEMANTIC_TOKENS_LIGHT = {
  "--bg-canvas": "#f8fafc",
  "--bg-surface": "#ffffff",
  "--bg-sidebar": "#f1f5f9",
  "--bg-subtle": "#f8fafc",
  "--bg-active": "#eff6ff",
  "--bg-error": "rgba(254, 226, 226, 0.5)",
  "--text-primary": "#0f172a",
  "--text-secondary": "#334155",
  "--text-muted": "#94a3b8",
  "--text-nav-active": "#1d4ed8",
  "--text-nav-inactive": "#64748b",
  "--text-error": "#dc2626",
  "--border-default": "#e2e8f0",
  "--border-subtle": "#f1f5f9",
  "--shadow-sm": "0 1px 2px rgba(15, 23, 42, 0.05)",
  "--shadow-md": "0 4px 12px rgba(15, 23, 42, 0.08)",
  "--shadow-lg": "0 8px 24px rgba(15, 23, 42, 0.12)",
} as const;

/** Semantic CSS custom properties — dark mode */
export const SEMANTIC_TOKENS_DARK = {
  "--bg-canvas": "#0f1117",
  "--bg-surface": "#161b27",
  "--bg-sidebar": "#12161f",
  "--bg-subtle": "#1e2433",
  "--bg-active": "rgba(59, 130, 246, 0.12)",
  "--bg-error": "rgba(127, 29, 29, 0.25)",
  "--text-primary": "#f1f5f9",
  "--text-secondary": "#94a3b8",
  "--text-muted": "#64748b",
  "--text-nav-active": "#60a5fa",
  "--text-nav-inactive": "#94a3b8",
  "--text-error": "#f87171",
  "--border-default": "rgba(255, 255, 255, 0.08)",
  "--border-subtle": "rgba(255, 255, 255, 0.04)",
  "--border-error": "rgba(239, 68, 68, 0.4)",
  "--shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.25)",
  "--shadow-md": "0 4px 16px rgba(0, 0, 0, 0.35)",
  "--shadow-lg": "0 8px 32px rgba(0, 0, 0, 0.45)",
} as const;

export type SemanticCssVar = keyof typeof SEMANTIC_TOKENS_LIGHT;

/**
 * Map semantic design tokens → Ant Design global seed tokens.
 * These are the baseline values that Ant Design uses to derive component-level
 * colour scales via its internal algorithm.  Component-specific overrides are
 * applied separately in antd-theme.ts `buildComponents()`.
 */
export function semanticToAntdTokens(
  isDark: boolean,
): Record<string, string | number> {
  const t = isDark ? SEMANTIC_TOKENS_DARK : SEMANTIC_TOKENS_LIGHT;
  return {
    // ── Backgrounds ──────────────────────────────────────────────────────
    colorBgBase: t["--bg-surface"],
    colorBgContainer: t["--bg-surface"],
    colorBgElevated: isDark ? "#1e2433" : "#ffffff",
    colorBgLayout: t["--bg-canvas"],
    colorBgSpotlight: t["--bg-subtle"],
    colorBgMask: isDark ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0.35)",

    // ── Text ─────────────────────────────────────────────────────────────
    colorText: t["--text-primary"],
    colorTextBase: t["--text-primary"],
    colorTextSecondary: t["--text-secondary"],
    colorTextTertiary: t["--text-muted"],
    colorTextQuaternary: t["--text-muted"],
    colorTextDisabled: t["--text-muted"],
    colorTextHeading: t["--text-primary"],
    colorTextDescription: t["--text-secondary"],
    colorTextPlaceholder: t["--text-muted"],

    // ── Borders ───────────────────────────────────────────────────────────
    colorBorder: t["--border-default"],
    colorBorderSecondary: t["--border-subtle"],
    colorSplit: t["--border-default"],
    colorFill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    colorFillSecondary: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    colorFillTertiary: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
    colorFillQuaternary: "transparent",

    // ── Status ────────────────────────────────────────────────────────────
    colorError: t["--text-error"],
    colorErrorBg: t["--bg-error"],
    colorErrorBorder: isDark ? "rgba(239,68,68,0.35)" : "#fca5a5",
    colorSuccess: isDark ? "#4ade80" : "#16a34a",
    colorSuccessBg: isDark ? "rgba(74,222,128,0.1)" : "rgba(22,163,74,0.08)",
    colorWarning: isDark ? "#fbbf24" : "#d97706",
    colorWarningBg: isDark ? "rgba(251,191,36,0.1)" : "rgba(217,119,6,0.08)",
    colorInfo: isDark ? "#38bdf8" : "#0284c7",
    colorInfoBg: isDark ? "rgba(56,189,248,0.1)" : "rgba(2,132,199,0.08)",

    // ── Shadows ───────────────────────────────────────────────────────────
    boxShadow: t["--shadow-md"],
    boxShadowSecondary: t["--shadow-sm"],
    boxShadowTertiary: "none",
  };
}
