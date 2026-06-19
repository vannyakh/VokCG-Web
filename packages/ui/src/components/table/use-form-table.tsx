"use client"

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table'
import { Checkbox, Form } from 'antd'
import { useCallback, useMemo, useState } from 'react'

import type { FormTableConfig } from '../table/form-table.types'

export type UseFormTableReturn<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = {
  form: ReturnType<typeof Form.useForm<TFilter>>[0]
  table: ReturnType<typeof useReactTable<TData>>
  filteredCount: number
  rowSelection: RowSelectionState
  setRowSelection: (value: RowSelectionState) => void
  collapsed: boolean
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  handleSearch: () => void
  handleReset: () => void
  config: FormTableConfig<TData, TFilter>
}

export function useFormTable<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown> = Record<string, unknown>,
>(config: FormTableConfig<TData, TFilter>): UseFormTableReturn<TData, TFilter> {
  const [form] = Form.useForm<TFilter>()
  const [appliedFilters, setAppliedFilters] = useState<TFilter>({} as TFilter)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [collapsed, setCollapsed] = useState(false)

  const filteredData = useMemo(() => {
    if (!config.formSchema?.length || !config.filterFn) return config.data
    return config.data.filter((row) => config.filterFn!(appliedFilters, row))
  }, [appliedFilters, config])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo((): ColumnDef<TData, any>[] => {
    const cols: ColumnDef<TData, unknown>[] = []

    if (config.showIndex !== false) {
      cols.push({
        id: '__index',
        header: 'No.',
        size: 56,
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return (
            <span className="text-xs text-muted">{pageIndex * pageSize + row.index + 1}</span>
          )
        },
      })
    }

    if (config.enableRowSelection) {
      cols.push({
        id: '__select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        size: 48,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      })
    }

    return [...cols, ...config.columns]
  }, [config.columns, config.enableRowSelection, config.showIndex])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection },
    enableRowSelection: config.enableRowSelection,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => config.getRowId(row),
    initialState: {
      pagination: { pageSize: config.pageSize ?? 20 },
    },
  })

  const handleSearch = useCallback(() => {
    setAppliedFilters(form.getFieldsValue())
    table.setPageIndex(0)
  }, [form, table])

  const handleReset = useCallback(() => {
    form.resetFields()
    setAppliedFilters({} as TFilter)
    table.setPageIndex(0)
  }, [form, table])

  return {
    form,
    table,
    filteredCount: filteredData.length,
    rowSelection,
    setRowSelection,
    collapsed,
    setCollapsed,
    handleSearch,
    handleReset,
    config,
  }
}
