'use client'

import { motion } from 'framer-motion'
import { ChevronsLeft, PinOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { studioNavItems } from '@vokcg/constants'
import type { NavItem } from '@vokcg/constants'
import { STUDIO_SIDEBAR } from '@vokcg/config'
import { useWorkspace } from '@vokcg/api'
import { useLocale } from '@vokcg/i18n'
import { useSidebarStore } from '@vokcg/store'

import { NavMenu } from '../components/nav-menu'
import { StudioLogo } from '../components/studio-logo'
import { Tooltip } from '../components/tooltip'
import { mobileDrawerSpring, sidebarPanelSpring, sidebarShellSpring } from '../lib/motion'
import { SidebarWorkspaceCard } from './sidebar-workspace-card'

const MINI_W = STUDIO_SIDEBAR.miniWidth
const NAV_ITEM_HEIGHT = 42

type Props = {
  activePath: string
  isMobile?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarBrand({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={[
        'flex h-14 shrink-0 items-center border-b border-divider',
        expanded ? 'px-4' : 'justify-center px-2',
      ].join(' ')}
    >
      <StudioLogo size="md" showWordmark={expanded} />
    </div>
  )
}

function SidebarFooterBtn({
  tooltip,
  onClick,
  children,
  className = '',
}: {
  tooltip?: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  const btn = (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-10 items-center justify-center rounded-xl border border-divider bg-subtle/40 text-secondary',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )

  if (!tooltip) return btn
  return (
    <Tooltip content={tooltip} placement="right">
      {btn}
    </Tooltip>
  )
}

export function StudioSidebar({
  activePath,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const router = useRouter()
  const { workspace, isDemo } = useWorkspace()
  const { collapsed, hidden, sidebarWidth, sidebarMiniMode, toggle, setSidebarWidth } =
    useSidebarStore()

  const [navScrolled, setNavScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const { t } = useLocale()
  const navItems = studioNavItems(false, workspace, t)
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
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6"
            style={{ background: 'linear-gradient(to bottom, var(--bg-sidebar), transparent)' }}
          />
        )}

        <nav
          ref={navRef}
          onScroll={onNavScroll}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-3"
        >
          <NavMenu
            items={navItems}
            activePath={activePath}
            collapse={!expanded}
            accordion
            rounded
            itemHeight={NAV_ITEM_HEIGHT}
            onSelect={handleSelect}
          />
        </nav>
      </div>

      {expanded && <SidebarWorkspaceCard workspace={workspace} isDemo={isDemo} />}

      {!isMobile && (
        <div
          className={[
            'flex shrink-0 items-center gap-1.5 border-t border-divider p-2.5',
            expanded ? '' : 'flex-col',
          ].join(' ')}
        >
          {!sidebarMiniMode && expanded && (
            <SidebarFooterBtn
              onClick={toggle}
              className="min-w-0 flex-1 justify-start gap-2.5 px-3"
            >
              <ChevronsLeft
                size={16}
                className={['shrink-0 transition-transform duration-300', isCollapsed ? 'rotate-180' : ''].join(
                  ' ',
                )}
              />
              <span className="whitespace-nowrap text-[13px] font-semibold">
                {collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              </span>
            </SidebarFooterBtn>
          )}

          {isCollapsed ? (
            <SidebarFooterBtn tooltip={t('sidebar.expand')} onClick={toggle} className="w-10 shrink-0">
              <ChevronsLeft size={15} className="rotate-180" />
            </SidebarFooterBtn>
          ) : expanded ? (
            <SidebarFooterBtn tooltip={t('sidebar.unpin')} onClick={toggle} className="w-10 shrink-0">
              <PinOff size={15} />
            </SidebarFooterBtn>
          ) : null}
        </div>
      )}

      {!isMobile && !sidebarMiniMode && !isCollapsed && (
        <div
          onMouseDown={onDragStart}
          className="absolute inset-y-0 right-0 z-40 w-1 cursor-col-resize bg-transparent"
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
