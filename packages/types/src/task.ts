export type TaskState =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type Task = {
  id: string
  state: TaskState
  title?: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type TaskListData = {
  tasks: Task[]
  page: number
  page_size: number
  total: number
}
