"use client"

import { useCallback, useState } from 'react'
import { LevelProvider, MenuContextProvider } from './menu-context'
import { NavMenuItem } from './nav-item'
import { NavSubMenu } from './nav-sub-menu'
import type { MenuContext, MenuProps, NavItem } from './types'

type Props = MenuProps & { items: NavItem[] }

export function NavMenu({
  items,
  activePath,
  collapse,
  accordion = true,
  rounded  = true,
  itemHeight = 38,
  onSelect,
}: Props) {
  const [openedMenus, setOpenedMenus] = useState<Set<string>>(new Set())

  // Mirrors Vben openMenu — in accordion mode keep only one branch open
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

  // Mirrors Vben closeMenu
  const closeMenu = useCallback((id: string) => {
    setOpenedMenus((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const ctx: MenuContext = {
    activePath,
    collapse,
    accordion,
    rounded,
    itemHeight,
    onSelect,
    openedMenus,
    openMenu,
    closeMenu,
  }

  return (
    <MenuContextProvider value={ctx}>
      <LevelProvider value={0}>
        <div className={collapse ? 'flex flex-col gap-1' : 'flex flex-col gap-0.5'}>
          {items.map((item) =>
            item.children?.length
              ? <NavSubMenu key={item.id} item={item} />
              : <NavMenuItem key={item.id} item={item} />,
          )}
        </div>
      </LevelProvider>
    </MenuContextProvider>
  )
}
