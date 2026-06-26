"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { motion } from "framer-motion";
import {
  ChevronRight,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings2,
  Sun,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN_TAB_META, ADMIN_ROUTES } from "@vokcg/constants";
import type { AdminTab } from "@vokcg/constants";
import { API_BASE_URL } from "@vokcg/config";
import { useAdminLogout } from "@/api";
import { useAdminAuthStore } from "@/store";
import { useColorMode, Tooltip } from "@vokcg/ui";

type AdminHeaderProps = {
  activeTab: AdminTab;
  collapsed: boolean;
  onSidebarToggle: () => void;
  onRefresh: () => void;
  onSettingsOpen: () => void;
  refreshing?: boolean;
};

function HeaderIconBtn({
  onClick,
  tooltip,
  children,
}: {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        onClick={onClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function AdminHeader({
  activeTab,
  collapsed,
  onSidebarToggle,
  onRefresh,
  onSettingsOpen,
  refreshing,
}: AdminHeaderProps) {
  const meta = ADMIN_TAB_META[activeTab];
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useAdminAuthStore((state) => state.admin);
  const logout = useAdminLogout();
  const router = useRouter();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "AD";

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className="min-w-0 px-1 py-1">
          <p className="truncate text-[13px] font-semibold text-primary">
            {user?.username ?? "Administrator"}
          </p>
          {user?.email && (
            <p className="truncate text-[11px] text-muted">{user.email}</p>
          )}
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-accent">
            {user?.is_superuser ? "Super Admin" : "Admin"}
          </p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={13} />,
      label: "Sign out",
      danger: true,
      onClick: () =>
        logout.mutate(undefined, {
          onSettled: () => router.push(ADMIN_ROUTES.login),
        }),
    },
  ];

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-default bg-surface px-3">
      {/* Sidebar toggle */}
      <HeaderIconBtn
        tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onSidebarToggle}
      >
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </HeaderIconBtn>

      <div className="h-4 w-px shrink-0 bg-[var(--border-default)]" />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex select-none items-center gap-1 text-[12px]"
      >
        <span className="font-medium text-muted">Admin</span>
        <ChevronRight size={10} className="shrink-0 text-muted/50" />
        <span className="font-semibold text-primary">{meta.label}</span>
      </nav>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-0.5">
        <Tooltip content={refreshing ? "Refreshing…" : "Refresh data"}>
          <motion.button
            type="button"
            onClick={onRefresh}
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={
              refreshing
                ? { duration: 0.7, ease: "linear", repeat: Infinity }
                : { duration: 0 }
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
          >
            <RefreshCw size={15} className={refreshing ? "text-accent" : ""} />
          </motion.button>
        </Tooltip>

        <HeaderIconBtn
          tooltip={
            colorMode === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          onClick={toggleColorMode}
        >
          {colorMode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </HeaderIconBtn>

        <HeaderIconBtn tooltip="Theme & preferences" onClick={onSettingsOpen}>
          <Settings2 size={15} />
        </HeaderIconBtn>
      </div>

      {/* User menu */}
      {user && (
        <>
          <div className="mx-1 h-5 w-px shrink-0 bg-[var(--border-default)]" />

          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{ minWidth: 200 }}
            menu={{ items: userMenuItems }}
          >
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-transparent transition-all hover:ring-[var(--border-default)] active:scale-95"
            >
              {user.avatar_url ? (
                <img
                  src={`${API_BASE_URL}${user.avatar_url}`}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {initials}
                </div>
              )}
            </button>
          </Dropdown>
        </>
      )}
    </div>
  );
}
