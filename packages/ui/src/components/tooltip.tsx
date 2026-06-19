import { Tooltip as AntTooltip } from 'antd'
import type { PropsWithChildren } from 'react'

interface TooltipProps extends PropsWithChildren {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ children, content, placement = 'top' }: TooltipProps) {
  return (
    <AntTooltip title={content} placement={placement}>
      {children}
    </AntTooltip>
  )
}
