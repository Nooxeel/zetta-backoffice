"use client"

import * as React from "react"
import {
  getStatsSummary,
  getWarehouseOverview,
  type StatsSummary,
  type WarehouseOverview,
} from "@/src/modules/shared/lib/api"
import { StatsCards } from "@/src/modules/dashboard/components/stats-cards"
import { ViewsBarChart } from "@/src/modules/dashboard/components/views-bar-chart"
import { SyncHistoryChart } from "@/src/modules/dashboard/components/sync-history-chart"

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<StatsSummary | null>(null)
  const [overview, setOverview] = React.useState<WarehouseOverview | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([getStatsSummary(), getWarehouseOverview()])
      .then(([s, o]) => {
        setSummary(s)
        setOverview(o)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Warehouse overview and sync activity.
        </p>
      </div>

      <StatsCards data={summary} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ViewsBarChart data={overview?.viewsData ?? []} loading={loading} />
        <SyncHistoryChart data={overview?.syncHistory ?? []} loading={loading} />
      </div>
    </div>
  )
}
