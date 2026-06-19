import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@vokcg/config'
import type { AuthUser } from '@vokcg/types'

type AuthState = {
  accessToken: string
  refreshToken: string
  user: AuthUser | null
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
  setUser: (user: AuthUser) => void
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
  hasPermission: (code: string) => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: '',
      refreshToken: '',
      user: null,
      setSession: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: '', refreshToken: '', user: null }),
      hasPermission: (code) => {
        const user = get().user
        if (!user) return false
        if (user.is_superuser) return true
        return user.permissions.includes(code)
      },
      isAdmin: () => {
        const user = get().user
        if (!user) return false
        return user.is_superuser || user.permissions.includes('users.read')
      },
    }),
    { name: STORAGE_KEYS.auth },
  ),
)
