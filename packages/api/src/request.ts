import type { ApiResponse, ValidationError } from '@vokcg/types'
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

export function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const p = payload as Record<string, unknown>

  if (Array.isArray(p.data) && p.data.length > 0) {
    return (p.data as ValidationError[])
      .map((e) => {
        const field = e.loc?.filter((s) => s !== 'body').join('.') ?? ''
        const reason = e.ctx?.reason ?? e.msg
        return field ? `${field}: ${reason}` : reason
      })
      .join('\n')
  }

  return (p.message as string | undefined) || fallback
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

      if (
        auth &&
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (originalRequest.url?.includes(auth.refreshPath)) {
          auth.clearSession()
          return Promise.reject(error)
        }

        originalRequest._retry = true
        const refreshToken = auth.getRefreshToken()
        if (!refreshToken) {
          auth.clearSession()
          return Promise.reject(error)
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
      }

      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to reach the API. Please check your connection and try again.')
      }

      const status = error.response?.status
      if (status === 502 || status === 503) {
        throw new Error('The API is temporarily unavailable. Please try again in a moment.')
      }

      const fallback = status ? `Request failed: ${status}` : 'Request failed'
      throw new Error(extractErrorMessage(error.response?.data, fallback))
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
