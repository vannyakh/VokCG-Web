import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  Cog,
  CreditCard,
  DatabaseBackup,
  FileText,
  FolderCog,
  KeyRound,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Package,
  Plug,
  Shield,
  ToggleLeft,
  UserCog,
  Users,
  Webhook,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { NavItem } from './nav'
import { ADMIN_ROUTES } from './routes'

export type AdminTab =
  | 'overview'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'tenants'
  | 'plans'
  | 'subscriptions'
  | 'billing'
  | 'logs'
  | 'services'
  | 'backups'
  | 'jobs'
  | 'reports'
  | 'notifications'
  | 'webhooks'
  | 'api-keys'
  | 'feature-flags'

export type AdminTabMeta = {
  label: string
  description: string
  icon: LucideIcon
  path: string
  queryKey: string[]
}

export const ADMIN_TAB_META: Record<AdminTab, AdminTabMeta> = {
  overview: {
    label: 'Overview',
    description: 'System health and statistics',
    icon: LayoutDashboard,
    path: ADMIN_ROUTES.overview,
    queryKey: ['admin', 'overview'],
  },
  users: {
    label: 'Users',
    description: 'Manage accounts and access',
    icon: Users,
    path: ADMIN_ROUTES.users,
    queryKey: ['admin', 'users'],
  },
  roles: {
    label: 'Roles',
    description: 'Role definitions and permissions',
    icon: Shield,
    path: ADMIN_ROUTES.roles,
    queryKey: ['admin', 'roles'],
  },
  permissions: {
    label: 'Permissions',
    description: 'Permission catalog and RBAC codes',
    icon: LockKeyhole,
    path: ADMIN_ROUTES.permissions,
    queryKey: ['admin', 'permissions'],
  },
  tenants: {
    label: 'Tenants',
    description: 'Multi-tenant organizations',
    icon: Building2,
    path: ADMIN_ROUTES.tenants,
    queryKey: ['admin', 'tenants'],
  },
  plans: {
    label: 'Plans',
    description: 'Pricing tiers and entitlements',
    icon: Package,
    path: ADMIN_ROUTES.plans,
    queryKey: ['admin', 'plans'],
  },
  subscriptions: {
    label: 'Subscriptions',
    description: 'Billing and subscription lifecycle',
    icon: CreditCard,
    path: ADMIN_ROUTES.subscriptions,
    queryKey: ['admin', 'subscriptions'],
  },
  billing: {
    label: 'Billing',
    description: 'Stripe configuration and payments',
    icon: CreditCard,
    path: ADMIN_ROUTES.billing,
    queryKey: ['admin', 'billing', 'stripe'],
  },
  logs: {
    label: 'Audit Logs',
    description: 'Security and activity trail',
    icon: FileText,
    path: ADMIN_ROUTES.logs,
    queryKey: ['admin', 'logs'],
  },
  services: {
    label: 'Services',
    description: 'Application service configuration',
    icon: Cog,
    path: ADMIN_ROUTES.services,
    queryKey: ['admin', 'services'],
  },
  backups: {
    label: 'Backups',
    description: 'Database and asset backups',
    icon: DatabaseBackup,
    path: ADMIN_ROUTES.backups,
    queryKey: ['admin', 'backups'],
  },
  jobs: {
    label: 'Scheduled Jobs',
    description: 'Cron jobs and background tasks',
    icon: CalendarClock,
    path: ADMIN_ROUTES.jobs,
    queryKey: ['admin', 'jobs'],
  },
  reports: {
    label: 'Reports',
    description: 'Revenue and usage analytics',
    icon: BarChart3,
    path: ADMIN_ROUTES.reports,
    queryKey: ['admin', 'reports'],
  },
  notifications: {
    label: 'Notifications',
    description: 'Email, in-app, and SMS templates',
    icon: Bell,
    path: ADMIN_ROUTES.notifications,
    queryKey: ['admin', 'notifications'],
  },
  webhooks: {
    label: 'Webhooks',
    description: 'Outbound event delivery',
    icon: Webhook,
    path: ADMIN_ROUTES.webhooks,
    queryKey: ['admin', 'webhooks'],
  },
  'api-keys': {
    label: 'API Keys',
    description: 'Programmatic access tokens',
    icon: KeyRound,
    path: ADMIN_ROUTES.apiKeys,
    queryKey: ['admin', 'api-keys'],
  },
  'feature-flags': {
    label: 'Feature Flags',
    description: 'Gradual rollouts and toggles',
    icon: ToggleLeft,
    path: ADMIN_ROUTES.featureFlags,
    queryKey: ['admin', 'feature-flags'],
  },
}

export const ADMIN_TAB_ORDER: AdminTab[] = [
  'overview',
  'users',
  'roles',
  'permissions',
  'tenants',
  'plans',
  'subscriptions',
  'billing',
  'logs',
  'services',
  'backups',
  'jobs',
  'reports',
  'notifications',
  'webhooks',
  'api-keys',
  'feature-flags',
]

export const ADMIN_AFFIX_TABS: AdminTab[] = ['overview']

export function tabFromPath(pathname: string): AdminTab {
  const entries = Object.entries(ADMIN_TAB_META) as [AdminTab, AdminTabMeta][]
  const match = entries
    .sort((a, b) => b[1].path.length - a[1].path.length)
    .find(([, meta]) => pathname === meta.path || pathname.startsWith(`${meta.path}/`))
  return match?.[0] ?? 'overview'
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    path: ADMIN_ROUTES.overview,
  },
  {
    id: 'access',
    label: 'Access',
    icon: UserCog,
    children: [
      { id: 'users', label: 'Users', icon: Users, path: ADMIN_ROUTES.users },
      { id: 'roles', label: 'Roles', icon: Shield, path: ADMIN_ROUTES.roles },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: LockKeyhole,
        path: ADMIN_ROUTES.permissions,
      },
    ],
  },
  {
    id: 'saas',
    label: 'SaaS',
    icon: Building2,
    children: [
      { id: 'tenants', label: 'Tenants', icon: Building2, path: ADMIN_ROUTES.tenants },
      { id: 'plans', label: 'Plans', icon: Package, path: ADMIN_ROUTES.plans },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: CreditCard,
        path: ADMIN_ROUTES.subscriptions,
      },
      { id: 'billing', label: 'Stripe Billing', icon: CreditCard, path: ADMIN_ROUTES.billing },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: FolderCog,
    children: [
      { id: 'logs', label: 'Audit Logs', icon: FileText, path: ADMIN_ROUTES.logs },
      { id: 'services', label: 'Services', icon: Cog, path: ADMIN_ROUTES.services },
      { id: 'backups', label: 'Backups', icon: DatabaseBackup, path: ADMIN_ROUTES.backups },
      { id: 'jobs', label: 'Scheduled Jobs', icon: CalendarClock, path: ADMIN_ROUTES.jobs },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LineChart,
    children: [
      { id: 'reports', label: 'Reports', icon: BarChart3, path: ADMIN_ROUTES.reports },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        path: ADMIN_ROUTES.notifications,
      },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    children: [
      { id: 'webhooks', label: 'Webhooks', icon: Webhook, path: ADMIN_ROUTES.webhooks },
      { id: 'api-keys', label: 'API Keys', icon: KeyRound, path: ADMIN_ROUTES.apiKeys },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    icon: ToggleLeft,
    children: [
      {
        id: 'feature-flags',
        label: 'Feature Flags',
        icon: ToggleLeft,
        path: ADMIN_ROUTES.featureFlags,
      },
    ],
  },
]
