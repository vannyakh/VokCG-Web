'use client'

import Link from 'next/link'

import { USER_ROUTES } from '@vokcg/constants'

type StudioLogoProps = {
  size?: 'sm' | 'md' | 'xl'
  showWordmark?: boolean
  className?: string
  link?: boolean
}

const SIZE = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-base',
  xl: 'h-11 w-11 text-lg',
} as const

export function StudioLogo({
  size = 'md',
  showWordmark = false,
  className = '',
  link = true,
}: StudioLogoProps) {
  const content = (
    <div className={['flex min-w-0 items-center gap-3', className].filter(Boolean).join(' ')}>
      <div
        className={[
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white',
          'ring-1 ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]',
          SIZE[size],
        ].join(' ')}
        style={{
          backgroundImage: [
            'linear-gradient(145deg,',
            'color-mix(in srgb, var(--color-primary) 90%, #1e3a8a) 0%,',
            'color-mix(in srgb, var(--color-primary) 55%, #4c1d95) 100%)',
          ].join(' '),
        }}
      >
        V
      </div>
      {showWordmark && (
        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-2xl font-extrabold tracking-tight text-primary">VokCG</p>
        </div>
      )}
    </div>
  )

  if (!link) return content

  return (
    <Link
      href={USER_ROUTES.create}
      className="shrink-0 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {content}
    </Link>
  )
}
