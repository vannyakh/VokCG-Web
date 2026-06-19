'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Modal, Select, Spin } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ArrowUp, BarChart3, Clock, Copy, Download, Edit3, FileText,
  Hash, Languages, List, Mic, PenLine, Plus, RefreshCw,
  Search, Sparkles, X, Zap, Clapperboard,
} from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { postApi } from '@vokcg/api'
import { SCRIPT_LANGUAGES } from '@vokcg/constants'
import { USER_ROUTES } from '@vokcg/constants'
import type { ScriptResponse, TermsResponse, CreateStudioConfig } from '@vokcg/types'
import { useAppMessage } from '@vokcg/ui'
import { configToScriptPayload, configToTermsPayload, CREATE_CONFIG_DEFAULTS } from '../../create/lib/create-config'
import {
  buildGenerationSubject, buildHookVariations, buildScriptPrompt,
  computeQualityScores, countWords, estimateCredits, estimateGradeLevel,
  estimateReadMinutes, estimateSpeechDurationWords, filterTemplates, formatScriptForCopy,
  formatScriptForExport, keywordListToString, loadScriptHistory, paragraphsForLength,
  parseScriptSections, platformForTemplate, relativeHistoryTime, saveScriptHistory,
  SCRIPT_LENGTHS, SCRIPT_PLATFORMS, SCRIPT_TEMPLATES, SCRIPT_TONES,
  sectionNamesForTemplate, sectionsToScript,
  type HookVariation, type ScriptHistoryEntry, type ScriptLength, type ScriptPlatform,
  type ScriptSection, type ScriptTemplateId, type ScriptTone, type ScriptVersion,
} from '../lib/script-writer-utils'
import { storeTtsDraft } from '../../tts/lib/tts-utils'
import { clearContentDraft, loadContentDraft, storeContentDraft } from '../lib/content-draft'

type WorkspaceTab = 'generate' | 'edit' | 'versions' | 'tts'
type SectionAction = 'rewrite' | 'expand' | 'shorten' | 'tone'

const LOADING_MESSAGES = [
  'scriptWriter.loading.analysing',
  'scriptWriter.loading.hook',
  'scriptWriter.loading.sections',
  'scriptWriter.loading.polishing',
] as const

const SECTION_STYLES: Record<string, string> = {
  hook: 'bg-accent-muted text-accent',
  problem: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  solution: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
  cta: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  body: 'bg-subtle text-secondary',
}

const toErrorText = (e: unknown) => (e instanceof Error ? e.message : '')

