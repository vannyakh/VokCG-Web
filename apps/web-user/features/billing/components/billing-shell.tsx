'use client'

import type { ReactNode } from 'react'
import { Page } from '@vokcg/ui'

type Props = {
  title: string
  description?: string
  badge?: string
  extra?: ReactNode
  children: ReactNode
}

export function BillingShell({ title, description, badge, extra, children }: Props) {
  return (
    <Page title={title} description={description} badge={badge} extra={extra} width="full" scroll spacing="comfortable">
      {children}
    </Page>
  )
}
