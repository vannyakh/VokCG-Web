import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

import { NAV_MENU, navCollapsedTileStyle } from './nav-styles'

type Props = {
  icon: LucideIcon
  active?: boolean
}

export function NavCollapsedTile({ icon: Icon, active = false }: Props) {
  return (
    <motion.span
      className="flex items-center justify-center transition-colors duration-150"
      style={{
        ...navCollapsedTileStyle(active),
        borderRadius: NAV_MENU.collapsedTileRadius,
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <Icon
        size={NAV_MENU.collapsedIconSize}
        strokeWidth={active ? NAV_MENU.collapsedIconStrokeActive : NAV_MENU.collapsedIconStroke}
        className="shrink-0"
      />
    </motion.span>
  )
}

export function navCollapsedRowStyle(): CSSProperties {
  return {
    height: NAV_MENU.collapsedItemHeight,
    paddingInline: 0,
  }
}
