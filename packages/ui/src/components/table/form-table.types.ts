import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

export type FormFieldSchema = {
  name: string
  label: string
  type?: 'input' | 'select'
  placeholder?: string
  options?: { label: string; value: string | number | boolean }[]
  componentProps?: Record<string, unknown>
}

export type FormTableConfig<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown> = Record<string, unknown>,
> = {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  getRowId: (row: TData) => string
  /** Search form fields — omit to hide form card */
  formSchema?: FormFieldSchema[]
  /** Client-side filter applied on Search */
  filterFn?: (filter: TFilter, row: TData) => boolean
  loading?: boolean
  emptyText?: string
  pageSize?: number
  showIndex?: boolean
  enableRowSelection?: boolean
  collapsedRows?: number
  toolbar?: ReactNode
  onRefresh?: () => void
  scrollX?: number | string
}

export type FormTableState<TFilter extends Record<string, unknown>> = {
  filters: TFilter
  rowSelection: Record<string, boolean>
  collapsed: boolean
}
