import { USER_ROUTES } from "@vokcg/constants";

export const FULL_BLEED_ROUTES = [
  USER_ROUTES.create,
  USER_ROUTES.ttsStudio,
  USER_ROUTES.scriptWriter,
] as const;

export function isFullBleedRoute(pathname: string) {
  return FULL_BLEED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export const CREATE_FORM = {
  maxWidth: 560,
  maxWidthClass: "max-w-full sm:max-w-xl lg:max-w-2xl",
  paddingX: "px-3 sm:px-4 md:px-5",
} as const;

export const CREATE_LAYOUT = {
  configFlex: 1,
  previewFlex: 1.15,
  mobileConfigMinHeight: "min(52dvh, 480px)",
} as const;

export const STUDIO_PANEL = {
  min: 360,
  max: 720,
  default: 480,
  maxViewportRatio: 0.48,
} as const;

export type PageSpacing = "none" | "compact" | "default" | "comfortable";

export const PAGE_SPACING = {
  contentOffset: {
    none: { bare: "", withHeader: "" },
    compact: { bare: "pt-1", withHeader: "pt-3" },
    default: { bare: "pt-2", withHeader: "pt-4" },
    comfortable: { bare: "pt-4", withHeader: "pt-5" },
  },
  contentGap: {
    none: "gap-0",
    compact: "gap-2",
    default: "gap-3",
    comfortable: "gap-5",
  },
  headerY: {
    none: "",
    compact: "py-3",
    default: "pt-2 pb-4",
    comfortable: "pt-4 pb-5",
  },
  footerY: {
    none: "",
    compact: "py-3",
    default: "py-4",
    comfortable: "py-5",
  },
  insetX: {
    none: "",
    compact: "px-3",
    default: "px-3 md:px-4",
    comfortable: "px-3 md:px-4 xl:px-6",
  },
} as const;

export const STUDIO_PAGE = {
  paddingX: "px-2 sm:px-3 md:px-4",
  shell: "relative flex h-full min-h-0 w-full flex-col overflow-hidden",
  width: {
    full: "w-full h-full min-h-0",
    wide: "mx-auto h-full min-h-0 w-full max-w-6xl",
    medium: "mx-auto h-full min-h-0 w-full max-w-5xl",
    narrow: "mx-auto h-full min-h-0 w-full max-w-3xl",
  },
} as const;

export type StudioPageWidth = keyof typeof STUDIO_PAGE.width;

/** Shared studio chrome — keep header + sidebar brand row aligned */
export const STUDIO_SHELL = {
  headerHeight: 64,
  headerHeightClass: "h-16",
  navItemHeight: 36,
} as const;

export const STUDIO_SIDEBAR = {
  miniWidth: 80,
  widthMin: 200,
  widthMax: 280,
  widthDefault: 240,
  mobileDrawerWidth: "min(88vw, 280px)",
  expandedWidth: 256,
  collapsedWidth: 80,
  brandIconSize: 36,
  navIconSize: 40,
  navItemRadius: 12,
  navIconRadius: 12,
  sectionGap: 8,
  navGap: 6,
} as const;
