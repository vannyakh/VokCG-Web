export type ApiResponse<T> = {
  status: number
  message?: string
  data: T
}

export type ValidationError = {
  type: string
  loc: string[]
  msg: string
  input: unknown
  ctx?: { reason: string }
}

export type ScriptResponse = ApiResponse<{ video_script: string }>
export type TermsResponse = ApiResponse<{ video_terms: string[] }>
export type TaskCreateResponse = ApiResponse<{ task_id: string }>
