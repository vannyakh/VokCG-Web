import type { EChartsCoreOption } from 'echarts/core'
import type { AdminOverview } from '@vokcg/types'
import type { AuditLog } from '@vokcg/types'

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4']

function baseTextStyle(isDark: boolean) {
  return {
    color: isDark ? '#94a3b8' : '#64748b',
  }
}

export function buildEntitiesBarOption(stats: AdminOverview, isDark: boolean): EChartsCoreOption {
  const labels = ['Users', 'Roles', 'Permissions', 'Audit Logs', 'Services']
  const values = [stats.users, stats.roles, stats.permissions, stats.logs, stats.services]

  return {
    color: CHART_COLORS,
    grid: { left: 12, right: 12, top: 36, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: baseTextStyle(isDark),
      axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' } },
      axisLabel: baseTextStyle(isDark),
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: CHART_COLORS[i % CHART_COLORS.length],
          },
        })),
        barMaxWidth: 48,
      },
    ],
  }
}

export function buildDistributionPieOption(stats: AdminOverview, isDark: boolean): EChartsCoreOption {
  const data = [
    { name: 'Users', value: stats.users },
    { name: 'Roles', value: stats.roles },
    { name: 'Permissions', value: stats.permissions },
    { name: 'Audit Logs', value: stats.logs },
    { name: 'Services', value: stats.services },
  ].filter((d) => d.value > 0)

  return {
    color: CHART_COLORS,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: baseTextStyle(isDark),
      icon: 'circle',
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: isDark ? '#161b27' : '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
        },
        data,
      },
    ],
  }
}

export function buildAuditActionOption(logs: AuditLog[], isDark: boolean): EChartsCoreOption {
  const counts: Record<string, number> = {}
  for (const log of logs) {
    counts[log.action] = (counts[log.action] ?? 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return {
    color: CHART_COLORS,
    grid: { left: 12, right: 12, top: 24, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: entries.map(([k]) => k),
      axisLabel: baseTextStyle(isDark),
      axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' } },
      axisLabel: baseTextStyle(isDark),
    },
    series: [
      {
        type: 'bar',
        data: entries.map(([, v]) => v),
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        barMaxWidth: 40,
      },
    ],
  }
}

export function buildAuditTimelineOption(logs: AuditLog[], isDark: boolean): EChartsCoreOption {
  const byDay: Record<string, number> = {}
  for (const log of logs) {
    const day = log.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }
  const days = Object.keys(byDay).sort().slice(-14)
  const values = days.map((d) => byDay[d] ?? 0)

  return {
    color: ['#3b82f6'],
    grid: { left: 12, right: 12, top: 24, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: days.map((d) => d.slice(5)),
      axisLabel: baseTextStyle(isDark),
      axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' } },
      axisLabel: baseTextStyle(isDark),
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59,130,246,0.25)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' },
            ],
          },
        },
        data: values,
      },
    ],
  }
}

export function buildHealthGaugeOption(
  label: string,
  connected: boolean,
  isDark: boolean,
): EChartsCoreOption {
  return {
    series: [
      {
        type: 'gauge',
        center: ['50%', '58%'],
        radius: '90%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 4,
        itemStyle: { color: connected ? '#10b981' : '#ef4444' },
        progress: { show: true, width: 10 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 10, color: [[1, isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '10%'],
          fontSize: 14,
          fontWeight: 700,
          color: connected ? '#10b981' : '#ef4444',
          formatter: () => (connected ? 'Online' : 'Offline'),
        },
        title: {
          offsetCenter: [0, '-20%'],
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b',
        },
        data: [{ value: connected ? 100 : 0, name: label }],
      },
    ],
  }
}

export function buildMrrTrendOption(
  data: { month: string; mrr: number }[],
  isDark: boolean,
): EChartsCoreOption {
  return {
    color: ['#3b82f6'],
    grid: { left: 12, right: 12, top: 36, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => `$${Number(value).toLocaleString()}`,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.month),
      axisLabel: baseTextStyle(isDark),
      axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' } },
      axisLabel: {
        ...baseTextStyle(isDark),
        formatter: (value: number) => `$${(value / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: data.map((d) => d.mrr),
        areaStyle: { opacity: 0.12 },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  }
}
