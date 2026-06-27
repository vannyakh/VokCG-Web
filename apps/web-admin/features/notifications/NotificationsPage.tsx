"use client";

import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Tag,
} from "antd";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { Page } from "@vokcg/ui";
import { FormTableUI, useFormTable } from "@vokcg/ui/table";
import {
  useAdminNotifications,
  useCreateNotification,
  useDeleteNotification,
  useUpdateNotification,
} from "@/api";
import { useAppMessage } from "@vokcg/ui";
import type {
  NotificationChannel,
  NotificationTemplate,
} from "@/types/platform";

const CHANNEL_COLOR: Record<NotificationChannel, string> = {
  email: "blue",
  in_app: "purple",
  sms: "green",
};

type NotificationFilters = {
  name?: string;
  channel?: NotificationChannel;
  enabled?: boolean;
};

const columnHelper = createColumnHelper<NotificationTemplate>();

export function NotificationsPage() {
  const message = useAppMessage();
  const { data, isLoading, refetch } = useAdminNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);

  const templates = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, sent_30d: 0 });
    setOpen(true);
  };

  const openEdit = (item: NotificationTemplate) => {
    setEditing(item);
    form.setFieldsValue(item);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateNotification.mutateAsync({ id: editing.id, body: values });
        message.success("Template updated");
      } else {
        await createNotification.mutateAsync(values);
        message.success("Template created");
      }
      setOpen(false);
    } catch {
      message.error("Failed to save template");
    }
  };

  const toggleEnabled = async (
    item: NotificationTemplate,
    enabled: boolean,
  ) => {
    try {
      await updateNotification.mutateAsync({ id: item.id, body: { enabled } });
    } catch {
      message.error("Failed to update template");
    }
  };

  const formTable = useFormTable<NotificationTemplate, NotificationFilters>({
    data: templates,
    getRowId: (row) => row.id,
    loading: isLoading,
    enableRowSelection: true,
    emptyText: "No notification templates yet.",
    onRefresh: () => refetch(),
    formSchema: [
      { name: "name", label: "Name", placeholder: "Template name" },
      {
        name: "channel",
        label: "Channel",
        type: "select",
        placeholder: "All channels",
        options: [
          { value: "email", label: "Email" },
          { value: "in_app", label: "In-app" },
          { value: "sms", label: "SMS" },
        ],
      },
      {
        name: "enabled",
        label: "Status",
        type: "select",
        placeholder: "All statuses",
        options: [
          { value: true, label: "Enabled" },
          { value: false, label: "Disabled" },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (
        filter.name &&
        !row.name.toLowerCase().includes(filter.name.toLowerCase())
      )
        return false;
      if (filter.channel && row.channel !== filter.channel) return false;
      if (filter.enabled !== undefined && row.enabled !== filter.enabled)
        return false;
      return true;
    },
    columns: [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("channel", {
        header: "Channel",
        size: 120,
        cell: (info) => {
          const channel = info.getValue() as NotificationChannel;
          return (
            <Tag variant="filled" color={CHANNEL_COLOR[channel]}>
              {channel.replace("_", "-")}
            </Tag>
          );
        },
      }),
      columnHelper.accessor("sent_30d", {
        header: "Sent (30d)",
        size: 120,
        cell: (info) => (
          <span className="block text-right">
            {info.getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("enabled", {
        header: "Enabled",
        size: 90,
        cell: (info) => (
          <Switch
            size="small"
            checked={info.getValue()}
            onChange={(checked) => toggleEnabled(info.row.original, checked)}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        size: 140,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              type="link"
              size="small"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this template?"
              onConfirm={() => deleteNotification.mutateAsync(row.original.id)}
            >
              <Button type="link" size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </div>
        ),
      }),
    ],
  });

  return (
    <Page
      autoContentHeight
      title="Notifications"
      description="Email, in-app, and SMS notification templates."
      extra={
        <Button type="primary" size="small" onClick={openCreate}>
          New template
        </Button>
      }
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? "Edit template" : "New template"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Video ready" />
          </Form.Item>
          <Form.Item
            name="channel"
            label="Channel"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "email", label: "Email" },
                { value: "in_app", label: "In-app" },
                { value: "sms", label: "SMS" },
              ]}
            />
          </Form.Item>
          <Form.Item name="sent_30d" label="Sent (30 days)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}
