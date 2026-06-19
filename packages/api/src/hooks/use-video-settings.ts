import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteApi, getApi, putApi, uploadFormData } from '../client'

export type VideoCodecOption = { value: string; label: string }

export type VideoSettingsData = {
  video_codec: string
  video_source: string
  codec_options: VideoCodecOption[]
}

type VideoSettingsResponse = { data: VideoSettingsData }

export type VideoSettingsUpdate = {
  video_codec?: string
  video_source?: string
}

type VideoMaterialUploadResponse = { data: { file: string } }
type VideoMaterialDeleteResponse = { data: { file: string } }

const VIDEO_SETTINGS_KEY = ['video-app-settings'] as const

export function useVideoAppSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: VIDEO_SETTINGS_KEY,
    queryFn: () => getApi<VideoSettingsResponse>('/api/v1/settings/video'),
  })

  const mutation = useMutation({
    mutationFn: (body: VideoSettingsUpdate) =>
      putApi<VideoSettingsResponse>('/api/v1/settings/video', body),
    onSuccess: (payload) => {
      queryClient.setQueryData(VIDEO_SETTINGS_KEY, payload)
    },
  })

  return {
    settings: query.data?.data,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    saveError: mutation.error,
    saveSettings: mutation.mutate,
    saveSettingsAsync: mutation.mutateAsync,
    refetch: query.refetch,
  }
}

export function useUploadVideoMaterial() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadFormData<VideoMaterialUploadResponse>('/api/v1/video_materials', formData)
    },
  })
}

export function useDeleteVideoMaterial() {
  return useMutation({
    mutationFn: (filename: string) =>
      deleteApi<VideoMaterialDeleteResponse>(`/api/v1/video_materials?file=${encodeURIComponent(filename)}`),
  })
}

export const VIDEO_ENCODER_HELP =
  'Advanced option. libx264 is the safest default. When a hardware encoder is selected, the app falls back to libx264 if the current FFmpeg, GPU, or driver cannot use it.'
