'use client'

import { ColorPicker as AntColorPicker, Select, Slider } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

const FORM_COLOR_PRESETS = [
  { label: 'Common', colors: ['#FFFFFF', '#000000', '#FACC15', '#38BDF8', '#F472B6', '#4ADE80'] },
]

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" className="flex cursor-pointer select-none items-center gap-2.5" onClick={() => onChange(!checked)}>
      <div className={['relative h-5 w-[34px] shrink-0 rounded-full border transition-[background,border-color] duration-200', checked ? 'border-accent bg-accent' : 'border-default bg-subtle'].join(' ')}>
        <div className={['absolute top-[3px] h-3 w-3 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-[left] duration-200', checked ? 'left-[17px]' : 'left-[3px]'].join(' ')} />
      </div>
      <span className="select-none text-sm font-semibold text-primary">{label}</span>
    </button>
  )
}

export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const normalized = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#FFFFFF'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-primary">{label}</label>
      <AntColorPicker value={normalized} onChange={(color) => onChange(color.toHexString())} showText format="hex" presets={FORM_COLOR_PRESETS} className="w-full justify-start" getPopupContainer={(trigger) => trigger.parentElement ?? document.body} />
    </div>
  )
}

export function RangeField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-bold text-primary">{label}</label>
        <span className="font-mono text-xs font-bold text-secondary">{value}</span>
      </div>
      <Slider min={min} max={max} step={step} value={value} onChange={onChange} tooltip={{ formatter: (v) => `${v ?? value}` }} />
    </div>
  )
}

export function StepSection({ title, description, children, align = 'start' }: { title: string; description?: string; children: ReactNode; align?: 'start' | 'center' }) {
  return (
    <div className="flex flex-col gap-5">
      <div className={align === 'center' ? 'text-center' : ''}>
        <h3 className="text-lg font-extrabold tracking-tight text-primary">{title}</h3>
        {description && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function CreateFieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-[13px] font-bold text-primary">{children}</label>
}

export function CreateCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={['overflow-hidden rounded-2xl border border-subtle bg-surface', 'shadow-[var(--shadow-sm)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]', className].join(' ')}>
      {children}
    </div>
  )
}

export function CollapsibleBlock({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-subtle bg-subtle/30">
      <button type="button" className="flex w-full items-center justify-between px-3.5 py-2.5" onClick={() => setOpen((v) => !v)}>
        <span className="text-xs font-semibold text-secondary">{label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-muted" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex flex-col gap-4 border-t border-subtle px-3.5 pb-4 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export type MenuSelectOption = { value: string; label: string }

type MenuSelectProps = { options: MenuSelectOption[]; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }

export function MenuSelect({ options, value, onChange, placeholder = 'Select…', disabled = false }: MenuSelectProps) {
  const selectOptions = useMemo(() => options.map((o) => ({ value: o.value, label: o.label })), [options])
  return (
    <Select options={selectOptions} value={value || undefined} onChange={(v) => onChange(v ?? '')} placeholder={placeholder} disabled={disabled} style={{ width: '100%' }} getPopupContainer={(trigger) => trigger.parentElement ?? document.body} />
  )
}

type FieldMenuSelectProps = MenuSelectProps & { label: string; helperText?: string }

export function FieldMenuSelect({ label, helperText, ...selectProps }: FieldMenuSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-primary">{label}</label>
      <MenuSelect {...selectProps} />
      {helperText && <span className="text-xs text-muted">{helperText}</span>}
    </div>
  )
}

export function numberOptions(values: readonly number[]): MenuSelectOption[] {
  return values.map((v) => ({ value: String(v), label: String(v) }))
}
