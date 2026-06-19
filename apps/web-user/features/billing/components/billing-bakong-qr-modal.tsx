'use client'

import { motion } from 'framer-motion'
import { Loader2, Lock, Smartphone, X } from 'lucide-react'
import { useMemo } from 'react'
import type { WorkspacePlan } from '@/types/workspace'
import { BillingModalShell } from './billing-modal-shell'

type Props = {
  open: boolean
  plan: WorkspacePlan | null
  qrCode: string | null
  amount?: number | null
  expiresAt?: string | null
  onClose: () => void
  labels: {
    title: string
    hint: string
    expires: string
    waiting: string
    secured: string
  }
}

function formatCheckoutAmount(value: number) {
  return Number(value) % 1 === 0 ? String(Math.round(value)) : value.toFixed(2)
}

export function BillingBakongQrModal({ open, plan, qrCode, amount, expiresAt, onClose, labels }: Props) {
  const expiresLabel = useMemo(() => {
    if (!expiresAt) return null
    try {
      return new Date(expiresAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    } catch {
      return null
    }
  }, [expiresAt])

  const qrImageUrl = useMemo(() => {
    if (!qrCode) return null
    return `https://api.qrserver.com/v1/create-qr-code/?size=196x196&data=${encodeURIComponent(qrCode)}`
  }, [qrCode])

  const displayAmount = amount ?? plan?.price ?? 0
  const visible = open && Boolean(plan && qrCode)

  return (
    <BillingModalShell open={visible} onClose={onClose} ariaLabelledBy="billing-bakong-title">
      {plan && qrCode && (
        <>
          <div className="relative border-b border-white/[0.08] bg-[#1a1f2e] px-6 pb-5 pt-6">
            <button type="button" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-white/55" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffb4b4]/80">KHQR</p>
            <h2 id="billing-bakong-title" className="mb-3 text-xl font-semibold tracking-tight text-white">{labels.title}</h2>
            <div className="flex items-end gap-1.5">
              <span className="pb-1 text-lg text-white/45">$</span>
              <span className="text-[40px] font-semibold leading-none tracking-tight text-white">{formatCheckoutAmount(displayAmount)}</span>
              <span className="pb-1 text-sm font-medium text-white/45">USD</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-7">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="rounded-[24px] bg-white p-4">
              {qrImageUrl ? <img src={qrImageUrl} alt="Bakong KHQR payment code" width={196} height={196} className="rounded-2xl" /> : null}
            </motion.div>
            <p className="flex max-w-[300px] items-center gap-2 text-center text-xs leading-relaxed text-white/50">
              <Smartphone size={14} className="shrink-0" />
              {labels.hint}
            </p>
            {expiresLabel && <p className="text-xs text-white/35">{labels.expires}: {expiresLabel}</p>}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#5B7FFF]/10 px-4 py-2 text-xs font-medium text-[#a9bbff]">
              <Loader2 size={14} className="animate-spin" />
              <span>{labels.waiting}</span>
            </div>
            <p className="flex items-center justify-center gap-2 text-[11px] text-white/30">
              <Lock size={12} strokeWidth={2.2} />
              {labels.secured}
            </p>
          </div>
        </>
      )}
    </BillingModalShell>
  )
}
