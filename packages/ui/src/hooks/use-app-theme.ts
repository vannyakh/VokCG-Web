'use client'

import { DEFAULT_PRIMARY_COLOR } from '@vokcg/config'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

import { applyAppTheme } from '../lib/apply-theme'

export function useAppTheme(primaryColor: string = DEFAULT_PRIMARY_COLOR) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    applyAppTheme(isDark, primaryColor)
  }, [primaryColor, isDark])
}
