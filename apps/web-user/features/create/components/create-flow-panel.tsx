'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCreateStudioStore } from '@vokcg/store'
import { AudioStep } from './audio-step'
import { ContentStep } from './content-step'
import { ReviewStep } from './review-step'
import { SubtitlesStep } from './subtitles-step'
import { VisualsStep } from './visuals-step'
import { CreateFormCenter } from './create-form-center'
import { CreateStepFooter } from './create-step-footer'

const STEP_VIEWS = {
  content: ContentStep,
  visuals: VisualsStep,
  audio: AudioStep,
  subtitles: SubtitlesStep,
  review: ReviewStep,
} as const

export function CreateFlowPanel() {
  const activeStep = useCreateStudioStore((s) => s.activeStep)
  const StepView = STEP_VIEWS[activeStep]

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-canvas">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 sm:py-6 md:py-8">
        <CreateFormCenter className="mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <StepView />
            </motion.div>
          </AnimatePresence>
        </CreateFormCenter>
      </div>
      <CreateStepFooter />
    </div>
  )
}
