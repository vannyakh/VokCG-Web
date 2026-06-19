"use client"

import { Card, Skeleton } from 'antd'
import type { LucideIcon } from 'lucide-react'

export type StatCardProps = {
  label: string
  value: string | number | undefined
  icon: LucideIcon
  accent?: string
  prefix?: string
  precision?: number
  loading?: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatStatValue(
  value: string | number | undefined,
  prefix?: string,
  precision?: number,
) {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') return prefix ? `${prefix}${value}` : value
  const formatted =
    precision !== undefined
      ? value.toLocaleString(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })
      : value.toLocaleString()
  return prefix ? `${prefix}${formatted}` : formatted
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'bg-accent-muted text-accent',
  prefix,
  precision,
  loading,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-default bg-surface" size="small" styles={{ body: { padding: '16px 18px' } }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-muted">{label}</p>
          {loading ? (
            <Skeleton.Input active size="small" className="mt-2!" style={{ width: 72, height: 28 }} />
          ) : (
            <p className="mt-1 text-[26px] font-extrabold leading-none tracking-tight text-primary">
              {formatStatValue(value, prefix, precision)}
            </p>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={17} />
        </div>
      </div>
    </Card>
  )
}
