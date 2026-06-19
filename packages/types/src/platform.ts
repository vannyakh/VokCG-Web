export type WebhookStatus = 'active' | 'disabled' | 'failing'

export type Webhook = {
  id: string
  url: string
  events: string[]
  status: WebhookStatus
  last_delivery: string | null
  created_at: string
}

export type ApiKey = {
  id: string
  name: string
  prefix: string
  scopes: string[]
  created_at: string
  last_used: string | null
}

export type ApiKeyCreateResponse = ApiKey & { secret: string }

export type FeatureFlag = {
  id: string
  key: string
  description: string | null
  enabled: boolean
  rollout: number
}

export type StripeSettings = {
  configured: boolean
  publishable_key: string
  secret_key_set: boolean
  webhook_secret_set: boolean
  mode: string
}

export type StripeSettingsInput = {
  secret_key?: string
  publishable_key?: string
  webhook_secret?: string
}

export type BackupType = 'full' | 'incremental'
export type BackupStatus = 'completed' | 'running' | 'failed'

export type Backup = {
  id: string
  type: BackupType
  status: BackupStatus
  size_mb: number
  created_at: string
}

export type JobStatus = 'active' | 'paused'

export type ScheduledJob = {
  id: string
  name: string
  cron: string
  status: JobStatus
  last_run: string | null
  next_run: string | null
  created_at: string
}

export type NotificationChannel = 'email' | 'in_app' | 'sms'

export type NotificationTemplate = {
  id: string
  name: string
  channel: NotificationChannel
  enabled: boolean
  sent_30d: number
  created_at: string
}
