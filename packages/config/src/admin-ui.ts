import type { AdminTab } from '@vokcg/constants'
import { DEFAULT_PRIMARY_COLOR } from './theme'

/** Accent color swatches for the preferences drawer */
export const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
] as const

export type PresetColor = (typeof PRESET_COLORS)[number]['value']

/** Sidebar dimension constraints */
export const ADMIN_SIDEBAR = {
  miniWidth: 60,
  widthMin: 180,
  widthMax: 340,
  widthDefault: 228,
  widthStep: 4,
} as const

/** Tabs pinned to the tab bar — cannot be closed */
export const ADMIN_AFFIX_TABS: AdminTab[] = ['overview']

export const DEFAULT_TAB_HISTORY: AdminTab[] = ['overview']

/** Persisted admin UI preference fields */
export type AdminUiPreferences = {
  primaryColor: string
  sidebarWidth: number
  sidebarMiniMode: boolean
  sidebarHoverExpand: boolean
  contentCompact: boolean
  transitionProgressBar: boolean
  transitionLoading: boolean
  transitionAnimation: boolean
  tabBarVisible: boolean
  tabBarDraggable: boolean
  tabBarWheelScroll: boolean
  tabBarShowIcons: boolean
}

export const DEFAULT_ADMIN_UI_PREFERENCES: AdminUiPreferences = {
  primaryColor: DEFAULT_PRIMARY_COLOR,
  sidebarWidth: ADMIN_SIDEBAR.widthDefault,
  sidebarMiniMode: false,
  sidebarHoverExpand: true,
  contentCompact: false,
  transitionProgressBar: true,
  transitionLoading: true,
  transitionAnimation: true,
  tabBarVisible: true,
  tabBarDraggable: true,
  tabBarWheelScroll: true,
  tabBarShowIcons: true,
}

/** Preferences drawer tab definitions */
export const ADMIN_PREFERENCE_TABS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'layout', label: 'Layout' },
  { id: 'general', label: 'General' },
  { id: 'shortcuts', label: 'Shortcuts' },
] as const

export type AdminPreferenceTabId = (typeof ADMIN_PREFERENCE_TABS)[number]['id']

export const ADMIN_SHORTCUTS = [
  { key: '[', label: 'Toggle sidebar' },
  { key: 'R', label: 'Refresh current tab' },
  { key: ',', label: 'Open / close settings' },
  { key: 'Esc', label: 'Close settings' },
  { key: '⌘ 1–9', label: 'Switch to tab N' },
] as const

export function exportAdminPreferencesSnapshot(
  prefs: AdminUiPreferences,
  themeMode?: string,
) {
  return { theme: themeMode, ...prefs }
}
