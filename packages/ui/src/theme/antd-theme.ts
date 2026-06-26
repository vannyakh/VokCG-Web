import { theme } from "antd";
import type { ThemeConfig } from "antd";
import {
  ANT_CSS_VAR_KEY,
  DEFAULT_PRIMARY_COLOR,
  DESIGN_FONT,
  DESIGN_MOTION,
  DESIGN_RADIUS,
  semanticToAntdTokens,
} from "@vokcg/config";

import { adjustHex, hexAlpha } from "../lib/color-utils";

// ─── Primary colour tokens ────────────────────────────────────────────────────
function primaryTokens(primaryColor: string, isDark: boolean) {
  return {
    colorPrimary: primaryColor,
    colorPrimaryHover: adjustHex(primaryColor, isDark ? 0.12 : 0.08),
    colorPrimaryActive: adjustHex(primaryColor, isDark ? -0.08 : -0.12),
    colorPrimaryBg: hexAlpha(primaryColor, isDark ? 0.14 : 0.08),
    colorPrimaryBgHover: hexAlpha(primaryColor, isDark ? 0.2 : 0.12),
    colorPrimaryBorder: hexAlpha(primaryColor, isDark ? 0.35 : 0.25),
    colorPrimaryBorderHover: hexAlpha(primaryColor, isDark ? 0.5 : 0.4),
    colorLink: primaryColor,
    colorLinkHover: adjustHex(primaryColor, isDark ? 0.15 : 0.1),
    controlItemBgActive: hexAlpha(primaryColor, isDark ? 0.14 : 0.08),
    controlItemBgActiveHover: hexAlpha(primaryColor, isDark ? 0.2 : 0.12),
  };
}

