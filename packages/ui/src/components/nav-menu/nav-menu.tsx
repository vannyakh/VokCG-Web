"use client"

import { useCallback, useId, useState } from 'react'
import { LevelProvider, MenuContextProvider } from './menu-context'
import { NavMenuItem } from './nav-item'
import { NavSubMenu } from './nav-sub-menu'
import { NAV_MENU } from './nav-styles'
import type { MenuContext, MenuProps, NavItem, NavMenuSection } from './types'

type Props = MenuProps & {
  items?: NavItem[]
  sections?: NavMenuSection[]
}

function renderNavItems(items: NavItem[]) {
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
  }

  const groups: NavMenuSection[] = sections ?? (items ? [{ id: 'default', items }] : [])

  return (
    <MenuContextProvider value={ctx}>
      <LevelProvider value={0}>
        <div
          className="flex flex-col"
          style={
            collapse
              ? {
                  paddingInline: NAV_MENU.collapsedPaddingX,
                  gap: NAV_MENU.collapsedItemGap,
                }
              : undefined
          }
        >
          {groups.map((section) => (
            <div key={section.id}>{renderNavItems(section.items)}</div>
          ))}
        </div>
      </LevelProvider>
    </MenuContextProvider>
  )
}
