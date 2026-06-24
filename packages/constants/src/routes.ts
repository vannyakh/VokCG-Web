export const USER_ROUTES = {
  home: '/',
  create: '/create',
  tasks: '/tasks',
  scriptWriter: '/script',
  ttsStudio: '/tts',
  voiceStudio: '/voice',
  settings: '/settings',
  billing: '/billing',
  billingPlans: '/billing/plans',
  exploreTemplates: '/explore/templates',
  exploreAvatar: '/explore/avatar',
  exploreMusic: '/explore/music',
  explorePublish: '/explore/publish',
  login: '/login',
  register: '/register',
} as const

export const LEGACY_WORKSPACE_ROUTES = {
  root: '/workspace',
  plans: '/workspace/plans',
  billing: '/workspace/billing',
  team: '/workspace/team',
} as const

/** Admin app lives on web-admin — use env override in production */
export const ADMIN_APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'

/** Studio (web-user) app — login and non-admin routes */
export const STUDIO_APP_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? 'http://localhost:3000'

export const ADMIN_ROUTES = {
  home: '/',
  login: '/login',
  overview: '/overview',
  users: '/users',
  roles: '/roles',
  permissions: '/permissions',
  tenants: '/tenants',
  plans: '/plans',
  subscriptions: '/subscriptions',
  billing: '/billing',
  logs: '/logs',
  services: '/services',
  backups: '/backups',
  jobs: '/jobs',
  reports: '/reports',
  notifications: '/notifications',
  webhooks: '/webhooks',
  apiKeys: '/api-keys',
  featureFlags: '/feature-flags',
} as const

/** @deprecated use USER_ROUTES — kept for migration compatibility */
export const ROUTES = {
  ...USER_ROUTES,
  admin: ADMIN_APP_URL,
  adminOverview: `${ADMIN_APP_URL}/overview`,
} as const
