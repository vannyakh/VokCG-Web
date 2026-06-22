export type TaskState = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export type TaskMaterial = string | {
  url?: string
  provider?: string
  duration?: number
}

export type Task = {
  id: string
  /** Raw field returned by the API — normalised to `id` by the API layer. */
  task_id?: string
  state: TaskState
  progress?: number
  stage?: string
  title?: string | null
  video_subject?: string
  video_source?: string
  video_aspect?: string
  video_count?: number
  videos?: string[]
  combined_videos?: string[]
  script?: string
  terms?: string | string[]
  materials?: TaskMaterial[]
  created_at?: string
  updated_at?: string
}

export type TaskContentSummary = {
  topic: string
  scriptPreview: string
  keywords: string[]
  source: string
  aspect: string
  materialCount: number
  videoCount: number
}

export type TaskViewMode = 'grid' | 'list'

export type TaskListData = {
  tasks: Task[]
  total: number
  page: number
  page_size: number
}
