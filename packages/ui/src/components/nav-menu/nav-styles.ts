import type { CSSProperties } from "react";

// ─── Layout constants ─────────────────────────────────────────────────────────
export const NAV_MENU = {
  marginX: 8,
  itemRadius: 9999,
  collapsedPaddingX: 8,
  collapsedTileSize: 42,
  collapsedTileRadius: 11,
  collapsedIconSize: 18,
  collapsedIconStroke: 1.75,
  collapsedIconStrokeActive: 2.25,
  collapsedItemHeight: 40,
  collapsedItemGap: 2,
  nestedItemHeightOffset: 2,
  sectionGap: 4,
  itemGap: 1,
  treeBranchWidth: 12,
  treeGuideOffset: 7,
} as const;

export const NAV_ROW = {
  iconSize: 15,
  nestedIconSize: 14,
  flyoutIconSize: 14,
  iconColumnWidth: 18,
  chevronColumnWidth: 18,
  labelClass: "min-w-0 flex-1 truncate text-left leading-none",
} as const;

/** Collapsed sidebar flyout panel */
export const NAV_FLYOUT = {
  minWidth: 176,
  radius: 12,
  offsetX: 8,
  padding: 5,
  itemHeight: 34,
  headerPaddingX: 12,
  headerPaddingY: 9,
} as const;

// ─── Surface colours ──────────────────────────────────────────────────────────
export const navSurface = {
  active: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
  nestedActive: "color-mix(in srgb, var(--color-primary) 9%, transparent)",
  hover: "color-mix(in srgb, var(--text-muted) 7%, transparent)",
  flyoutHover: "color-mix(in srgb, var(--text-muted) 8%, transparent)",
  flyoutBg: "var(--bg-surface)",
  flyoutBorder: "var(--border-divider)",
  sectionLabel: "var(--text-muted)",
} as const;

// ─── Style helpers ────────────────────────────────────────────────────────────
export function navRowRadius(nested: boolean, inPopup: boolean) {
  if (inPopup) return NAV_FLYOUT.radius - 2;
  return 9999;
}

export function navIconColor(active: boolean): CSSProperties {
  return {
    color: active ? "var(--color-primary)" : "var(--text-nav-inactive)",
    transition: "color 0.15s ease",
  };
}

export function navCollapsedTileStyle(active: boolean): CSSProperties {
  return {
    width: 40,
    height: 34,
    background: active
      ? "color-mix(in srgb, var(--color-primary) 13%, transparent)"
      : "transparent",
    color: active ? "var(--color-primary)" : "var(--text-nav-inactive)",
    transition: "background 0.15s ease, color 0.15s ease",
  };
}

export function navTreeLineColor(active: boolean): string {
  return active
    ? "color-mix(in srgb, var(--color-primary) 40%, transparent)"
    : "color-mix(in srgb, var(--text-muted) 15%, transparent)";
}

export function navTreeDotColor(active: boolean): string {
  return active
    ? "var(--color-primary)"
    : "color-mix(in srgb, var(--text-muted) 28%, transparent)";
}

/** Full-width button className in expanded mode */
export function navItemButtonClass({
  collapse,
  inPopup,
  isActive,
  disabled,
  nested,
}: {
  collapse: boolean;
  inPopup: boolean;
  isActive: boolean;
  disabled: boolean;
  nested?: boolean;
}) {
  if (collapse && !inPopup) {
    return "group flex w-full select-none items-center justify-center";
  }

  return [
    "group relative flex w-full select-none items-center gap-2.5 text-left outline-none",
    "transition-colors duration-150",
    inPopup ? "rounded-lg" : "",
    isActive
      ? "text-accent"
      : disabled
        ? "cursor-not-allowed text-muted opacity-40"
        : "text-nav-inactive hover:text-nav-active focus-visible:text-nav-active",
  ].join(" ");
}
