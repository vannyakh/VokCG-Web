'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { postApi, TASKS_KEY } from '@vokcg/api'
import { getCreateStudioConfig, useCreateStudioStore, usePreviewOutputStore, useVideoStore } from '@vokcg/store'
import { USER_ROUTES } from '@vokcg/constants'
import type { ScriptResponse, TaskCreateResponse, TermsResponse } from '@vokcg/types'
import { useLocale } from '@vokcg/i18n'
import { useAppMessage } from '@vokcg/ui'
import { configToScriptPayload, configToTermsPayload, configToVideoPayload } from '../lib/create-config'

export function useVideoActions() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()
  const message = useAppMessage()
  const patchConfig = useVideoStore((s) => s.patchConfig)

  const generateScriptMutation = useMutation({
    mutationFn: () => {
      const config = getCreateStudioConfig()
      return postApi<ScriptResponse>('/api/v1/scripts', configToScriptPayload(config))
    },
    onSuccess: (payload) =>
      patchConfig('content', { script: payload.data.video_script || '' }),
  })

  const generateTermsMutation = useMutation({
    mutationFn: () => {
      const config = getCreateStudioConfig()
      return postApi<TermsResponse>('/api/v1/terms', configToTermsPayload(config))
    },
    onSuccess: (payload) =>
      patchConfig('content', { terms: (payload.data.video_terms || []).join(', ') }),
  })

  const createVideoMutation = useMutation({
    mutationFn: () => {
      const config = getCreateStudioConfig()
      return postApi<TaskCreateResponse>('/api/v1/videos', configToVideoPayload(config))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
      useVideoStore.getState().resetForm()
      useCreateStudioStore.getState().resetFlow()
      usePreviewOutputStore.getState().reset()
      message.success(t('create.steps.review.started'))
      router.push(USER_ROUTES.tasks)
    },
  })

  const submitCreateVideo = () => {
    createVideoMutation.mutate(undefined, {
      onSettled: (_data, error) => {
        if (!error) createVideoMutation.reset()
      },
    })
  }

  return { generateScriptMutation, generateTermsMutation, createVideoMutation, submitCreateVideo }
}
