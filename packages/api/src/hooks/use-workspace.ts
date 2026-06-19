'use client'

import { useMemo } from 'react'

import type { Workspace } from '@vokcg/types'

const EMPTY_WORKSPACE: Workspace = {
  id: '',
  name: 'My Studio',
  slug: 'my-studio',
  status: 'trial',
  members_count: 0,
  plan: null,
  subscription_status: null,
  subscription_id: null,
  role: 'member',
  renews_at: null,
  mrr: 0,
}

/** Stub until workspace API hooks are migrated */
export function useWorkspace() {
  const workspace = useMemo(() => EMPTY_WORKSPACE, [])

  return {
    workspace,
    members: [],
    availableTenants: [],
    selectedTenantId: workspace.id,
    setSelectedTenantId: (_id: string) => {},
    isLoading: false,
    isFetching: false,
    refetch: async () => {},
    isDemo: !workspace.id,
    canManageBilling: false,
  }
}
