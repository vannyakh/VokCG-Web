import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@vokcg/config'

import type { User } from '@/types/auth'

type UserAuthState = {
  accessToken: string
  refreshToken: string
  user: User | null
  setSession: (accessToken: string, refreshToken: string, user: User) => void
  setUser: (user: User) => void
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
}

export const useAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      accessToken: '',
      refreshToken: '',
      user: null,
      setSession: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: '', refreshToken: '', user: null }),
    }),
    { name: STORAGE_KEYS.userAuth },
  ),
)
