'use client'

import { Input, Modal, Popconfirm, Select, Tag } from 'antd'
import { Activity, Copy, KeyRound, Link2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useCreateUserApiKey, useDeleteUserApiKey, useUserApiAccessLogs, useUserApiKeys } from '@/api'
import { API_BASE_URL } from '@vokcg/config'
import { useAppMessage } from '@vokcg/ui'
import { SettingsDangerButton, SettingsOutlineButton, SettingsPrimaryButton } from './settings-button'
import { SettingsCard, SettingsCardBody, SettingsCardHeader, SettingsKvRow, SettingsListRow } from './settings-card'

function formatDate(value: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return value
  }
}

function statusColor(code: number) {
  if (code >= 500) return 'red'
  if (code >= 400) return 'orange'
  if (code >= 300) return 'blue'
  return 'green'
}

export function SettingsServiceApiTab() {
  const { t } = useLocale()
  const message = useAppMessage()
  const { data: apiKeys, isLoading } = useUserApiKeys()
  const createKey = useCreateUserApiKey()
  const deleteKey = useDeleteUserApiKey()

  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [logKeyFilter, setLogKeyFilter] = useState<string | undefined>()
  const [logPage, setLogPage] = useState(1)

  const { data: logsData, isLoading: logsLoading } = useUserApiAccessLogs(logKeyFilter, logPage)
  const logs = logsData?.items ?? []
  const logsTotal = logsData?.total ?? 0

  const keyFilterOptions = useMemo(
    () => [
      { value: '', label: t('settings.serviceApi.allKeys') },
      ...((apiKeys ?? []).map((key) => ({ value: key.id, label: key.name }))),
    ],
    [apiKeys, t],
  )

  const handleCreate = async () => {
    const name = keyName.trim()
    if (!name) {
      message.error(t('settings.serviceApi.nameRequired'))
      return
    }
    try {
      const response = await createKey.mutateAsync({ name })
      const secret = (response as { data?: { secret?: string } })?.data?.secret
      if (!secret) { message.error(t('settings.serviceApi.createFailed')); return }
      setCreateOpen(false)
      setKeyName('')
      setCreatedSecret(secret)
      message.success(t('settings.serviceApi.created'))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('settings.serviceApi.createFailed'))
    }
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      message.success(t('settings.serviceApi.copied'))
    } catch {
      message.error(t('settings.serviceApi.copyFailed'))
    }
  }

  const handleRevoke = async (keyId: string) => {
    try {
      await deleteKey.mutateAsync(keyId)
      message.success(t('settings.serviceApi.revoked'))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('settings.serviceApi.revokeFailed'))
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SettingsCard>
        <SettingsCardHeader icon={Link2} tone="blue" title={t('settings.serviceApi.connectionTitle')} subtitle={t('settings.serviceApi.hint')} />
        <SettingsCardBody>
          <SettingsKvRow label={t('settings.serviceApi.baseUrl')} value={<code className="truncate rounded-lg bg-subtle px-2.5 py-1 font-mono text-sm text-muted">{API_BASE_URL || window.location.origin}</code>} />
          <SettingsKvRow label={t('settings.serviceApi.authHeader')} value={<code className="truncate rounded-lg bg-subtle px-2.5 py-1 font-mono text-sm text-muted">X-Api-Key</code>} />
        </SettingsCardBody>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader
          icon={KeyRound}
          tone="amber"
          title={t('settings.serviceApi.keysTitle')}
          subtitle={t('settings.serviceApi.keysHint')}
          extra={<SettingsPrimaryButton size="sm" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>{t('settings.serviceApi.generate')}</SettingsPrimaryButton>}
        />
        <SettingsCardBody flush>
          {isLoading ? (
            <p className="py-6 text-[15px] text-muted">{t('settings.serviceApi.loading')}</p>
          ) : !apiKeys?.length ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent"><KeyRound size={22} strokeWidth={1.8} /></div>
              <p className="text-[15px] text-muted">{t('settings.serviceApi.empty')}</p>
              <SettingsPrimaryButton size="sm" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>{t('settings.serviceApi.generate')}</SettingsPrimaryButton>
            </div>
          ) : (
            (apiKeys ?? []).map((key) => (
              <SettingsListRow
                key={key.id}
                icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle text-secondary"><KeyRound size={17} strokeWidth={1.8} /></div>}
                action={
                  <Popconfirm title={t('settings.serviceApi.revokeConfirm')} onConfirm={() => void handleRevoke(key.id)}>
                    <SettingsDangerButton size="sm" loading={deleteKey.isPending}>{t('settings.serviceApi.revoke')}</SettingsDangerButton>
                  </Popconfirm>
                }
              >
                <p className="text-[15px] font-semibold text-primary">{key.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-subtle px-2 py-0.5 font-mono text-sm text-muted">{key.prefix}***</code>
                  {key.scopes.map((scope) => <Tag key={scope} className="m-0 text-[11px]">{scope}</Tag>)}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {t('settings.serviceApi.createdAt')} {formatDate(key.created_at)}
                  {key.last_used ? ` · ${t('settings.serviceApi.lastUsed')} ${formatDate(key.last_used)}` : ` · ${t('settings.serviceApi.neverUsed')}`}
                </p>
              </SettingsListRow>
            ))
          )}
        </SettingsCardBody>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader
          icon={Activity}
          tone="green"
          title={t('settings.serviceApi.logsTitle')}
          subtitle={t('settings.serviceApi.logsHint')}
          extra={
            <Select size="small" className="min-w-[160px]" value={logKeyFilter ?? ''} options={keyFilterOptions} onChange={(value) => { setLogKeyFilter(value || undefined); setLogPage(1) }} />
          }
        />
        <SettingsCardBody flush>
          {logsLoading ? (
            <p className="py-6 text-[15px] text-muted">{t('settings.serviceApi.logsLoading')}</p>
          ) : logs.length === 0 ? (
            <p className="py-6 text-[15px] text-muted">{t('settings.serviceApi.logsEmpty')}</p>
          ) : (
            logs.map((log) => (
              <SettingsListRow key={log.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag color={statusColor(log.status_code)} className="m-0 font-mono text-[11px]">{log.status_code}</Tag>
                  <code className="text-sm font-semibold text-primary">{log.method}</code>
                  <code className="truncate text-sm text-secondary">{log.path}</code>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {log.api_key_name ?? log.api_key_prefix ?? t('settings.serviceApi.unknownKey')}
                  {' · '}{formatDate(log.created_at)}
                  {log.ip_address ? ` · ${log.ip_address}` : ''}
                </p>
              </SettingsListRow>
            ))
          )}
        </SettingsCardBody>
        {logsTotal > 15 && (
          <div className="flex items-center justify-between gap-4 border-t border-divider px-5 py-4 sm:px-6">
            <span className="text-sm text-muted">{t('settings.serviceApi.logsTotal', { count: String(logsTotal) })}</span>
            <div className="flex gap-2">
              <SettingsOutlineButton size="sm" disabled={logPage <= 1} onClick={() => setLogPage((p) => p - 1)}>{t('common.back')}</SettingsOutlineButton>
              <SettingsOutlineButton size="sm" disabled={logPage * 15 >= logsTotal} onClick={() => setLogPage((p) => p + 1)}>{t('common.next')}</SettingsOutlineButton>
            </div>
          </div>
        )}
      </SettingsCard>

      <Modal
        title={t('settings.serviceApi.generate')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); setKeyName('') }}
        onOk={() => void handleCreate()}
        confirmLoading={createKey.isPending}
        okText={t('settings.serviceApi.generate')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <p className="mb-3 text-sm text-muted">{t('settings.serviceApi.generateHint')}</p>
        <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder={t('settings.serviceApi.namePlaceholder')} maxLength={120} onPressEnter={() => void handleCreate()} />
      </Modal>

      <Modal
        title={t('settings.serviceApi.secretTitle')}
        open={Boolean(createdSecret)}
        onCancel={() => setCreatedSecret(null)}
        footer={[
          <SettingsPrimaryButton key="close" onClick={() => setCreatedSecret(null)}>{t('settings.serviceApi.secretDone')}</SettingsPrimaryButton>,
        ]}
        destroyOnHidden
      >
        <p className="mb-3 text-sm text-muted">{t('settings.serviceApi.secretHint')}</p>
        <div className="flex items-center gap-2 rounded-xl bg-subtle/60 p-3">
          <code className="min-w-0 flex-1 break-all text-sm text-primary">{createdSecret}</code>
          <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary" onClick={() => createdSecret && void handleCopy(createdSecret)}>
            <Copy size={16} />
          </button>
        </div>
      </Modal>
    </div>
  )
}