// ─── Shared component-level token overrides ───────────────────────────────────
function buildComponents(isDark: boolean): ThemeConfig["components"] {
  const focus = "none";

  return {
    // ── Interactive controls ───────────────────────────────────────────────
    Button: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      fontWeight: 600,
      primaryShadow: focus,
      defaultShadow: focus,
      dangerShadow: focus,
      defaultBg: "var(--bg-surface)",
      defaultBorderColor: "var(--border-default)",
      defaultColor: "var(--text-primary)",
    },

    Input: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      activeShadow: focus,
      hoverBorderColor: "var(--color-primary)",
      activeBorderColor: "var(--color-primary)",
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
      colorText: "var(--text-primary)",
      colorTextPlaceholder: "var(--text-muted)",
      addonBg: "var(--bg-subtle)",
    },

    InputNumber: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      activeShadow: focus,
      hoverBorderColor: "var(--color-primary)",
      activeBorderColor: "var(--color-primary)",
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
    },

    Select: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      controlItemBgHover: "var(--bg-subtle)",
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
      colorText: "var(--text-primary)",
      colorTextPlaceholder: "var(--text-muted)",
      optionSelectedBg: "var(--bg-active)",
      optionActiveBg: "var(--bg-subtle)",
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
    },

    Cascader: {
      colorBgContainer: "var(--bg-surface)",
      controlItemBgHover: "var(--bg-subtle)",
    },

    TreeSelect: {
      colorBgContainer: "var(--bg-surface)",
    },

    Mentions: {
      colorBgContainer: "var(--bg-surface)",
    },

    Checkbox: {
      borderRadius: DESIGN_RADIUS.sm,
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
    },

    Radio: {
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
      buttonSolidCheckedBg: "var(--color-primary)",
      buttonBg: "var(--bg-surface)",
      buttonCheckedBg: "var(--bg-active)",
      buttonColor: "var(--text-primary)",
    },

    Switch: {
      colorTextQuaternary: "var(--border-default)",
      trackMinWidth: 36,
    },

    Slider: {
      railBg: "var(--border-default)",
      railHoverBg: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
      handleColor: "var(--color-primary)",
      handleSizeHover: 12,
      dotBorderColor: "var(--border-default)",
    },

    // ── Display & feedback ─────────────────────────────────────────────────
    Card: {
      borderRadius: DESIGN_RADIUS.lg,
      colorBgContainer: "var(--bg-surface)",
      colorBorderSecondary: "var(--border-default)",
      paddingLG: 20,
    },

    Modal: {
      borderRadius: DESIGN_RADIUS.lg,
      borderRadiusLG: DESIGN_RADIUS.lg,
      contentBg: "var(--bg-surface)",
      headerBg: "var(--bg-surface)",
      titleColor: "var(--text-primary)",
      titleFontSize: 15,
      titleLineHeight: 1.4,
      footerBg: "var(--bg-surface)",
    },

    Drawer: {
      colorBgElevated: "var(--bg-surface)",
      colorText: "var(--text-primary)",
      padding: 20,
    },

    Popover: {
      borderRadius: DESIGN_RADIUS.lg,
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
      colorText: "var(--text-primary)",
      titleMinWidth: 160,
    },

    Popconfirm: {
      borderRadius: DESIGN_RADIUS.lg,
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
    },

    Tooltip: {
      borderRadius: DESIGN_RADIUS.sm,
      colorBgSpotlight: isDark ? "#334155" : "#1e293b",
      colorTextLightSolid: "#f8fafc",
      fontSize: 12,
    },

    Dropdown: {
      borderRadius: DESIGN_RADIUS.md,
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
      controlItemBgHover: "var(--bg-subtle)",
      controlItemBgActive: "var(--bg-active)",
      colorText: "var(--text-primary)",
    },

    Menu: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusLG: DESIGN_RADIUS.md,
      colorBgContainer: "var(--bg-sidebar)",
      itemBg: "transparent",
      itemColor: "var(--text-nav-inactive)",
      itemHoverColor: "var(--text-primary)",
      itemHoverBg: "var(--bg-active)",
      itemSelectedColor: "var(--text-nav-active)",
      itemSelectedBg: "var(--bg-active)",
      itemActiveBg: "var(--bg-active)",
      subMenuItemBg: "transparent",
      activeBarBorderWidth: 0,
      iconSize: 16,
      iconMarginInlineEnd: 8,
      collapsedWidth: 48,
    },

    // ── Data display ───────────────────────────────────────────────────────
    Table: {
      borderRadius: DESIGN_RADIUS.lg,
      rowHoverBg: "var(--bg-active)",
      headerBg: "var(--bg-subtle)",
      headerColor: "var(--text-secondary)",
      headerSortHoverBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      headerSortActiveBg: isDark
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
      borderColor: "var(--border-default)",
      colorBgContainer: "var(--bg-surface)",
      footerBg: "var(--bg-surface)",
      colorText: "var(--text-primary)",
      rowSelectedBg: "var(--bg-active)",
      rowSelectedHoverBg: "var(--bg-active)",
      rowExpandedBg: "var(--bg-subtle)",
      cellPaddingBlock: 10,
      cellPaddingInline: 12,
      cellFontSize: 13,
    },

    Tabs: {
      borderRadius: DESIGN_RADIUS.md,
      cardBg: "var(--bg-subtle)",
      cardGutter: 4,
      itemColor: "var(--text-muted)",
      itemHoverColor: "var(--text-primary)",
      itemSelectedColor: "var(--color-primary)",
      itemActiveColor: "var(--color-primary)",
      titleFontSize: 13,
      titleFontSizeLG: 14,
      inkBarColor: "var(--color-primary)",
      horizontalMargin: "0",
    },

    Collapse: {
      borderRadius: DESIGN_RADIUS.md,
      colorBgContainer: "var(--bg-surface)",
      headerBg: "var(--bg-subtle)",
      colorBorder: "var(--border-default)",
      colorText: "var(--text-primary)",
    },

    List: {
      colorBorder: "var(--border-default)",
      colorText: "var(--text-primary)",
    },

    Descriptions: {
      colorText: "var(--text-primary)",
      labelBg: "var(--bg-subtle)",
      colorTextTertiary: "var(--text-muted)",
    },

    Timeline: {
      colorText: "var(--text-primary)",
      colorTextSecondary: "var(--text-muted)",
      tailColor: "var(--border-default)",
    },

    Tree: {
      colorBgContainer: "var(--bg-surface)",
      directoryNodeSelectedBg: "var(--bg-active)",
      nodeSelectedBg: "var(--bg-active)",
      nodeHoverBg: "var(--bg-subtle)",
      colorText: "var(--text-primary)",
    },

    // ── Status / feedback ──────────────────────────────────────────────────
    Alert: {
      borderRadius: DESIGN_RADIUS.md,
      fontSize: 13,
      withDescriptionPadding: "12px 16px",
    },

    Tag: {
      borderRadius: DESIGN_RADIUS.sm,
      colorBorder: "var(--border-default)",
      defaultBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      defaultColor: "var(--text-primary)",
      fontSize: 12,
      lineHeight: 1.5,
    },

    Badge: {
      colorBgContainer: "var(--bg-surface)",
    },

    Skeleton: {
      colorFill: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      colorFillContent: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      borderRadius: DESIGN_RADIUS.sm,
    },

    Spin: {
      colorPrimary: "var(--color-primary)",
    },

    Progress: {
      defaultColor: "var(--color-primary)",
      colorSuccess: "#22c55e",
    },

    Empty: {
      colorTextDisabled: "var(--text-muted)",
    },

    Result: {
      colorTextDescription: "var(--text-muted)",
    },

    // ── Navigation ─────────────────────────────────────────────────────────
    Breadcrumb: {
      colorText: "var(--text-muted)",
      lastItemColor: "var(--text-primary)",
      linkColor: "var(--text-muted)",
      linkHoverColor: "var(--text-primary)",
      separatorColor: "var(--border-default)",
      iconFontSize: 13,
      fontSize: 13,
    },

    Pagination: {
      itemBg: "transparent",
      itemActiveBg: "var(--bg-active)",
      itemLinkBg: "transparent",
      colorText: "var(--text-secondary)",
      borderRadius: DESIGN_RADIUS.sm,
    },

    Steps: {
      colorText: "var(--text-primary)",
      colorTextDescription: "var(--text-muted)",
      descriptionMaxWidth: 160,
      titleLineHeight: 1.4,
      fontSize: 13,
    },

    // ── Form ───────────────────────────────────────────────────────────────
    Form: {
      itemMarginBottom: 16,
      labelColor: "var(--text-secondary)",
      labelFontSize: 13,
      labelHeight: 32,
      verticalLabelPadding: "0 0 4px",
    },

    Upload: {
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
      colorText: "var(--text-primary)",
      colorTextDescription: "var(--text-muted)",
      borderRadiusLG: DESIGN_RADIUS.lg,
    },

    // ── Date & time ────────────────────────────────────────────────────────
    DatePicker: {
      borderRadius: DESIGN_RADIUS.md,
      activeShadow: focus,
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
      cellBgDisabled: "transparent",
      cellHoverBg: "var(--bg-subtle)",
      cellActiveWithRangeBg: "var(--bg-active)",
    },

    // ── Layout ─────────────────────────────────────────────────────────────
    Layout: {
      colorBgLayout: "var(--bg-canvas)",
      colorBgHeader: "var(--bg-surface)",
      colorBgBody: "var(--bg-canvas)",
      headerPadding: "0 24px",
      headerHeight: 56,
    },

    Divider: {
      colorSplit: "var(--border-default)",
      colorText: "var(--text-muted)",
      orientationMargin: 0.05,
    },

    // ── Typography ─────────────────────────────────────────────────────────
    Typography: {
      colorText: "var(--text-primary)",
      colorTextSecondary: "var(--text-secondary)",
      colorTextDisabled: "var(--text-muted)",
      fontSizeHeading1: 28,
      fontSizeHeading2: 22,
      fontSizeHeading3: 18,
      fontSizeHeading4: 15,
      fontSizeHeading5: 13,
      titleMarginTop: 0,
      titleMarginBottom: "0.4em",
    },

    // ── Statistic ──────────────────────────────────────────────────────────
    Statistic: {
      colorText: "var(--text-primary)",
      titleFontSize: 13,
      contentFontSize: 24,
    },

    // ── Transfer / other controls ──────────────────────────────────────────
    Transfer: {
      colorBgContainer: "var(--bg-surface)",
      colorBorder: "var(--border-default)",
    },

    Segmented: {
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      trackBg: "var(--bg-subtle)",
      itemColor: "var(--text-muted)",
      itemHoverColor: "var(--text-primary)",
      itemHoverBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      itemSelectedColor: "var(--text-primary)",
      itemSelectedBg: "var(--bg-surface)",
      trackPadding: 3,
    },

    // ── Message & notification ─────────────────────────────────────────────
    Message: {
      borderRadius: DESIGN_RADIUS.md,
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
      contentPadding: "9px 16px",
      colorText: "var(--text-primary)",
    },

    Notification: {
      borderRadius: DESIGN_RADIUS.lg,
      colorBgElevated: isDark ? "#1e2433" : "#ffffff",
      colorText: "var(--text-primary)",
      colorTextHeading: "var(--text-primary)",
      width: 380,
    },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function buildAntdTheme(
  isDark: boolean,
  primaryColor = DEFAULT_PRIMARY_COLOR,
): ThemeConfig {
  return {
    cssVar: { key: ANT_CSS_VAR_KEY, prefix: "" },
    hashed: false,
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...semanticToAntdTokens(isDark),
      ...primaryTokens(primaryColor, isDark),

      // ── Radii ──────────────────────────────────────────────────────────
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      borderRadiusLG: DESIGN_RADIUS.lg,
      borderRadiusXS: 6,

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: DESIGN_FONT.sans,
      fontFamilyCode: DESIGN_FONT.mono,
      fontSize: DESIGN_FONT.sizeBase,
      fontSizeSM: DESIGN_FONT.sizeSm,
      fontSizeLG: DESIGN_FONT.sizeLg,

      // ── Motion ─────────────────────────────────────────────────────────
      motionDurationFast: DESIGN_MOTION.fast,
      motionDurationMid: DESIGN_MOTION.fast,
      motionDurationSlow: DESIGN_MOTION.mid,

      // ── Control sizing ─────────────────────────────────────────────────
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 42,
      controlHeightXS: 22,
      controlPaddingHorizontal: 12,
      controlPaddingHorizontalSM: 8,

      // ── Line & spacing ─────────────────────────────────────────────────
      lineWidth: 1,
      lineWidthBold: 2,
      lineWidthFocus: 3,
      padding: 16,
      paddingSM: 12,
      paddingXS: 8,
      paddingLG: 20,
      margin: 16,
      marginSM: 12,
      marginXS: 8,
      marginLG: 20,

      // ── Z-index stack (avoids conflicts with Tailwind / custom layers) ──
      zIndexPopupBase: 1000,
      zIndexBase: 0,

      // ── Disable global focus ring (we use our own) ─────────────────────
      boxShadowSecondary: "none",
    },
    components: buildComponents(isDark),
  };
}
