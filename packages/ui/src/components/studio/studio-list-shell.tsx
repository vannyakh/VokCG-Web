'use client'

import type { ReactNode } from 'react'

import type { PageSpacing, PageWidth } from '../layout/page'
import { Page } from '../layout/page'

type Props = {
  /** Shown under the global Header title — do not repeat the page title here */
  description?: ReactNode
  badge?: string
  extra?: ReactNode
  footer?: ReactNode
  spacing?: PageSpacing
  scroll?: boolean
  width?: PageWidth
  headerBorder?: boolean
  /** Stick the page sub-header to top on scroll */
  stickyHeader?: boolean
  children: ReactNode
}

/** Standard list / management tool page — title lives in the studio Header */
export function StudioListShell({
  description,
  badge,
  extra,
  footer,
  spacing = 'comfortable',
  scroll = true,
  width = 'full',
  headerBorder = true,
  stickyHeader = false,
  children,
}: Props) {
  return (
    <Page
      description={description}
      badge={badge}
      extra={extra}
      footer={footer}
      width={width}
      fill
      scroll={scroll}
      spacing={spacing}
      headerBorder={headerBorder}
      stickyHeader={stickyHeader}
    >
      {children}
    </Page>
  )
}

