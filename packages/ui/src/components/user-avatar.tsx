'use client'

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

export function UserAvatar({
  username,
  avatarUrl,
  revision,
  size = 'sm',
  className = '',
}: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size]
  const initials = username.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    const src =
      revision != null
        ? `${API_BASE_URL}${avatarUrl}?v=${revision}`
        : `${API_BASE_URL}${avatarUrl}`
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