export function ScriptWriterWorkspace() {
  const { t } = useLocale()
  const message = useAppMessage()
  const router = useRouter()

  const [tab, setTab] = useState<WorkspaceTab>('generate')
  const [templateId, setTemplateId] = useState<ScriptTemplateId>('youtube')
  const [templateSearch, setTemplateSearch] = useState('')
  const [platform, setPlatform] = useState<ScriptPlatform>('youtube-long')
  const [length, setLength] = useState<ScriptLength>('long')
  const [audience, setAudience] = useState('Content creators & marketers')
  const [language, setLanguage] = useState('')
  const [topic, setTopic] = useState('How AI video tools are helping creators produce more content in less time — covering TTS, auto-editing, and scheduling in one platform.')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordDraft, setKeywordDraft] = useState('')
  const [addingKeyword, setAddingKeyword] = useState(false)
  const [tone, setTone] = useState<ScriptTone>('informative')
  const [script, setScript] = useState('')
  const [sections, setSections] = useState<ScriptSection[]>([])
  const [variations, setVariations] = useState<HookVariation[]>([])
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null)
  const [history, setHistory] = useState<ScriptHistoryEntry[]>(() => loadScriptHistory())
  const [versions, setVersions] = useState<ScriptVersion[]>([])
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle')
  const [loadingStep, setLoadingStep] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalHint, setModalHint] = useState('')
  const [modalValue, setModalValue] = useState('')
  const [modalReadOnly, setModalReadOnly] = useState(false)
  const [modalConfirmLabel, setModalConfirmLabel] = useState('')
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | null>(null)
  const [pendingRewriteSection, setPendingRewriteSection] = useState<ScriptSection | null>(null)
  const [busySectionId, setBusySectionId] = useState<string | null>(null)
  const draftLoaded = useRef(false)

  const template = useMemo(
    () => SCRIPT_TEMPLATES.find((item) => item.id === templateId) ?? SCRIPT_TEMPLATES[0]!,
    [templateId],
  )
  const sectionNames = useMemo(() => sectionNamesForTemplate(template, length), [template, length])
  const filteredTemplates = useMemo(() => filterTemplates(SCRIPT_TEMPLATES, templateSearch), [templateSearch])

  const paragraphCount = paragraphsForLength(length)
  const credits = estimateCredits(length)
  const wordCount = countWords(script)
  const charCount = script.length
  const readMinutes = estimateReadMinutes(wordCount)
  const gradeLevel = estimateGradeLevel(script)
  const quality = useMemo(() => computeQualityScores(script, keywords), [script, keywords])
  const hasScript = status === 'ready' && script.trim().length > 0

  const config = useMemo((): CreateStudioConfig => {
    const subject = buildGenerationSubject(topic, audience)
    const scriptPrompt = buildScriptPrompt({ template, platform, length, audience, tone, keywords })
    return {
      ...CREATE_CONFIG_DEFAULTS,
      content: { ...CREATE_CONFIG_DEFAULTS.content, subject, script, terms: keywordListToString(keywords), language, paragraphCount, scriptPrompt },
    }
  }, [audience, keywords, language, length, paragraphCount, platform, script, template, tone, topic])

  const applyScript = useCallback(
    (nextScript: string, names = sectionNames) => {
      setScript(nextScript)
      const nextSections = parseScriptSections(nextScript, names)
      setSections(nextSections)
      setVariations(buildHookVariations(nextSections))
      setSelectedVariationId(null)
      setStatus(nextScript.trim() ? 'ready' : 'idle')
    },
    [sectionNames],
  )

  const pushVersion = useCallback((nextSections: ScriptSection[], nextScript: string) => {
    setVersions((prev) => [{ id: crypto.randomUUID(), createdAt: Date.now(), sections: nextSections, script: nextScript }, ...prev].slice(0, 8))
  }, [])

  useEffect(() => {
    if (draftLoaded.current) return
    const draft = loadContentDraft()
    if (!draft) return
    draftLoaded.current = true
    if (draft.subject) setTopic(draft.subject)
    if (draft.language) setLanguage(draft.language)
    if (draft.terms) setKeywords(draft.terms.split(/[,，]/).map((term) => term.trim()).filter(Boolean))
    if (draft.script?.trim()) applyScript(draft.script)
    clearContentDraft()
  }, [applyScript])

  useEffect(() => {
    if (status !== 'generating') return
    setLoadingStep(0)
    const timer = window.setInterval(() => setLoadingStep((step) => Math.min(step + 1, LOADING_MESSAGES.length - 1)), 2500)
    return () => window.clearInterval(timer)
  }, [status])

  const generateScriptMutation = useMutation({
    mutationFn: () => postApi<ScriptResponse>('/api/v1/scripts', configToScriptPayload(config, { generationMode: 'structured', sectionNames })),
    onSuccess: (payload) => {
      const nextScript = payload.data.video_script || ''
      const nextSections = parseScriptSections(nextScript, sectionNames)
      setScript(nextScript); setSections(nextSections); setVariations(buildHookVariations(nextSections)); setSelectedVariationId(null); setStatus('ready')
      pushVersion(nextSections, nextScript)
      const title = topic.trim().slice(0, 48) || t('scriptWriter.untitled')
      const entry: ScriptHistoryEntry = { id: crypto.randomUUID(), title, templateId, createdAt: Date.now(), wordCount: countWords(nextScript) }
      const nextHistory = [entry, ...history.filter((item) => item.title !== title)].slice(0, 10)
      setHistory(nextHistory); saveScriptHistory(nextHistory)
      message.success(t('scriptWriter.scriptGenerated'))
    },
    onError: (error) => { setStatus('idle'); message.error(toErrorText(error) || t('scriptWriter.generateFailed')) },
  })

  const generateTermsMutation = useMutation({
    mutationFn: (purpose: 'keywords' | 'hashtags' = 'keywords') => postApi<TermsResponse>('/api/v1/terms', configToTermsPayload(config, 8, purpose)),
    onSuccess: (payload) => { setKeywords(payload.data.video_terms ?? []); message.success(t('scriptWriter.keywordsGenerated')) },
    onError: (error) => message.error(toErrorText(error) || t('scriptWriter.generateFailed')),
  })

  const sectionMutation = useMutation({
    mutationFn: async ({ section, action, instruction }: { section: ScriptSection; action: SectionAction; instruction?: string }) =>
      postApi<ScriptResponse>('/api/v1/scripts', configToScriptPayload(config, { generationMode: 'section', sectionAction: action, sectionName: section.name, sectionText: section.text, sectionInstruction: instruction, tone })),
    onSuccess: (payload, variables) => {
      const nextText = payload.data.video_script?.trim() || variables.section.text
      const nextSections = sections.map((item) => item.id === variables.section.id ? { ...item, text: nextText } : item)
      const nextScript = sectionsToScript(nextSections)
      setSections(nextSections); setScript(nextScript); setVariations(buildHookVariations(nextSections)); pushVersion(nextSections, nextScript)
      message.success(t('scriptWriter.sectionUpdated'))
    },
    onError: (error) => message.error(toErrorText(error) || t('scriptWriter.generateFailed')),
    onSettled: () => setBusySectionId(null),
  })

  const busy = generateScriptMutation.isPending || generateTermsMutation.isPending || sectionMutation.isPending

  const handleGenerate = () => {
    if (!topic.trim()) { message.warning(t('scriptWriter.topicRequired')); return }
    setStatus('generating'); generateScriptMutation.mutate()
  }

  const handleTemplateSelect = (id: ScriptTemplateId) => { setTemplateId(id); setPlatform(platformForTemplate(id)) }

  const handleNewScript = () => { setTopic(''); setScript(''); setSections([]); setVariations([]); setKeywords([]); setSelectedVariationId(null); setStatus('idle'); setTab('generate'); message.info(t('scriptWriter.newScriptStarted')) }

  const handleCopyAll = async () => {
    if (!sections.length) return
    await navigator.clipboard.writeText(formatScriptForCopy(sections))
    message.success(t('scriptWriter.copiedScript'))
  }

  const handleExport = (format: 'txt' | 'md') => {
    if (!sections.length) return
    const slug = topic.trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase().slice(0, 40) || 'script'
    const blob = new Blob([formatScriptForExport(sections, format)], { type: format === 'md' ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${slug}.${format}`; anchor.click(); URL.revokeObjectURL(url)
    message.success(t('scriptWriter.exported', { format }))
  }

  const handleSendToTts = (text?: string) => {
    const payload = text?.trim() || script.trim()
    if (!payload) { message.warning(t('scriptWriter.noScriptYet')); return }
    storeContentDraft({ subject: buildGenerationSubject(topic, audience), script: payload, terms: keywordListToString(keywords), language, source: 'script-writer' })
    storeTtsDraft(payload)
    router.push(USER_ROUTES.ttsStudio)
  }

  const handleUseInCreate = () => {
    if (!script.trim()) { message.warning(t('scriptWriter.noScriptYet')); return }
    storeContentDraft({ subject: buildGenerationSubject(topic, audience), script, terms: keywordListToString(keywords), language, source: 'script-writer' })
    router.push(USER_ROUTES.create)
    message.success(t('scriptWriter.sentToCreate'))
  }

  const updateSectionText = (id: string, text: string) => {
    const nextSections = sections.map((section) => section.id === id ? { ...section, text } : section)
    setSections(nextSections); setScript(sectionsToScript(nextSections))
  }

  const applyVariation = (variation: HookVariation) => {
    setSelectedVariationId(variation.id)
    if (sections.length === 0) return
    const hookIndex = sections.findIndex((section) => section.kind === 'hook')
    const index = hookIndex >= 0 ? hookIndex : 0
    const nextSections = sections.map((section, i) => i === index ? { ...section, text: variation.text } : section)
    const nextScript = sectionsToScript(nextSections); setSections(nextSections); setScript(nextScript)
    message.success(t('scriptWriter.variationApplied'))
  }

  const addKeyword = (value: string) => { const word = value.trim(); if (!word || keywords.includes(word)) return; setKeywords((prev) => [...prev, word]) }

  const openModal = (title: string, hint: string, options?: { readOnly?: boolean; value?: string; confirmLabel?: string; onConfirm?: () => void }) => {
    setModalTitle(title); setModalHint(hint); setModalValue(options?.value ?? ''); setModalReadOnly(Boolean(options?.readOnly))
    setModalConfirmLabel(options?.confirmLabel ?? t('scriptWriter.apply')); setModalOnConfirm(() => options?.onConfirm ?? null); setModalOpen(true)
  }

  const handleSectionAction = (section: ScriptSection, action: SectionAction) => {
    if (action === 'rewrite') { setPendingRewriteSection(section); openModal(t('scriptWriter.rewriteSection', { name: section.name }), t('scriptWriter.rewriteSectionHint')); return }
    setBusySectionId(section.id); sectionMutation.mutate({ section, action })
  }

  const handleModalConfirm = () => {
    if (pendingRewriteSection) { setBusySectionId(pendingRewriteSection.id); sectionMutation.mutate({ section: pendingRewriteSection, action: 'rewrite', instruction: modalValue.trim() || undefined }); setPendingRewriteSection(null) }
    else { modalOnConfirm?.() }
    setModalOpen(false)
  }

  const runAiAction = (action: string) => {
    if (!hasScript && action !== 'hashtags') { message.warning(t('scriptWriter.noScriptYet')); return }
    if (action === 'rewrite' || action === 'shorter' || action === 'hook') { handleGenerate(); return }
    if (action === 'hashtags') {
      if (!script.trim()) { message.warning(t('scriptWriter.noScriptYet')); return }
      generateTermsMutation.mutate('hashtags', {
        onSuccess: (payload) => {
          const tags = (payload.data.video_terms ?? []).map((term) => term.startsWith('#') ? term : `#${term.replace(/\s+/g, '')}`)
          openModal(t('scriptWriter.actionHashtags'), t('scriptWriter.hashtagsHint'), { readOnly: true, value: tags.join('\n'), confirmLabel: t('common.close'), onConfirm: () => undefined })
        },
      })
      return
    }
    message.info(t('scriptWriter.actionSoon'))
  }

  const languageOptions = SCRIPT_LANGUAGES.map((code) => ({ value: code, label: code || t('common.random') }))

  return (
    <>
      <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-default bg-canvas">
        <TemplatePanel t={t} templateSearch={templateSearch} onSearchChange={setTemplateSearch} filteredTemplates={filteredTemplates} templateId={templateId} onSelectTemplate={handleTemplateSelect} history={history} onHistorySelect={(entry) => { setTemplateId(entry.templateId); setTopic(entry.title) }} onNewScript={handleNewScript} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar t={t} tab={tab} versionsCount={versions.length} readMinutes={readMinutes} credits={credits} onTabChange={(next) => { if (next === 'tts') handleSendToTts(); else setTab(next) }} onCopyAll={() => void handleCopyAll()} copyDisabled={!hasScript} />

          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-4">
              {tab === 'versions' && <VersionsPanel t={t} versions={versions} onRestore={(version) => applyScript(version.script, sectionNames)} />}

              {tab === 'edit' && (
                <div className="overflow-hidden rounded-xl border border-default bg-surface">
                  <div className="border-b border-default px-3.5 py-2.5 text-xs font-medium text-secondary">{t('scriptWriter.editScript')}</div>
                  <Input.TextArea value={script} onChange={(e) => applyScript(e.target.value, sectionNames)} autoSize={{ minRows: 16, maxRows: 28 }} className="rounded-none border-none px-3.5 py-3 text-sm leading-relaxed shadow-none" placeholder={t('scriptWriter.scriptPlaceholder')} />
                </div>
              )}

              {tab === 'generate' && (
                <div className="flex flex-col gap-3.5">
                  <BriefCard t={t} templateLabel={t(`scriptWriter.${template.nameKey}`)} platform={platform} length={length} audience={audience} language={language} topic={topic} keywords={keywords} keywordDraft={keywordDraft} addingKeyword={addingKeyword} tone={tone} credits={credits} busy={busy} languageOptions={languageOptions} onPlatformChange={setPlatform} onLengthChange={setLength} onAudienceChange={setAudience} onLanguageChange={setLanguage} onTopicChange={setTopic} onToneChange={setTone} onGenerate={handleGenerate} onRemoveKeyword={(keyword) => setKeywords((prev) => prev.filter((item) => item !== keyword))} onKeywordDraftChange={setKeywordDraft} onStartAddKeyword={() => setAddingKeyword(true)} onCancelAddKeyword={() => { setAddingKeyword(false); setKeywordDraft('') }} onConfirmAddKeyword={() => { addKeyword(keywordDraft); setKeywordDraft(''); setAddingKeyword(false) }} onAiKeywords={() => generateTermsMutation.mutate('keywords')} aiKeywordsDisabled={!script.trim() || busy} />

                  {status === 'generating' && (
                    <div className="overflow-hidden rounded-xl border border-default bg-surface">
                      <div className="px-5 py-10 text-center">
                        <div className="mb-3 flex items-center justify-center gap-2"><Spin /><span className="text-sm font-medium text-secondary">{t(LOADING_MESSAGES[loadingStep] ?? LOADING_MESSAGES[0])}</span></div>
                        <p className="text-xs text-muted">{t('scriptWriter.loading.eta')}</p>
                      </div>
                    </div>
                  )}

                  {!hasScript && status !== 'generating' && (
                    <div className="overflow-hidden rounded-xl border border-default bg-surface">
                      <div className="px-5 py-10 text-center"><PenLine size={40} className="mx-auto mb-3 text-subtle" /><p className="text-sm font-medium text-secondary">{t('scriptWriter.emptyTitle')}</p><p className="mt-2 text-xs leading-relaxed text-muted">{t('scriptWriter.emptySub')}</p></div>
                    </div>
                  )}

                  {hasScript && (
                    <OutputCard t={t} sections={sections} variations={variations} selectedVariationId={selectedVariationId} busySectionId={busySectionId} wordCount={wordCount} charCount={charCount} duration={estimateSpeechDurationWords(wordCount)} onCopyAll={() => void handleCopyAll()} onExport={() => handleExport('txt')} onSendToTts={() => handleSendToTts()} onSectionChange={updateSectionText} onSectionAction={handleSectionAction} onPreviewSection={(section) => handleSendToTts(section.text)} onApplyVariation={applyVariation} />
                  )}
                </div>
              )}
            </div>

            <InsightsPanel t={t} hasScript={hasScript} wordCount={wordCount} duration={estimateSpeechDurationWords(wordCount)} gradeLevel={gradeLevel} clarityScore={quality.clarity} quality={quality} onExportTxt={() => handleExport('txt')} onExportMd={() => handleExport('md')} onSendToTts={() => handleSendToTts()} onUseInCreate={handleUseInCreate} onAiAction={runAiAction} />
          </div>
        </div>
      </div>

      <Modal open={modalOpen} title={modalTitle} onCancel={() => { setPendingRewriteSection(null); setModalOpen(false) }} onOk={handleModalConfirm} okText={modalConfirmLabel} cancelText={t('common.cancel')}>
        <p className="mb-3 text-sm text-muted">{modalHint}</p>
        <Input.TextArea value={modalValue} onChange={(e) => setModalValue(e.target.value)} readOnly={modalReadOnly} autoSize={{ minRows: 3, maxRows: 8 }} placeholder={t('scriptWriter.rewritePlaceholder')} />
      </Modal>
    </>
  )
}

