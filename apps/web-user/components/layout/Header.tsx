'use client'

import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from 'lucide-react'

import { studioPageMeta } from '@vokcg/constants'
import { STUDIO_SHELL } from '@vokcg/config'
import { useLocale } from '@vokcg/i18n'
import { useSidebarStore } from '@/store'
import { Tooltip, useColorMode } from '@vokcg/ui'

import { UserMenu } from './UserMenu'

type HeaderProps = {
  pathname: string
  isMobile?: boolean
  mobileNavOpen?: boolean
  onMenuClick?: () => void
}

function HeaderIconBtn({
  onClick,
  tooltip,
  children,
}: {
  onClick: () => void
  tooltip: string
  children: React.ReactNode
}) {
  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        onClick={onClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-active)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function Header({
  pathname,
  isMobile = false,
  mobileNavOpen = false,
  onMenuClick,
}: HeaderProps) {
  const { t } = useLocale()
  const meta = studioPageMeta(pathname)
  const { hidden, toggleHidden } = useSidebarStore()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <header
      className={`flex ${STUDIO_SHELL.headerHeightClass} shrink-0 items-center gap-3 px-4`}
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* Sidebar toggle */}
      <HeaderIconBtn
        tooltip={
          isMobile
            ? mobileNavOpen ? t('create.hideSidebar') : t('create.showSidebar')
            : hidden ? t('create.showSidebar') : t('create.hideSidebar')
        }
        onClick={isMobile ? (onMenuClick ?? (() => {})) : toggleHidden}
      >
        {isMobile ? (
          mobileNavOpen ? <X size={17} /> : <Menu size={17} />
        ) : hidden ? (
          <PanelLeftOpen size={17} />
        ) : (
          <PanelLeftClose size={17} />
        )}
      </HeaderIconBtn>

      {/* Page title */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1
          className="truncate text-[15px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {t(meta.labelKey)}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1">
        <HeaderIconBtn
          tooltip={colorMode === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          onClick={toggleColorMode}
        >
          {colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </HeaderIconBtn>

        <div
          className="mx-1 h-5 w-px"
          style={{ background: 'var(--border-default)' }}
          aria-hidden
        />

        <UserMenu />
      </div>
    </header>
  )
}
