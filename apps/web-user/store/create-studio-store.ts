import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS, STUDIO_PANEL } from '@vokcg/config'
import {
  CREATE_FLOW_STEPS,
  createFlowStepIndex,
  nextCreateFlowStep,
  prevCreateFlowStep,
  type CreateFlowStepId,
} from '@vokcg/constants'

type CreateStudioState = {
  panelWidth: number
  optionsCollapsed: boolean
  activeStep: CreateFlowStepId
  setPanelWidth: (width: number) => void
  setOptionsCollapsed: (collapsed: boolean) => void
  toggleOptions: () => void
  resetPanelWidth: () => void
  setActiveStep: (step: CreateFlowStepId) => void
  nextStep: () => void
  prevStep: () => void
  resetFlow: () => void
}

function clampWidth(width: number) {
  return Math.min(STUDIO_PANEL.max, Math.max(STUDIO_PANEL.min, Math.round(width)))
}

export const useCreateStudioStore = create<CreateStudioState>()(
  persist(
    (set, get) => ({
      panelWidth: STUDIO_PANEL.default,
      optionsCollapsed: false,
      activeStep: CREATE_FLOW_STEPS[0]!.id,
      setPanelWidth: (width) => set({ panelWidth: clampWidth(width) }),
      setOptionsCollapsed: (collapsed) => set({ optionsCollapsed: collapsed }),
      toggleOptions: () => set((s) => ({ optionsCollapsed: !s.optionsCollapsed })),
      resetPanelWidth: () => set({ panelWidth: STUDIO_PANEL.default }),
      setActiveStep: (activeStep) => set({ activeStep }),
      nextStep: () => {
        const next = nextCreateFlowStep(get().activeStep)
        if (next) set({ activeStep: next })
      },
      prevStep: () => {
        const prev = prevCreateFlowStep(get().activeStep)
        if (prev) set({ activeStep: prev })
      },
      resetFlow: () => set({ activeStep: CREATE_FLOW_STEPS[0]!.id }),
    }),
    { name: STORAGE_KEYS.createStudio },
  ),
)

export { createFlowStepIndex }
export type { CreateFlowStepId }
