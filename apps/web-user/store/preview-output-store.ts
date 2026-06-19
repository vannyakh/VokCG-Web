import { create } from 'zustand'

type PreviewOutputState = {
  ready: boolean
  taskId: string | null
  videos: string[]
  activeIndex: number
  activeUrl: string | null
  setSnapshot: (snapshot: { ready: boolean; taskId: string | null; videos: string[]; activeIndex: number; activeUrl: string | null }) => void
  setActiveIndex: (index: number) => void
  reset: () => void
}

const empty = {
  ready: false,
  taskId: null,
  videos: [] as string[],
  activeIndex: 0,
  activeUrl: null,
}

export const usePreviewOutputStore = create<PreviewOutputState>((set) => ({
  ...empty,
  setSnapshot: (snapshot) => set(snapshot),
  setActiveIndex: (activeIndex) =>
    set((s) => ({
      activeIndex,
      activeUrl: s.videos[activeIndex] ?? s.activeUrl,
    })),
  reset: () => set(empty),
}))
