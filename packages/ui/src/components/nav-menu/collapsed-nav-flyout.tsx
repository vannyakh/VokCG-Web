"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

function useFlyoutHover(openDelay = 80, closeDelay = 120) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)

  const clear = () => { if (timer.current) clearTimeout(timer.current) }
  const enter = () => { clear(); timer.current = setTimeout(() => setOpen(true), openDelay) }
  const leave = () => { clear(); timer.current = setTimeout(() => setOpen(false), closeDelay) }
  const pin   = () => { clear(); setOpen(true) }

  return { open, enter, leave, pin }
}

type CollapsedNavFlyoutProps = {
  trigger: ReactNode
  children: ReactNode
  align?: 'center' | 'start'
}

export function CollapsedNavFlyout({ trigger, children, align = 'center' }: CollapsedNavFlyoutProps) {
  const { open, enter, leave, pin } = useFlyoutHover()
  const triggerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCoords({
        left: rect.right + 6,
        top: align === 'start' ? rect.top : rect.top + rect.height / 2,
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, align])

  const flyout =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="collapsed-nav-flyout"
                className="fixed z-[200]"
                style={{
                  left: coords.left,
                  top: coords.top,
                  translateY: align === 'center' ? '-50%' : 0,
                }}
                initial={{ opacity: 0, x: -8, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
                onMouseEnter={pin}
                onMouseLeave={leave}
              >
                <div
                  className="overflow-hidden rounded-2xl border border-divider bg-surface"
                  style={{
                    minWidth: 176,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)',
                  }}
                >
                  <div className="p-1.5">{children}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null

  return (
    <div ref={triggerRef} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      {trigger}
      {flyout}
    </div>
  )
}
