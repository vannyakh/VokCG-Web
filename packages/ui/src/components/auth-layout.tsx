import type { ReactNode } from 'react'

import { Shield, Sparkles } from 'lucide-react'

import { StudioLogo } from '../studio-logo'

export type AuthLayoutVariant = 'studio' | 'admin'

type AuthLayoutProps = {
  children: ReactNode
  variant?: AuthLayoutVariant
  title?: string
  subtitle?: string
  footer?: ReactNode
}

const VARIANT_META = {
  studio: {
    eyebrow: 'Creative studio',
    title: 'Welcome back',
    subtitle: 'Sign in to continue creating videos, scripts, and voice content.',
    icon: Sparkles,
    iconClass: 'text-accent',
    panelGradient:
      'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 45%)',
  },
  admin: {
    eyebrow: 'Administration',
    title: 'Control panel',
    subtitle: 'Secure access for platform operators, billing, and system configuration.',
    icon: Shield,
    iconClass: 'text-accent',
    panelGradient:
      'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 16%, transparent) 0%, transparent 60%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent 42%)',
  },
} as const

export function AuthLayout({
  children,
  variant = 'studio',
  title,
  subtitle,
  footer,
}: AuthLayoutProps) {
  const meta = VARIANT_META[variant]
  const Icon = meta.icon
  const heading = title ?? meta.title
  const description = subtitle ?? meta.subtitle

  return (
    <div className="auth-shell relative flex min-h-screen flex-col lg:flex-row">
      <div
        aria-hidden
        className="auth-shell-bg pointer-events-none absolute inset-0"
      />

      <section className="relative hidden min-h-screen flex-1 flex-col justify-between overflow-hidden border-r border-default bg-sidebar px-10 py-12 lg:flex xl:px-14">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: meta.panelGradient }}
        />
        <div className="auth-grid absolute inset-0 opacity-[0.35]" />

        <div className="relative z-10">
          <StudioLogo size="md" showWordmark link={false} />
        </div>

        <div className="relative z-10 max-w-md space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
            <Icon size={13} className={meta.iconClass} />
            {meta.eyebrow}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary xl:text-4xl">
              {heading}
            </h1>
            <p className="text-[15px] leading-7 text-secondary">{description}</p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted">
          VokCG platform · {variant === 'admin' ? 'Admin console' : 'Studio workspace'}
        </p>
      </section>

      <section className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <StudioLogo size="md" showWordmark link={false} />
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">{heading}</p>
              <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
          </div>

          <div className="auth-card rounded-[28px] border border-default bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
            {children}
          </div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
