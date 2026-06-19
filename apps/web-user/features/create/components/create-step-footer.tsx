'use client'

import { Button } from 'antd'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { useCreateStudioStore } from '@/store'
import { CREATE_FLOW_STEPS, createFlowStepIndex } from '@vokcg/constants'
import { validateCreateFlowStep } from '../lib/create-config'
import { useCreateConfig } from '../hooks/use-create-config'
import { CreateFormCenter } from './create-form-center'

export function CreateStepFooter() {
  const { t } = useLocale()
  const activeStep = useCreateStudioStore((s) => s.activeStep)
  const nextStep = useCreateStudioStore((s) => s.nextStep)
  const prevStep = useCreateStudioStore((s) => s.prevStep)
  const { config } = useCreateConfig()
  const validation = validateCreateFlowStep(activeStep, config)

  const index = createFlowStepIndex(activeStep)
  const isFirst = index <= 0
  const isLast = index >= CREATE_FLOW_STEPS.length - 1

  return (
    <div className="w-full shrink-0 border-t border-subtle bg-canvas/95 py-2.5 sm:py-3">
      <CreateFormCenter>
        <div className="flex flex-col gap-2">
          {!validation.valid && validation.messageKey && (
            <p className="text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">{t(validation.messageKey)}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button size="middle" icon={<ChevronLeft size={14} />} onClick={prevStep} disabled={isFirst} className="min-w-0 font-semibold">
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted sm:text-[11px]">{t('common.stepOf', { current: index + 1, total: CREATE_FLOW_STEPS.length })}</span>
            {isLast ? (
              <span className="max-w-[40%] truncate text-right text-[10px] font-semibold text-accent sm:max-w-none sm:text-[11px]">{t('create.generateBelow')}</span>
            ) : (
              <Button type="primary" size="middle" onClick={nextStep} disabled={!validation.valid} className="font-bold">
                {t('common.next')}<ChevronRight size={14} className="ml-1 inline" />
              </Button>
            )}
          </div>
        </div>
      </CreateFormCenter>
    </div>
  )
}
