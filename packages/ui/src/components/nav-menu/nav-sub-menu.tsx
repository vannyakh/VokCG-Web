"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { CollapsedNavFlyout } from './collapsed-nav-flyout'
import { LevelProvider, useMenuContext, useMenuLevel } from './menu-context'
import { NavBadge } from './nav-badge'
import { NavMenuItem } from './nav-item'
import { NavCollapsedTile, navCollapsedRowStyle } from './nav-collapsed-tile'
import {
  NAV_FLYOUT,
  NAV_MENU,
  navIconColor,
  navRowRadius,
  navTreeDotColor,
  navTreeLineColor,
} from './nav-styles'
import type { NavItem } from './types'

type Props = { item: NavItem; inPopup?: boolean }

function anyChildActive(item: NavItem, path: string): boolean {
  return item.children?.some((c) => c.path === path || anyChildActive(c, path)) ?? false
}

export function NavSubMenu({ item, inPopup = false }: Props) {
  const {
    activePath,
    collapse,
    openedMenus,
    openMenu,
    closeMenu,
    itemHeight = 36,
  } = useMenuContext()
  const level = useMenuLevel()
  const isOpen = openedMenus.has(item.id)
  const hasActive = anyChildActive(item, activePath)
  const rowRadius = navRowRadius(false, inPopup)

  const seededRef = useRef(false)
  useEffect(() => {
    if (!seededRef.current && hasActive && !collapse) {
      openMenu(item.id, [])
      seededRef.current = true
    }
  }, [hasActive, collapse, item.id, openMenu])

  useEffect(() => {
    if (collapse) closeMenu(item.id)
  }, [collapse, item.id, closeMenu])

  if (collapse && !inPopup) {
    const trigger = (
      <button
        type="button"
        className="group flex w-full select-none items-center justify-center"
        style={navCollapsedRowStyle()}
      >
        <NavCollapsedTile icon={item.icon} active={hasActive} />
      </button>
    )

    return (
      <CollapsedNavFlyout trigger={trigger} title={item.label} align="start">
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

  const paddingLeft = inPopup ? 10 : 10 + level * 12
  const isHighlighted = hasActive
  const rowHeight = inPopup ? NAV_FLYOUT.itemHeight : itemHeight

  return (
    <div>
      <button
        type="button"
        onClick={() => (isOpen ? closeMenu(item.id) : openMenu(item.id, []))}
        className={[
          'group flex w-full select-none items-center gap-2 text-left transition-colors duration-150',
          inPopup ? 'rounded-lg px-2.5' : '',
          isHighlighted
            ? 'text-accent'
            : inPopup
              ? 'text-nav-inactive hover:bg-[color-mix(in_srgb,var(--text-muted)_8%,transparent)] hover:text-nav-active'
              : 'text-nav-inactive hover:text-nav-active',
        ].join(' ')}
        style={{
          height: rowHeight,
          borderRadius: inPopup ? NAV_FLYOUT.radius - 2 : rowRadius,
          paddingLeft: inPopup ? undefined : paddingLeft,
          paddingRight: inPopup ? undefined : 8,
        }}
      >
        <item.icon
          size={15}
          strokeWidth={isHighlighted ? 2.2 : 1.75}
          className="shrink-0"
          style={navIconColor(isHighlighted)}
        />
        <span
          className={[
            'min-w-0 flex-1 truncate text-[13px] leading-none',
            isHighlighted ? 'font-semibold' : 'font-medium',
          ].join(' ')}
        >
          {item.label}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {item.badge && <NavBadge label={item.badge} compact />}
          <ChevronRight
            size={13}
            strokeWidth={2}
            className={[
              'shrink-0 transition-transform duration-200',
              isOpen ? 'rotate-90 opacity-70' : 'opacity-35',
            ].join(' ')}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (!collapse || inPopup) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <SubMenuTree
              item={item}
              level={level}
              activePath={activePath}
              anchorPaddingLeft={paddingLeft}
              inPopup={inPopup}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SubMenuTree({
  item,
  level,
  activePath,
  anchorPaddingLeft,
  inPopup = false,
}: {
  item: NavItem
  level: number
  activePath: string
  anchorPaddingLeft: number
  inPopup?: boolean
}) {
  const hasActiveChild = anyChildActive(item, activePath)
  const children = item.children ?? []

  if (inPopup) {
    return (
      <div
        className="flex flex-col pt-0.5"
        style={{ paddingLeft: 8, gap: 2 }}
      >
        <LevelProvider value={level + 1}>
          {children.map((child) =>
            child.children?.length ? (
              <NavSubMenu key={child.id} item={child} inPopup />
            ) : (
              <NavMenuItem key={child.id} item={child} inPopup />
            ),
          )}
        </LevelProvider>
      </div>
    )
  }

  const guideX = anchorPaddingLeft + NAV_MENU.treeGuideOffset
  const contentPadLeft = guideX + NAV_MENU.treeBranchWidth + 4

  return (
    <div
      className="relative pb-0.5 pt-0.5"
      style={{ paddingLeft: contentPadLeft, paddingRight: NAV_MENU.marginX }}
    >
      <span
        className="pointer-events-none absolute w-px transition-colors duration-200"
        style={{
          left: guideX,
          top: 4,
          bottom: 16,
          background: navTreeLineColor(hasActiveChild),
        }}
        aria-hidden
      />

      <div className="flex flex-col">
        <LevelProvider value={level + 1}>
          {children.map((child, idx) => {
            const isLastChild = idx === children.length - 1
            const isChildActive =
              child.path === activePath || anyChildActive(child, activePath)

            return (
              <div key={child.id} className="relative">
                <span
                  className="pointer-events-none absolute flex items-center"
                  style={{
                    left: -(NAV_MENU.treeBranchWidth + 4),
                    top: '50%',
                    width: NAV_MENU.treeBranchWidth,
                    transform: 'translateY(-50%)',
                  }}
                  aria-hidden
                >
                  <span
                    className="block h-px flex-1 transition-colors duration-200"
                    style={{ background: navTreeLineColor(isChildActive) }}
                  />
                  <span
                    className="block h-1 w-1 shrink-0 rounded-full transition-colors duration-200"
                    style={{ background: navTreeDotColor(isChildActive) }}
                  />
                </span>

                {isLastChild && (
                  <span
                    className="pointer-events-none absolute w-px"
                    style={{
                      left: -(NAV_MENU.treeBranchWidth + 4),
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
