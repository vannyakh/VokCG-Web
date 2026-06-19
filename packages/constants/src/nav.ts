import {
  CalendarClock,
  Clapperboard,
  CreditCard,
  FileText,
  LayoutTemplate,
  ListVideo,
  Mic,
  Music,
  Package,
  Receipt,
  ScanFace,
  Settings,
  Sparkles,
  Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { USER_ROUTES } from './routes'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  path?: string
  children?: NavItem[]
  disabled?: boolean
  badge?: string
  comingSoon?: boolean
}

export type MainNavItem = {
  to: string
  labelKey: string
  icon: LucideIcon
  adminOnly?: boolean
  badge?: string
  comingSoon?: boolean
}

export type NavSection = {
  id: string
  sectionKey: string
  single?: boolean
  items: MainNavItem[]
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  video: Clapperboard,
  audio: Volume2,
  billing: CreditCard,
  explore: Sparkles,
  account: Settings,
}

export const STUDIO_NAV_SECTIONS: NavSection[] = [
  {
    id: 'video',
    sectionKey: 'nav.section.video',
    items: [
      { to: USER_ROUTES.create, labelKey: 'nav.create', icon: Clapperboard },
      { to: USER_ROUTES.scriptWriter, labelKey: 'nav.scriptWriter', icon: FileText },
    ],
  },
  {
    id: 'audio',
    sectionKey: 'nav.section.audio',
    items: [
      { to: USER_ROUTES.ttsStudio, labelKey: 'nav.ttsStudio', icon: Volume2 },
      { to: USER_ROUTES.voiceStudio, labelKey: 'nav.voiceStudio', icon: Mic },
    ],
  },
  {
    id: 'tasks',
    sectionKey: 'nav.tasks',
    single: true,
    items: [{ to: USER_ROUTES.tasks, labelKey: 'nav.tasks', icon: ListVideo }],
  },
  {
    id: 'billing',
    sectionKey: 'nav.section.billing',
    items: [
      { to: USER_ROUTES.billing, labelKey: 'nav.billing', icon: Receipt },
      { to: USER_ROUTES.billingPlans, labelKey: 'nav.plans', icon: Package },
    ],
  },
  {
    id: 'explore',
    sectionKey: 'nav.section.explore',
    items: [
      { to: '/explore/templates', labelKey: 'nav.templates', icon: LayoutTemplate, comingSoon: true },
      { to: '/explore/avatar', labelKey: 'nav.aiAvatar', icon: ScanFace, comingSoon: true },
      { to: '/explore/music', labelKey: 'nav.musicLibrary', icon: Music, comingSoon: true },
      { to: '/explore/publish', labelKey: 'nav.autoPublish', icon: CalendarClock, comingSoon: true },
    ],
  },
  {
    id: 'account',
    sectionKey: 'nav.section.account',
    items: [{ to: USER_ROUTES.settings, labelKey: 'nav.settings', icon: Settings }],
  },
]

export function studioNavSections(isAdmin: boolean): NavSection[] {
  return STUDIO_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0)
}

export function studioNavItems(
  isAdmin: boolean,
  workspace: { plan?: { name: string } | null } | undefined,
  t: (key: string) => string,
): NavItem[] {
  return studioNavSections(isAdmin).flatMap((section): NavItem[] => {
    if (section.single && section.items.length === 1) {
      const item = section.items[0]!
      return [
        {
          id: item.to,
          label: t(item.labelKey),
          icon: item.icon,
          path: item.comingSoon ? undefined : item.to,
          badge: item.comingSoon ? t('nav.badge.soon') : item.badge,
          comingSoon: item.comingSoon,
        },
      ]
    }

    return [
      {
        id: section.id,
        label: t(section.sectionKey),
        icon: SECTION_ICONS[section.id] ?? Clapperboard,
        children: section.items.map((item) => {
          let badge = item.badge
          if (item.comingSoon) {
            badge = t('nav.badge.soon')
          } else if (section.id === 'billing' && item.to === USER_ROUTES.billing && workspace?.plan) {
            badge = workspace.plan.name
          }
          return {
            id: item.to,
            label: t(item.labelKey),
            icon: item.icon,
            path: item.comingSoon ? undefined : item.to,
            badge,
            comingSoon: item.comingSoon,
          }
        }),
      },
    ]
  })
}

export function studioPageMeta(pathname: string): { sectionKey: string; labelKey: string } {
  for (const section of STUDIO_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.comingSoon) continue
      if (pathname === item.to || (item.to !== '/' && pathname.startsWith(`${item.to}/`))) {
        return { sectionKey: section.sectionKey, labelKey: item.labelKey }
      }
    }
  }
  return { sectionKey: 'nav.home', labelKey: 'nav.home' }
}
