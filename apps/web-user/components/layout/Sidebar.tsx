'use client'

import { motion } from 'framer-motion'
import { ChevronsLeft, PinOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useWorkspace } from '@vokcg/api'
import { STUDIO_SIDEBAR } from '@vokcg/config'
import { studioNavSections, USER_ROUTES } from '@vokcg/constants'
import type { NavItem, NavSection } from '@vokcg/constants'
import { useLocale } from '@vokcg/i18n'
import { useSidebarStore } from '@vokcg/store'
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
const NAV_ITEM_HEIGHT = 42

type SidebarProps = {
  activePath: string
  isMobile?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function sectionToNavItems(
  section: NavSection,
  t: (key: string) => string,
  workspace?: { plan?: { name: string } | null } | undefined,
): NavItem[] {
  return section.items.map((item) => {
    let badge: string | undefined = item.badge
    if (item.comingSoon) {
      badge = t('nav.badge.soon')
    } else if (
      section.id === 'billing' &&
      item.to === USER_ROUTES.billing &&
      workspace?.plan
    ) {
      badge = workspace.plan.name
    }
    return {
      id: item.to,
      label: t(item.labelKey),
      icon: item.icon,
      path: item.comingSoon ? undefined : item.to,
      badge,
      comingSoon: item.comingSoon,
    }
  })
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
  const navSections = studioNavSections(false)
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
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2"
        >
          {navSections.map((section, idx) => {
            const items = sectionToNavItems(section, t, workspace)
            const showLabel = expanded && !section.single

            return (
              <div key={section.id}>
                {idx > 0 && (
                  <div
                    className={[
                      'h-px bg-divider/50',
                      expanded ? 'mx-4 my-2' : 'mx-3 my-2.5',
                    ].join(' ')}
                  />
                )}

                {showLabel && (
                  <p className="mb-0.5 px-5 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted/50 select-none">
                    {t(section.sectionKey)}
                  </p>
                )}

                <NavMenu
                  items={items}
                  activePath={activePath}
                  collapse={!expanded}
                  accordion={false}
                  rounded
                  itemHeight={NAV_ITEM_HEIGHT}
                  onSelect={handleSelect}
                />
              </div>
            )
          })}
        </nav>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8"
          style={{ background: 'linear-gradient(to top, var(--bg-sidebar), transparent)' }}
        />
      </div>

      {expanded && <SidebarWorkspaceCard workspace={workspace} isDemo={isDemo} />}

      {!isMobile && (
        <div
          className={[
            'flex shrink-0 items-center gap-1.5 border-t border-divider px-2.5 py-2.5',
            isCollapsed ? 'flex-col' : '',
          ].join(' ')}
        >
          {!sidebarMiniMode && expanded && (
            <button
              type="button"
              onClick={toggle}
              className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-divider bg-subtle/40 py-2 pl-3 pr-2.5 text-secondary transition-colors hover:border-accent/25 hover:bg-accent/6 hover:text-accent"
            >
              <ChevronsLeft
                size={15}
                className={[
                  'shrink-0 transition-transform duration-300',
                  isCollapsed ? 'rotate-180' : '',
                ].join(' ')}
              />
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">
                {t('sidebar.collapse')}
              </span>
              <kbd className="hidden rounded bg-divider/80 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted/60 group-hover:inline-flex">
                [
              </kbd>
            </button>
          )}

          {isCollapsed ? (
            <Tooltip content={t('sidebar.expand')} placement="right">
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-10 items-center justify-center rounded-xl border border-divider bg-subtle/40 text-secondary transition-colors hover:border-accent/25 hover:bg-accent/6 hover:text-accent"
              >
                <ChevronsLeft size={15} className="rotate-180" />
              </button>
            </Tooltip>
          ) : expanded ? (
            <Tooltip content={t('sidebar.unpin')} placement="right">
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl border border-divider bg-subtle/40 text-secondary transition-colors hover:border-accent/25 hover:bg-accent/6 hover:text-accent"
              >
                <PinOff size={14} />
              </button>
            </Tooltip>
          ) : null}
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
