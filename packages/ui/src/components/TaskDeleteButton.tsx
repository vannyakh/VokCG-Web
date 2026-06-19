'use client'

import { Button, Popconfirm } from 'antd'
import { Trash2 } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { isTaskActive } from '../lib/task-status'
import type { Task } from '@vokcg/types'

type TaskDeleteButtonProps = {
  task: Task
  onDelete: (id: string) => void
  variant?: 'overlay' | 'table' | 'header'
}

export function TaskDeleteButton({ task, onDelete, variant = 'overlay' }: TaskDeleteButtonProps) {
  const { t } = useLocale()

  if (isTaskActive(task.state)) return null

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  const trigger =
    variant === 'table' ? (
      <Button
        type="text"
        size="small"
        danger
        icon={<Trash2 size={15} />}
        onClick={stop}
        className="rounded-lg opacity-60 hover:opacity-100"
      />
    ) : variant === 'header' ? (
      <Button type="text" size="small" danger icon={<Trash2 size={14} />} onClick={stop} className="rounded-lg" />
    ) : (
      <button
        type="button"
        aria-label={t('tasks.delete')}
        className="flex h-7 w-7 items-center justify-center rounded-full border text-white opacity-85 hover:bg-red-600 hover:opacity-100"
        style={{ background: 'rgba(0,0,0,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}
        onClick={stop}
      >
        <Trash2 size={13} />
      </button>
    )

  return (
    <Popconfirm
      title={t('tasks.deleteConfirmTitle')}
      description={t('tasks.deleteConfirmDescription')}
      okText={t('tasks.deleteConfirmOk')}
      cancelText={t('tasks.deleteConfirmCancel')}
      okButtonProps={{ danger: true }}
      onConfirm={() => onDelete(task.id)}
      onPopupClick={stop}
    >
      {trigger}
    </Popconfirm>
  )
}
