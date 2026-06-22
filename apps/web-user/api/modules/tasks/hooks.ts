import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteApi, getApi } from '@/api/request'
import type { ApiResponse } from '@vokcg/types'
import type { Task, TaskListData, TaskState } from '@vokcg/types'

export const TASKS_KEY = ['tasks'] as const

/* ── API response normalizer ─────────────────────────────────────────────── */
// The backend returns:
//   • `task_id`  instead of `id`
//   • `state`    as an integer instead of a string enum
//
// We normalise once here so every consumer works with the typed Task shape.

function normalizeState(
  raw: unknown,
  task: Record<string, unknown>,
): TaskState {
  // Already a valid string state — pass through
  if (typeof raw === 'string') {
    const valid: TaskState[] = ['pending', 'processing', 'completed', 'failed', 'cancelled']
    if (valid.includes(raw as TaskState)) return raw as TaskState
  }

  // Numeric state: infer from contextual signals rather than guessing the
  // server-side enum (which may change). Signals are ordered by certainty:
  //   1. Has a final video                → completed
  //   2. Has a stage string / progress>0  → processing
  //   3. Otherwise                        → pending
  const hasVideo = !!(
    (task.combined_videos as unknown[] | undefined)?.length ||
    (task.videos as unknown[] | undefined)?.length
  )
  if (hasVideo) return 'completed'

  const hasStage    = typeof task.stage === 'string' && task.stage.length > 0
  const hasProgress = typeof task.progress === 'number' && task.progress > 0
  if (hasStage || hasProgress) return 'processing'

  return 'pending'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTask(raw: any): Task {
  return {
    ...raw,
    // Back-compat: server sends task_id, our types use id
    id:    String(raw.id ?? raw.task_id ?? ''),
    state: normalizeState(raw.state, raw),
  }
}

function normalizeListData(res: ApiResponse<TaskListData>): TaskListData {
  return {
    ...res.data,
    tasks: (res.data.tasks ?? []).map(normalizeTask),
  }
}

/* ── Active-state detection (works on raw API data before normalisation) ─── */
function rawIsActive(task: Record<string, unknown>): boolean {
  // String state — quick check
  if (typeof task.state === 'string') {
    return task.state === 'pending' || task.state === 'processing'
  }
  // Numeric / unknown state — use contextual signals
  const hasVideo = !!(
    (task.combined_videos as unknown[] | undefined)?.length ||
    (task.videos as unknown[] | undefined)?.length
  )
  if (hasVideo) return false
  const hasStage    = typeof task.stage === 'string' && task.stage.length > 0
  const hasProgress = typeof task.progress === 'number' && task.progress > 0
  return hasStage || hasProgress
}

/* ── Hooks ───────────────────────────────────────────────────────────────── */

export function useTasks(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...TASKS_KEY, page, pageSize],
    queryFn:  () => getApi<ApiResponse<TaskListData>>('/api/v1/tasks', { page, page_size: pageSize }),
    select:   normalizeListData,
    refetchInterval: (query) => {
      // query.state.data is the RAW (pre-select) ApiResponse<TaskListData>
      const tasks: Record<string, unknown>[] = query.state.data?.data?.tasks ?? []
      return tasks.some(rawIsActive) ? 2500 : false
    },
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, taskId],
    queryFn:  () => getApi<ApiResponse<Task>>(`/api/v1/tasks/${taskId}`),
    select:   (res) => normalizeTask(res.data),
    enabled:  Boolean(taskId),
    refetchInterval: (query) => {
      // query.state.data is the RAW (pre-select) ApiResponse<Task>
      const raw = query.state.data?.data as Record<string, unknown> | undefined
      if (!raw) return 2000
      return rawIsActive(raw) ? 1500 : false
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => deleteApi(`/api/v1/tasks/${taskId}`),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: TASKS_KEY }) },
  })
}
