'use client'

import {
  ChevronRight,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { STUDIO_NAV_SECTIONS, studioPageMeta } from '@vokcg/constants'
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

function getPageIcon(pathname: string): LucideIcon | null {
  for (const section of STUDIO_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.comingSoon) continue
      if (pathname === item.to || (item.to !== '/' && pathname.startsWith(`${item.to}/`))) {
        return item.icon
      }
    }
  }
  return null
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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle/70 hover:text-primary"
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
  const PageIcon = getPageIcon(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-surface px-3 sm:gap-3 sm:px-4 md:px-5">
      <HeaderIconBtn
        tooltip={
          isMobile
            ? mobileNavOpen
              ? t('create.hideSidebar')
              : t('create.showSidebar')
            : hidden
              ? t('create.showSidebar')
              : t('create.hideSidebar')
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

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:flex-none"
      >
        <span className="hidden truncate text-sm font-medium text-muted md:inline">
          {t(meta.sectionKey)}
        </span>
        <ChevronRight size={14} className="hidden shrink-0 text-muted/50 md:block" aria-hidden />
        {PageIcon && (
          <PageIcon
            size={15}
            strokeWidth={2}
            className="hidden shrink-0 text-muted/70 sm:block"
            aria-hidden
          />
        )}
        <h1 className="truncate text-sm font-bold text-primary sm:text-[15px]">
          {t(meta.labelKey)}
        </h1>
      </nav>

      <div className="hidden flex-1 lg:block" aria-hidden />

      <div className="flex shrink-0 items-center gap-2">
        <HeaderIconBtn
          tooltip={colorMode === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          onClick={toggleColorMode}
        >
          {colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </HeaderIconBtn>

        <UserMenu />
      </div>
    </header>
  )
}
