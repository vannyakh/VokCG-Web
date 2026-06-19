'use client'

import { Dropdown } from 'antd'
import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useLogout } from '@/api'
import { USER_ROUTES } from '@vokcg/constants'
import { useLocale } from '@vokcg/i18n'
import { useAuthStore } from '@/store'
import { UserAvatar } from '@vokcg/ui'

/* ── Action row ─────────────────────────────────────────────────────────── */
type ActionRowProps = {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  variant?: 'default' | 'danger'
}

function ActionRow({ icon, label, sublabel, onClick, href, disabled, variant = 'default' }: ActionRowProps) {
  const isDanger = variant === 'danger'

  const inner = (
    <span className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
        style={{
          background: isDanger
            ? 'rgba(239,68,68,0.08)'
            : 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
          color: isDanger ? '#ef4444' : 'var(--text-secondary)',
        }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[13.5px] font-medium leading-snug"
          style={{ color: isDanger ? '#ef4444' : 'var(--text-primary)' }}
        >
          {label}
        </span>
        {sublabel && (
          <span className="block text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
            {sublabel}
          </span>
        )}
      </span>
    </span>
  )

  const baseStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '7px 10px',
    borderRadius: 12,
    background: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textAlign: 'left',
    transition: 'background 150ms',
  }

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        style={baseStyle}
        className={isDanger ? 'hover:bg-red-500/8' : 'hover:bg-active/60'}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      className={isDanger ? 'hover:bg-red-500/8' : 'hover:bg-active/60'}
    >
      {inner}
    </button>
  )
}

/* ── Panel ──────────────────────────────────────────────────────────────── */
type UserMenuPanelProps = {
  username: string
  email: string
  avatarUrl?: string | null
  settingsLabel: string
  logoutLabel: string
  logoutPending: boolean
  onClose: () => void
  onLogout: () => void
}

function UserMenuPanel({
  username,
  email,
  avatarUrl,
  settingsLabel,
  logoutLabel,
  logoutPending,
  onClose,
  onLogout,
}: UserMenuPanelProps) {
  return (
    <div
      style={{
        width: 288,
        borderRadius: 20,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.12)',
      }}
    >
      {/* Profile header */}
      <div
        style={{
          padding: '20px 20px 16px',
          background: 'linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 60%)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-4">
          <UserAvatar username={username} avatarUrl={avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[15px] font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {username}
            </p>
            <p
              className="mt-0.5 truncate text-[12px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 8px 10px' }}>
        <ActionRow
          href={USER_ROUTES.settings}
          onClick={onClose}
          icon={<Settings size={16} strokeWidth={1.9} />}
          label={settingsLabel}
          sublabel="Preferences & account"
        />

        <div
          style={{
            height: 1,
            background: 'var(--border-default)',
            margin: '6px 2px',
          }}
        />

        <ActionRow
          onClick={onLogout}
          disabled={logoutPending}
          variant="danger"
          icon={<LogOut size={16} strokeWidth={1.9} />}
          label={logoutLabel}
        />
      </div>
    </div>
  )
}

/* ── Trigger ────────────────────────────────────────────────────────────── */
export function UserMenu() {
  const { t } = useLocale()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    setOpen(false)
    logout.mutate(undefined, {
      onSettled: () => router.push(USER_ROUTES.login),
    })
  }

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      popupRender={() => (
        <UserMenuPanel
          username={user.username}
          email={user.email}
          avatarUrl={user.avatar_url}
          settingsLabel={t('nav.settings')}
          logoutLabel={t('header.logout')}
          logoutPending={logout.isPending}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
        />
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-active/60"
        style={{
          outline: open
            ? '2px solid color-mix(in srgb, var(--color-primary) 30%, transparent)'
            : 'none',
          outlineOffset: 1,
        }}
      >
        <UserAvatar username={user.username} avatarUrl={user.avatar_url} size="sm" />
        <span className="hidden truncate text-[13px] font-medium md:block" style={{ color: 'var(--text-primary)' }}>
          {user.username}
        </span>
      </button>
    </Dropdown>
  )
}
