"use client"

import type { StatCardProps } from './stat-card'
import { StatCard } from './stat-card'

export type StatGridItem = Omit<StatCardProps, 'loading'>

type StatGridProps = {
  items: StatGridItem[]
  columns?: 2 | 3 | 4 | 6
  loading?: boolean
  className?: string
}

const GRID_CLASS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
} as const

/** Responsive KPI grid built on StatCard */
export function StatGrid({ items, columns = 3, loading, className = '' }: StatGridProps) {
  return (
    <div className={`grid shrink-0 gap-3 ${GRID_CLASS[columns]} ${className}`.trim()}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} loading={loading} />
      ))}
    </div>
  )
}
