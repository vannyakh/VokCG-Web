import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  ADMIN_AFFIX_TABS,
  DEFAULT_ADMIN_UI_PREFERENCES,
  DEFAULT_TAB_HISTORY,
  STORAGE_KEYS,
} from "@vokcg/config";
import type { AdminTab } from "@vokcg/constants";

export function selectOpenTabs(
  tabHistory: AdminTab[],
  removedTabs: AdminTab[],
  activeTab: AdminTab,
): AdminTab[] {
  const removed = new Set(removedTabs);
  const withCurrent = tabHistory.includes(activeTab)
    ? tabHistory
    : [...tabHistory, activeTab];
  return withCurrent.filter((t) => !removed.has(t));
}

type AdminUiPersisted = {
  primaryColor: string;
  sidebarWidth: number;
  sidebarMiniMode: boolean;
  sidebarHoverExpand: boolean;
  contentCompact: boolean;
  transitionProgressBar: boolean;
  transitionLoading: boolean;
  transitionAnimation: boolean;
  tabBarVisible: boolean;
  tabBarDraggable: boolean;
  tabBarWheelScroll: boolean;
  tabBarShowIcons: boolean;
  tabHistory: AdminTab[];
  removedTabs: AdminTab[];
};

const DEFAULT_ADMIN_UI_PERSISTED: AdminUiPersisted = {
  ...DEFAULT_ADMIN_UI_PREFERENCES,
  tabHistory: DEFAULT_TAB_HISTORY,
  removedTabs: [],
};

