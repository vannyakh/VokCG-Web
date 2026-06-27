"use client";

import { Form, Input, Modal, Switch } from "antd";
import { KeyRound, Mail, User, UserCircle } from "lucide-react";
import { AdminUserAvatar } from "@/components/admin";
import type { UserFormValues } from "../hooks/use-users-page";
import type { User as UserType } from "@/types/auth";
import type { FormInstance } from "antd";

type UserFormModalProps = {
  open: boolean;
  editing: UserType | null;
  form: FormInstance<UserFormValues>;
  confirmLoading: boolean;
  onOk: () => void;
  onCancel: () => void;
};

export function UserFormModal({
  open,
  editing,
  form,
  confirmLoading,
  onOk,
  onCancel,
}: UserFormModalProps) {
  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <User size={15} className="text-accent" />
          {editing ? "Edit user" : "Add user"}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText={editing ? "Save changes" : "Create user"}
      confirmLoading={confirmLoading}
      destroyOnHidden
      width={460}
    >
      <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
        {editing ? (
          /* ── Edit mode: read-only identity + editable profile fields ── */
          <>
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-default bg-subtle/40 px-4 py-3">
              <AdminUserAvatar
                username={editing.username}
                avatarUrl={editing.avatar_url}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-primary">
                  {editing.username}
                </p>
                <p className="truncate text-[12px] text-muted">{editing.email}</p>
              </div>
            </div>

            <Form.Item name="full_name" label="Display name">
              <Input
                prefix={<UserCircle size={14} className="text-muted" />}
                placeholder="Jane Doe"
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Account active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        ) : (
          /* ── Create mode: full registration fields ── */
          <>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email", message: "Valid email required" }]}
            >
              <Input
                prefix={<Mail size={14} className="text-muted" />}
                placeholder="user@example.com"
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, min: 3, max: 64, message: "3–64 characters" }]}
            >
              <Input
                prefix={<span className="text-[13px] text-muted">@</span>}
                placeholder="jane_doe"
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}
            >
              <Input.Password
                prefix={<KeyRound size={14} className="text-muted" />}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item name="full_name" label="Display name (optional)">
              <Input
                prefix={<UserCircle size={14} className="text-muted" />}
                placeholder="Jane Doe"
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Account active"
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
