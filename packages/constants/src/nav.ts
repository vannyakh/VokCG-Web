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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { USER_ROUTES } from "./routes";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavItem[];
  disabled?: boolean;
  badge?: string;
  comingSoon?: boolean;
};

export type MainNavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
  comingSoon?: boolean;
};

export type NavSection = {
  id: string;
  sectionKey: string;
  single?: boolean;
  items: MainNavItem[];
};

export type StudioNavSection = {
  id: string;
  items: NavItem[];
};

function buildSectionNavItems(
  section: NavSection,
  workspace: { plan?: { name: string } | null } | undefined,
  t: (key: string) => string,
): NavItem[] {
  if (section.single && section.items.length === 1) {
    const item = section.items[0]!;
    return [
      {
        id: item.to,
        label: t(item.labelKey),
        icon: item.icon,
        path: item.comingSoon ? undefined : item.to,
        badge: item.comingSoon ? t("nav.badge.soon") : item.badge,
        comingSoon: item.comingSoon,
      },
    ];
  }

  return [
    {
      id: section.id,
      label: t(section.sectionKey),
      icon: SECTION_ICONS[section.id] ?? Clapperboard,
      children: section.items.map((item) => {
        let badge = item.badge;
        if (item.comingSoon) {
          badge = t("nav.badge.soon");
        } else if (
          section.id === "billing" &&
          item.to === USER_ROUTES.billing &&
          workspace?.plan
        ) {
          badge = workspace.plan.name;
        }
        return {
          id: item.to,
          label: t(item.labelKey),
          icon: item.icon,
          path: item.comingSoon ? undefined : item.to,
          badge,
          comingSoon: item.comingSoon,
        };
      }),
    },
  ];
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  studio: Clapperboard,
  billing: CreditCard,
  explore: Sparkles,
  account: Settings,
};

export const STUDIO_NAV_SECTIONS: NavSection[] = [
  {
    id: "studio",
    sectionKey: "nav.section.studio",
    items: [
      { to: USER_ROUTES.create, labelKey: "nav.create", icon: Clapperboard },
      {
        to: USER_ROUTES.scriptWriter,
        labelKey: "nav.scriptWriter",
        icon: FileText,
      },
      { to: USER_ROUTES.ttsStudio, labelKey: "nav.ttsStudio", icon: Volume2 },
      { to: USER_ROUTES.voiceStudio, labelKey: "nav.voiceStudio", icon: Mic },
    ],
  },
  {
    id: "tasks",
    sectionKey: "nav.tasks",
    single: true,
    items: [{ to: USER_ROUTES.tasks, labelKey: "nav.tasks", icon: ListVideo }],
  },
  {
    id: "billing",
    sectionKey: "nav.section.billing",
    items: [
      { to: USER_ROUTES.billing, labelKey: "nav.billing", icon: Receipt },
      { to: USER_ROUTES.billingPlans, labelKey: "nav.plans", icon: Package },
    ],
  },
  {
    id: "explore",
    sectionKey: "nav.section.explore",
    items: [
      {
        to: USER_ROUTES.exploreTemplates,
        labelKey: "nav.templates",
        icon: LayoutTemplate,
      },
      {
        to: USER_ROUTES.exploreAvatar,
        labelKey: "nav.aiAvatar",
        icon: ScanFace,
      },
      {
        to: USER_ROUTES.exploreMusic,
        labelKey: "nav.musicLibrary",
        icon: Music,
      },
      {
        to: USER_ROUTES.explorePublish,
        labelKey: "nav.autoPublish",
        icon: CalendarClock,
      },
    ],
  },
  {
    id: "account",
    sectionKey: "nav.section.account",
    items: [
      { to: USER_ROUTES.settings, labelKey: "nav.settings", icon: Settings },
    ],
  },
];

export function studioNavSections(isAdmin: boolean): NavSection[] {
  return STUDIO_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0);
}

export function studioNavItemSections(
  isAdmin: boolean,
  workspace: { plan?: { name: string } | null } | undefined,
  t: (key: string) => string,
): StudioNavSection[] {
  return studioNavSections(isAdmin).map((section) => ({
    id: section.id,
    items: buildSectionNavItems(section, workspace, t),
  }));
}

export function studioNavItems(
  isAdmin: boolean,
  workspace: { plan?: { name: string } | null } | undefined,
  t: (key: string) => string,
): NavItem[] {
  return studioNavItemSections(isAdmin, workspace, t).flatMap(
    (section) => section.items,
  );
}

export function studioPageMeta(pathname: string): {
  sectionKey: string;
  labelKey: string;
} {
  for (const section of STUDIO_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.comingSoon) continue;
      if (
        pathname === item.to ||
        (item.to !== "/" && pathname.startsWith(`${item.to}/`))
      ) {
        return { sectionKey: section.sectionKey, labelKey: item.labelKey };
      }
    }
  }
  return { sectionKey: "nav.home", labelKey: "nav.home" };
}
