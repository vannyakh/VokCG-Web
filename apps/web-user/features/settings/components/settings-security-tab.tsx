"use client";

import { Form, Input } from "antd";
import { Lock, MonitorSmartphone } from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "@vokcg/i18n";
import {
  useAuthSessions,
  useChangePassword,
  useRevokeOtherSessions,
  useRevokeSession,
} from "@/api";
import { useAppMessage } from "@vokcg/ui";
import {
  SettingsDangerButton,
  SettingsOutlineButton,
  SettingsPrimaryButton,
} from "./settings-button";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
  SettingsCardHeader,
  SettingsListRow,
  SettingsSaveRow,
} from "./settings-card";

function formatSessionDate(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function sessionLabel(userAgent?: string | null) {
  if (!userAgent) return "Unknown device";
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return "Mobile device";
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Browser session";
}

export function SettingsSecurityTab() {
  const { t } = useLocale();
  const message = useAppMessage();
  const [passwordForm] = Form.useForm();
  const changePassword = useChangePassword();
  const { data: sessions, isLoading: sessionsLoading } = useAuthSessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  const sessionList = sessions ?? [];
  const otherSessions = useMemo(
    () => sessionList.filter((s) => !s.is_current),
    [sessionList],
  );

  const handlePasswordChange = async (values: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    if (values.new_password !== values.confirm_password) {
      message.error(t("settings.security.passwordMismatch"));
      return;
    }
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      message.success(t("settings.security.passwordUpdated"));
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : t("settings.security.passwordFailed"),
      );
    }
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId);
      message.success(t("settings.security.sessionRevoked"));
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : t("settings.security.sessionRevokeFailed"),
      );
    }
  };

  const handleRevokeOthers = async () => {
    try {
      const response = await revokeOthers.mutateAsync();
      const revoked =
        (response as { data?: { revoked?: number } })?.data?.revoked ?? 0;
      message.success(
        revoked > 0
          ? t("settings.security.otherSessionsRevoked", {
              count: String(revoked),
            })
          : t("settings.security.noOtherSessions"),
      );
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : t("settings.security.sessionRevokeFailed"),
      );
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SettingsCard>
        <SettingsCardHeader
          icon={Lock}
          tone="green"
          title={t("settings.security.passwordTitle")}
          subtitle={t("settings.security.passwordHint")}
        />
        <SettingsCardBody>
          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handlePasswordChange}
            className="settings-form-grid settings-form-grid--single"
          >
            <Form.Item
              name="current_password"
              label={t("settings.security.currentPassword")}
              rules={[
                {
                  required: true,
                  message: t("settings.security.currentPasswordRequired"),
                },
              ]}
            >
              <Input.Password
                autoComplete="current-password"
                placeholder={t("settings.security.currentPasswordPlaceholder")}
              />
            </Form.Item>
            <Form.Item
              name="new_password"
              label={t("settings.security.newPassword")}
              rules={[
                {
                  required: true,
                  message: t("settings.security.newPasswordRequired"),
                },
                { min: 6, message: t("settings.security.newPasswordMin") },
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder={t("settings.security.newPasswordPlaceholder")}
              />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              label={t("settings.security.confirmPassword")}
              rules={[
                {
                  required: true,
                  message: t("settings.security.confirmPasswordRequired"),
                },
              ]}
              className="settings-form-full"
            >
              <Input.Password
                autoComplete="new-password"
                placeholder={t("settings.security.confirmPasswordPlaceholder")}
              />
            </Form.Item>
          </Form>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SettingsSaveRow>
            <SettingsPrimaryButton
              onClick={() => passwordForm.submit()}
              loading={changePassword.isPending}
            >
              {t("settings.security.updatePassword")}
            </SettingsPrimaryButton>
          </SettingsSaveRow>
        </SettingsCardFooter>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader
          icon={MonitorSmartphone}
          tone="blue"
          title={t("settings.security.sessionsTitle")}
          subtitle={t("settings.security.sessionsHint")}
          extra={
            otherSessions.length > 0 ? (
              <SettingsOutlineButton
                size="sm"
                loading={revokeOthers.isPending}
                onClick={() => void handleRevokeOthers()}
              >
                {t("settings.security.revokeOtherSessions")}
              </SettingsOutlineButton>
            ) : null
          }
        />
        <SettingsCardBody flush>
          {sessionsLoading ? (
            <p className="py-6 text-[15px] text-muted">
              {t("settings.security.sessionsLoading")}
            </p>
          ) : sessionList.length === 0 ? (
            <p className="py-6 text-[15px] text-muted">
              {t("settings.security.noSessions")}
            </p>
          ) : (
            sessionList.map((session) => (
              <SettingsListRow
                key={session.id}
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle text-secondary">
                    <MonitorSmartphone size={17} strokeWidth={1.8} />
                  </div>
                }
                action={
                  !session.is_current ? (
                    <SettingsDangerButton
                      size="sm"
                      loading={revokeSession.isPending}
                      onClick={() => void handleRevoke(session.id)}
                    >
                      {t("settings.security.revokeSession")}
                    </SettingsDangerButton>
                  ) : undefined
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-primary">
                    {sessionLabel(session.user_agent)}
                  </span>
                  {session.is_current && (
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                      {t("settings.security.currentSession")}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {formatSessionDate(session.created_at)}
                  {session.ip_address ? ` · ${session.ip_address}` : ""}
                </p>
              </SettingsListRow>
            ))
          )}
        </SettingsCardBody>
      </SettingsCard>
    </div>
  );
}
