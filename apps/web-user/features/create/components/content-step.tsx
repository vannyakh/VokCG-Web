'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Spin } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { PenLine, Sparkles } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { SCRIPT_LANGUAGES } from '@vokcg/constants'
import { useCreateConfig } from '../hooks/use-create-config'
import { useContentDraft } from '../hooks/use-content-draft'
import { useVideoActions } from '../hooks/use-video-actions'
import { slideDown } from '@vokcg/ui'
import { countWords } from '../../script/lib/script-writer-utils'
import { estimateSpeechDuration, formatDuration } from '../../tts/lib/tts-utils'
import { CollapsibleBlock, CreateCard, FieldMenuSelect, MenuSelect, StepSection, Toggle } from './form-primitives'

const toErrorText = (e: unknown) => (e instanceof Error ? e.message : '')

export function ContentStep() {
  const { t } = useLocale()
  const { section: content, patch, contentGeneration } = useCreateConfig('content')
  const { openInScriptWriter, applyDraftToCreate } = useContentDraft()
  const draftApplied = useRef(false)
  const [useCustomSysPrompt, setUseCustomSysPrompt] = useState(() => Boolean(content.systemPrompt.trim()))
  const [subjectTouched, setSubjectTouched] = useState(false)
  const { generateScriptMutation, generateTermsMutation } = useVideoActions()

  useEffect(() => {
    if (draftApplied.current) return
    draftApplied.current = true
    applyDraftToCreate()
  }, [applyDraftToCreate])

  const wordCount = countWords(content.script)
  const speechDuration = formatDuration(estimateSpeechDuration(content.script.trim().length))
  const subjectError = subjectTouched && !content.subject.trim() ? t('create.validation.subjectRequired') : ''
  const errorMessage = toErrorText(generateScriptMutation.error) || toErrorText(generateTermsMutation.error)
  const scriptLanguageOptions = useMemo(() => SCRIPT_LANGUAGES.map((code) => ({ value: code, label: code || t('create.steps.content.autoDetect') })), [t])

  return (
    <StepSection title={t('create.steps.content.title')} description={t('create.steps.content.subtitle')}>
      <CreateCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-primary">{t('create.steps.content.subject')}</label>
            <Input value={content.subject} onChange={(e) => patch({ subject: e.target.value })} onBlur={() => setSubjectTouched(true)} placeholder={t('create.steps.content.subjectPlaceholder')} size="large" status={subjectError ? 'error' : undefined} />
            {subjectError && <p className="text-xs font-medium text-error">{subjectError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-bold text-primary">{t('create.steps.content.language')}</label>
              <MenuSelect options={scriptLanguageOptions} value={content.language} onChange={(language) => patch({ language })} placeholder={t('create.steps.content.autoDetect')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="w-fit border-b border-dotted border-muted text-sm font-bold text-primary">{t('create.steps.content.paragraphs')}</label>
              <Input type="number" min={1} max={10} value={content.paragraphCount} onChange={(e) => patch({ paragraphCount: Math.min(10, Math.max(1, Number.parseInt(e.target.value || '1', 10))) })} className="w-full sm:w-[88px]" />
            </div>
            <Button type="primary" size="large" block icon={generateScriptMutation.isPending ? <Spin size="small" /> : <Sparkles size={14} />} onClick={() => { setSubjectTouched(true); generateScriptMutation.mutate() }} disabled={!contentGeneration.canGenerateScript || generateScriptMutation.isPending} className="font-bold lg:w-auto">
              {t('create.steps.content.aiScript')}
            </Button>
          </div>
        </div>
      </CreateCard>

      <CreateCard className="relative p-3 sm:p-4">
        {generateScriptMutation.isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/85 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <Spin />
              <p className="text-sm font-semibold text-primary">{t('create.generatingScript')}</p>
              <p className="text-xs text-muted">{t('create.generatingScriptHint')}</p>
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {content.script.trim().length > 0 && (
              <>
                <span className="rounded-full border border-default px-2.5 py-1 text-xs text-secondary">{t('create.steps.content.statsWords', { count: wordCount })}</span>
                <span className="rounded-full border border-default px-2.5 py-1 text-xs text-secondary">{t('create.steps.content.statsDuration', { duration: speechDuration })}</span>
              </>
            )}
          </div>
          <Button size="small" icon={<PenLine size={14} />} onClick={openInScriptWriter} className="font-semibold">{t('create.steps.content.openScriptWriter')}</Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">{t('create.steps.content.script')}</label>
          <Input.TextArea value={content.script} onChange={(e) => patch({ script: e.target.value })} placeholder={t('create.steps.content.scriptPlaceholder')} rows={6} className="min-h-[140px] sm:min-h-[180px]" style={{ resize: 'vertical' }} disabled={generateScriptMutation.isPending} />
          <p className="text-[11px] text-muted">{content.script.trim().length > 0 ? t('create.steps.content.scriptChars', { count: content.script.trim().length }) : t('create.steps.content.scriptEmpty')}</p>
        </div>
      </CreateCard>

      <CreateCard className="p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-primary">{t('create.steps.content.keywords')}</label>
            <Input value={content.terms} onChange={(e) => patch({ terms: e.target.value })} placeholder={t('create.steps.content.keywordsPlaceholder')} />
          </div>
          <Button block size="large" icon={generateTermsMutation.isPending ? <Spin size="small" /> : <Sparkles size={14} />} onClick={() => generateTermsMutation.mutate()} disabled={!contentGeneration.canGenerateTerms || generateTermsMutation.isPending} className="font-bold sm:w-auto">
            {t('create.steps.content.aiKeywords')}
          </Button>
        </div>
      </CreateCard>

      <CollapsibleBlock label={t('create.steps.content.advanced')}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">{t('create.steps.content.customRequirements')}</label>
          <Input.TextArea value={content.scriptPrompt} onChange={(e) => patch({ scriptPrompt: e.target.value })} placeholder={t('create.steps.content.customRequirementsPlaceholder')} className="min-h-[80px]" style={{ resize: 'vertical' }} maxLength={2000} />
        </div>
        <Toggle checked={useCustomSysPrompt} onChange={(v) => { setUseCustomSysPrompt(v); if (!v) patch({ systemPrompt: '' }) }} label={t('create.steps.content.customSystemPrompt')} />
        {useCustomSysPrompt && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-primary">{t('create.steps.content.customSystemPrompt')}</label>
            <Input.TextArea value={content.systemPrompt} onChange={(e) => patch({ systemPrompt: e.target.value })} className="min-h-[120px]" style={{ resize: 'vertical' }} maxLength={8000} />
          </div>
        )}
      </CollapsibleBlock>

      <AnimatePresence>
        {errorMessage && (
          <motion.div key="err" variants={slideDown} initial="initial" animate="animate" exit="exit">
            <div className="rounded-xl border border-error bg-app-error px-4 py-3"><span className="text-sm font-semibold text-error">{errorMessage}</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepSection>
  )
}
