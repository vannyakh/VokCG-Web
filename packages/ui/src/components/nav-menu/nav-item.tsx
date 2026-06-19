"use client"

import { Tooltip } from '../tooltip'
import { useMenuContext, useMenuLevel } from './menu-context'
import { NAV_MENU, navItemButtonClass, navTileClass } from './nav-styles'
import type { NavItem } from './types'

type Props = { item: NavItem; inPopup?: boolean }

function resolveItem(item: NavItem) {
  const comingSoon = item.comingSoon === true
  return {
    disabled: item.disabled || comingSoon,
    badge: item.badge ?? (comingSoon ? 'Soon' : undefined),
  }
}

function NavBadge({ label }: { label: string }) {
  return (
    <span className="ml-auto shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
      {label}
    </span>
  )
}

export function NavMenuItem({ item, inPopup = false }: Props) {
  const { activePath, collapse, itemHeight = 42, onSelect } = useMenuContext()
  const level = useMenuLevel()
  const { disabled, badge } = resolveItem(item)

  const isActive = !!item.path && item.path === activePath && !disabled
  const isLeaf = !item.children?.length
  const isNested = level > 0
  const isCollapsed = collapse && !inPopup

  const btn = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => isLeaf && !disabled && onSelect(item)}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled}
      className={navItemButtonClass({ collapse, inPopup, isActive, disabled })}
      style={{
        height: itemHeight,
        borderRadius: isCollapsed ? 0 : NAV_MENU.itemRadius,
        marginLeft: isCollapsed ? 0 : isNested ? 0 : NAV_MENU.marginX,
        marginRight: isCollapsed ? 0 : isNested ? 0 : NAV_MENU.marginX,
        paddingLeft: isCollapsed ? 0 : inPopup || isNested ? 10 : 12,
        paddingRight: isCollapsed ? 0 : 10,
      }}
    >
      {isCollapsed ? (
        <span
          className={navTileClass(isActive)}
          style={{
            width: NAV_MENU.collapsedTileSize,
            height: NAV_MENU.collapsedTileSize,
          }}
        >
          <item.icon size={17} strokeWidth={isActive ? 2.25 : 1.85} className="shrink-0" />
        </span>
      ) : (
        <item.icon size={16} strokeWidth={isActive ? 2.25 : 1.85} className="shrink-0" />
      )}

      {!collapse || inPopup ? (
        <>
          <span
            className={[
              'min-w-0 flex-1 truncate text-[14px] leading-none',
              isActive ? 'font-semibold' : 'font-medium',
            ].join(' ')}
          >
            {item.label}
          </span>
          {badge && <NavBadge label={badge} />}
        </>
      ) : null}
    </button>
  )

  if (isCollapsed) {
    const tip = badge ? `${item.label} (${badge})` : item.label
    return <Tooltip content={tip} placement="right">{btn}</Tooltip>
  }

  return btn
}
