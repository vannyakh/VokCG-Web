'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@vokcg/config'

type WorkspaceState = {
  selectedTenantId: string | null
  setSelectedTenantId: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedTenantId: null,
      setSelectedTenantId: (id) => set({ selectedTenantId: id }),
    }),
    { name: STORAGE_KEYS.workspace },
  ),
)
