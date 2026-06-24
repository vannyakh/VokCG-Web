'use client'

import type { ReactNode } from 'react'

import { Alert, Button, Form } from 'antd'

/* ── Header ─────────────────────────────────────────────────────────── */
type AuthCardHeaderProps = {
  title: string
  description?: string
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  const isAdmin = title.toLowerCase().includes('admin')
  const badgeText = isAdmin ? 'Secure Admin Console' : 'Secure Platform Access'

  return (
    <div style={{ marginBottom: 24 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 9999,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          color: 'var(--color-primary)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: '0 0 8px var(--color-primary)',
          }}
        />
        {badgeText}
      </span>
      <h2
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
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
  error?: string
  children: ReactNode
}

export function AuthField({ label, htmlFor, hint, optional, error, children }: AuthFieldProps) {
  return (
    <Form.Item
      layout="vertical"
      label={
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
          {optional ? (
            <span style={{ fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
              (optional)
            </span>
          ) : null}
        </span>
      }
      htmlFor={htmlFor}
      validateStatus={error ? 'error' : undefined}
      help={error || hint}
      style={{ marginBottom: 0 }}
    >
      {children}
    </Form.Item>
  )
}

/* ── Alert banner ───────────────────────────────────────────────────── */
type AuthAlertProps = {
  tone?: 'error' | 'info' | 'warning'
  children: ReactNode
}

export function AuthAlert({ tone = 'error', children }: AuthAlertProps) {
  return (
    <Alert
      message={children}
      type={tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'info'}
      showIcon
      style={{
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    />
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
