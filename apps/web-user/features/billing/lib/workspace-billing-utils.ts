import type { WorkspacePlan } from '@/types/workspace'

export type WorkspaceUsageLimits = {
  videos: number | null
  storageGb: number | null
  seats: number | null
}

function parseFeatureNumber(features: string[], pattern: RegExp): number | null {
  for (const feature of features) {
    const match = feature.match(pattern)
    if (match?.[1]) {
      const value = Number.parseInt(match[1], 10)
      if (Number.isFinite(value)) return value
    }
  }
  return null
}

export function parsePlanLimits(plan: WorkspacePlan | null | undefined): WorkspaceUsageLimits {
  const features = plan?.features ?? []
  const videos = parseFeatureNumber(features, /(\d+)\s*videos?\s*\/\s*month/i)
  const storageGb = parseFeatureNumber(features, /(\d+)\s*gb\s*storage/i)
  let seats = parseFeatureNumber(features, /(\d+)\s*users?/i)
  if (features.some((item) => /unlimited users/i.test(item))) {
    seats = null
  }
  return { videos, storageGb, seats }
}

export function usagePercent(used: number, limit: number | null) {
  if (!limit || limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export type PlanCreditSummary = {
  used: number
  limit: number | null
  remaining: number | null
  percent: number
  isUnlimited: boolean
}

export function planCreditSummary(used: number, limit: number | null): PlanCreditSummary {
  if (limit == null || limit <= 0) {
    return { used, limit: null, remaining: null, percent: 0, isUnlimited: true }
  }
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percent: usagePercent(used, limit),
    isUnlimited: false,
  }
}

export function pickUpgradePlan<T extends { id: string; price: number }>(
  plans: T[],
  currentPlanId: string | undefined,
  currentPrice: number,
): T | null {
  const sorted = [...plans].sort((a, b) => a.price - b.price)
  return sorted.find((plan) => plan.price > currentPrice && plan.id !== currentPlanId) ?? null
}
