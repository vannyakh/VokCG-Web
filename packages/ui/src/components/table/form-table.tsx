"use client"

import { flexRender } from '@tanstack/react-table'
import { Button, Form, Input, Pagination, Select, Spin, Tooltip } from 'antd'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'

import type { FormFieldSchema, FormTableConfig } from '../table/form-table.types'
import { useFormTable, type UseFormTableReturn } from '../table/use-form-table'

const FORM_COLS = 4

function renderField(field: FormFieldSchema) {
  if (field.type === 'select') {
    return (
      <Select
        allowClear
        placeholder={field.placeholder}
        options={field.options}
        className="w-full"
        {...field.componentProps}
      />
    )
  }

  return (
    <Input allowClear placeholder={field.placeholder} {...field.componentProps} />
  )
}

type FormTableProps<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = UseFormTableReturn<TData, TFilter>

export function FormTableUI<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown> = Record<string, unknown>,
>({
  form,
  table,
  filteredCount,
  collapsed,
  setCollapsed,
  handleSearch,
  handleReset,
  config,
}: FormTableProps<TData, TFilter>) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [bodyHeight, setBodyHeight] = useState(320)

  const schema = config.formSchema ?? []
  const collapsedRows = config.collapsedRows ?? 1
  const maxCollapsedFields = collapsedRows * FORM_COLS
  const visibleSchema =
    collapsed && schema.length > maxCollapsedFields ? schema.slice(0, maxCollapsedFields) : schema
  const hiddenCount = schema.length - visibleSchema.length
  const showToolbar = Boolean(config.toolbar || config.onRefresh)

  useLayoutEffect(() => {
    const panel = bodyRef.current?.parentElement
    if (!panel) return

    const update = () => {
      const paginationH = 48
      const toolbarH =
        panel.querySelector('.form-table-toolbar')?.getBoundingClientRect().height ?? 0
      setBodyHeight(Math.max(panel.clientHeight - paginationH - toolbarH - 2, 160))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [config.loading, filteredCount, collapsed, schema.length, showToolbar])

  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="form-table-page flex min-h-0 flex-1 flex-col gap-3">
      {schema.length > 0 && (
        <div className="form-table-form shrink-0 rounded-xl border border-default bg-surface px-4 py-3.5 shadow-sm">
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            colon={false}
            onFinish={handleSearch}
          >
            <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
                {visibleSchema.map((field) => (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    className="form-table-field mb-0"
                  >
                    {renderField(field)}
                  </Form.Item>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button onClick={handleReset}>Reset</Button>
                <Button type="primary" htmlType="submit" loading={config.loading}>
                  Search
                </Button>
              </div>
            </div>

            {schema.length > maxCollapsedFields && (
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="mt-2.5 flex items-center gap-1 text-xs font-medium text-primary/80 hover:text-primary"
              >
                {collapsed ? (
                  <>
                    <ChevronDown size={14} />
                    Expand
                    {hiddenCount > 0 && <span className="text-muted">({hiddenCount} more)</span>}
                  </>
                ) : (
                  <>
                    <ChevronUp size={14} />
                    Collapse
                  </>
                )}
              </button>
            )}
          </Form>
        </div>
      )}

      <div className="form-table-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-default bg-surface shadow-sm">
        {showToolbar && (
          <div className="form-table-toolbar flex shrink-0 items-center justify-end gap-2 border-b border-default px-4 py-2">
            {config.onRefresh && (
              <Tooltip title="Refresh">
                <Button
                  size="small"
                  icon={<RefreshCw size={14} />}
                  onClick={config.onRefresh}
                  loading={config.loading}
                />
              </Tooltip>
            )}
            {config.toolbar}
          </div>
        )}

        <div
          ref={bodyRef}
          className="form-table-body min-h-0 flex-1 overflow-auto"
          style={{ maxHeight: bodyHeight }}
        >
          <Spin spinning={Boolean(config.loading)}>
            <table className="form-table-grid w-full min-w-full border-collapse text-[13px]">
              <thead className="sticky top-0 z-10 bg-subtle">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="whitespace-nowrap border-b border-default px-3 py-2.5 text-left text-[13px] font-semibold text-secondary"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length}
                      className="py-14 text-center text-sm text-muted"
                    >
                      {config.emptyText ?? 'No data found.'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-subtle transition-colors hover:bg-subtle/60"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5 align-middle text-primary">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Spin>
        </div>

        <div className="form-table-pagination shrink-0 border-t border-default px-3 py-2">
          <Pagination
            size="small"
            current={pageIndex + 1}
            pageSize={pageSize}
            total={filteredCount}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total) => `Total ${total} records`}
            onChange={(page, size) => {
              table.setPageIndex(page - 1)
              if (size !== pageSize) table.setPageSize(size)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export function FormTable<
  TData extends Record<string, unknown>,
  TFilter extends Record<string, unknown> = Record<string, unknown>,
>(config: FormTableConfig<TData, TFilter>) {
  const state = useFormTable(config)
  return <FormTableUI {...state} />
}
