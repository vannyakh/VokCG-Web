'use client'

import { Button, Modal, Upload } from 'antd'
import { Upload as UploadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useUpdateAvatar } from '@/api'
import { useAppMessage } from '@vokcg/ui'
import { UserAvatar } from '@vokcg/ui'

type UpdateAvatarModalProps = {
  open: boolean
  onClose: () => void
  username: string
  avatarUrl?: string | null
  avatarRevision?: number
  onSuccess?: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function UpdateAvatarModal({ open, onClose, username, avatarUrl, avatarRevision, onSuccess }: UpdateAvatarModalProps) {
  const { t } = useLocale()
  const message = useAppMessage()
  const updateAvatar = useUpdateAvatar()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const reset = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    if (!selectedFile) return
    try {
      await updateAvatar.mutateAsync(selectedFile)
      message.success(t('settings.profile.avatarUpdated'))
      onSuccess?.()
      handleClose()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <Modal
      title={t('settings.profile.updateAvatar')}
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleClose}>{t('common.cancel')}</Button>,
        <Button
          key="save"
          type="primary"
          loading={updateAvatar.isPending}
          disabled={!selectedFile}
          onClick={handleSave}
        >
          {updateAvatar.isPending ? t('settings.profile.uploadingAvatar') : t('settings.profile.saveAvatar')}
        </Button>,
      ]}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={username}
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-[3px] ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
          />
        ) : (
          <UserAvatar
            username={username}
            avatarUrl={avatarUrl}
            revision={avatarRevision}
            size="xl"
            className="ring-[3px] ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
          />
        )}
        <p className="text-center text-sm text-muted">{t('settings.profile.updateAvatarHint')}</p>
        <Upload
          accept={ACCEPTED_TYPES.join(',')}
          showUploadList={false}
          beforeUpload={(file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
              message.error(t('settings.profile.updateAvatarHint'))
              return Upload.LIST_IGNORE
            }
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            return false
          }}
        >
          <Button icon={<UploadIcon size={16} />}>{t('settings.profile.choosePhoto')}</Button>
        </Upload>
      </div>
    </Modal>
  )
}
