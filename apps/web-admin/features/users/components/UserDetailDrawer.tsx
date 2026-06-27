"use client";

import { Button, Drawer, Popconfirm, Tag } from "antd";
import {
  CalendarDays,
  Clock,
  Mail,
  Pencil,
  PowerOff,
  RotateCcw,
  Trash2,
  UserCheck,
} from "lucide-react";
import { formatAdminDate } from "@vokcg/ui";
import { AdminUserAvatar } from "@/components/admin";
import type { User } from "@/types/auth";

type UserDetailDrawerProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  isTogglingActive?: boolean;
  isDeleting?: boolean;
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
        }}
      >
        <Icon size={13} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        <div className="mt-0.5 text-[13px] font-medium text-primary break-all">
          {value}
        </div>
      </div>
    </div>
  );
}

function accountAge(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86_400_000,
  );
  if (days < 1) return "Today";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}yr`;
}

export function UserDetailDrawer({
  open,
  user,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
  onResetPassword,
  isTogglingActive,
  isDeleting,
}: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          <UserCheck size={15} className="text-accent" />
          User Profile
        </span>
      }
      width={360}
      styles={{
        body: { padding: 0, display: "flex", flexDirection: "column" },
      }}
    >
      {/* ── Avatar + name banner ────────────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-3 px-6 py-8 text-center"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <AdminUserAvatar
          username={user.username}
          avatarUrl={user.avatar_url}
          size="xl"
        />
        <div>
          <p className="text-[16px] font-bold text-primary">{user.username}</p>
          {user.full_name && (
            <p className="text-[13px] text-muted">{user.full_name}</p>
          )}
        </div>
        <Tag
          color={user.is_active ? "green" : "default"}
          className="rounded-full px-3"
        >
          {user.is_active ? "Active" : "Inactive"}
        </Tag>
      </div>

      {/* ── Info fields ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-6 py-5">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow
          icon={CalendarDays}
          label="Member since"
          value={formatAdminDate(user.created_at)}
        />
        <InfoRow
          icon={Clock}
          label="Account age"
          value={accountAge(user.created_at)}
        />
        <InfoRow
          icon={Clock}
          label="Last updated"
          value={formatAdminDate(user.updated_at)}
        />
      </div>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div
        className="mt-auto flex flex-col gap-2 px-6 py-5"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        <Button
          block
          icon={<Pencil size={13} />}
          onClick={() => {
            onClose();
            onEdit(user);
          }}
        >
          Edit profile
        </Button>

        <Button
          block
          icon={<RotateCcw size={13} />}
          onClick={() => onResetPassword(user)}
        >
          Reset password
        </Button>

        <Popconfirm
          title={
            user.is_active ? "Deactivate this user?" : "Activate this user?"
          }
          description={
            user.is_active
              ? "The user will lose access until reactivated."
              : "The user will be able to sign in again."
          }
          onConfirm={() => void onToggleActive(user)}
          okText="Confirm"
        >
          <Button
            block
            icon={<PowerOff size={13} />}
            loading={isTogglingActive}
            danger={user.is_active}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
        </Popconfirm>

        <Popconfirm
          title="Delete this user?"
          description="This action cannot be undone. All data will be permanently removed."
          onConfirm={() => void onDelete(user)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button
            block
            danger
            icon={<Trash2 size={13} />}
            loading={isDeleting}
          >
            Delete account
          </Button>
        </Popconfirm>
      </div>
    </Drawer>
  );
}
