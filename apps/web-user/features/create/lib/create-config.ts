import type { CreateStudioConfig, ContentGenerationAction } from '@/types/create-config'
import { NO_VOICE_ID } from '@/types/tts'
import { CREATE_CONFIG_DEFAULTS } from '@/store/video-store'
import type { CreateFlowStepId } from '@vokcg/constants'

export { CREATE_CONFIG_DEFAULTS }

export type DeepPartialCreateConfig = {
  [K in keyof CreateStudioConfig]?: CreateStudioConfig[K] extends object
    ? Partial<CreateStudioConfig[K]>
    : CreateStudioConfig[K]
}

export function mergeCreateConfig(partial?: DeepPartialCreateConfig | null): CreateStudioConfig {
  if (!partial) return CREATE_CONFIG_DEFAULTS
  return {
    content: { ...CREATE_CONFIG_DEFAULTS.content, ...partial.content },
    visuals: { ...CREATE_CONFIG_DEFAULTS.visuals, ...partial.visuals },
    audio: { ...CREATE_CONFIG_DEFAULTS.audio, ...partial.audio },
    subtitles: { ...CREATE_CONFIG_DEFAULTS.subtitles, ...partial.subtitles },
  }
}

export type ScriptWriterPayloadExtras = {
  generationMode?: 'auto' | 'full' | 'structured' | 'section'
  sectionAction?: 'rewrite' | 'expand' | 'shorten' | 'tone'
  sectionName?: string
  sectionText?: string
  sectionInstruction?: string
  tone?: string
  sectionNames?: string[]
}

export type TermsPayloadPurpose = 'search' | 'keywords' | 'hashtags'

export function configToScriptPayload(config: CreateStudioConfig, extras?: ScriptWriterPayloadExtras) {
  const { content } = config
  return {
    video_subject: content.subject,
    video_language: content.language,
    paragraph_number: content.paragraphCount,
    video_script_prompt: content.scriptPrompt,
    custom_system_prompt: content.systemPrompt,
    generation_mode: extras?.generationMode ?? 'auto',
    section_action: extras?.sectionAction,
    section_name: extras?.sectionName,
    section_text: extras?.sectionText,
    section_instruction: extras?.sectionInstruction,
    tone: extras?.tone,
    section_names: extras?.sectionNames,
  }
}

export function configToTermsPayload(config: CreateStudioConfig, amount = 5, purpose: TermsPayloadPurpose = 'search') {
  const { content } = config
  return {
    video_subject: content.subject,
    video_script: content.script,
    amount,
    terms_purpose: purpose,
    video_language: content.language,
  }
}

export function canRunContentGeneration(action: ContentGenerationAction, config: CreateStudioConfig): boolean {
  const { content } = config
  switch (action) {
    case 'generateScript': return Boolean(content.subject.trim())
    case 'generateTerms': return Boolean(content.script.trim())
    default: return false
  }
}

export const CONTENT_GENERATION_DEPS: Record<
  ContentGenerationAction,
  { requires: readonly (keyof CreateStudioConfig['content'])[]; provides: readonly (keyof CreateStudioConfig['content'])[] }
> = {
  generateScript: {
    requires: ['subject', 'language', 'paragraphCount', 'scriptPrompt', 'systemPrompt'],
    provides: ['script'],
  },
  generateTerms: {
    requires: ['subject', 'script'],
    provides: ['terms'],
  },
}

export function configToVideoPayload(config: CreateStudioConfig) {
  const { content, visuals, audio, subtitles } = config
  return {
    video_subject: content.subject,
    video_script: content.script,
    video_terms: content.terms,
    video_language: content.language,
    paragraph_number: content.paragraphCount,
    video_script_prompt: content.scriptPrompt,
    custom_system_prompt: content.systemPrompt,
    video_source: visuals.source,
    video_aspect: visuals.aspect,
    video_concat_mode: visuals.concatMode,
    video_transition_mode: visuals.transitionMode || null,
    video_clip_duration: visuals.clipDuration,
    video_count: visuals.count,
    ...(visuals.source === 'local' && visuals.materials.length > 0
      ? { video_materials: visuals.materials }
      : {}),
    voice_name: audio.voiceName,
    voice_volume: audio.voiceVolume,
    voice_rate: audio.voiceRate,
    tts_style_prompt: audio.stylePrompt,
    bgm_type: audio.bgmType,
    bgm_file: audio.bgmFile,
    bgm_volume: audio.bgmVolume,
    subtitle_enabled: subtitles.enabled,
    subtitle_position: subtitles.position,
    custom_position: subtitles.customPosition,
    font_name: subtitles.fontName,
    text_fore_color: subtitles.textForeColor,
    font_size: subtitles.fontSize,
    stroke_color: subtitles.strokeColor,
    stroke_width: subtitles.strokeWidth,
    text_background_color: subtitles.bgEnabled ? subtitles.textBgColor : false,
    rounded_subtitle_background: subtitles.roundedBg,
  }
}

export type CreateFlowStepValidation = {
  valid: boolean
  messageKey: string | null
}

export function validateCreateFlowStep(stepId: CreateFlowStepId, config: CreateStudioConfig): CreateFlowStepValidation {
  switch (stepId) {
    case 'content': return validateContent(config)
    case 'visuals': return validateVisuals(config)
    case 'audio': return validateAudio(config)
    case 'subtitles': return validateSubtitles(config)
    case 'review': {
      const checks = ['content', 'visuals', 'audio', 'subtitles'] as CreateFlowStepId[]
      for (const step of checks) {
        const result = validateCreateFlowStep(step, config)
        if (!result.valid) return result
      }
      return { valid: true, messageKey: null }
    }
    default: return { valid: true, messageKey: null }
  }
}

function validateContent(config: CreateStudioConfig): CreateFlowStepValidation {
  const { subject, script } = config.content
  if (subject.trim() || script.trim()) return { valid: true, messageKey: null }
  return { valid: false, messageKey: 'create.validation.contentRequired' }
}

function validateVisuals(config: CreateStudioConfig): CreateFlowStepValidation {
  const { count, clipDuration, source, materials } = config.visuals
  if (source === 'local' && materials.length === 0) return { valid: false, messageKey: 'create.validation.visualsRequired' }
  if (count < 1) return { valid: false, messageKey: 'create.validation.countRequired' }
  if (clipDuration < 1) return { valid: false, messageKey: 'create.validation.clipDurationRequired' }
  return { valid: true, messageKey: null }
}

function validateAudio(config: CreateStudioConfig): CreateFlowStepValidation {
  if (!config.audio.voiceName || config.audio.voiceName === NO_VOICE_ID) {
    return { valid: false, messageKey: 'create.validation.voiceRequired' }
  }
  return { valid: true, messageKey: null }
}

function validateSubtitles(_config: CreateStudioConfig): CreateFlowStepValidation {
  return { valid: true, messageKey: null }
}
