'use client'

import type { ReactNode } from 'react'

import { ColorModeProvider } from '../components/color-mode'
import { AntdProvider } from './antd-provider'
import { QueryProvider } from './query-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ColorModeProvider>
        <AntdProvider>{children}</AntdProvider>
      </ColorModeProvider>
    </QueryProvider>
  )
}
