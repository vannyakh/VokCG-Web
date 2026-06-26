"use client";

import { motion } from "framer-motion";
import { ChevronsLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { useWorkspace } from "@/api";
import { STUDIO_SHELL, STUDIO_SIDEBAR } from "@vokcg/config";
import { studioNavItemSections, USER_ROUTES } from "@vokcg/constants";
import type { NavItem } from "@vokcg/constants";
import { useLocale } from "@vokcg/i18n";
import { useSidebarStore } from "@/store";
import {
  mobileDrawerSpring,
  NavMenu,
  sidebarPanelSpring,
  sidebarShellSpring,
  Tooltip,
} from "@vokcg/ui";

import { SidebarWorkspaceCard } from "./SidebarWorkspaceCard";

const MINI_W = STUDIO_SIDEBAR.miniWidth;
const NAV_ITEM_HEIGHT = STUDIO_SHELL.navItemHeight;

type SidebarProps = {
  activePath: string;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function BrannamLogo({ expanded }: { expanded: boolean }) {
  const boxSize = expanded ? 38 : 34;

  return (
    <Link
      href={USER_ROUTES.create}
      className="flex items-center gap-2 rounded-xl outline-offset-2 transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden"
        style={{ width: boxSize, height: boxSize }}
      >
        <svg
          viewBox="0 0 361 361"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden
        >
          <path
            d="M361 161C355.676 114.875 331.59 71.3771 295.884 41.6956C260.178 12.0142 214.407 -2.76582 168.085 0.427762C121.763 3.62135 78.4538 24.5429 47.1588 58.8436C15.8638 93.1443 -1.00929 138.186 0.0467399 184.606C1.10277 231.025 20.0067 275.253 52.8291 308.095C85.6516 340.937 129.868 359.867 176.287 360.951C222.706 362.035 267.758 345.189 302.077 313.914C336.396 282.64 357.344 239.343 360.565 193.023L360.752 191H323.158C320.601 227.769 304.25 261.578 277.008 286.404C249.765 311.23 214.003 324.602 177.156 323.742C140.308 322.882 105.21 307.855 79.1551 281.785C53.1007 255.715 38.0948 220.607 37.2565 183.759C36.4183 146.911 49.8121 111.157 74.654 83.9294C99.4959 56.7016 133.875 40.0941 170.645 37.559C207.415 35.024 243.748 46.7563 272.092 70.3174C300.435 93.8785 317.774 124.386 322 161H361Z"
            fill="currentColor"
            fillOpacity="0.9"
            className="text-[var(--text-primary)] transition-colors duration-300"
          />
          <path
            d="M23 175.5H97.4626C106.45 175.5 114.745 170.676 119.19 162.866L141.096 124.375C143.535 120.088 149.818 120.413 151.803 124.929L197.195 228.205C199.08 232.495 204.935 233.064 207.612 229.218L236.048 188.363C241.656 180.304 250.853 175.5 260.671 175.5H287"
            stroke="var(--color-primary)"
            strokeWidth="26"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />
        </svg>
      </div>

      {expanded && (
        <span
          className="min-w-0 font-extrabold text-[24px] tracking-[-0.02em] leading-none"
          style={{ color: "var(--text-primary)" }}
        >
          VokCG
        </span>
      )}
    </Link>
  );
}

function SidebarBrand({
  expanded,
  isMobile,
  onClose,
}: {
  expanded: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className={[
        `flex ${STUDIO_SHELL.headerHeightClass} shrink-0 items-center justify-between`,
        expanded ? "px-3.5" : "justify-center",
      ].join(" ")}
      style={{
        borderBottom: "1px solid var(--border-default)",
        paddingInline: expanded ? undefined : 10,
      }}
    >
      <BrannamLogo expanded={expanded} />
      {isMobile && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)]"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function Sidebar({
  activePath,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const router = useRouter();
  const { workspace, isDemo } = useWorkspace();
  const {
    collapsed,
    hidden,
    sidebarWidth,
    sidebarMiniMode,
    toggle,
    setSidebarWidth,
  } = useSidebarStore();

  const [navScrolled, setNavScrolled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const { t } = useLocale();
  const navSections = studioNavItemSections(false, workspace, t);
  const isCollapsed = !isMobile && (sidebarMiniMode || collapsed);
  const expanded = isMobile || !isCollapsed;
  const shellWidth = hidden ? 0 : isCollapsed ? MINI_W : sidebarWidth;
  const panelWidth = isCollapsed ? MINI_W : sidebarWidth;

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const startX = e.clientX;
      const startW = sidebarWidth;
      const onMove = (ev: MouseEvent) =>
        setSidebarWidth(startW + ev.clientX - startX);
      const onUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [sidebarWidth, setSidebarWidth],
  );

  const onNavScroll = useCallback(() => {
    setNavScrolled((navRef.current?.scrollTop ?? 0) > 4);
  }, []);

  const handleSelect = useCallback(
    (item: NavItem) => {
      if (!item.path || item.disabled || item.comingSoon) return;
      router.push(item.path);
      if (isMobile) onMobileClose?.();
    },
    [isMobile, onMobileClose, router],
  );

  const panel = (
    <>
      <SidebarBrand
        expanded={expanded}
        isMobile={isMobile}
        onClose={onMobileClose}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {navScrolled && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8"
            style={{
              background:
                "linear-gradient(to bottom, var(--bg-sidebar), transparent)",
            }}
          />
        )}

        <nav
          ref={navRef}
          onScroll={onNavScroll}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-1.5"
        >
          <NavMenu
            sections={navSections}
            activePath={activePath}
            collapse={!expanded}
            accordion
            rounded
            itemHeight={NAV_ITEM_HEIGHT}
            onSelect={handleSelect}
          />
        </nav>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8"
          style={{
            background:
              "linear-gradient(to top, var(--bg-sidebar), transparent)",
          }}
        />
      </div>

      {expanded && (
        <SidebarWorkspaceCard workspace={workspace} isDemo={isDemo} />
      )}

      {!isMobile && (
        <div
          className="flex shrink-0 items-center py-1.5"
          style={{
            borderTop: "1px solid var(--border-default)",
            paddingInline: isCollapsed ? 10 : 8,
          }}
        >
          {isCollapsed ? (
            <Tooltip content={t("sidebar.expand")} placement="right">
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-full items-center justify-center rounded-[11px] transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-active)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <ChevronsLeft size={17} className="rotate-180" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-active)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <ChevronsLeft size={14} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">
                {t("sidebar.collapse")}
              </span>
              <kbd
                className="hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none group-hover:inline-flex"
                style={{
                  background: "var(--border-default)",
                  color: "var(--text-muted)",
                }}
              >
                [
              </kbd>
            </button>
          )}
        </div>
      )}

      {!isMobile && !sidebarMiniMode && !isCollapsed && (
        <div
          onMouseDown={onDragStart}
          className={`absolute inset-y-0 right-0 z-40 w-1 cursor-col-resize transition-all duration-150 ${
            isDragging
              ? "bg-accent/80 shadow-[0_0_8px_var(--color-primary)]"
              : "bg-transparent hover:bg-accent/25"
          }`}
          aria-hidden
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={mobileDrawerSpring}
        aria-label="Studio navigation"
        aria-hidden={!mobileOpen}
        className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-divider bg-sidebar shadow-2xl will-change-transform"
        style={{
          width: STUDIO_SIDEBAR.mobileDrawerWidth,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      >
        {panel}
      </motion.aside>
    );
  }

  return (
    <motion.div
      layout
      className="relative h-dvh shrink-0 overflow-hidden"
      initial={false}
      animate={{ width: shellWidth }}
      transition={sidebarShellSpring}
      style={{ pointerEvents: hidden ? "none" : "auto" }}
      aria-hidden={hidden}
    >
      <motion.aside
        initial={false}
        animate={{
          width: panelWidth,
          x: hidden ? -12 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={sidebarPanelSpring}
        aria-label="Studio navigation"
        className="absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-divider bg-sidebar will-change-transform"
      >
        {panel}
      </motion.aside>
    </motion.div>
  );
}
