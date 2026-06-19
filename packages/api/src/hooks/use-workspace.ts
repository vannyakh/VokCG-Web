'use client'

import { useMemo } from 'react'

import { useWorkspaceStore } from '@vokcg/store'
import { useWorkspaceContext } from './use-workspace-saas'
import type { Workspace, WorkspaceMember } from '@vokcg/types'

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

export function useWorkspace() {
  const selectedTenantId = useWorkspaceStore((s) => s.selectedTenantId)
  const setSelectedTenantId = useWorkspaceStore((s) => s.setSelectedTenantId)

  const { data, isLoading, isFetching, refetch } = useWorkspaceContext(selectedTenantId)

  const workspace = useMemo(
    () => data?.workspace ?? EMPTY_WORKSPACE,
    [data?.workspace],
  )

  const members = useMemo(
    (): WorkspaceMember[] => data?.members ?? [],
    [data?.members],
  )

  const availableTenants = useMemo(
    () => data?.tenants ?? [],
    [data?.tenants],
  )

  return {
    workspace,
    members,
    availableTenants,
    selectedTenantId: selectedTenantId ?? workspace.id,
    setSelectedTenantId,
    isLoading,
    isFetching,
    refetch,
    isDemo: !workspace.id,
    canManageBilling: workspace.role === 'owner' || workspace.role === 'admin',
  }
}
