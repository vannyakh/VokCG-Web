"use client"

import { Button, Form, Input, Modal, Popconfirm, Select, Switch, Tag } from 'antd'
import { createColumnHelper } from '@tanstack/react-table'
import { useState } from 'react'
import { Page } from '@vokcg/ui'
import { FormTableUI, useFormTable } from '@vokcg/ui/table'
import { useAdminJobs, useCreateJob, useDeleteJob, useUpdateJob } from '@vokcg/api/hooks/use-admin-platform'
import { useAppMessage } from '@vokcg/ui/hooks/use-app-message'
import type { JobStatus, ScheduledJob } from '@vokcg/types'

type JobFilters = {
  name?: string
  status?: JobStatus
}

const columnHelper = createColumnHelper<ScheduledJob>()

export default function AdminJobsPage() {
  const message = useAppMessage()
  const { data, isLoading, refetch } = useAdminJobs()
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduledJob | null>(null)

  const jobs = data?.data ?? []

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setOpen(true)
  }

  const openEdit = (job: ScheduledJob) => {
    setEditing(job)
    form.setFieldsValue({ name: job.name, cron: job.cron, status: job.status })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        await updateJob.mutateAsync({ id: editing.id, body: values })
        message.success('Job updated')
      } else {
        await createJob.mutateAsync(values)
        message.success('Job created')
      }
      setOpen(false)
    } catch {
      message.error('Failed to save job')
    }
  }

  const toggleStatus = async (job: ScheduledJob, active: boolean) => {
    try {
      await updateJob.mutateAsync({
        id: job.id,
        body: { status: (active ? 'active' : 'paused') as JobStatus },
      })
    } catch {
      message.error('Failed to update job')
    }
  }

  const formTable = useFormTable<ScheduledJob, JobFilters>({
    data: jobs,
    getRowId: (row) => row.id,
    loading: isLoading,
    emptyText: 'No scheduled jobs yet.',
    onRefresh: () => refetch(),
    formSchema: [
      { name: 'name', label: 'Name', placeholder: 'Search job name' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'paused', label: 'Paused' },
        ],
      },
    ],
    filterFn: (filter, row) => {
      if (filter.name && !row.name.toLowerCase().includes(filter.name.toLowerCase())) return false
      if (filter.status && row.status !== filter.status) return false
      return true
    },
    columns: [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('cron', {
        header: 'Cron',
        cell: (info) => <code className="text-xs">{info.getValue()}</code>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const v = info.getValue()
          return (
            <Tag color={v === 'active' ? 'green' : 'default'} className="capitalize">
              {v}
            </Tag>
          )
        },
      }),
      columnHelper.accessor('last_run', {
        header: 'Last run',
        cell: (info) => {
          const v = info.getValue()
          return v ? new Date(v).toLocaleString() : '—'
        },
      }),
      columnHelper.accessor('next_run', {
        header: 'Next run',
        cell: (info) => {
          const v = info.getValue()
          return v ? new Date(v).toLocaleString() : '—'
        },
      }),
      columnHelper.display({
        id: 'enabled',
        header: 'Enabled',
        size: 90,
        cell: ({ row }) => (
          <Switch
            size="small"
            checked={row.original.status === 'active'}
            onChange={(checked) => toggleStatus(row.original, checked)}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 120,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button type="link" size="small" onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Popconfirm title="Delete this job?" onConfirm={() => deleteJob.mutateAsync(row.original.id)}>
              <Button type="link" size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </div>
        ),
      }),
    ],
  })

  return (
    <Page
      autoContentHeight
      title="Scheduled Jobs"
      description="Cron jobs and recurring background tasks."
      extra={
        <Button type="primary" size="small" onClick={openCreate}>
          Add job
        </Button>
      }
    >
      <FormTableUI {...formTable} />

      <Modal
        title={editing ? 'Edit job' : 'Add job'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Daily backup" />
          </Form.Item>
          <Form.Item name="cron" label="Cron expression" rules={[{ required: true }]}>
            <Input placeholder="0 2 * * *" className="font-mono" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  )
}
