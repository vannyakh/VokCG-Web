'use client'

import { App, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { useTheme } from 'next-themes'
import { useMemo, type ReactNode } from 'react'
import { useAdminUiStore } from '@vokcg/store'

import { useAppTheme } from '../hooks/use-app-theme'
import { buildAntdTheme } from '../theme/antd-theme'

export function AntdProvider({ children }: { children: ReactNode }) {
  useAppTheme()

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const primaryColor = useAdminUiStore((s) => s.primaryColor)

  const antdTheme = useMemo(
    () => buildAntdTheme(isDark, primaryColor),
    [isDark, primaryColor],
  )

  return (
    <ConfigProvider locale={enUS} theme={antdTheme} componentSize="middle">
      <App message={{ maxCount: 3 }} notification={{ placement: 'topRight', top: 56 }}>
        {children}
      </App>
    </ConfigProvider>
  )
}
