'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { modalBackdrop, modalPanel } from '@vokcg/ui'

type Props = {
  open: boolean
  onClose: () => void
  dismissible?: boolean
  ariaLabelledBy?: string
  children: ReactNode
  className?: string
}

export function BillingModalShell({ open, onClose, dismissible = true, ariaLabelledBy, children, className = '' }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open || !dismissible) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dismissible, onClose, open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            variants={modalPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            className={['relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px]', 'border border-white/[0.08] bg-[#12151f]', 'shadow-[0_24px_64px_rgba(0,0,0,0.5)]', className].filter(Boolean).join(' ')}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
