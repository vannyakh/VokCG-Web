"use client"

import { useCallback, useId, useState } from 'react'
import { LevelProvider, MenuContextProvider } from './menu-context'
import { NavMenuItem } from './nav-item'
import { NavSubMenu } from './nav-sub-menu'
import { NAV_MENU, navSurface } from './nav-styles'
import type { MenuContext, MenuProps, NavItem, NavMenuSection } from './types'

type Props = MenuProps & {
  items?: NavItem[]
  sections?: NavMenuSection[]
}

function renderNavItems(items: NavItem[], collapse: boolean) {
  return items.map((item) =>
    item.children?.length ? (
      <NavSubMenu key={item.id} item={item} />
    ) : (
      <NavMenuItem key={item.id} item={item} />
    ),
  )
}

export function NavMenu({
  items,
  sections,
  activePath,
  collapse,
  accordion = true,
  rounded = true,
  itemHeight = 44,
  onSelect,
}: Props) {
  const uid = useId()
  const menuId = uid.replace(/:/g, '_')

  const [openedMenus, setOpenedMenus] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const openMenu = useCallback(
    (id: string, parentIds: string[]) => {
      setOpenedMenus((prev) => {
        const next = new Set(accordion ? parentIds : [...prev])
        next.add(id)
        return next
      })
    },
    [accordion],
  )

  const closeMenu = useCallback((id: string) => {
    setOpenedMenus((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggleMenu = useCallback(
    (id: string, parentIds: string[]) => {
      setOpenedMenus((prev) => {
        if (prev.has(id)) {
          const next = new Set(prev)
          next.delete(id)
          return next
        }
        const next = new Set(accordion ? parentIds : [...prev])
        next.add(id)
        return next
      })
    },
    [accordion],
  )

  const ctx: MenuContext = {
    menuId,
    activePath,
    collapse,
    accordion,
    rounded,
    itemHeight,
    onSelect,
    hoveredId,
    setHoveredId,
    openedMenus,
    openMenu,
    closeMenu,
    toggleMenu,
  }

  const groups: NavMenuSection[] = sections ?? (items ? [{ id: 'default', items }] : [])

  return (
    <MenuContextProvider value={ctx}>
      <LevelProvider value={0}>
        <div
          className="flex flex-col"
          style={
            collapse
              ? { paddingInline: NAV_MENU.collapsedPaddingX, gap: NAV_MENU.collapsedItemGap }
              : { gap: 0 }
          }
        >
          {groups.map((section, sIdx) => (
            <div key={section.id} style={{ marginTop: sIdx > 0 ? NAV_MENU.sectionGap : 0 }}>
              {/* Section label — expanded sidebar only */}
              {section.label && !collapse && (
                <div
                  className="mb-0.5 truncate px-3 text-[10.5px] font-semibold uppercase tracking-widest"
                  style={{ color: navSurface.sectionLabel, paddingTop: sIdx > 0 ? 8 : 4 }}
                >
                  {section.label}
                </div>
              )}

              {renderNavItems(section.items, collapse)}
            </div>
          ))}
        </div>
      </LevelProvider>
    </MenuContextProvider>
  )
}
