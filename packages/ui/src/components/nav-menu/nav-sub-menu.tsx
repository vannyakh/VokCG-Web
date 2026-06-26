"use client";

import { Menu } from "antd";
import type { MenuProps as AntMenuProps } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { CollapsedNavFlyout } from "./collapsed-nav-flyout";
import { LevelProvider, useMenuContext, useMenuLevel } from "./menu-context";
import { NavBadge } from "./nav-badge";
import { NavMenuItem } from "./nav-item";
import { NavCollapsedTile, navCollapsedRowStyle } from "./nav-collapsed-tile";
import {
  NAV_FLYOUT,
  NAV_MENU,
  navIconColor,
  navRowRadius,
  navSurface,
  navTreeDotColor,
  navTreeLineColor,
} from "./nav-styles";
import type { NavItem } from "./types";

type Props = { item: NavItem; inPopup?: boolean };

function anyChildActive(item: NavItem, path: string): boolean {
  return (
    item.children?.some((c) => c.path === path || anyChildActive(c, path)) ??
    false
  );
}

// ─── NavItem[] → Ant Design Menu items ───────────────────────────────────────
type AntMenuItem = Required<AntMenuProps>["items"][number];

function toAntItems(items: NavItem[]): AntMenuItem[] {
  return items.map((item) => {
    const disabled = item.disabled || item.comingSoon === true;
    const icon = (
      <item.icon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
    );

    if (item.children?.length) {
      return {
        key: item.id,
        label: item.label,
        icon,
        disabled,
        children: toAntItems(item.children),
      } as AntMenuItem;
    }

    return {
      key: item.path ?? item.id,
      label: item.badge
        ? ((
            <span className="flex items-center gap-1.5">
              <span className="flex-1 truncate">{item.label}</span>
              <NavBadge
                label={item.badge}
                variant={item.badgeVariant}
                compact
              />
            </span>
          ) as ReactNode)
        : item.label,
      icon,
      disabled,
    } as AntMenuItem;
  });
}

// Walk the tree to find a NavItem by its path
function findByPath(items: NavItem[], path: string): NavItem | undefined {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NavSubMenu({ item, inPopup = false }: Props) {
  const {
    activePath,
    collapse,
    openedMenus,
    openMenu,
    closeMenu,
    toggleMenu,
    itemHeight = 36,
    onSelect,
    hoveredId,
    setHoveredId,
  } = useMenuContext();
  const level = useMenuLevel();
  const isOpen = openedMenus.has(item.id);
  const hasActive = anyChildActive(item, activePath);
  const isHighlighted = hasActive;
  const rowRadius = navRowRadius(false, inPopup);
  const isHovered = hoveredId === item.id && !isHighlighted;

  // Auto-open if a child is active on first render
  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current && hasActive && !collapse) {
      openMenu(item.id, []);
      seededRef.current = true;
    }
  }, [hasActive, collapse, item.id, openMenu]);

  // Close when sidebar collapses
  useEffect(() => {
    if (collapse) closeMenu(item.id);
  }, [collapse, item.id, closeMenu]);

  // ── Collapsed mode: Ant Design Menu inside the flyout panel ──────────────
  if (collapse && !inPopup) {
    const antItems = toAntItems(item.children ?? []);
    const selectedKey = activePath;

    const trigger = (
      <button
        type="button"
        className="group flex w-full select-none items-center justify-center"
        style={navCollapsedRowStyle()}
      >
        <NavCollapsedTile icon={item.icon} active={hasActive} />
      </button>
    );

    return (
      <CollapsedNavFlyout trigger={trigger} title={item.label} align="start">
        <Menu
          mode="inline"
          items={antItems}
          selectedKeys={[selectedKey]}
          inlineIndent={12}
          onClick={({ key }) => {
            const found = findByPath(item.children ?? [], key);
            if (found) onSelect(found);
          }}
          style={{
            background: "transparent",
            border: "none",
            width: "100%",
            minWidth: NAV_FLYOUT.minWidth - NAV_FLYOUT.padding * 2,
          }}
        />
      </CollapsedNavFlyout>
    );
  }

  // ── Expanded mode: accordion ──────────────────────────────────────────────
  const paddingLeft = inPopup ? 10 : 10 + level * 12;
  const rowHeight = inPopup ? NAV_FLYOUT.itemHeight : itemHeight;

  return (
    <div>
      <div
        className="relative"
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Hover surface */}
        {isHovered && (
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: inPopup ? NAV_FLYOUT.radius - 2 : 9999,
              background: navSurface.hover,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={() => toggleMenu(item.id, [])}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMenu(item.id, []);
            }
          }}
          className={[
            "group relative flex w-full select-none items-center gap-2 text-left outline-none",
            "transition-colors duration-150",
            inPopup ? "rounded-lg" : "",
            isHighlighted
              ? "text-accent"
              : "text-nav-inactive hover:text-nav-active focus-visible:text-nav-active",
          ].join(" ")}
          style={{
            height: rowHeight,
            borderRadius: inPopup ? NAV_FLYOUT.radius - 2 : rowRadius,
            paddingLeft: inPopup ? undefined : paddingLeft,
            paddingRight: inPopup ? undefined : 8,
            zIndex: 1,
            position: "relative",
          }}
          aria-expanded={isOpen}
        >
          <item.icon
            size={15}
            strokeWidth={isHighlighted ? 2.2 : 1.75}
            className="shrink-0"
            style={navIconColor(isHighlighted)}
          />
          <span
            className={[
              "min-w-0 flex-1 truncate text-[13px] leading-none",
              isHighlighted ? "font-semibold" : "font-medium",
            ].join(" ")}
          >
            {item.label}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {item.badge && (
              <NavBadge
                label={item.badge}
                variant={item.badgeVariant}
                compact
              />
            )}
            <motion.span
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                opacity: isOpen ? 0.65 : 0.35,
              }}
            >
              <ChevronRight size={13} strokeWidth={2} className="shrink-0" />
            </motion.span>
          </div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (!collapse || inPopup) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <SubMenuTree
              item={item}
              level={level}
              activePath={activePath}
              anchorPaddingLeft={paddingLeft}
              inPopup={inPopup}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-menu tree (expanded sidebar) ─────────────────────────────────────────

