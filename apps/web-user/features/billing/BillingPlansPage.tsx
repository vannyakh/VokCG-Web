'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@vokcg/i18n'
import { useWorkspace, useChangeWorkspacePlan, useWorkspaceCheckout, useWorkspacePlans } from '@/api'
import { USER_ROUTES } from '@vokcg/constants'
import { useAppMessage } from '@vokcg/ui'
import { pickUpgradePlan } from './lib/workspace-billing-utils'
import { BillingBakongQrModal } from './components/billing-bakong-qr-modal'
import { BillingCheckoutModal, type BillingPaymentMethod } from './components/billing-checkout-modal'
import { BillingList } from './components/billing-list'
import { BillingPlanCard } from './components/billing-plan-card'
import { BillingShell } from './components/billing-shell'
import type { WorkspacePlan } from '@/types/workspace'

export function BillingPlansPage() {
  const { t } = useLocale()
  const message = useAppMessage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspace, canManageBilling, selectedTenantId, refetch } = useWorkspace()
  const { data: plansData, isLoading } = useWorkspacePlans()
  const changePlan = useChangeWorkspacePlan()
  const checkout = useWorkspaceCheckout()

  const [checkoutPlan, setCheckoutPlan] = useState<WorkspacePlan | null>(null)
  const [loadingMethod, setLoadingMethod] = useState<BillingPaymentMethod | null>(null)
  const [bakongSession, setBakongSession] = useState<{
    plan: WorkspacePlan
    qrCode: string
    amount?: number | null
    expiresAt?: string | null
  } | null>(null)

  const plans = plansData ?? []
  const currentPlanId = workspace.plan?.id
  const currentPrice = workspace.plan?.price ?? 0

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.price - b.price),
    [plans],
  )

  const recommendedPlanId = useMemo(() => {
    const upgrade = pickUpgradePlan(plans, currentPlanId, currentPrice)
    return upgrade?.id ?? null
  }, [plans, currentPlanId, currentPrice])

  const checkoutLabels = useMemo(
    () => ({
      checkout: t('billing.checkoutModal.title'),
      selectPayment: t('billing.checkoutModal.selectPayment'),
      stripeTitle: t('billing.checkoutModal.stripeTitle'),
      stripeDescription: t('billing.checkoutModal.stripeDescription'),
      bakongTitle: t('billing.checkoutModal.bakongTitle'),
      bakongDescription: t('billing.checkoutModal.bakongDescription'),
      secured: t('billing.checkoutModal.secured'),
      perMonth: t('billing.checkoutModal.perMonth'),
      continuePay: t('billing.checkoutModal.continuePay'),
    }),
    [t],
  )

  const bakongLabels = useMemo(
    () => ({
      title: t('billing.checkoutModal.bakongQrTitle'),
      hint: t('billing.checkoutModal.bakongQrHint'),
      expires: t('billing.checkoutModal.bakongExpires'),
      waiting: t('billing.checkoutModal.bakongWaiting'),
      secured: t('billing.checkoutModal.secured'),
    }),
    [t],
  )

  useEffect(() => {
    const status = searchParams.get('checkout')
    if (!status) return
    if (status === 'success') {
      message.success(t('billing.checkoutSuccess'))
      void refetch()
    } else if (status === 'cancel') {
      message.info(t('billing.checkoutCanceled'))
    }
    router.replace(USER_ROUTES.billingPlans)
  }, [message, refetch, router, searchParams, t])

  const handleSelectPlan = async (plan: WorkspacePlan) => {
    if (!canManageBilling) {
      message.warning(t('billing.readOnly'))
      return
    }

    if (plan.price <= 0) {
      try {
        await changePlan.mutateAsync({
          plan_id: plan.id,
          tenant_id: selectedTenantId || undefined,
        })
        message.success(t('billing.planChanged'))
      } catch (error) {
        message.error(error instanceof Error ? error.message : t('billing.checkoutFailed'))
      }
      return
    }

    setCheckoutPlan(plan)
  }

  const handlePaymentMethod = async (method: BillingPaymentMethod) => {
    if (!checkoutPlan) return

    setLoadingMethod(method)
    try {
      const origin = window.location.origin
      const result = await checkout.mutateAsync({
        plan_id: checkoutPlan.id,
        tenant_id: selectedTenantId || undefined,
        payment_method: method,
        success_url: `${origin}${USER_ROUTES.billingPlans}?checkout=success`,
        cancel_url: `${origin}${USER_ROUTES.billingPlans}?checkout=cancel`,
      })

      if (method === 'stripe') {
        const url = result.data?.url
        if (url) {
          message.success(t('billing.checkoutStarted'))
          window.location.href = url
          return
        }
        message.error(t('billing.checkoutFailed'))
        return
      }

      const qrCode = result.data?.qr_code
      if (!qrCode) {
        message.error(t('billing.checkoutFailed'))
        return
      }

      setCheckoutPlan(null)
      setBakongSession({
        plan: checkoutPlan,
        qrCode,
        amount: result.data?.amount ?? checkoutPlan.price,
        expiresAt: result.data?.expires_at ?? null,
      })
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('billing.checkoutFailed'))
    } finally {
      setLoadingMethod(null)
    }
  }

  const busy = changePlan.isPending || checkout.isPending

  return (
    <BillingShell
      description={t('billing.plansDescription')}
      badge={workspace.plan?.name}
    >
      {!canManageBilling && (
        <p className="mb-4 rounded-xl border border-subtle bg-subtle/50 px-4 py-3 text-sm text-muted">
          {t('billing.readOnly')}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">{t('billing.loadingPlans')}</p>
      ) : sortedPlans.length === 0 ? (
        <div className="rounded-2xl border border-subtle bg-surface px-5 py-8 text-center">
          <p className="text-sm text-muted">{t('billing.noPlans')}</p>
        </div>
      ) : (
        <BillingList>
          {sortedPlans.map((item) => {
            const isCurrent = item.id === currentPlanId
            const isUpgrade = currentPrice < item.price
            const actionLabel = isCurrent
              ? t('billing.current')
              : item.price <= 0
                ? t('billing.switchPlan')
                : isUpgrade
                  ? t('billing.upgrade')
                  : t('billing.subscribe')

            return (
              <BillingPlanCard
                key={item.id}
                plan={item}
                isCurrent={isCurrent}
                isRecommended={item.id === recommendedPlanId}
                currentLabel={t('billing.current')}
                recommendedLabel={t('billing.recommended')}
                actionLabel={actionLabel}
                disabled={isCurrent || busy || !canManageBilling}
                loading={busy}
                onSelect={() => void handleSelectPlan(item)}
              />
            )
          })}
        </BillingList>
      )}

      <BillingCheckoutModal
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        loadingMethod={loadingMethod}
        onClose={() => {
          if (loadingMethod) return
          setCheckoutPlan(null)
        }}
        onSelect={(method) => void handlePaymentMethod(method)}
        labels={checkoutLabels}
      />

      <BillingBakongQrModal
        open={Boolean(bakongSession)}
        plan={bakongSession?.plan ?? null}
        qrCode={bakongSession?.qrCode ?? null}
        amount={bakongSession?.amount}
        expiresAt={bakongSession?.expiresAt}
        onClose={() => setBakongSession(null)}
        labels={bakongLabels}
      />
    </BillingShell>
  )
}
