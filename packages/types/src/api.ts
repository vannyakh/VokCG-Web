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
