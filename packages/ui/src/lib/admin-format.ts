/** Shared formatters for admin tables */
export function formatAdminDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(value: number, options?: { prefix?: string; suffix?: string }) {
  const formatted = Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${options?.prefix ?? ''}${formatted}${options?.suffix ?? ''}`
}
