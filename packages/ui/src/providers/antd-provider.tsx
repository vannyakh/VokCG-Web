'use client'

import { App, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { DEFAULT_PRIMARY_COLOR } from '@vokcg/config'
import { useTheme } from 'next-themes'
import { useMemo, type ReactNode } from 'react'

import { useAppTheme } from '../hooks/use-app-theme'
import { buildAntdTheme } from '../theme/antd-theme'

type AntdProviderProps = {
  children: ReactNode
  primaryColor?: string
}

export function AntdProvider({ children, primaryColor = DEFAULT_PRIMARY_COLOR }: AntdProviderProps) {
  useAppTheme(primaryColor)

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

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
