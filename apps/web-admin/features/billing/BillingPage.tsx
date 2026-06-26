"use client";

import { Alert, Button, Card, Form, Input, Skeleton, Tag } from "antd";
import { Page } from "@vokcg/ui";
import { useStripeSettings, useUpdateStripeSettings } from "@/api";
import { useAppMessage } from "@vokcg/ui";

export function BillingPage() {
  const message = useAppMessage();
  const { data, isLoading } = useStripeSettings();
  const updateSettings = useUpdateStripeSettings();
  const [form] = Form.useForm();
  const settings = data?.data;

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      await updateSettings.mutateAsync({
        secret_key: values.secret_key || undefined,
        publishable_key: values.publishable_key || undefined,
        webhook_secret: values.webhook_secret || undefined,
      });
      form.resetFields();
      message.success("Stripe settings saved");
    } catch {
      message.error("Failed to save Stripe settings");
    }
  };

  return (
    <Page
      title="Stripe Billing"
      description="Configure Stripe keys and webhook endpoint for subscription checkout."
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex max-w-2xl flex-col gap-4">
          <Card className="border-default bg-surface">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-primary">Status</span>
              <Tag color={settings?.configured ? "green" : "default"}>
                {settings?.configured
                  ? `${settings.mode} mode`
                  : "Not configured"}
              </Tag>
              {settings?.secret_key_set && (
                <Tag color="blue">Secret key set</Tag>
              )}
              {settings?.webhook_secret_set && (
                <Tag color="purple">Webhook secret set</Tag>
              )}
            </div>
            {settings?.publishable_key && (
              <p className="mb-4 font-mono text-xs text-muted">
                Publishable key: {settings.publishable_key}
              </p>
            )}
            <Alert
              type="info"
              showIcon
              className="mb-4"
              title="Stripe webhook URL"
              description={`${window.location.origin}/api/v1/webhooks/stripe`}
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="secret_key"
                label="Secret key"
                extra="Leave blank to keep existing"
              >
                <Input.Password placeholder="sk_test_..." />
              </Form.Item>
              <Form.Item name="publishable_key" label="Publishable key">
                <Input placeholder="pk_test_..." />
              </Form.Item>
              <Form.Item
                name="webhook_secret"
                label="Webhook signing secret"
                extra="Leave blank to keep existing"
              >
                <Input.Password placeholder="whsec_..." />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleSave}
                loading={updateSettings.isPending}
              >
                Save settings
              </Button>
            </Form>
          </Card>
        </div>
      )}
    </Page>
  );
}