export type AdminUiState = {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  sidebarMiniMode: boolean;
  setSidebarMiniMode: (v: boolean) => void;
  sidebarHoverExpand: boolean;
  setSidebarHoverExpand: (v: boolean) => void;
  contentCompact: boolean;
  setContentCompact: (v: boolean) => void;
  transitionProgressBar: boolean;
  setTransitionProgressBar: (v: boolean) => void;
  transitionLoading: boolean;
  setTransitionLoading: (v: boolean) => void;
  transitionAnimation: boolean;
  setTransitionAnimation: (v: boolean) => void;
  tabBarVisible: boolean;
  setTabBarVisible: (v: boolean) => void;
  tabBarDraggable: boolean;
  setTabBarDraggable: (v: boolean) => void;
  tabBarWheelScroll: boolean;
  setTabBarWheelScroll: (v: boolean) => void;
  tabBarShowIcons: boolean;
  setTabBarShowIcons: (v: boolean) => void;
  tabHistory: AdminTab[];
  removedTabs: AdminTab[];
  openTab: (tab: AdminTab) => void;
  closeTab: (tab: AdminTab) => void;
  closeOtherTabs: (keep: AdminTab) => void;
  closeAllTabs: () => void;
  sortTabs: (oldIndex: number, newIndex: number, activeTab: AdminTab) => void;
  resetTabSession: () => void;
  resetPreferences: () => void;
};

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set, get) => ({
      primaryColor: DEFAULT_ADMIN_UI_PREFERENCES.primaryColor,
      setPrimaryColor: (primaryColor) => set({ primaryColor }),

      sidebarWidth: DEFAULT_ADMIN_UI_PREFERENCES.sidebarWidth,
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      sidebarMiniMode: DEFAULT_ADMIN_UI_PREFERENCES.sidebarMiniMode,
      setSidebarMiniMode: (sidebarMiniMode) => set({ sidebarMiniMode }),
      sidebarHoverExpand: DEFAULT_ADMIN_UI_PREFERENCES.sidebarHoverExpand,
      setSidebarHoverExpand: (sidebarHoverExpand) =>
        set({ sidebarHoverExpand }),

      contentCompact: DEFAULT_ADMIN_UI_PREFERENCES.contentCompact,
      setContentCompact: (contentCompact) => set({ contentCompact }),

      transitionProgressBar: DEFAULT_ADMIN_UI_PREFERENCES.transitionProgressBar,
      setTransitionProgressBar: (transitionProgressBar) =>
        set({ transitionProgressBar }),
      transitionLoading: DEFAULT_ADMIN_UI_PREFERENCES.transitionLoading,
      setTransitionLoading: (transitionLoading) => set({ transitionLoading }),
      transitionAnimation: DEFAULT_ADMIN_UI_PREFERENCES.transitionAnimation,
      setTransitionAnimation: (transitionAnimation) =>
        set({ transitionAnimation }),

      tabBarVisible: DEFAULT_ADMIN_UI_PREFERENCES.tabBarVisible,
      setTabBarVisible: (tabBarVisible) => set({ tabBarVisible }),
      tabBarDraggable: DEFAULT_ADMIN_UI_PREFERENCES.tabBarDraggable,
      setTabBarDraggable: (tabBarDraggable) => set({ tabBarDraggable }),
      tabBarWheelScroll: DEFAULT_ADMIN_UI_PREFERENCES.tabBarWheelScroll,
      setTabBarWheelScroll: (tabBarWheelScroll) => set({ tabBarWheelScroll }),
      tabBarShowIcons: DEFAULT_ADMIN_UI_PREFERENCES.tabBarShowIcons,
      setTabBarShowIcons: (tabBarShowIcons) => set({ tabBarShowIcons }),

      tabHistory: DEFAULT_TAB_HISTORY,
      removedTabs: [],

      openTab: (tab) =>
        set((state) => {
          const nextRemoved = state.removedTabs.filter((t) => t !== tab);
          const inHistory = state.tabHistory.includes(tab);
          if (inHistory && nextRemoved.length === state.removedTabs.length) {
            return state;
          }
          return {
            removedTabs: nextRemoved,
            tabHistory: inHistory
              ? state.tabHistory
              : [...state.tabHistory, tab],
          };
        }),

      closeTab: (tab) =>
        set((state) => ({
          removedTabs: state.removedTabs.includes(tab)
            ? state.removedTabs
            : [...state.removedTabs, tab],
        })),

      closeOtherTabs: (keep) =>
        set((state) => {
          const nextRemoved = new Set(state.removedTabs);
          for (const tab of state.tabHistory) {
            if (tab !== keep && !ADMIN_AFFIX_TABS.includes(tab))
              nextRemoved.add(tab);
          }
          return { removedTabs: Array.from(nextRemoved) };
        }),

      closeAllTabs: () =>
        set((state) => {
          const nextRemoved = new Set(state.removedTabs);
          for (const tab of state.tabHistory) {
            if (!ADMIN_AFFIX_TABS.includes(tab)) nextRemoved.add(tab);
          }
          return { removedTabs: Array.from(nextRemoved) };
        }),

      sortTabs: (oldIndex, newIndex, activeTab) => {
        if (oldIndex === newIndex) return;
        const state = get();
        const openTabs = selectOpenTabs(
          state.tabHistory,
          state.removedTabs,
          activeTab,
        );
        const reordered = [...openTabs];
        const [moved] = reordered.splice(oldIndex, 1);
        if (!moved) return;
        reordered.splice(newIndex, 0, moved);
        const closed = state.tabHistory.filter((t) =>
          state.removedTabs.includes(t),
        );
        set({
          tabHistory: [
            ...reordered,
            ...closed.filter((t) => !reordered.includes(t)),
          ],
        });
      },

      resetTabSession: () =>
        set({
          tabHistory: DEFAULT_TAB_HISTORY,
          removedTabs: [],
        }),

      resetPreferences: () => set({ ...DEFAULT_ADMIN_UI_PREFERENCES }),
    }),
    {
      name: STORAGE_KEYS.adminUi,
      version: 1,
      partialize: (state) => ({
        primaryColor: state.primaryColor,
        sidebarWidth: state.sidebarWidth,
        sidebarMiniMode: state.sidebarMiniMode,
        sidebarHoverExpand: state.sidebarHoverExpand,
        contentCompact: state.contentCompact,
        transitionProgressBar: state.transitionProgressBar,
        transitionLoading: state.transitionLoading,
        transitionAnimation: state.transitionAnimation,
        tabBarVisible: state.tabBarVisible,
        tabBarDraggable: state.tabBarDraggable,
        tabBarWheelScroll: state.tabBarWheelScroll,
        tabBarShowIcons: state.tabBarShowIcons,
        tabHistory: state.tabHistory,
        removedTabs: state.removedTabs,
      }),
    },
  ),
);
