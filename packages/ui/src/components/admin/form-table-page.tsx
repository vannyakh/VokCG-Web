"use client"

import type { ReactNode } from 'react'
import type { StatGridItem } from './stat-grid'
import { StatGrid } from './stat-grid'
import { Page, type PageProps } from '../layout/page'

type FormTablePageProps = PageProps & {
  stats?: StatGridItem[]
  statsColumns?: 2 | 3 | 4 | 6
  statsLoading?: boolean
  statsExtra?: ReactNode
  children: ReactNode
}

/**
 * Standard admin list page — Page header + optional StatGrid + form-table stack.
 * Used by Users, Tenants, Subscriptions, Plans, and other CRUD tables.
 */
export function FormTablePage({
  stats,
  statsColumns = 3,
  statsLoading,
  statsExtra,
  children,
  autoContentHeight = true,
  contentClass = '',
  width = 'full',
  ...pageProps
}: FormTablePageProps) {
  const hasStats = Boolean(stats?.length || statsExtra)

  return (
    <Page
      autoContentHeight={autoContentHeight}
      contentClass={contentClass}
      width={width}
      {...pageProps}
    >
      <div className={hasStats ? 'form-table-stack' : 'flex min-h-0 flex-1 flex-col'}>
        {(stats?.length || statsExtra) && (
          <div className="flex flex-col gap-3">
            {stats?.length ? (
              <StatGrid columns={statsColumns} loading={statsLoading} items={stats} />
            ) : null}
            {statsExtra}
          </div>
        )}
        {children}
      </div>
    </Page>
  )
}
