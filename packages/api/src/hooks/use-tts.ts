import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteApi, getApi, postBlob, uploadFormData } from '../client'
import type { ApiResponse, TtsServersData, TtsVoicesData, VoiceCloneProfile } from '@vokcg/types'

export const TTS_SERVERS_KEY = ['tts', 'servers'] as const
export const TTS_CLONES_KEY = ['tts', 'voice-clones'] as const

export function useTtsServers() {
  return useQuery({
    queryKey: TTS_SERVERS_KEY,
    queryFn: () => getApi<ApiResponse<TtsServersData>>('/api/v1/tts/servers'),
    select: (res) => res.data.servers,
    staleTime: 60_000,
  })
}

export function useTtsVoices(ttsServer: string, locale: string, currentVoice: string) {
  return useQuery({
    queryKey: [...TTS_SERVERS_KEY, 'voices', ttsServer, locale, currentVoice],
    queryFn: () =>
      getApi<ApiResponse<TtsVoicesData>>('/api/v1/tts/voices', {
        tts_server: ttsServer,
        locale,
        current_voice: currentVoice,
      }),
    select: (res) => res.data,
    enabled: Boolean(ttsServer),
    staleTime: 30_000,
  })
}

export function useVoiceClones(provider?: string, q?: string) {
  return useQuery({
    queryKey: [...TTS_CLONES_KEY, provider ?? 'all', q ?? ''],
    queryFn: () =>
      getApi<ApiResponse<{ clones: VoiceCloneProfile[] }>>('/api/v1/tts/voice-clones', {
        provider: provider ?? '',
        q: q ?? '',
      }),
    select: (res) => res.data.clones,
    staleTime: 15_000,
  })
}

export function useCreateVoiceClone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      uploadFormData<ApiResponse<{ clone: VoiceCloneProfile }>>('/api/v1/tts/voice-clones', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TTS_CLONES_KEY })
      queryClient.invalidateQueries({ queryKey: TTS_SERVERS_KEY })
    },
  })
}

export function useDeleteVoiceClone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cloneId: string) =>
      deleteApi<ApiResponse<{ ok: boolean }>>(`/api/v1/tts/voice-clones/${cloneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TTS_CLONES_KEY })
      queryClient.invalidateQueries({ queryKey: TTS_SERVERS_KEY })
    },
  })
}

export function useVoicePreview() {
  return useMutation({
    mutationFn: (body: {
      text: string
      voice_name: string
      voice_volume: number
      voice_rate: number
      style_prompt?: string
    }) => postBlob('/api/v1/tts/preview', body),
  })
}
