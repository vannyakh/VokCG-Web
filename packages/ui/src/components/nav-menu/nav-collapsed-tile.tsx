import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

import { NAV_MENU, navCollapsedTileStyle } from './nav-styles'

type Props = {
  icon: LucideIcon
  active?: boolean
}

export function NavCollapsedTile({ icon: Icon, active = false }: Props) {
  return (
    <span
      className="flex items-center justify-center transition-colors duration-150"
      style={{
        ...navCollapsedTileStyle(active),
        borderRadius: NAV_MENU.collapsedTileRadius,
      }}
    >
      <Icon
        size={NAV_MENU.collapsedIconSize}
        strokeWidth={active ? NAV_MENU.collapsedIconStrokeActive : NAV_MENU.collapsedIconStroke}
        className="shrink-0"
      />
    </span>
  )
}

export function navCollapsedRowStyle(): CSSProperties {
  return {
    height: NAV_MENU.collapsedItemHeight,
    paddingInline: 0,
  }
}
