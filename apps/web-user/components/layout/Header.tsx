'use client'
import { useMemo } from 'react'
import { Menu, Moon, Sun, X, FileText, PanelLeftOpen, PanelLeftClose } from 'lucide-react'

import { studioPageMeta, STUDIO_NAV_SECTIONS } from '@vokcg/constants'
import { STUDIO_SHELL } from '@vokcg/config'
import { useLocale } from '@vokcg/i18n'
import { useSidebarStore } from '@/store'
import { Tooltip, useColorMode, StudioLogo } from '@vokcg/ui'

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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)]"
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

  // Find active icon
  const ActiveIcon = useMemo(() => {
    for (const section of STUDIO_NAV_SECTIONS) {
      for (const item of section.items) {
        if (pathname === item.to || (item.to !== '/' && pathname.startsWith(`${item.to}/`))) {
          return item.icon
        }
      }
    }
    return FileText
  }, [pathname])

  return (
    <header
      className={`flex ${STUDIO_SHELL.headerHeightClass} shrink-0 items-center gap-3 px-4`}
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* Left section: Toggle + optional Logo + Separator + Active Page Info */}
      <div className="flex flex-1 min-w-0 items-center gap-2.5">
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

        {/* Brand Logo (only when sidebar is hidden / mobile drawer closed) */}
        {((!isMobile && hidden) || (isMobile && !mobileNavOpen)) && (
          <StudioLogo size="sm" showWordmark={true} link={true} />
        )}

        {/* Vertical separator */}
        <div
          className="h-4 w-px shrink-0"
          style={{ background: 'var(--border-default)' }}
          aria-hidden
        />

        {/* Active Page Info */}
        <div className="flex items-center gap-2 text-[var(--text-primary)] min-w-0">
          <ActiveIcon size={16} className="text-[var(--text-muted)] shrink-0" />
          <h1 className="truncate text-[14px] font-semibold">
            {t(meta.labelKey)}
          </h1>
        </div>
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
