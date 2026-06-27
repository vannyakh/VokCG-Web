"use client";

import { Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  PowerOff,
  RotateCcw,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { User } from "@/types/auth";

type UserActionsMenuProps = {
  user: User;
  onDetail: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
};

export function UserActionsMenu({
  user,
  onDetail,
  onEdit,
  onToggleActive,
  onDelete,
  onResetPassword,
}: UserActionsMenuProps) {
  const confirmDelete = () => {
    Modal.confirm({
      title: "Delete this user?",
      content: "This action cannot be undone. All data will be permanently removed.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => void onDelete(user),
    });
  };

  const items: MenuProps["items"] = [
    {
      key: "detail",
      icon: <Eye size={13} />,
      label: "View details",
      onClick: () => onDetail(user),
    },
    {
      key: "edit",
      icon: <Pencil size={13} />,
      label: "Edit profile",
      onClick: () => onEdit(user),
    },
    { type: "divider" },
    {
      key: "toggle",
      icon: user.is_active ? <PowerOff size={13} /> : <UserCheck size={13} />,
      label: user.is_active ? "Deactivate" : "Activate",
      onClick: () => void onToggleActive(user),
    },
    {
      key: "reset-password",
      icon: <RotateCcw size={13} />,
      label: "Reset password",
      onClick: () => onResetPassword(user),
    },
    { type: "divider" },
    {
      key: "delete",
      icon: <Trash2 size={13} />,
      label: "Delete account",
      danger: true,
      onClick: confirmDelete,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-all hover:bg-black/6 hover:text-primary dark:hover:bg-white/8 active:scale-90"
      >
        <MoreHorizontal size={15} />
      </button>
    </Dropdown>
  );
}
