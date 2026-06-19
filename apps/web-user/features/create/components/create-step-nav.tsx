'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '@vokcg/i18n'
import { useCreateStudioStore } from '@vokcg/store'
import { CREATE_FLOW_STEPS, createFlowStepIndex, type CreateFlowStepId } from '@vokcg/constants'
import { CreateFormCenter } from './create-form-center'

type Props = { compact?: boolean; centered?: boolean; interactive?: boolean; variant?: 'default' | 'pills' }

export function CreateStepNav({ compact = false, centered = false, interactive = true, variant = 'default' }: Props) {
  const { t } = useLocale()
  const activeStep = useCreateStudioStore((s) => s.activeStep)
  const setActiveStep = useCreateStudioStore((s) => s.setActiveStep)
  const activeIndex = createFlowStepIndex(activeStep)
  const isPills = variant === 'pills'

  const steps = useMemo(() => CREATE_FLOW_STEPS.map((step) => ({
    ...step,
    label: t(`create.steps.${step.id}.label`),
    description: t(`create.steps.${step.id}.description`),
  })), [t])

  const nav = (
    <nav aria-label="Create video steps" className={[isPills ? 'grid w-full grid-cols-5 gap-1 py-0.5' : 'flex shrink-0 gap-1 overflow-x-auto py-2.5', !isPills && centered ? 'justify-center' : '', !isPills && compact ? 'scrollbar-none' : ''].filter(Boolean).join(' ')}>
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = step.id === activeStep
        const isComplete = index < activeIndex

        if (isPills) {
          const pillClass = ['flex min-w-0 items-center justify-center gap-1 rounded-full border px-1.5 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5', isActive ? 'border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] bg-accent-muted text-primary shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]' : isComplete ? 'border-subtle bg-subtle/40 text-secondary' : 'border-transparent text-muted', interactive && !isActive ? 'hover:border-subtle hover:bg-subtle/30 hover:text-primary' : '', !interactive ? 'cursor-default' : ''].filter(Boolean).join(' ')
          const pillContent = (
            <>
              <span className={['flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold', isActive ? 'bg-accent text-white' : isComplete ? 'bg-accent/15 text-accent' : 'bg-subtle text-muted'].join(' ')}>{isComplete ? '✓' : index + 1}</span>
              <span className="truncate text-[9px] font-semibold sm:text-[11px]">{step.label}</span>
            </>
          )
          if (!interactive) return <div key={step.id} aria-current={isActive ? 'step' : undefined} className={pillClass}>{pillContent}</div>
          return <button key={step.id} type="button" onClick={() => setActiveStep(step.id as CreateFlowStepId)} className={pillClass}>{pillContent}</button>
        }

        const stepClass = ['group relative flex min-w-0 shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 transition-colors', isActive ? 'bg-accent-muted text-primary' : 'text-muted', interactive && !isActive ? 'hover:bg-subtle hover:text-primary' : '', !interactive ? 'cursor-default' : ''].filter(Boolean).join(' ')
        const stepInner = (
          <>
            <span className={['flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold', isActive ? 'bg-accent text-white' : isComplete ? 'bg-accent/20 text-accent' : 'bg-subtle text-muted'].join(' ')}>{isComplete ? '✓' : index + 1}</span>
            {!compact && (
              <span className="hidden min-w-0 flex-col items-start md:flex">
                <span className="truncate text-[11px] font-bold leading-tight">{step.label}</span>
                <span className="truncate text-[9px] font-medium text-muted/80">{step.description}</span>
              </span>
            )}
            {compact && <Icon size={14} className={isActive ? 'text-accent' : 'text-muted'} />}
            {isActive && <motion.div layoutId="create-step-indicator" className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-accent" />}
          </>
        )
        if (!interactive) return <div key={step.id} aria-current={isActive ? 'step' : undefined} className={stepClass}>{stepInner}</div>
        return <button key={step.id} type="button" onClick={() => setActiveStep(step.id as CreateFlowStepId)} className={stepClass}>{stepInner}</button>
      })}
    </nav>
  )

  if (centered && !isPills) {
    return <div className="w-full border-t border-subtle bg-surface/40"><CreateFormCenter>{nav}</CreateFormCenter></div>
  }
  if (isPills) return nav
  return <div className="w-full border-b border-subtle bg-surface/80 px-3">{nav}</div>
}
