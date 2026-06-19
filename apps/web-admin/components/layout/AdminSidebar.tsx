"use client"

import { motion } from 'framer-motion'
import { ChevronsLeft, Pin, PinOff, Shield } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { ADMIN_NAV_ITEMS, ADMIN_TAB_META, tabFromPath } from '@vokcg/constants'
import type { AdminTab } from '@vokcg/constants'
import { NavMenu } from '@vokcg/ui'
import type { NavItem } from '@vokcg/ui'
import { ADMIN_SIDEBAR } from '@vokcg/config'
import { useAdminUiStore } from '@/store'
import { Tooltip } from '@vokcg/ui'

const MINI_W = ADMIN_SIDEBAR.miniWidth

type Props = {
  activeTab: AdminTab
  collapsed: boolean
  onToggle: () => void
  onTabOpen: (tab: AdminTab) => void
}

export function AdminSidebar({ activeTab, collapsed, onToggle, onTabOpen }: Props) {
  const { sidebarWidth, setSidebarWidth, sidebarMiniMode, sidebarHoverExpand } = useAdminUiStore()

  const [hovering, setHovering]       = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const isCollapsed  = sidebarMiniMode || collapsed
  const canHoverOpen = sidebarHoverExpand && isCollapsed
  const isOpen       = !isCollapsed || hovering
  const visibleWidth = isOpen ? sidebarWidth : MINI_W

  const onEnter = useCallback(() => { if (canHoverOpen) setHovering(true)  }, [canHoverOpen])
  const onLeave = useCallback(() => setHovering(false), [])
  const onPin   = useCallback(() => { setHovering(false); onToggle() }, [onToggle])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX, startW = sidebarWidth
    const onMove = (ev: MouseEvent) => setSidebarWidth(Math.max(ADMIN_SIDEBAR.widthMin, Math.min(ADMIN_SIDEBAR.widthMax, startW + ev.clientX - startX)))
    const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth, setSidebarWidth])

  const onNavScroll = useCallback(() => {
    setNavScrolled((navRef.current?.scrollTop ?? 0) > 4)
  }, [])

  // Called by NavMenu when a leaf item is selected
  const handleSelect = useCallback((item: NavItem) => {
    if (!item.path || item.disabled || item.comingSoon) return
    const tab = tabFromPath(item.path) as AdminTab
    onTabOpen(tab)
  }, [onTabOpen])

  // Active path driven by the current tab
  const activePath = ADMIN_TAB_META[activeTab]?.path ?? ''

  return (
    <div
      className="relative h-screen shrink-0 transition-[width] duration-200"
      style={{ width: isCollapsed ? MINI_W : sidebarWidth }}
    >
      <motion.aside
        initial={false}
        animate={{ width: visibleWidth }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-label="Admin navigation"
        className="absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-default bg-sidebar"
        style={{ boxShadow: hovering ? '4px 0 24px rgba(0,0,0,0.12)' : undefined }}
      >
        {/* ── Brand ──────────────────────────────────────────── */}
        <div className="flex h-14 shrink-0 items-center overflow-hidden border-b border-default px-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-muted ring-1 ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
            <Shield size={15} className="text-accent" />
          </div>
          <div className="ml-3 min-w-0 overflow-hidden">
            <p className="whitespace-nowrap text-[13px] font-extrabold tracking-tight text-primary">Admin</p>
            <p className="whitespace-nowrap text-[10px] font-medium text-muted">Control Panel</p>
          </div>
        </div>

        {/* ── Nav ────────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {navScrolled && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5"
              style={{ background: 'linear-gradient(to bottom, var(--bg-sidebar), transparent)' }}
            />
          )}

          <nav
            ref={navRef}
            onScroll={onNavScroll}
            className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2"
          >
            <p className="mb-1.5 overflow-hidden whitespace-nowrap px-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted/40">
              {isOpen ? 'Navigation' : '···'}
            </p>

            <NavMenu
              items={ADMIN_NAV_ITEMS}
              activePath={activePath}
              collapse={!isOpen}
              accordion
              rounded
              itemHeight={38}
              onSelect={handleSelect}
            />
          </nav>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5"
            style={{ background: 'linear-gradient(to top, var(--bg-sidebar), transparent)' }}
          />
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between gap-1 border-t border-default px-2 py-2">
          {!sidebarMiniMode && (
            <button
              type="button"
              onClick={onToggle}
              style={{ height: 38, borderRadius: 8 }}
              className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden px-2.5 text-muted transition-colors hover:bg-black/4 hover:text-primary dark:hover:bg-white/4"
            >
              <ChevronsLeft
                size={15}
                className={['shrink-0 transition-transform duration-300', isCollapsed ? 'rotate-180' : ''].join(' ')}
              />
              <span className="whitespace-nowrap text-[12px] font-medium">
                {collapsed ? 'Expand' : 'Collapse'}
              </span>
            </button>
          )}

          {isCollapsed && hovering ? (
            <Tooltip content="Pin sidebar open" placement="right">
              <button
                type="button"
                onClick={onPin}
                style={{ height: 38, width: 38, borderRadius: 8 }}
                className="flex shrink-0 items-center justify-center text-muted transition-colors hover:bg-black/6 hover:text-primary dark:hover:bg-white/6"
              >
                <Pin size={14} />
              </button>
            </Tooltip>
          ) : !isCollapsed ? (
            <Tooltip content="Unpin sidebar" placement="right">
              <button
                type="button"
                onClick={onToggle}
                style={{ height: 38, width: 38, borderRadius: 8 }}
                className="flex shrink-0 items-center justify-center text-muted transition-colors hover:bg-black/6 hover:text-primary dark:hover:bg-white/6"
              >
                <PinOff size={14} />
              </button>
            </Tooltip>
          ) : (
            <div style={{ height: 38, width: 38 }} />
          )}
        </div>

        {/* Drag-to-resize */}
        {!sidebarMiniMode && isOpen && (
          <div
            onMouseDown={onDragStart}
            className="absolute inset-y-0 right-0 z-40 w-1 cursor-col-resize transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
          />
        )}
      </motion.aside>
    </div>
  )
}
