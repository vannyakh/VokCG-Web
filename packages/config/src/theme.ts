/** Shared theme defaults — keep in sync with globals.css :root --color-primary */
export const DEFAULT_PRIMARY_COLOR = "#3b82f6";

export const DEFAULT_COLOR_MODE = "dark" as const;

export const THEME_MODE_OPTIONS = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "Auto" },
] as const;

export type ThemeModeId = (typeof THEME_MODE_OPTIONS)[number]["id"];

/** Drawer width for preferences panel */
export const PREFERENCES_DRAWER_WIDTH = 384;
