"use client"

import { API_BASE_URL } from '@vokcg/config'

type UserAvatarProps = {
  username: string
  avatarUrl?: string | null
  revision?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASS = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-20 w-20 text-lg',
} as const

export function UserAvatar({ username, avatarUrl, revision, size = 'sm', className = '' }: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size]
  const initials = username.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    const src =
      revision != null
        ? `${API_BASE_URL}${avatarUrl}?v=${revision}`
        : `${API_BASE_URL}${avatarUrl}`
    return (
      <img
        src={src}
        alt={username}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`.trim()}
      />
    )
  }

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white',
        sizeClass,
        className,
      ].join(' ')}
    >
      {initials}
    </div>
  )
}

type EntityAvatarProps = {
  name: string
  size?: 'sm' | 'md'
  accent?: string
}

const ENTITY_SIZE = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
} as const

/** Avatar for tenants, orgs, and other named entities */
export function EntityAvatar({
  name,
  size = 'sm',
  accent = 'bg-accent-muted text-accent',
}: EntityAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-lg font-bold',
        ENTITY_SIZE[size],
        accent,
      ].join(' ')}
    >
      {initial}
    </div>
  )
}

export function EntityCell({
  name,
  subtitle,
  accent,
}: {
  name: string
  subtitle?: string | null
  accent?: string
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <EntityAvatar name={name} accent={accent} />
      <div className="min-w-0 flex flex-col">
        <span className="truncate text-sm font-semibold text-primary">{name}</span>
        {subtitle && (
          <span className="truncate font-mono text-xs text-muted">{subtitle}</span>
        )}
      </div>
    </div>
  )
}

export function UserCell({
  username,
  fullName,
  avatarUrl,
}: {
  username: string
  fullName?: string | null
  avatarUrl?: string | null
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <UserAvatar username={username} avatarUrl={avatarUrl} />
      <div className="min-w-0 flex flex-col">
        <span className="truncate text-sm font-semibold text-primary">{username}</span>
        {fullName && <span className="truncate text-xs text-muted">{fullName}</span>}
      </div>
    </div>
  )
}
