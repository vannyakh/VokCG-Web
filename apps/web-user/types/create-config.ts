export type VideoMaterial = {
  provider: string
  url: string
  duration: number
}

export type CreateStudioContentConfig = {
  subject: string
  script: string
  terms: string
  language: string
  paragraphCount: number
  scriptPrompt: string
  systemPrompt: string
}

export type CreateStudioVisualsConfig = {
  source: string
  aspect: string
  concatMode: string
  transitionMode: string
  clipDuration: number
  count: number
  materials: VideoMaterial[]
  uploadedMaterialNames: string[]
}

export type CreateStudioAudioConfig = {
  ttsServer: string
  voiceName: string
  voiceVolume: number
  voiceRate: number
  stylePrompt: string
  bgmType: string
  bgmFile: string
  bgmVolume: number
}

export type CreateStudioSubtitlesConfig = {
  enabled: boolean
  position: string
  customPosition: number
  fontName: string
  textForeColor: string
  fontSize: number
  strokeColor: string
  strokeWidth: number
  bgEnabled: boolean
  textBgColor: string
  roundedBg: boolean
}

export type CreateStudioConfig = {
  content: CreateStudioContentConfig
  visuals: CreateStudioVisualsConfig
  audio: CreateStudioAudioConfig
  subtitles: CreateStudioSubtitlesConfig
}

export type CreateConfigSection = keyof CreateStudioConfig

export type ContentGenerationAction = 'generateScript' | 'generateTerms'
