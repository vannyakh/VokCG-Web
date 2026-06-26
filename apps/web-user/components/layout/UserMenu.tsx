"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useLogout } from "@/api";
import { USER_ROUTES } from "@vokcg/constants";
import { useLocale } from "@vokcg/i18n";
import { useAuthStore } from "@/store";
import { UserAvatar } from "@vokcg/ui";

export function UserMenu() {
  const { t } = useLocale();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout.mutate(undefined, {
      onSettled: () => router.push(USER_ROUTES.login),
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      handleLogout();
    } else if (key === "settings") {
      router.push(USER_ROUTES.settings);
      setOpen(false);
    }
  };

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "header",
        type: "group" as const,
        label: (
          <div className="flex items-center gap-3 px-1 py-1.5 pb-2.5 border-b border-default/40 select-none">
            <UserAvatar
              username={user.username}
              avatarUrl={user.avatar_url}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-primary leading-tight">
                {user.username}
              </div>
              <div className="truncate text-xs text-muted mt-0.5">
                {user.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "settings",
        icon: <Settings size={15} className="text-secondary" />,
        label: (
          <span className="text-[13px] font-medium text-primary">
            {t("nav.settings")}
          </span>
        ),
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        danger: true,
        icon: <LogOut size={15} />,
        label: (
          <span className="text-[13px] font-medium">
            {logout.isPending ? "Logging out..." : t("header.logout")}
          </span>
        ),
      },
    ],
    [user, t, logout.isPending],
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      menu={{ items: menuItems, onClick: handleMenuClick }}
      classNames={{ root: "user-menu-dropdown" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center justify-center rounded-full p-0.5 transition-all duration-150 hover:bg-[var(--bg-active)] cursor-pointer outline-none"
        style={{
          outline: open
            ? "1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)"
            : "1.5px solid transparent",
          outlineOffset: 1,
        }}
      >
        <UserAvatar
          username={user.username}
          avatarUrl={user.avatar_url}
          size="sm"
        />
      </button>
    </Dropdown>
  );
}
