import type { ApiResponse, ValidationError } from '@vokcg/types'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_BASE_URL } from '@vokcg/config'
import { useAuthStore } from '@vokcg/store'
import type { AuthTokenPayload } from '@vokcg/types'

function extractErrorMessage(payload: unknown, fallback: string): string {
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

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const { setSession, clearSession } = useAuthStore.getState()

  try {
    const response = await axios.post<ApiResponse<AuthTokenPayload>>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )

    const payload = response.data
    if (isErrorPayload(response.status, payload) || !payload.data?.access_token) {
      clearSession()
      return null
    }

    setSession(payload.data.access_token, payload.data.refresh_token, payload.data.user)
    return payload.data.access_token
  } catch {
    clearSession()
    return null
  }
}

function ensureAccessToken(): Promise<string | null> {
  const { refreshToken, clearSession } = useAuthStore.getState()
  if (!refreshToken) {
    clearSession()
    return Promise.resolve(null)
  }

  if (!refreshPromise) {
    const tokenForRefresh = refreshToken
    refreshPromise = refreshAccessToken(tokenForRefresh).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as { status?: number }
    if (isErrorPayload(response.status, payload)) {
      throw new Error(extractErrorMessage(payload, `Request failed: ${response.status}`))
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
        useAuthStore.getState().clearSession()
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const newToken = await ensureAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
    }

    if (error.code === 'ERR_NETWORK') {
      throw new Error(
        'Unable to reach the API. Ensure the backend is running (docker compose up or uvicorn on port 8888).',
      )
    }

    const status = error.response?.status
    if (status === 502 || status === 503) {
      throw new Error(
        'API is unavailable. If you use Docker, wait until the server started on port 8888, then refresh.',
      )
    }

    const fallback = status ? `Request failed: ${status}` : 'Request failed'
    throw new Error(extractErrorMessage(error.response?.data, fallback))
  },
)

export async function getApi<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(path, { params, ...config })
  return response.data
}

export async function postApi<T>(
  path: string,
  body: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(path, body, config)
  return response.data
}

export async function putApi<T>(
  path: string,
  body: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(path, body, config)
  return response.data
}

export async function deleteApi<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(path, config)
  return response.data
}

export async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<T>(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function postBlob(path: string, body: Record<string, unknown>): Promise<Blob> {
  const response = await apiClient.post(path, body, { responseType: 'blob' })
  return response.data as Blob
}
