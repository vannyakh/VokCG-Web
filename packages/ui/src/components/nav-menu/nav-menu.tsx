"use client"

import { useCallback, useId, useState } from 'react'
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
  itemHeight = 40,
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

  return (
    <MenuContextProvider value={ctx}>
      <LevelProvider value={0}>
        <div className={collapse ? 'flex flex-col gap-0.5' : 'flex flex-col gap-0.5 px-1'}>
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
