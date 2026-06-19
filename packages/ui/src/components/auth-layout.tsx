import type { ReactNode } from 'react'

import { StudioLogo } from './studio-logo'

type AuthLayoutProps = {
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'var(--bg-canvas)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient layer */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: [
            'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--color-primary) 28%, transparent), transparent)',
            'radial-gradient(ellipse 60% 40% at 80% 90%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)',
            'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(139, 92, 246, 0.12), transparent)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          pointerEvents: 'none',
        }}
      />

      {/* Form content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {/* Logo — icon + wordmark stacked */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StudioLogo size="xl" link={false} />
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            VokCG
          </span>
        </div>

        {/* Form — no card, just content */}
        <div style={{ width: '100%' }}>
          {children}
        </div>

        {footer ? (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
