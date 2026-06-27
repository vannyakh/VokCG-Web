"use client";

import { Form, Input, Modal } from "antd";
import { KeyRound, ShieldAlert } from "lucide-react";
import { AdminUserAvatar } from "@/components/admin";
import type { User } from "@/types/auth";

type FormValues = {
  password: string;
  confirm: string;
};

type UserPasswordResetModalProps = {
  open: boolean;
  user: User | null;
  confirmLoading: boolean;
  onOk: (password: string) => void;
  onCancel: () => void;
};

export function UserPasswordResetModal({
  open,
  user,
  confirmLoading,
  onOk,
  onCancel,
}: UserPasswordResetModalProps) {
  const [form] = Form.useForm<FormValues>();

  const handleOk = async () => {
    const values = await form.validateFields();
    onOk(values.password);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <KeyRound size={15} className="text-accent" />
          Reset password
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Reset password"
      confirmLoading={confirmLoading}
      destroyOnHidden
      width={420}
      afterClose={() => form.resetFields()}
    >
      {user && (
        <div className="mt-4 space-y-4">
          {/* User identity */}
          <div className="flex items-center gap-3 rounded-xl border border-default bg-subtle/40 px-4 py-3">
            <AdminUserAvatar
              username={user.username}
              avatarUrl={user.avatar_url}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-primary">
                {user.username}
              </p>
              <p className="truncate text-[12px] text-muted">{user.email}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 dark:border-amber-400/20 dark:bg-amber-400/8">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
              The user will be signed out of all active sessions after the password is reset.
            </p>
          </div>

          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="password"
              label="New password"
              rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}
            >
              <Input.Password
                prefix={<KeyRound size={13} className="text-muted" />}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm the password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<KeyRound size={13} className="text-muted" />}
                placeholder="Repeat the new password"
                autoComplete="new-password"
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
}
