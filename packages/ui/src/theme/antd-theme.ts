import { theme } from 'antd'
import type { ThemeConfig } from 'antd'
import {
  ANT_CSS_VAR_KEY,
  DEFAULT_PRIMARY_COLOR,
  DESIGN_FONT,
  DESIGN_MOTION,
  DESIGN_RADIUS,
  semanticToAntdTokens,
} from '@vokcg/config'

import { adjustHex, hexAlpha } from '../lib/color-utils'

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
  }
}

const sharedComponents: ThemeConfig['components'] = {
  Button: {
    borderRadius: DESIGN_RADIUS.md,
    borderRadiusSM: DESIGN_RADIUS.sm,
    fontWeight: 600,
    primaryShadow: 'none',
    defaultShadow: 'none',
    dangerShadow: 'none',
  },
  Input: {
    borderRadius: DESIGN_RADIUS.md,
    borderRadiusSM: DESIGN_RADIUS.sm,
    activeShadow: 'none',
    hoverBorderColor: 'var(--color-primary)',
    activeBorderColor: 'var(--color-primary)',
  },
  Card: {
    borderRadius: DESIGN_RADIUS.lg,
    colorBgContainer: 'var(--bg-surface)',
    colorBorderSecondary: 'var(--border-default)',
  },
  Table: {
    borderRadius: DESIGN_RADIUS.lg,
    rowHoverBg: 'var(--bg-active)',
    headerBg: 'var(--bg-subtle)',
    headerColor: 'var(--text-secondary)',
    borderColor: 'var(--border-default)',
  },
  Modal: {
    borderRadius: DESIGN_RADIUS.lg,
    contentBg: 'var(--bg-surface)',
    titleColor: 'var(--text-primary)',
  },
}

export function buildAntdTheme(
  isDark: boolean,
  primaryColor = DEFAULT_PRIMARY_COLOR,
): ThemeConfig {
  return {
    cssVar: { key: ANT_CSS_VAR_KEY, prefix: '' },
    hashed: false,
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...semanticToAntdTokens(isDark),
      ...primaryTokens(primaryColor, isDark),
      borderRadius: DESIGN_RADIUS.md,
      borderRadiusSM: DESIGN_RADIUS.sm,
      borderRadiusLG: DESIGN_RADIUS.lg,
      fontFamily: DESIGN_FONT.sans,
      fontFamilyCode: DESIGN_FONT.mono,
      fontSize: DESIGN_FONT.sizeBase,
      motionDurationMid: DESIGN_MOTION.fast,
      motionDurationSlow: DESIGN_MOTION.mid,
      controlHeight: 36,
    },
    components: sharedComponents,
  }
}
