import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS, STUDIO_SIDEBAR } from "@vokcg/config";

type SidebarState = {
  collapsed: boolean;
  hidden: boolean;
  sidebarWidth: number;
  sidebarHoverExpand: boolean;
  sidebarMiniMode: boolean;
  toggle: () => void;
  toggleHidden: () => void;
  setCollapsed: (v: boolean) => void;
  setHidden: (v: boolean) => void;
  setSidebarWidth: (w: number) => void;
  setSidebarHoverExpand: (v: boolean) => void;
  setSidebarMiniMode: (v: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      hidden: false,
      sidebarWidth: STUDIO_SIDEBAR.widthDefault,
      sidebarHoverExpand: false,
      sidebarMiniMode: false,
      toggle: () => set({ collapsed: !get().collapsed }),
      toggleHidden: () => set({ hidden: !get().hidden }),
      setCollapsed: (v) => set({ collapsed: v }),
      setHidden: (v) => set({ hidden: v }),
      setSidebarWidth: (w) =>
        set({
          sidebarWidth: Math.max(
            STUDIO_SIDEBAR.widthMin,
            Math.min(STUDIO_SIDEBAR.widthMax, w),
          ),
        }),
      setSidebarHoverExpand: (v) => set({ sidebarHoverExpand: v }),
      setSidebarMiniMode: (v) => set({ sidebarMiniMode: v }),
    }),
    { name: STORAGE_KEYS.sidebar },
  ),
);
