'use client'

import { Check, Loader2 } from 'lucide-react'
import type { WorkspacePlan } from '@/types/workspace'
import { formatCurrency } from '@vokcg/ui'

type Props = {
  plan: WorkspacePlan
  isCurrent: boolean
  isRecommended?: boolean
  actionLabel: string
  disabled: boolean
  loading: boolean
  onSelect: () => void
  currentLabel: string
  recommendedLabel?: string
}

export function BillingPlanCard({ plan, isCurrent, isRecommended = false, actionLabel, disabled, loading, onSelect, currentLabel, recommendedLabel = 'Recommended' }: Props) {
  return (
    <article
      data-current={isCurrent ? 'true' : undefined}
      data-recommended={isRecommended ? 'true' : undefined}
      className={['flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:gap-8', isCurrent ? 'bg-accent/[0.06]' : isRecommended ? 'bg-accent/[0.03]' : ''].join(' ')}
    >
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-xl font-bold tracking-tight text-primary">{plan.name}</h3>
          {isCurrent && <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">{currentLabel}</span>}
          {isRecommended && !isCurrent && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">{recommendedLabel}</span>}
        </div>
        {plan.features.length > 0 && (
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-[15px] text-secondary">
                <Check size={16} className="shrink-0 text-accent" strokeWidth={2.5} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6 lg:flex-col lg:items-end lg:gap-3">
        <p className="text-right text-[28px] font-extrabold leading-none tabular-nums tracking-tight text-primary sm:min-w-[120px]">
          {formatCurrency(plan.price, { prefix: '$' })}
          <span className="ml-1 text-base font-medium text-muted">/{plan.interval}</span>
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={onSelect}
          className={['inline-flex h-11 min-w-[148px] items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold', 'disabled:cursor-not-allowed disabled:opacity-60', isCurrent ? 'billing-primary-btn--outline' : 'billing-primary-btn'].join(' ')}
        >
          {loading && !isCurrent ? <Loader2 size={16} className="animate-spin" /> : null}
          {actionLabel}
        </button>
      </div>
    </article>
  )
}
