import type { ApiResponse, ValidationError } from '@vokcg/types'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

const AUTH_NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/logout'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseErrorPayload(payload: unknown): Record<string, unknown> | null {
  if (typeof payload === 'string') {
    try {
      const parsed: unknown = JSON.parse(payload)
      return isRecord(parsed) ? parsed : null
    } catch {
      return payload.trim() ? { message: payload.trim() } : null
    }
  }
  return isRecord(payload) ? payload : null
}

export function extractErrorMessage(payload: unknown, fallback: string): string {
  const p = parseErrorPayload(payload)
  if (!p) return fallback

  if (typeof p.message === 'string' && p.message.trim()) {
    return p.message.trim()
  }

  if (typeof p.error === 'string' && p.error.trim()) {
    return p.error.trim()
  }

  if (typeof p.detail === 'string' && p.detail.trim()) {
    return p.detail.trim()
  }

  if (Array.isArray(p.detail) && p.detail.length > 0) {
    return p.detail
      .map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)))
      .join('\n')
  }

  if (isRecord(p.data) && typeof p.data.message === 'string' && p.data.message.trim()) {
    return p.data.message.trim()
  }

  if (Array.isArray(p.data) && p.data.length > 0) {
    return (p.data as ValidationError[])
      .map((e) => {
        const field = e.loc?.filter((s) => s !== 'body').join('.') ?? ''
        const reason = e.ctx?.reason ?? e.msg
        return field ? `${field}: ${reason}` : reason
      })
      .join('\n')
  }

  return fallback
}

export function normalizeRequestError(error: unknown, fallback = 'Request failed'): Error {
  if (error instanceof Error && !axios.isAxiosError(error)) {
    return error
  }

  const axiosError = error as AxiosError
  if (axiosError?.code === 'ERR_NETWORK') {
    return new Error('Unable to reach the API. Please check your connection and try again.')
  }

  const status = axiosError.response?.status
  if (status === 502 || status === 503) {
    return new Error('The API is temporarily unavailable. Please try again in a moment.')
  }

  const statusFallback = status ? `Request failed: ${status}` : fallback
  return new Error(extractErrorMessage(axiosError.response?.data, statusFallback))
}

function shouldAttemptTokenRefresh(
  error: AxiosError,
  auth: RequestAuthConfig,
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
): boolean {
  if (error.response?.status !== 401) return false
  if (originalRequest._retry) return false

  const url = originalRequest.url ?? ''
  if (url.includes(auth.refreshPath)) return false
  if (AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))) return false

  return true
}

function isErrorPayload(status: number, payload: { status?: number } | null | undefined): boolean {
  const apiStatus = payload?.status
  return status >= 400 || (apiStatus !== undefined && apiStatus >= 400)
}

export type RequestAuthConfig<TSession = unknown> = {
  getAccessToken: () => string | null | undefined
  getRefreshToken: () => string | null | undefined
  refreshPath: string
  refresh: (refreshToken: string) => Promise<string | null>
  clearSession: () => void
}

export type CreateRequestClientOptions = {
  baseURL: string
  auth?: RequestAuthConfig
}

export type RequestClient = {
  client: AxiosInstance
  getApi: <T>(
    path: string,
    params?: Record<string, string | number | undefined>,
    config?: AxiosRequestConfig,
  ) => Promise<T>
  postApi: <T>(
    path: string,
    body: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) => Promise<T>
  putApi: <T>(
    path: string,
    body: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) => Promise<T>
  deleteApi: <T>(path: string, config?: AxiosRequestConfig) => Promise<T>
  uploadFormData: <T>(path: string, formData: FormData) => Promise<T>
  postBlob: (path: string, body: Record<string, unknown>) => Promise<Blob>
}

export function createRequestClient(options: CreateRequestClientOptions): RequestClient {
  const { baseURL, auth } = options
  let refreshPromise: Promise<string | null> | null = null

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = auth?.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => {
      const payload = response.data as { status?: number }
      if (isErrorPayload(response.status, payload)) {
        throw new Error(extractErrorMessage(payload, `Request failed: ${response.status}`))
      }
      return response
    },
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (auth && originalRequest && shouldAttemptTokenRefresh(error, auth, originalRequest)) {
        originalRequest._retry = true
        const refreshToken = auth.getRefreshToken()
        if (!refreshToken) {
          auth.clearSession()
          return Promise.reject(normalizeRequestError(error))
        }

        if (!refreshPromise) {
          refreshPromise = auth.refresh(refreshToken).finally(() => {
            refreshPromise = null
          })
        }

        const newToken = await refreshPromise
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return client(originalRequest)
        }

        auth.clearSession()
      }

      return Promise.reject(normalizeRequestError(error))
    },
  )

  async function getApi<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await client.get<T>(path, { params, ...config })
    return response.data
  }

  async function postApi<T>(
    path: string,
    body: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await client.post<T>(path, body, config)
    return response.data
  }

  async function putApi<T>(
    path: string,
    body: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await client.put<T>(path, body, config)
    return response.data
  }

  async function deleteApi<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await client.delete<T>(path, config)
    return response.data
  }

  async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
    const response = await client.post<T>(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async function postBlob(path: string, body: Record<string, unknown>): Promise<Blob> {
    const response = await client.post(path, body, { responseType: 'blob' })
    return response.data as Blob
  }

  return { client, getApi, postApi, putApi, deleteApi, uploadFormData, postBlob }
}

export type { ApiResponse }
