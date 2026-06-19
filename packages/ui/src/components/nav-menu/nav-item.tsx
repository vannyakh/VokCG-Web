"use client"

import { motion } from 'framer-motion'

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
    <span className="ml-auto shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
      {label}
    </span>
  )
}

export function NavMenuItem({ item, inPopup = false }: Props) {
  const { menuId, activePath, collapse, itemHeight = 40, onSelect, hoveredId, setHoveredId } = useMenuContext()
  const level = useMenuLevel()
  const { disabled, badge } = resolveItem(item)

  const isActive   = !!item.path && item.path === activePath && !disabled
  const isLeaf     = !item.children?.length
  const isNested   = level > 0
  const isCollapsed = collapse && !inPopup
  const isHovered  = hoveredId === item.id

  const handleMouseEnter = () => { if (!disabled && !isCollapsed) setHoveredId(item.id) }
  const handleMouseLeave = () => { if (hoveredId === item.id) setHoveredId(null) }

  const btn = (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fluid hover background pill — slides between items via layoutId */}
      {isHovered && !isActive && (
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

      {/* Active background */}
      {isActive && (
        <span
          className="absolute inset-0 rounded-[10px]"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
          }}
          aria-hidden
        />
      )}

      {/* Active left accent bar */}
      {isActive && !isCollapsed && (
        <span
          className="absolute inset-y-[7px] left-0 w-[3px] rounded-full"
          style={{ background: 'var(--color-primary)' }}
          aria-hidden
        />
      )}

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
          paddingLeft: isCollapsed ? 0 : inPopup ? 10 : isNested ? 10 : 12,
          paddingRight: isCollapsed ? 0 : 10,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isCollapsed ? (
          <span
            className="flex items-center justify-center rounded-xl transition-all duration-150"
            style={{
              width: NAV_MENU.collapsedTileSize,
              height: NAV_MENU.collapsedTileSize,
              background: isActive
                ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
                : 'transparent',
              boxShadow: isActive
                ? 'inset 0 0 0 1.5px color-mix(in srgb, var(--color-primary) 28%, transparent)'
                : 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--text-nav-inactive)',
            }}
          >
            <item.icon size={17} strokeWidth={isActive ? 2.3 : 1.75} className="shrink-0" />
          </span>
        ) : (
          <item.icon
            size={15}
            strokeWidth={isActive ? 2.2 : 1.75}
            className="shrink-0 transition-colors duration-150"
          />
        )}

        {(!collapse || inPopup) && (
          <>
            <span
              className={[
                'min-w-0 flex-1 truncate text-[13px] leading-none transition-colors duration-150',
                isActive ? 'font-semibold' : 'font-medium',
              ].join(' ')}
            >
              {item.label}
            </span>
            {badge && <NavBadge label={badge} />}
          </>
        )}
      </button>
    </div>
  )

  if (isCollapsed) {
    const tip = badge ? `${item.label} · ${badge}` : item.label
    return <Tooltip content={tip} placement="right">{btn}</Tooltip>
  }

  return btn
}
