'use client'

import { Form, Input } from 'antd'
import { Camera, Pencil, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useAuthMe, useUpdateProfile } from '@/api'
import { useAuthStore } from '@/store'
import { useAppMessage } from '@vokcg/ui'
import { UserAvatar } from '@vokcg/ui'
import { SettingsGhostButton, SettingsOutlineButton, SettingsPrimaryButton } from './settings-button'
import { SettingsCard, SettingsCardBody, SettingsCardFooter, SettingsCardHeader, SettingsSaveRow } from './settings-card'
import { UpdateAvatarModal } from './update-avatar-modal'

type ProfileFormValues = {
  username: string
  full_name: string
}

function formatMemberDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

export function SettingsProfileTab() {
  const { t } = useLocale()
  const message = useAppMessage()
  const user = useAuthStore((s) => s.user)
  useAuthMe(Boolean(user))
  const updateProfile = useUpdateProfile()
  const [form] = Form.useForm<ProfileFormValues>()
  const [editing, setEditing] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [avatarRevision, setAvatarRevision] = useState(0)

  useEffect(() => {
    if (!user || editing) return
    form.setFieldsValue({ username: user.username, full_name: user.full_name?.trim() ?? '' })
  }, [user, editing, form])

  if (!user) return null

  const displayName = user.full_name?.trim() || user.username

  const handleEdit = () => {
    form.setFieldsValue({ username: user.username, full_name: user.full_name?.trim() ?? '' })
    setEditing(true)
  }

  const handleCancel = () => {
    form.resetFields()
    setEditing(false)
  }

  const handleSave = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({ username: values.username.trim(), full_name: values.full_name.trim() || null })
      message.success(t('settings.profile.saved'))
      setEditing(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('settings.profile.saveFailed'))
    }
  }

  return (
    <>
      <div className="max-w-3xl">
        <SettingsCard>
          <SettingsCardHeader
            icon={UserRound}
            tone="blue"
            title={t('settings.profile.cardTitle')}
            subtitle={t('settings.profile.cardSubtitle')}
            extra={
              !editing ? (
                <SettingsOutlineButton size="sm" icon={<Pencil size={14} />} onClick={handleEdit}>
                  {t('settings.profile.editProfile')}
                </SettingsOutlineButton>
              ) : null
            }
          />

          <div className="flex items-center gap-5 border-b border-default px-5 py-5 sm:gap-6 sm:px-6 sm:py-6">
            <button
              type="button"
              aria-label={t('settings.profile.updateAvatar')}
              onClick={() => setAvatarModalOpen(true)}
              className="relative shrink-0 rounded-full"
            >
              <UserAvatar username={user.username} avatarUrl={user.avatar_url} revision={avatarRevision} size="xl" className="!h-20 !w-20 !text-2xl" />
              <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-subtle text-primary">
                <Camera size={12} strokeWidth={2} />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-primary">{displayName}</p>
              <p className="mt-0.5 text-sm text-muted">@{user.username}</p>
              <div className="mt-3">
                <SettingsOutlineButton size="sm" icon={<Camera size={14} />} onClick={() => setAvatarModalOpen(true)}>
                  {t('settings.profile.changePhoto')}
                </SettingsOutlineButton>
              </div>
            </div>
          </div>

          <SettingsCardBody>
            <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSave} disabled={!editing} className="settings-form-grid">
              <Form.Item label={t('settings.profile.fullName')}>
                {editing ? (
                  <Form.Item name="full_name" noStyle rules={[{ max: 120, message: t('settings.profile.fullNameMax') }]}>
                    <Input placeholder={t('settings.profile.fullNamePlaceholder')} />
                  </Form.Item>
                ) : (
                  <Input readOnly value={user.full_name?.trim() || t('settings.profile.notProvided')} className="settings-field-readonly" />
                )}
              </Form.Item>

              <Form.Item label={t('settings.profile.username')}>
                {editing ? (
                  <Form.Item
                    name="username"
                    noStyle
                    rules={[
                      { required: true, message: t('settings.profile.usernameRequired') },
                      { min: 3, message: t('settings.profile.usernameMin') },
                      { max: 64, message: t('settings.profile.usernameMax') },
                      { pattern: /^[a-zA-Z0-9_-]+$/, message: t('settings.profile.usernamePattern') },
                    ]}
                  >
                    <Input prefix="@" placeholder={t('settings.profile.usernamePlaceholder')} />
                  </Form.Item>
                ) : (
                  <Input readOnly value={`@${user.username}`} className="settings-field-readonly" />
                )}
              </Form.Item>

              <Form.Item label={t('settings.profile.email')} className="settings-form-full">
                <Input readOnly value={user.email} className="settings-field-readonly" />
                <p className="settings-form-hint">{t('settings.profile.emailHint')}</p>
              </Form.Item>

              {user.created_at && (
                <Form.Item label={t('settings.profile.memberSince')} className="settings-form-full">
                  <p className="text-[15px] text-muted">{formatMemberDate(user.created_at)}</p>
                </Form.Item>
              )}
            </Form>
          </SettingsCardBody>

          {editing && (
            <SettingsCardFooter>
              <SettingsSaveRow>
                <SettingsPrimaryButton onClick={() => form.submit()} loading={updateProfile.isPending}>
                  {t('settings.profile.saveChanges')}
                </SettingsPrimaryButton>
                <SettingsGhostButton onClick={handleCancel} disabled={updateProfile.isPending}>
                  {t('common.cancel')}
                </SettingsGhostButton>
              </SettingsSaveRow>
            </SettingsCardFooter>
          )}
        </SettingsCard>
      </div>

      <UpdateAvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        username={user.username}
        avatarUrl={user.avatar_url}
        avatarRevision={avatarRevision}
        onSuccess={() => setAvatarRevision((v) => v + 1)}
      />
    </>
  )
}
