'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useVideoStore } from '@/store'
import { USER_ROUTES } from '@vokcg/constants'
import {
  clearContentDraft,
  contentDraftFromCreateContent,
  loadContentDraft,
  storeContentDraft,
  type ContentDraft,
} from '../lib/content-draft'

export function useContentDraft() {
  const router = useRouter()
  const patchConfig = useVideoStore((s) => s.patchConfig)
  const content = useVideoStore((s) => s.config.content)

  const saveFromCreate = useCallback(() => {
    return storeContentDraft(contentDraftFromCreateContent(content))
  }, [content])

  const saveDraft = useCallback((draft: Partial<ContentDraft>) => {
    return storeContentDraft(draft)
  }, [])

  const openInScriptWriter = useCallback(() => {
    saveFromCreate()
    router.push(USER_ROUTES.scriptWriter)
  }, [router, saveFromCreate])

  const openInCreate = useCallback(
    (draft: Partial<ContentDraft>) => {
      storeContentDraft({ ...draft, source: draft.source ?? 'script-writer' })
      router.push(USER_ROUTES.create)
    },
    [router],
  )

  const applyDraftToCreate = useCallback((): boolean => {
    const draft = loadContentDraft()
    if (!draft) return false
    patchConfig('content', {
      subject: draft.subject,
      script: draft.script,
      terms: draft.terms,
      language: draft.language,
    })
    clearContentDraft()
    return true
  }, [patchConfig])

  const readDraft = useCallback(() => loadContentDraft(), [])

  return {
    saveFromCreate,
    saveDraft,
    openInScriptWriter,
    openInCreate,
    applyDraftToCreate,
    readDraft,
    clearContentDraft,
  }
}
