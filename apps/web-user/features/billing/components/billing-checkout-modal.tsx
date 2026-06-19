'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight, CreditCard, Loader2, Lock, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { WorkspacePlan } from '@/types/workspace'
import { modalOptionItem, modalOptionStagger } from '@vokcg/ui'
import { BillingModalShell } from './billing-modal-shell'

export type BillingPaymentMethod = 'stripe' | 'bakong'

type PaymentOption = {
  id: BillingPaymentMethod
  title: string
  description: string
  icon: ReactNode
  iconClassName: string
}

type Props = {
  open: boolean
  plan: WorkspacePlan | null
  loadingMethod?: BillingPaymentMethod | null
  onClose: () => void
  onSelect: (method: BillingPaymentMethod) => void
  labels: {
    checkout: string
    selectPayment: string
    stripeTitle: string
    stripeDescription: string
    bakongTitle: string
    bakongDescription: string
    secured: string
    perMonth: string
    continuePay: string
  }
}

function formatCheckoutAmount(value: number) {
  return Number(value) % 1 === 0 ? String(Math.round(value)) : value.toFixed(2)
}

export function BillingCheckoutModal({ open, plan, loadingMethod = null, onClose, onSelect, labels }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<BillingPaymentMethod>('bakong')
  const busy = Boolean(loadingMethod)
  const visible = open && Boolean(plan)

  useEffect(() => {
    if (open) setSelectedMethod('bakong')
  }, [open, plan?.id])

  const options: PaymentOption[] = useMemo(
    () => [
      {
        id: 'bakong',
        title: labels.bakongTitle,
        description: labels.bakongDescription,
        iconClassName: 'bg-[#E5282A] text-white text-[10px] font-semibold tracking-tight',
        icon: 'KHQR',
      },
      {
        id: 'stripe',
        title: labels.stripeTitle,
        description: labels.stripeDescription,
        iconClassName: 'bg-[#635BFF] text-white',
        icon: <CreditCard size={18} strokeWidth={1.8} />,
      },
    ],
    [labels],
  )

  const continueLabel = plan
    ? labels.continuePay.replace('{{amount}}', formatCheckoutAmount(plan.price))
    : labels.continuePay.replace('{{amount}}', '0')

  return (
    <BillingModalShell open={visible} onClose={onClose} dismissible={!busy} ariaLabelledBy="billing-checkout-title">
      {plan && (
        <>
          <div className="relative border-b border-white/[0.08] bg-[#1a1f2e] px-6 pb-5 pt-6">
            <button
              type="button"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-white/55 disabled:cursor-not-allowed disabled:opacity-45"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">{labels.checkout}</p>
            <h2 id="billing-checkout-title" className="mb-3 text-xl font-semibold tracking-tight text-white">{plan.name}</h2>
            <div className="flex items-end gap-1.5">
              <span className="pb-1 text-lg text-white/45">$</span>
              <span className="text-[40px] font-semibold leading-none tracking-tight text-white">{formatCheckoutAmount(plan.price)}</span>
              <span className="pb-1 text-sm font-medium text-white/45">USD</span>
              <span className="pb-1 text-sm text-white/35">/{labels.perMonth}</span>
            </div>
          </div>

          <div className="px-6 py-6">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{labels.selectPayment}</p>
            <motion.div variants={modalOptionStagger} initial="initial" animate="animate" className="flex flex-col gap-3">
              {options.map((option) => {
                const selected = selectedMethod === option.id
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    variants={modalOptionItem}
                    disabled={busy}
                    aria-pressed={selected}
                    onClick={() => setSelectedMethod(option.id)}
                    className={['flex w-full items-center gap-4 rounded-[20px] border px-4 py-4 text-left', 'disabled:cursor-not-allowed disabled:opacity-65', selected ? 'border-[#5B7FFF]/70 bg-[#5B7FFF]/10 ring-1 ring-[#5B7FFF]/25' : 'border-white/[0.08] bg-white/[0.03]'].join(' ')}
                  >
                    <span className={['flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', option.iconClassName].join(' ')}>{option.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-white">{option.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-white/45">{option.description}</span>
                    </span>
                    <span
                      className={['flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[#5B7FFF] bg-[#5B7FFF] text-white' : 'border-white/15 bg-white/[0.03] text-transparent'].join(' ')}
                      aria-hidden
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <ChevronRight size={16} className={selected ? 'shrink-0 text-[#8aa4ff]' : 'shrink-0 text-white/20'} />
                  </motion.button>
                )
              })}
            </motion.div>

            <button
              type="button"
              disabled={busy && !loadingMethod}
              onClick={() => onSelect(selectedMethod)}
              className="mt-6 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#5B7FFF] px-6 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingMethod ? <Loader2 size={18} className="animate-spin" /> : null}
              {continueLabel}
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/30">
              <Lock size={12} strokeWidth={2.2} />
              {labels.secured}
            </p>
          </div>
        </>
      )}
    </BillingModalShell>
  )
}
