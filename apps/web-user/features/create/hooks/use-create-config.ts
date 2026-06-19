import { useMemo } from 'react'
import { useVideoStore } from '@vokcg/store'
import type { ContentGenerationAction, CreateConfigSection, CreateStudioConfig } from '@vokcg/types'
import { canRunContentGeneration, CONTENT_GENERATION_DEPS } from '../lib/create-config'

export type CreateContentGeneration = {
  canGenerateScript: boolean
  canGenerateTerms: boolean
  deps: typeof CONTENT_GENERATION_DEPS
  canRun: (action: ContentGenerationAction) => boolean
}

function useContentGeneration(config: CreateStudioConfig): CreateContentGeneration {
  return useMemo(
    () => ({
      canGenerateScript: canRunContentGeneration('generateScript', config),
      canGenerateTerms: canRunContentGeneration('generateTerms', config),
      deps: CONTENT_GENERATION_DEPS,
      canRun: (action: ContentGenerationAction) => canRunContentGeneration(action, config),
    }),
    [config],
  )
}

export function useCreateConfig(): {
  config: CreateStudioConfig
  patchConfig: <S extends CreateConfigSection>(section: S, partial: Partial<CreateStudioConfig[S]>) => void
  setConfig: (config: CreateStudioConfig) => void
  resetConfig: () => void
  contentGeneration: CreateContentGeneration
}

export function useCreateConfig<S extends CreateConfigSection>(section: S): {
  config: CreateStudioConfig
  section: CreateStudioConfig[S]
  patch: (partial: Partial<CreateStudioConfig[S]>) => void
  contentGeneration: CreateContentGeneration
}

export function useCreateConfig<S extends CreateConfigSection | undefined>(section?: S) {
  const config = useVideoStore((s) => s.config)
  const patchConfig = useVideoStore((s) => s.patchConfig)
  const setConfig = useVideoStore((s) => s.setConfig)
  const resetConfig = useVideoStore((s) => s.resetForm)
  const contentGeneration = useContentGeneration(config)

  if (section) {
    return {
      config,
      section: config[section],
      patch: (partial: Partial<CreateStudioConfig[typeof section]>) =>
        patchConfig(section, partial as never),
      contentGeneration,
    }
  }

  return { config, patchConfig, setConfig, resetConfig, contentGeneration }
}
