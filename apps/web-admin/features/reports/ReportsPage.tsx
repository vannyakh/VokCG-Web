"use client"

import { Card, Skeleton } from 'antd'
import { Building2, Clock, CreditCard, DollarSign, Layers } from 'lucide-react'
import { Page } from '@vokcg/ui'
import { StatGrid } from '@/components/admin'
import { EChart } from '@vokcg/ui/charts/echart'
import { useColorMode } from '@vokcg/ui'
import { useAdminOverview } from '@vokcg/api'
import { useAdminSubscriptions, useAdminTenants } from '@vokcg/api/hooks/use-admin-saas'
import { buildMrrTrendOption } from '@/lib/admin-dashboard-charts'

export function ReportsPage() {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { data: overviewData, isLoading: overviewLoading } = useAdminOverview()
  const { data: tenantsData, isLoading: tenantsLoading } = useAdminTenants()
  const { data: subscriptionsData, isLoading: subsLoading } = useAdminSubscriptions()

  const isLoading = overviewLoading || tenantsLoading || subsLoading
  const overview = overviewData?.data
  const tenants = tenantsData?.data ?? []
  const subscriptions = subscriptionsData?.data ?? []

  const totalMrr = overview?.mrr ?? tenants.reduce((sum, t) => sum + Number(t.mrr), 0)
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length
  const trialTenants = tenants.filter((t) => t.status === 'trial').length
  const activeTenants = tenants.filter((t) => t.status === 'active').length

  const mrrTrend = tenants.length
    ? [{ month: 'Current', mrr: totalMrr }]
    : [{ month: 'Current', mrr: 0 }]

  return (
    <Page
      title="Reports"
      description="Revenue, tenant growth, and platform usage analytics."
      badge="Live"
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="flex flex-col gap-4">
          <StatGrid
            columns={3}
            items={[
              { label: 'MRR', value: totalMrr, icon: DollarSign, prefix: '$', precision: 0 },
              { label: 'Active subscriptions', value: activeSubs, icon: CreditCard },
              { label: 'Active tenants', value: activeTenants, icon: Building2 },
            ]}
          />

          <Card className="border-default bg-surface" title="MRR snapshot">
            <EChart option={buildMrrTrendOption(mrrTrend, isDark)} height={280} />
          </Card>

          <StatGrid
            columns={2}
            items={[
              { label: 'Total subscriptions', value: subscriptions.length, icon: Layers },
              {
                label: 'Trial tenants',
                value: trialTenants,
                icon: Clock,
                accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              },
            ]}
          />
        </div>
      )}
    </Page>
  )
}
