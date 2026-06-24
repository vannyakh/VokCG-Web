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
      className="flex items-center justify-center rounded-[11px]"
      style={navCollapsedTileStyle(active)}
      whileHover={{ scale: 1.06, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.94, transition: { duration: 0.08 } }}
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
