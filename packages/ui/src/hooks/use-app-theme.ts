'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useAdminUiStore } from '@vokcg/store'

import { applyAppTheme } from '../lib/apply-theme'

export function useAppTheme() {
  const primaryColor = useAdminUiStore((s) => s.primaryColor)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    applyAppTheme(isDark, primaryColor)
  }, [primaryColor, isDark])
}