function SubMenuTree({
  item,
  level,
  activePath,
  anchorPaddingLeft,
  inPopup = false,
}: {
  item: NavItem;
  level: number;
  activePath: string;
  anchorPaddingLeft: number;
  inPopup?: boolean;
}) {
  const hasActiveChild = anyChildActive(item, activePath);
  const children = item.children ?? [];

  if (inPopup) {
    return (
      <div className="flex flex-col pt-0.5" style={{ paddingLeft: 8, gap: 2 }}>
        <LevelProvider value={level + 1}>
          {children.map((child) =>
            child.children?.length ? (
              <NavSubMenu key={child.id} item={child} inPopup />
            ) : (
              <NavMenuItem key={child.id} item={child} inPopup />
            ),
          )}
        </LevelProvider>
      </div>
    );
  }

  const guideX = anchorPaddingLeft + NAV_MENU.treeGuideOffset;
  const contentPadLeft = guideX + NAV_MENU.treeBranchWidth + 4;

  return (
    <div
      className="relative pb-0.5 pt-0.5"
      style={{ paddingLeft: contentPadLeft, paddingRight: NAV_MENU.marginX }}
    >
      {/* Vertical guide line */}
      <span
        className="pointer-events-none absolute w-px transition-colors duration-200"
        style={{
          left: guideX,
          top: 4,
          bottom: 16,
          background: navTreeLineColor(hasActiveChild),
        }}
        aria-hidden
      />

      <div className="flex flex-col">
        <LevelProvider value={level + 1}>
          {children.map((child, idx) => {
            const isLastChild = idx === children.length - 1;
            const isChildActive =
              child.path === activePath || anyChildActive(child, activePath);

            return (
              <div key={child.id} className="relative">
                {/* Branch connector */}
                <span
                  className="pointer-events-none absolute flex items-center"
                  style={{
                    left: -(NAV_MENU.treeBranchWidth + 4),
                    top: "50%",
                    width: NAV_MENU.treeBranchWidth,
                    transform: "translateY(-50%)",
                  }}
                  aria-hidden
                >
                  <span
                    className="block h-px flex-1 transition-colors duration-200"
                    style={{ background: navTreeLineColor(isChildActive) }}
                  />
                  <span
                    className="block h-1 w-1 shrink-0 rounded-full transition-colors duration-200"
                    style={{ background: navTreeDotColor(isChildActive) }}
                  />
                </span>

                {/* Cover the guide line below the last child */}
                {isLastChild && (
                  <span
                    className="pointer-events-none absolute w-px"
                    style={{
                      left: -(NAV_MENU.treeBranchWidth + 4),
                      top: "50%",
                      bottom: 0,
                      background: "var(--bg-sidebar)",
                    }}
                    aria-hidden
                  />
                )}

                {child.children?.length ? (
                  <NavSubMenu item={child} />
                ) : (
                  <NavMenuItem item={child} />
                )}
              </div>
            );
          })}
        </LevelProvider>
      </div>
    </div>
  );
}
