"use client"

import { Tooltip } from '../tooltip'
import { useMenuContext, useMenuLevel } from './menu-context'
import { NavBadge } from './nav-badge'
import { NavCollapsedTile, navCollapsedRowStyle } from './nav-collapsed-tile'
import {
  NAV_FLYOUT,
  NAV_MENU,
  navIconColor,
  navItemButtonClass,
  navRowRadius,
  navSurface,
} from './nav-styles'
import type { NavItem } from './types'

type Props = { item: NavItem; inPopup?: boolean }

function resolveItem(item: NavItem) {
  const comingSoon = item.comingSoon === true
  return {
    disabled: item.disabled || comingSoon,
    badge: item.badge ?? (comingSoon ? 'Soon' : undefined),
  }
}

export function NavMenuItem({ item, inPopup = false }: Props) {
  const { activePath, collapse, itemHeight = 44, onSelect } = useMenuContext()
  const level = useMenuLevel()
  const { disabled, badge } = resolveItem(item)

  const isActive = !!item.path && item.path === activePath && !disabled
  const isLeaf = !item.children?.length
  const isNested = level > 0
  const isCollapsed = collapse && !inPopup
  const rowRadius = navRowRadius(isNested, inPopup)
  const rowHeight =
    isCollapsed
      ? NAV_MENU.collapsedItemHeight
      : inPopup
        ? NAV_FLYOUT.itemHeight
        : isNested && !inPopup
          ? itemHeight - NAV_MENU.nestedItemHeightOffset
          : itemHeight
  const showActiveSurface = isActive && !isCollapsed

  const btn = (
    <div className="relative">
      {showActiveSurface && (
        <span
          className="absolute inset-0"
          style={{
            borderRadius: rowRadius,
            background: isNested ? navSurface.nestedActive : navSurface.active,
          }}
          aria-hidden
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => isLeaf && !disabled && onSelect(item)}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
        className={navItemButtonClass({ collapse, inPopup, isActive, disabled, nested: isNested })}
        style={{
          ...(isCollapsed ? navCollapsedRowStyle() : {}),
          height: rowHeight,
          borderRadius: isCollapsed ? 0 : rowRadius,
          paddingLeft: isCollapsed ? 0 : inPopup ? 10 : isNested ? 8 : 10,
          paddingRight: isCollapsed ? 0 : inPopup ? 10 : 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isCollapsed ? (
          <NavCollapsedTile icon={item.icon} active={isActive} />
        ) : (
          <item.icon
            size={inPopup ? 15 : isNested && !inPopup ? 14 : 15}
            strokeWidth={isActive ? 2.2 : 1.75}
            className="shrink-0"
            style={navIconColor(isActive)}
          />
        )}

        {(!collapse || inPopup) && (
          <>
            <span
              className={[
                'min-w-0 flex-1 truncate leading-none',
                isNested && !inPopup ? 'text-[12.5px]' : 'text-[13px]',
                isActive ? 'font-semibold' : 'font-medium',
              ].join(' ')}
            >
              {item.label}
            </span>
            {badge && <NavBadge label={badge} compact={inPopup} />}
          </>
        )}
      </button>
    </div>
  )

  if (isCollapsed) {
    const tip = badge ? `${item.label} · ${badge}` : item.label
    return (
      <Tooltip content={tip} placement="right">
        {btn}
      </Tooltip>
    )
  }

  return btn
}
