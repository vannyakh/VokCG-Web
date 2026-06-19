export type Permission = {
  id: string
  code: string
  name: string
  resource: string
  action: string
  description?: string | null
}

export type Role = {
  id: string
  name: string
  slug: string
  description?: string | null
  permissions: Permission[]
}

export type AuthUser = {
  id: string
  email: string
  username: string
  full_name?: string | null
  avatar_path?: string | null
  avatar_url?: string | null
  is_active: boolean
  is_superuser: boolean
  roles: Role[]
  permissions: string[]
  created_at: string
  updated_at: string
}

export type AuthTokenPayload = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export type AuditLog = {
  id: string
  user_id?: string | null
  action: string
  resource: string
  resource_id?: string | null
  details?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

export type ServiceConfig = {
  id: string
  key: string
  value?: Record<string, unknown> | null
  description?: string | null
  updated_at: string
}

export type AdminOverview = {
  users: number
  roles: number
  permissions: number
  logs: number
  services: number
  tenants?: number
  plans?: number
  subscriptions?: number
  mrr?: number
  redis_connected: boolean
  database_enabled: boolean
}