function TemplatePanel({ t, templateSearch, onSearchChange, filteredTemplates, templateId, onSelectTemplate, history, onHistorySelect, onNewScript }: {
  t: (key: string, params?: Record<string, string | number>) => string
  templateSearch: string; onSearchChange: (v: string) => void; filteredTemplates: typeof SCRIPT_TEMPLATES
  templateId: ScriptTemplateId; onSelectTemplate: (id: ScriptTemplateId) => void
  history: ScriptHistoryEntry[]; onHistorySelect: (entry: ScriptHistoryEntry) => void; onNewScript: () => void
}) {
  return (
    <aside className="hidden w-[224px] shrink-0 flex-col border-r border-default bg-surface lg:flex">
      <div className="px-3.5 py-3.5">
        <h2 className="mb-2.5 text-[13px] font-semibold text-primary">{t('scriptWriter.templates')}</h2>
        <div className="flex items-center gap-1.5 rounded-lg border border-default bg-subtle px-2.5 py-1.5"><Search size={13} className="shrink-0 text-muted" /><Input variant="borderless" value={templateSearch} onChange={(e) => onSearchChange(e.target.value)} placeholder={t('scriptWriter.searchTemplates')} className="px-0 text-xs shadow-none" /></div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="px-3.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.contentType')}</p>
        {filteredTemplates.map((item) => {
          const Icon = item.icon; const active = item.id === templateId
          return (
            <button key={item.id} type="button" onClick={() => onSelectTemplate(item.id)} className={['flex w-full items-center gap-2 border-l-2 px-3.5 py-1.5 text-left transition-colors', active ? 'border-accent bg-accent-muted' : 'border-transparent hover:bg-subtle'].join(' ')}>
              <span className={['flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.iconClass].join(' ')}><Icon size={14} /></span>
              <span className="min-w-0 flex-1">
                <span className={['block truncate text-xs font-medium', active ? 'text-accent' : 'text-primary'].join(' ')}>{t(`scriptWriter.${item.nameKey}`)}</span>
                <span className="block truncate text-[10px] text-muted">{t(`scriptWriter.${item.metaKey}`)}</span>
              </span>
            </button>
          )
        })}
        <p className="mt-2 px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.recentScripts')}</p>
        {history.length === 0 ? <p className="px-3.5 pb-3 text-xs text-muted">{t('scriptWriter.noHistory')}</p> : history.map((entry) => (
          <button key={entry.id} type="button" onClick={() => onHistorySelect(entry)} className="flex w-full items-center gap-2 px-3.5 py-1.5 text-left hover:bg-subtle">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span className="min-w-0 flex-1 truncate text-xs text-secondary">{entry.title}</span>
            <span className="text-[10px] text-muted">{relativeHistoryTime(entry.createdAt)}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto border-t border-default p-3"><Button type="primary" block icon={<Plus size={14} />} onClick={onNewScript}>{t('scriptWriter.newScript')}</Button></div>
    </aside>
  )
}

function TopBar({ t, tab, versionsCount, readMinutes, credits, onTabChange, onCopyAll, copyDisabled }: {
  t: (key: string, params?: Record<string, string | number>) => string; tab: WorkspaceTab
  versionsCount: number; readMinutes: number; credits: number
  onTabChange: (tab: WorkspaceTab) => void; onCopyAll: () => void; copyDisabled: boolean
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-0 border-b border-default bg-surface px-4">
      {(['generate', 'edit', 'versions', 'tts'] as WorkspaceTab[]).map((item) => (
        <button key={item} type="button" onClick={() => onTabChange(item)} className={['flex h-12 items-center border-b-2 px-3.5 text-[13px] transition-colors', tab === item ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-secondary'].join(' ')}>
          {item === 'versions' ? `${t('scriptWriter.tab.versions')} (${versionsCount})` : t(`scriptWriter.tab.${item}`)}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary sm:inline-flex"><Clock size={13} />{readMinutes > 0 ? `~${readMinutes}` : '—'} {t('scriptWriter.minRead')}</span>
        <span className="hidden items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary sm:inline-flex"><Sparkles size={13} />{credits} {t('scriptWriter.credits')}</span>
        <Button size="small" icon={<Copy size={13} />} onClick={onCopyAll} disabled={copyDisabled}>{t('scriptWriter.copyAll')}</Button>
      </div>
    </div>
  )
}

function BriefCard(props: {
  t: (key: string, params?: Record<string, string | number>) => string
  templateLabel: string; platform: ScriptPlatform; length: ScriptLength; audience: string; language: string; topic: string
  keywords: string[]; keywordDraft: string; addingKeyword: boolean; tone: ScriptTone; credits: number; busy: boolean
  languageOptions: Array<{ value: string; label: string }>
  onPlatformChange: (v: ScriptPlatform) => void; onLengthChange: (v: ScriptLength) => void; onAudienceChange: (v: string) => void
  onLanguageChange: (v: string) => void; onTopicChange: (v: string) => void; onToneChange: (v: ScriptTone) => void; onGenerate: () => void
  onRemoveKeyword: (k: string) => void; onKeywordDraftChange: (v: string) => void; onStartAddKeyword: () => void; onCancelAddKeyword: () => void
  onConfirmAddKeyword: () => void; onAiKeywords: () => void; aiKeywordsDisabled: boolean
}) {
  const { t, templateLabel, platform, length, audience, language, topic, keywords, keywordDraft, addingKeyword, tone, credits, busy, languageOptions, onPlatformChange, onLengthChange, onAudienceChange, onLanguageChange, onTopicChange, onToneChange, onGenerate, onRemoveKeyword, onKeywordDraftChange, onStartAddKeyword, onCancelAddKeyword, onConfirmAddKeyword, onAiKeywords, aiKeywordsDisabled } = props
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface">
      <div className="flex items-center gap-2 border-b border-default px-3.5 py-2.5"><Sparkles size={14} className="text-muted" /><span className="text-xs font-medium text-secondary">{t('scriptWriter.brief')}</span><span className="ml-auto rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold text-accent">{templateLabel}</span></div>
      <div className="grid grid-cols-1 gap-2.5 p-3.5 md:grid-cols-2">
        <FieldSelect label={t('scriptWriter.platformLabel')} value={platform} onChange={(v) => onPlatformChange(v as ScriptPlatform)} options={SCRIPT_PLATFORMS.map((item) => ({ value: item, label: t(`scriptWriter.platform.${item}`) }))} />
        <FieldSelect label={t('scriptWriter.targetLength')} value={length} onChange={(v) => onLengthChange(v as ScriptLength)} options={SCRIPT_LENGTHS.map((item) => ({ value: item, label: t(`scriptWriter.length.${item}`) }))} />
        <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.audience')}</label><Input size="small" value={audience} onChange={(e) => onAudienceChange(e.target.value)} placeholder={t('scriptWriter.audiencePlaceholder')} /></div>
        <FieldSelect label={t('scriptWriter.language')} value={language} onChange={onLanguageChange} options={languageOptions} />
      </div>
      <div className="px-3.5 pb-3.5"><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.topic')}</label><Input.TextArea value={topic} onChange={(e) => onTopicChange(e.target.value)} rows={3} placeholder={t('scriptWriter.topicPlaceholder')} className="text-sm leading-relaxed" /></div>
      <div className="px-3.5 pb-2.5">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.keywordsLabel')}</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.map((keyword) => (<span key={keyword} className="inline-flex items-center gap-1 rounded-full border border-default bg-subtle px-2.5 py-1 text-xs text-secondary">{keyword}<button type="button" onClick={() => onRemoveKeyword(keyword)} aria-label="Remove"><X size={12} className="text-muted hover:text-error" /></button></span>))}
          {addingKeyword ? (<Input size="small" autoFocus value={keywordDraft} onChange={(e) => onKeywordDraftChange(e.target.value)} onPressEnter={onConfirmAddKeyword} onBlur={() => { onConfirmAddKeyword(); onCancelAddKeyword() }} placeholder={t('scriptWriter.addKeyword')} className="max-w-[120px] rounded-full text-xs" />) : (<button type="button" onClick={onStartAddKeyword} className="inline-flex items-center gap-1 rounded-full border border-dashed border-default px-2.5 py-1 text-xs text-muted hover:bg-subtle"><Plus size={11} />{t('scriptWriter.addKeyword')}</button>)}
          <button type="button" onClick={onAiKeywords} disabled={aiKeywordsDisabled} className="inline-flex items-center gap-1 rounded-full border border-dashed border-default px-2.5 py-1 text-xs text-muted hover:bg-subtle disabled:opacity-50"><Sparkles size={11} />{t('scriptWriter.aiKeywords')}</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-default px-3.5 py-2.5">
        <div className="flex flex-1 flex-wrap gap-1.5">{SCRIPT_TONES.map((item) => (<button key={item} type="button" onClick={() => onToneChange(item)} className={['rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors', tone === item ? 'border-accent/40 bg-accent-muted text-accent' : 'border-default text-muted hover:border-accent/30 hover:text-accent'].join(' ')}>{t(`scriptWriter.tone.${item}`)}</button>))}</div>
        <div className="flex items-center gap-2"><span className="text-[11px] text-muted">{credits} {t('scriptWriter.credits')}</span><Button type="primary" size="small" icon={busy ? <Spin size="small" /> : <Sparkles size={13} />} onClick={onGenerate} disabled={busy || !topic.trim()}>{t('scriptWriter.generateScript')}</Button></div>
      </div>
    </div>
  )
}

function OutputCard(props: {
  t: (key: string, params?: Record<string, string | number>) => string
  sections: ScriptSection[]; variations: HookVariation[]; selectedVariationId: string | null; busySectionId: string | null
  wordCount: number; charCount: number; duration: string
  onCopyAll: () => void; onExport: () => void; onSendToTts: () => void
  onSectionChange: (id: string, text: string) => void; onSectionAction: (section: ScriptSection, action: SectionAction) => void
  onPreviewSection: (section: ScriptSection) => void; onApplyVariation: (variation: HookVariation) => void
}) {
  const { t, sections, variations, selectedVariationId, busySectionId, wordCount, charCount, duration, onCopyAll, onExport, onSendToTts, onSectionChange, onSectionAction, onPreviewSection, onApplyVariation } = props
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-default px-3.5 py-2.5"><FileText size={14} className="text-muted" /><span className="text-xs font-medium text-secondary">{t('scriptWriter.generatedScript')}</span><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{t('scriptWriter.ready')}</span><div className="ml-auto flex flex-wrap gap-1.5"><Button size="small" icon={<Copy size={12} />} onClick={onCopyAll}>{t('scriptWriter.copyAll')}</Button><Button size="small" icon={<Download size={12} />} onClick={onExport}>{t('scriptWriter.export')}</Button><Button size="small" type="primary" icon={<Mic size={12} />} onClick={onSendToTts}>{t('scriptWriter.sendToTts')}</Button></div></div>
      <div className="px-3.5 py-1">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-default py-3 last:border-b-0">
            <span className={['mb-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold', SECTION_STYLES[section.kind] ?? SECTION_STYLES.body].join(' ')}><Zap size={11} />{section.name}</span>
            <div contentEditable suppressContentEditableWarning onInput={(e) => onSectionChange(section.id, e.currentTarget.textContent ?? '')} className="min-h-[40px] rounded-lg px-2 py-1.5 text-[13px] leading-relaxed text-primary outline-none focus:bg-subtle">{section.text}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <ToolButton icon={RefreshCw} label={t('scriptWriter.rewrite')} loading={busySectionId === section.id} onClick={() => onSectionAction(section, 'rewrite')} />
              <ToolButton icon={Plus} label={t('scriptWriter.expand')} loading={busySectionId === section.id} onClick={() => onSectionAction(section, 'expand')} />
              <ToolButton icon={ArrowUp} label={t('scriptWriter.shorten')} loading={busySectionId === section.id} onClick={() => onSectionAction(section, 'shorten')} />
              <ToolButton icon={Edit3} label={t('scriptWriter.adjustTone')} loading={busySectionId === section.id} onClick={() => onSectionAction(section, 'tone')} />
              <ToolButton icon={Mic} label={t('scriptWriter.previewTts')} onClick={() => onPreviewSection(section)} />
            </div>
          </div>
        ))}
      </div>
      {variations.length > 0 && (
        <div className="border-t border-default px-3.5 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.hookVariations')}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {variations.map((variation) => (<button key={variation.id} type="button" onClick={() => onApplyVariation(variation)} className={['rounded-lg border p-2.5 text-left transition-colors', selectedVariationId === variation.id ? 'border-accent bg-accent-muted' : 'border-default hover:border-accent/40 hover:bg-accent-muted/40'].join(' ')}><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t(`scriptWriter.${variation.labelKey}`)}</p><p className="mt-1 text-xs leading-relaxed text-secondary">{variation.text}</p></button>))}
          </div>
        </div>
      )}
      <div className="flex gap-4 border-t border-default bg-subtle px-3.5 py-2">
        <StatInline value={String(wordCount)} label={t('scriptWriter.words')} /><StatInline value={duration} label={t('scriptWriter.estDuration')} /><StatInline value={String(charCount)} label={t('scriptWriter.characters')} /><StatInline value={String(sections.length)} label={t('scriptWriter.sections')} />
      </div>
    </div>
  )
}

function VersionsPanel({ t, versions, onRestore }: { t: (key: string, params?: Record<string, string | number>) => string; versions: ScriptVersion[]; onRestore: (version: ScriptVersion) => void }) {
  if (versions.length === 0) return <p className="text-sm text-muted">{t('scriptWriter.noVersions')}</p>
  return (
    <div className="space-y-2">{versions.map((version, index) => (
      <div key={version.id} className="flex items-center justify-between rounded-xl border border-default bg-surface px-4 py-3">
        <div><p className="text-sm font-medium text-primary">{t('scriptWriter.versionLabel', { number: versions.length - index })}</p><p className="text-xs text-muted">{relativeHistoryTime(version.createdAt)} · {version.sections.map((s) => s.name).join(' → ')}</p></div>
        <Button size="small" onClick={() => onRestore(version)}>{t('scriptWriter.restoreVersion')}</Button>
      </div>
    ))}</div>
  )
}

function InsightsPanel({ t, hasScript, wordCount, duration, gradeLevel, clarityScore, quality, onExportTxt, onExportMd, onSendToTts, onUseInCreate, onAiAction }: {
  t: (key: string) => string; hasScript: boolean; wordCount: number; duration: string; gradeLevel: number; clarityScore: number
  quality: ReturnType<typeof computeQualityScores>; onExportTxt: () => void; onExportMd: () => void; onSendToTts: () => void; onUseInCreate: () => void; onAiAction: (action: string) => void
}) {
  return (
    <aside className="hidden w-[204px] shrink-0 flex-col border-l border-default bg-surface xl:flex">
      <div className="border-b border-default px-3.5 py-3"><h3 className="text-xs font-semibold text-secondary">{t('scriptWriter.insights')}</h3></div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-default px-3.5 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.stats')}</p>
          <div className="grid grid-cols-2 gap-1.5"><StatBox value={hasScript ? String(wordCount) : '—'} label={t('scriptWriter.words')} /><StatBox value={hasScript ? duration : '—'} label={t('scriptWriter.estDuration')} /><StatBox value={hasScript ? String(gradeLevel) : '—'} label={t('scriptWriter.gradeLevel')} /><StatBox value={hasScript ? String(clarityScore) : '—'} label={t('scriptWriter.clarityScore')} /></div>
        </div>
        {hasScript && (
          <div className="border-b border-default px-3.5 py-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.quality')}</p>
            <ScoreRow label={t('scriptWriter.engagement')} value={quality.engagement} color="bg-emerald-500" />
            <ScoreRow label={t('scriptWriter.clarity')} value={quality.clarity} color="bg-teal-500" />
            <ScoreRow label={t('scriptWriter.seoFit')} value={quality.seo} color="bg-amber-500" />
            <ScoreRow label={t('scriptWriter.hookStrength')} value={quality.hookStrength} color="bg-emerald-500" />
          </div>
        )}
        <div className="border-b border-default px-3.5 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{t('scriptWriter.aiActions')}</p>
          <div className="space-y-0.5">
            <ActionRow icon={RefreshCw} tone="purple" label={t('scriptWriter.actionRewrite')} onClick={() => onAiAction('rewrite')} />
            <ActionRow icon={ArrowUp} tone="teal" label={t('scriptWriter.actionShorter')} onClick={() => onAiAction('shorter')} />
            <ActionRow icon={List} tone="green" label={t('scriptWriter.actionChapters')} onClick={() => onAiAction('chapters')} />
            <ActionRow icon={Hash} tone="amber" label={t('scriptWriter.actionHashtags')} onClick={() => onAiAction('hashtags')} />
            <ActionRow icon={Sparkles} tone="coral" label={t('scriptWriter.actionHook')} onClick={() => onAiAction('hook')} />
            <ActionRow icon={Languages} tone="purple" label={t('scriptWriter.actionTranslate')} onClick={() => onAiAction('translate')} />
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-1.5 p-3.5">
        <Button block icon={<Clapperboard size={14} />} onClick={onUseInCreate} disabled={!hasScript}>{t('scriptWriter.useInCreate')}</Button>
        <Button block icon={<FileText size={14} />} onClick={onExportTxt} disabled={!hasScript}>{t('scriptWriter.exportTxt')}</Button>
        <Button block icon={<BarChart3 size={14} />} onClick={onExportMd} disabled={!hasScript}>{t('scriptWriter.exportMd')}</Button>
        <Button type="primary" block icon={<Mic size={14} />} onClick={onSendToTts} disabled={!hasScript}>{t('scriptWriter.sendToTtsStudio')}</Button>
      </div>
    </aside>
  )
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (<div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</label><Select size="small" value={value} onChange={onChange} options={options} className="w-full" /></div>)
}

function StatBox({ value, label }: { value: string; label: string }) {
  return <div className="rounded-lg bg-subtle px-2 py-2 text-center"><div className="text-[15px] font-semibold text-primary">{value}</div><div className="text-[10px] text-muted">{label}</div></div>
}

function StatInline({ value, label }: { value: string; label: string }) {
  return <div className="text-center"><div className="text-[15px] font-semibold text-primary">{value}</div><div className="text-[10px] text-muted">{label}</div></div>
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (<div className="mb-1.5 flex items-center gap-2"><span className="w-[68px] shrink-0 text-[11px] text-secondary">{label}</span><div className="h-1 flex-1 rounded bg-subtle"><div className={`h-full rounded ${color}`} style={{ width: `${value}%` }} /></div><span className="w-5 text-right text-[11px] font-medium text-secondary">{value}</span></div>)
}

function ToolButton({ icon: Icon, label, onClick, loading }: { icon: typeof RefreshCw; label: string; onClick: () => void; loading?: boolean }) {
  return (<button type="button" onClick={onClick} disabled={loading} className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[11px] text-muted transition-colors hover:border-default hover:bg-subtle disabled:opacity-50">{loading ? <Spin size="small" /> : <Icon size={12} />}{label}</button>)
}

function ActionRow({ icon: Icon, tone, label, onClick }: { icon: typeof RefreshCw; tone: 'purple' | 'teal' | 'green' | 'amber' | 'coral'; label: string; onClick: () => void }) {
  const toneClass = { purple: 'bg-accent-muted text-accent', teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400', green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', coral: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' }[tone]
  return (<button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded-lg py-1.5 hover:bg-subtle"><span className={`flex h-6 w-6 items-center justify-center rounded-md ${toneClass}`}><Icon size={13} /></span><span className="text-xs text-secondary">{label}</span></button>)
}
