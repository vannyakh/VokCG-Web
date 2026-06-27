"use client";

import { Tooltip } from "antd";
import { motion } from "framer-motion";
import { useMenuContext, useMenuLevel } from "./menu-context";
import { NavBadge } from "./nav-badge";
import { NavCollapsedTile, navCollapsedRowStyle } from "./nav-collapsed-tile";
import {
  NAV_FLYOUT,
  NAV_MENU,
  NAV_ROW,
  navIconColor,
  navItemButtonClass,
  navRowRadius,
  navSurface,
} from "./nav-styles";
import type { NavItem } from "./types";

type Props = { item: NavItem; inPopup?: boolean };

function resolveItem(item: NavItem) {
  const comingSoon = item.comingSoon === true;
  return {
    disabled: item.disabled || comingSoon,
    badge: item.badge ?? (comingSoon ? "Soon" : undefined),
    badgeVariant:
      item.badgeVariant ?? (comingSoon ? ("soon" as const) : undefined),
  };
}

export function NavMenuItem({ item, inPopup = false }: Props) {
  const {
    activePath,
    collapse,
    itemHeight = 44,
    onSelect,
    menuId,
    hoveredId,
    setHoveredId,
  } = useMenuContext();
  const level = useMenuLevel();
  const { disabled, badge, badgeVariant } = resolveItem(item);

  const isActive = !!item.path && item.path === activePath && !disabled;
  const isLeaf = !item.children?.length;
  const isNested = level > 0;
  const isCollapsed = collapse && !inPopup;
  const isHovered = hoveredId === item.id;
  const rowRadius = navRowRadius(isNested, inPopup);

  const rowHeight = isCollapsed
    ? NAV_MENU.collapsedItemHeight
    : inPopup
      ? NAV_FLYOUT.itemHeight
      : isNested && !inPopup
        ? itemHeight - NAV_MENU.nestedItemHeightOffset
        : itemHeight;

  const showActivePill = isActive && !isCollapsed;
  const showHoverPill = isHovered && !isCollapsed && !isActive && !disabled;

  // ── Collapsed mode: Ant Design Tooltip with just the label ────────────────
  if (isCollapsed) {
    const tip =
      item.tooltip ?? (badge ? `${item.label} · ${badge}` : item.label);
    return (
      <Tooltip
        title={tip}
        placement="right"
        mouseEnterDelay={0.05}
        mouseLeaveDelay={0.05}
        getPopupContainer={() => document.body}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => isLeaf && !disabled && onSelect(item)}
          className="group flex w-full select-none items-center justify-center"
          style={navCollapsedRowStyle()}
          aria-current={isActive ? "page" : undefined}
          aria-disabled={disabled}
        >
          <NavCollapsedTile icon={item.icon} active={isActive} />
        </button>
      </Tooltip>
    );
  }

  // ── Expanded / in-popup mode ───────────────────────────────────────────────
  const iconSize = inPopup
    ? NAV_ROW.flyoutIconSize
    : isNested && !inPopup
      ? NAV_ROW.nestedIconSize
      : NAV_ROW.iconSize;

  return (
    <div
      className="relative"
      style={!inPopup ? { marginInline: NAV_MENU.marginX } : undefined}
      onMouseEnter={() => !disabled && setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {showActivePill && (
        <motion.span
          layoutId={`${menuId}-active-pill`}
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: rowRadius,
            background: isNested ? navSurface.nestedActive : navSurface.active,
          }}
          aria-hidden
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {showHoverPill && (
        <motion.span
          layoutId={`${menuId}-hover-pill`}
          className="pointer-events-none absolute inset-0"
          style={{ borderRadius: rowRadius, background: navSurface.hover }}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => isLeaf && !disabled && onSelect(item)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && isLeaf && !disabled) {
            e.preventDefault();
            onSelect(item);
          }
        }}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={disabled}
        className={navItemButtonClass({
          collapse,
          inPopup,
          isActive,
          disabled,
          nested: isNested,
        })}
        style={{
          height: rowHeight,
          borderRadius: rowRadius,
          paddingLeft: inPopup ? 10 : isNested ? 8 : 10,
          paddingRight: inPopup ? 10 : 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ width: NAV_ROW.iconColumnWidth }}
        >
          <item.icon
            size={iconSize}
            strokeWidth={isActive ? 2.2 : 1.75}
            className="shrink-0"
            style={navIconColor(isActive)}
          />
        </span>
        <span
          className={[
            NAV_ROW.labelClass,
            isNested && !inPopup ? "text-[12.5px]" : "text-[13px]",
            isActive ? "font-semibold" : "font-medium",
          ].join(" ")}
        >
          {item.label}
        </span>
        {badge && (
          <NavBadge label={badge} variant={badgeVariant} compact={inPopup} />
        )}
        {level === 0 && !inPopup && !badge && (
          <span
            className="shrink-0"
            style={{ width: NAV_ROW.chevronColumnWidth }}
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}
