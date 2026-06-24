'use client'

import { motion } from 'framer-motion'
import { ChevronsLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useWorkspace } from '@/api'
import { STUDIO_SHELL, STUDIO_SIDEBAR } from '@vokcg/config'
import { studioNavItemSections } from '@vokcg/constants'
import type { NavItem } from '@vokcg/constants'
import { useLocale } from '@vokcg/i18n'
import { useSidebarStore } from '@/store'
import {
  mobileDrawerSpring,
  NavMenu,
  sidebarPanelSpring,
  sidebarShellSpring,
  StudioLogo,
  Tooltip,
} from '@vokcg/ui'

import { SidebarWorkspaceCard } from './SidebarWorkspaceCard'

const MINI_W = STUDIO_SIDEBAR.miniWidth
const NAV_ITEM_HEIGHT = STUDIO_SHELL.navItemHeight

type SidebarProps = {
  activePath: string
  isMobile?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarBrand({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={[
        `flex ${STUDIO_SHELL.headerHeightClass} shrink-0 items-center`,
        expanded ? 'px-3' : 'justify-center',
      ].join(' ')}
      style={{
        borderBottom: '1px solid var(--border-default)',
        paddingInline: expanded ? undefined : 10,
      }}
    >
      <StudioLogo size={expanded ? 'lg' : 'md'} showWordmark={expanded} />
    </div>
  )
}

export function Sidebar({
  activePath,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const router = useRouter()
  const { workspace, isDemo } = useWorkspace()
  const { collapsed, hidden, sidebarWidth, sidebarMiniMode, toggle, setSidebarWidth } =
    useSidebarStore()

  const [navScrolled, setNavScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const { t } = useLocale()
  const navSections = studioNavItemSections(false, workspace, t)
  const isCollapsed = !isMobile && (sidebarMiniMode || collapsed)
  const expanded = isMobile || !isCollapsed
  const shellWidth = hidden ? 0 : isCollapsed ? MINI_W : sidebarWidth
  const panelWidth = isCollapsed ? MINI_W : sidebarWidth

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = sidebarWidth
      const onMove = (ev: MouseEvent) => setSidebarWidth(startW + ev.clientX - startX)
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [sidebarWidth, setSidebarWidth],
  )

  const onNavScroll = useCallback(() => {
    setNavScrolled((navRef.current?.scrollTop ?? 0) > 4)
  }, [])

  const handleSelect = useCallback(
    (item: NavItem) => {
      if (!item.path || item.disabled || item.comingSoon) return
      router.push(item.path)
      if (isMobile) onMobileClose?.()
    },
    [isMobile, onMobileClose, router],
  )

  const panel = (
    <>
      <SidebarBrand expanded={expanded} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {navScrolled && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8"
            style={{ background: 'linear-gradient(to bottom, var(--bg-sidebar), transparent)' }}
          />
        )}

        <nav
          ref={navRef}
          onScroll={onNavScroll}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-1.5"
        >
          <NavMenu
            sections={navSections}
            activePath={activePath}
            collapse={!expanded}
            accordion
            rounded
            itemHeight={NAV_ITEM_HEIGHT}
            onSelect={handleSelect}
          />
        </nav>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8"
          style={{ background: 'linear-gradient(to top, var(--bg-sidebar), transparent)' }}
        />
      </div>

      {expanded && <SidebarWorkspaceCard workspace={workspace} isDemo={isDemo} />}

      {!isMobile && (
        <div
          className="flex shrink-0 items-center py-1.5"
          style={{
            borderTop: '1px solid var(--border-default)',
            paddingInline: isCollapsed ? 10 : 8,
          }}
        >
          {isCollapsed ? (
            <Tooltip content={t('sidebar.expand')} placement="right">
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-full items-center justify-center rounded-[11px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-active)'
                  e.currentTarget.style.color = 'var(--color-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <ChevronsLeft size={17} className="rotate-180" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
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
              <ChevronsLeft size={14} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">
                {t('sidebar.collapse')}
              </span>
              <kbd
                className="hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none group-hover:inline-flex"
                style={{
                  background: 'var(--border-default)',
                  color: 'var(--text-muted)',
                }}
              >
                [
              </kbd>
            </button>
          )}
        </div>
      )}

      {!isMobile && !sidebarMiniMode && !isCollapsed && (
        <div
          onMouseDown={onDragStart}
          className="absolute inset-y-0 right-0 z-40 w-1 cursor-col-resize bg-transparent transition-colors hover:bg-accent/25"
          aria-hidden
        />
      )}
    </>
  )

  if (isMobile) {
    return (
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={mobileDrawerSpring}
        aria-label="Studio navigation"
        aria-hidden={!mobileOpen}
        className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-divider bg-sidebar shadow-2xl will-change-transform"
        style={{
          width: STUDIO_SIDEBAR.mobileDrawerWidth,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
      >
        {panel}
      </motion.aside>
    )
  }

  return (
    <motion.div
      layout
      className="relative h-dvh shrink-0 overflow-hidden"
      initial={false}
      animate={{ width: shellWidth }}
      transition={sidebarShellSpring}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      aria-hidden={hidden}
    >
      <motion.aside
        initial={false}
        animate={{
          width: panelWidth,
          x: hidden ? -12 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={sidebarPanelSpring}
        aria-label="Studio navigation"
        className="absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-divider bg-sidebar will-change-transform"
      >
        {panel}
      </motion.aside>
    </motion.div>
  )
}
