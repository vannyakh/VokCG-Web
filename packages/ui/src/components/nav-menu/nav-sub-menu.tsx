"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { CollapsedNavFlyout } from './collapsed-nav-flyout'
import { LevelProvider, useMenuContext, useMenuLevel } from './menu-context'
import { NavMenuItem } from './nav-item'
import { NAV_MENU, navItemButtonClass, navTileClass } from './nav-styles'
import type { NavItem } from './types'

type Props = { item: NavItem; inPopup?: boolean }

function anyChildActive(item: NavItem, path: string): boolean {
  return item.children?.some((c) => c.path === path || anyChildActive(c, path)) ?? false
}

export function NavSubMenu({ item, inPopup = false }: Props) {
  const { activePath, collapse, openedMenus, openMenu, closeMenu, itemHeight = 42 } = useMenuContext()
  const level = useMenuLevel()
  const isOpen = openedMenus.has(item.id)
  const hasActive = anyChildActive(item, activePath)

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

  const toggle = () => {
    if (collapse) return
    if (isOpen) closeMenu(item.id)
    else openMenu(item.id, [])
  }

  if (collapse && !inPopup) {
    const trigger = (
      <button
        type="button"
        className="flex w-full select-none items-center justify-center px-2.5"
        style={{ height: itemHeight }}
      >
        <span
          className={navTileClass(hasActive)}
          style={{
            width: NAV_MENU.collapsedTileSize,
            height: NAV_MENU.collapsedTileSize,
          }}
        >
          <item.icon size={17} strokeWidth={hasActive ? 2.25 : 1.85} className="shrink-0" />
        </span>
      </button>
    )

    return (
      <CollapsedNavFlyout trigger={trigger} align="start">
        <div className="p-1.5">
          <LevelProvider value={0}>
            {item.children?.map((child) =>
              child.children?.length ? (
                <NavSubMenu key={child.id} item={child} inPopup />
              ) : (
                <NavMenuItem key={child.id} item={child} inPopup />
              ),
            )}
          </LevelProvider>
        </div>
      </CollapsedNavFlyout>
    )
  }

  const paddingLeft = 12 + level * 14

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className={navItemButtonClass({
          collapse: false,
          inPopup: false,
          isActive: hasActive || isOpen,
          disabled: false,
        })}
        style={{
          height: itemHeight,
          borderRadius: NAV_MENU.itemRadius,
          marginLeft: NAV_MENU.marginX,
          marginRight: NAV_MENU.marginX,
          paddingLeft,
          paddingRight: 10,
        }}
      >
        <item.icon size={16} strokeWidth={hasActive || isOpen ? 2.25 : 1.85} className="shrink-0" />

        <span
          className={[
            'min-w-0 flex-1 truncate text-[14px] leading-none',
            hasActive || isOpen ? 'font-semibold' : 'font-medium',
          ].join(' ')}
        >
          {item.label}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {item.badge && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {item.badge}
            </span>
          )}
          <ChevronDown
            size={14}
            className={['shrink-0 text-muted/50 transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(
              ' ',
            )}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="relative my-1"
              style={{ marginLeft: NAV_MENU.marginX + paddingLeft + 7, marginRight: NAV_MENU.marginX }}
            >
              <div
                className="absolute left-0 w-px"
                style={{
                  top: 0,
                  bottom: 19,
                  background: 'var(--border-divider)',
                }}
              />

              <div className="flex flex-col gap-0.5">
                <LevelProvider value={level + 1}>
                  {item.children?.map((child, idx, arr) => {
                    const isLast = idx === arr.length - 1
                    return (
                      <div key={child.id} className="relative">
                        <div
                          className="absolute left-0 w-3"
                          style={{
                            top: '50%',
                            height: 1,
                            background: 'var(--border-divider)',
                          }}
                        />
                        {isLast && (
                          <div
                            className="absolute left-0 w-px"
                            style={{
                              top: '50%',
                              bottom: 0,
                              background: 'var(--bg-sidebar)',
                            }}
                          />
                        )}
                        <div className="pl-4">
                          {child.children?.length ? <NavSubMenu item={child} /> : <NavMenuItem item={child} />}
                        </div>
                      </div>
                    )
                  })}
                </LevelProvider>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
