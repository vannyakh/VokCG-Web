"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { CollapsedNavFlyout } from './collapsed-nav-flyout'
import { LevelProvider, useMenuContext, useMenuLevel } from './menu-context'
import { NavMenuItem } from './nav-item'
import { NAV_MENU, navTileClass } from './nav-styles'
import type { NavItem } from './types'

type Props = { item: NavItem; inPopup?: boolean }

function anyChildActive(item: NavItem, path: string): boolean {
  return item.children?.some((c) => c.path === path || anyChildActive(c, path)) ?? false
}

export function NavSubMenu({ item, inPopup = false }: Props) {
  const {
    menuId, activePath, collapse,
    openedMenus, openMenu, closeMenu,
    itemHeight = 40, hoveredId, setHoveredId,
  } = useMenuContext()
  const level     = useMenuLevel()
  const isOpen    = openedMenus.has(item.id)
  const hasActive = anyChildActive(item, activePath)
  const isHovered = hoveredId === item.id

  // Auto-open the branch that contains the active route (expanded only)
  const seededRef = useRef(false)
  useEffect(() => {
    if (!seededRef.current && hasActive && !collapse) {
      openMenu(item.id, [])
      seededRef.current = true
    }
  }, [hasActive, collapse, item.id, openMenu])

  // Always close when sidebar collapses
  useEffect(() => {
    if (collapse) closeMenu(item.id)
  }, [collapse, item.id, closeMenu])

  // ── Collapsed / icon-only mode ────────────────────────────────────────────
  if (collapse && !inPopup) {
    const trigger = (
      <button
        type="button"
        className="group flex w-full select-none items-center justify-center px-2"
        style={{ height: itemHeight }}
      >
        <span
          className="flex items-center justify-center rounded-xl transition-all duration-150"
          style={{
            width: NAV_MENU.collapsedTileSize,
            height: NAV_MENU.collapsedTileSize,
            background: hasActive
              ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
              : 'transparent',
            boxShadow: hasActive
              ? 'inset 0 0 0 1.5px color-mix(in srgb, var(--color-primary) 28%, transparent)'
              : 'none',
            color: hasActive ? 'var(--color-primary)' : 'var(--text-nav-inactive)',
          }}
        >
          <item.icon size={17} strokeWidth={hasActive ? 2.3 : 1.75} className="shrink-0" />
        </span>
      </button>
    )

    return (
      <CollapsedNavFlyout trigger={trigger} align="start">
        <LevelProvider value={0}>
          {item.children?.map((child) =>
            child.children?.length ? (
              <NavSubMenu key={child.id} item={child} inPopup />
            ) : (
              <NavMenuItem key={child.id} item={child} inPopup />
            ),
          )}
        </LevelProvider>
      </CollapsedNavFlyout>
    )
  }

  // ── Expanded mode: accordion ──────────────────────────────────────────────
  const isHeaderActive = hasActive || isOpen
  const paddingLeft    = 12 + level * 16

  return (
    <div>
      {/* Dropdown trigger row */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {isHovered && !isHeaderActive && (
          <motion.span
            layoutId={`${menuId}-hover-pill`}
            className="absolute inset-0 rounded-[10px] bg-active/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
            aria-hidden
          />
        )}
        {/* Default background for every sub-menu trigger */}
        {!isHeaderActive && (
          <span
            className="absolute inset-0 rounded-[12px] transition-all duration-150"
            style={{
              background: isHovered
                ? 'color-mix(in srgb, var(--text-muted) 9%, transparent)'
                : 'color-mix(in srgb, var(--text-muted) 4%, transparent)',
            }}
            aria-hidden
          />
        )}
        {isHeaderActive && (
          <span
            className="absolute inset-0 rounded-[12px]"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 13%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={() => isOpen ? closeMenu(item.id) : openMenu(item.id, [])}
          className={[
            'group relative z-10 flex w-full select-none items-center gap-3 text-left transition-colors duration-150',
            isHeaderActive ? 'text-accent' : 'text-nav-inactive hover:text-nav-active',
          ].join(' ')}
          style={{ height: itemHeight, borderRadius: NAV_MENU.itemRadius, paddingLeft, paddingRight: 12 }}
        >
          {/* Icon box — matches NavMenuItem */}
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
            style={{
              background: isHeaderActive
                ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
                : 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
              color: isHeaderActive ? 'var(--color-primary)' : 'var(--text-nav-inactive)',
            }}
          >
            <item.icon size={15} strokeWidth={isHeaderActive ? 2.2 : 1.8} />
          </span>
          <span
            className={[
              'min-w-0 flex-1 truncate text-[13.5px] leading-none',
              isHeaderActive ? 'font-semibold' : 'font-medium',
            ].join(' ')}
          >
            {item.label}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {item.badge && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                {item.badge}
              </span>
            )}
            <ChevronRight
              size={13}
              className={[
                'shrink-0 transition-transform duration-200',
                isOpen ? 'rotate-90 opacity-70' : 'opacity-35',
              ].join(' ')}
            />
          </div>
        </button>
      </div>

      {/* Animated children panel */}
      <AnimatePresence initial={false}>
        {isOpen && !collapse && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <SubMenuTree item={item} level={level} activePath={activePath} paddingLeft={paddingLeft} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Tree with visible indent guide lines ─────────────────────────────────── */
function SubMenuTree({
  item,
  level,
  activePath,
  paddingLeft,
}: {
  item: NavItem
  level: number
  activePath: string
  paddingLeft: number
}) {
  const hasActiveChild = anyChildActive(item, activePath)
  const children = item.children ?? []

  // The vertical line sits at paddingLeft + 7 (left edge of the guide)
  const lineX = paddingLeft + 7

  return (
    <div
      className="relative pb-1 pt-0.5"
      style={{ paddingLeft: lineX + 14, paddingRight: NAV_MENU.marginX }}
    >
      {/* ── Vertical spine ── */}
      <span
        className="pointer-events-none absolute w-px transition-colors duration-300"
        style={{
          left: lineX,
          top: 4,
          bottom: 22,
          background: hasActiveChild
            ? 'color-mix(in srgb, var(--color-primary) 45%, transparent)'
            : 'color-mix(in srgb, var(--text-muted) 22%, transparent)',
        }}
        aria-hidden
      />

      <div className="flex flex-col gap-0.5">
        <LevelProvider value={level + 1}>
          {children.map((child, idx) => {
            const isLastChild = idx === children.length - 1
            const isChildActive = child.path === activePath || anyChildActive(child, activePath)

            return (
              <div key={child.id} className="relative">
                {/* Horizontal tick with dot at the junction */}
                <span
                  className="pointer-events-none absolute"
                  style={{
                    left: -14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    width: 14,
                  }}
                  aria-hidden
                >
                  {/* Horizontal line */}
                  <span
                    className="block h-px flex-1 transition-colors duration-200"
                    style={{
                      background: isChildActive
                        ? 'color-mix(in srgb, var(--color-primary) 60%, transparent)'
                        : 'color-mix(in srgb, var(--text-muted) 22%, transparent)',
                    }}
                  />
                  {/* Junction dot */}
                  <span
                    className="block h-1.5 w-1.5 rounded-full transition-colors duration-200"
                    style={{
                      flexShrink: 0,
                      background: isChildActive
                        ? 'var(--color-primary)'
                        : 'color-mix(in srgb, var(--text-muted) 30%, transparent)',
                    }}
                  />
                </span>

                {/* Cut vertical spine below last child */}
                {isLastChild && (
                  <span
                    className="pointer-events-none absolute w-px"
                    style={{
                      left: -14,
                      top: '50%',
                      bottom: 0,
                      background: 'var(--bg-sidebar)',
                    }}
                    aria-hidden
                  />
                )}

                {child.children?.length ? (
                  <NavSubMenu item={child} />
                ) : (
                  <NavMenuItem item={child} />
                )}
              </div>
            )
          })}
        </LevelProvider>
      </div>
    </div>
  )
}
