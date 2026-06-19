'use client'

import type { ReactNode } from 'react'

import { Button } from 'antd'
import { AlertCircle, Info } from 'lucide-react'

/* ── Header ─────────────────────────────────────────────────────────── */
type AuthCardHeaderProps = {
  title: string
  description?: string
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

/* ── Field wrapper ──────────────────────────────────────────────────── */
type AuthFieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  optional?: boolean
  children: ReactNode
}

export function AuthField({ label, htmlFor, hint, optional, children }: AuthFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
        {optional ? (
          <span style={{ fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            (optional)
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

/* ── Alert banner ───────────────────────────────────────────────────── */
type AuthAlertProps = {
  tone?: 'error' | 'info' | 'warning'
  children: ReactNode
}

export function AuthAlert({ tone = 'error', children }: AuthAlertProps) {
  const Icon = tone === 'info' ? Info : AlertCircle

  const styles = {
    error:   { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',   color: 'var(--text-error)' },
    warning: { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',  color: '#b45309' },
    info:    { bg: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: 'color-mix(in srgb, var(--color-primary) 25%, transparent)', color: 'var(--color-primary)' },
  } as const

  const s = styles[tone]

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        borderRadius: 12,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <Icon size={14} style={{ marginTop: 2, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  )
}

/* ── Layout helpers ─────────────────────────────────────────────────── */
export function AuthFormStack({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {children}
    </div>
  )
}

export function AuthFormFields({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  )
}

export function AuthFormActions({ children }: { children: ReactNode }) {
  return <div style={{ paddingTop: 8 }}>{children}</div>
}

export function AuthFooterText({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

/* ── Submit button (inline-styled to guarantee pill shape) ──────────── */
type AuthSubmitButtonProps = {
  children: ReactNode
  loading?: boolean
  onClick?: () => void
}

export function AuthSubmitButton({ children, loading, onClick }: AuthSubmitButtonProps) {
  return (
    <Button
      type="primary"
      block
      size="large"
      loading={loading}
      onClick={onClick}
      style={{
        height: 46,
        borderRadius: 9999,
        border: 'none',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.01em',
        boxShadow: '0 2px 16px color-mix(in srgb, var(--color-primary) 35%, transparent)',
      }}
    >
      {children}
    </Button>
  )
}

/* ── Ant Design class presets (inputs) ──────────────────────────────── */
export const authInputClassName = 'auth-input'

/** @deprecated use AuthSubmitButton instead */
export const authButtonClassName = 'auth-btn-legacy'
