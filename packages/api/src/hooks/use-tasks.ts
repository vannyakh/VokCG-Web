import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteApi, getApi } from '../client'
import type { ApiResponse } from '@vokcg/types'
import type { Task, TaskListData } from '@vokcg/types'

export const TASKS_KEY = ['tasks'] as const

const ACTIVE_STATES = new Set(['pending', 'processing'])

function isTaskActive(state: string): boolean {
  return ACTIVE_STATES.has(state)
}

export function useTasks(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...TASKS_KEY, page, pageSize],
    queryFn: () =>
      getApi<ApiResponse<TaskListData>>('/api/v1/tasks', { page, page_size: pageSize }),
    select: (res) => res.data,
    refetchInterval: (query) => {
      const tasks = query.state.data?.data?.tasks ?? []
      return tasks.some((t: Task) => isTaskActive(t.state)) ? 2500 : false
    },
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, taskId],
    queryFn: () => getApi<ApiResponse<Task>>(`/api/v1/tasks/${taskId}`),
    select: (res) => res.data,
    enabled: Boolean(taskId),
    refetchInterval: (query) => {
      const task = query.state.data?.data
      if (!task) return 2000
      return isTaskActive(task.state) ? 1500 : false
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => deleteApi(`/api/v1/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}
