"use client"

import * as React from "react"
import {
  getStatsSummary,
  getWarehouseOverview,
  getBusinessKpis,
  type StatsSummary,
  type WarehouseOverview,
  type BusinessKpisData,
} from "@/src/modules/shared/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/modules/shared/components/ui/tabs"
import { StatsCards } from "@/src/modules/dashboard/components/stats-cards"
import { ViewsBarChart } from "@/src/modules/dashboard/components/views-bar-chart"
import { SyncHistoryChart } from "@/src/modules/dashboard/components/sync-history-chart"
import { BusinessKpiCards } from "@/src/modules/dashboard/components/business-kpi-cards"
import { ReceivedVsConsumedChart } from "@/src/modules/dashboard/components/received-vs-consumed-chart"
import { ExpirationAlertsChart } from "@/src/modules/dashboard/components/expiration-alerts-chart"
import { TopRotationChart } from "@/src/modules/dashboard/components/top-rotation-chart"
import { StockByLineChart } from "@/src/modules/dashboard/components/stock-by-line-chart"
import { ExpirationHistoryChart } from "@/src/modules/dashboard/components/expiration-history-chart"

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<StatsSummary | null>(null)
  const [overview, setOverview] = React.useState<WarehouseOverview | null>(null)
  const [businessKpis, setBusinessKpis] = React.useState<BusinessKpisData | null>(null)
  const [loadingSystem, setLoadingSystem] = React.useState(true)
  const [loadingBusiness, setLoadingBusiness] = React.useState(true)

  React.useEffect(() => {
    Promise.all([getStatsSummary(), getWarehouseOverview()])
      .then(([s, o]) => {
        setSummary(s)
        setOverview(o)
      })
      .catch(() => {})
      .finally(() => setLoadingSystem(false))

    getBusinessKpis()
      .then(setBusinessKpis)
      .catch(() => {})
      .finally(() => setLoadingBusiness(false))
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Indicadores de negocio y estado del sistema.
        </p>
      </div>

      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">Indicadores de Negocio</TabsTrigger>
          <TabsTrigger value="system">Estado del Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="flex flex-col gap-4">
          <BusinessKpiCards data={businessKpis?.kpis ?? null} loading={loadingBusiness} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ReceivedVsConsumedChart
              data={businessKpis?.charts.recibidoVsConsumido ?? []}
              loading={loadingBusiness}
            />
            <ExpirationAlertsChart
              data={businessKpis?.charts.alertasVencimiento ?? []}
              loading={loadingBusiness}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopRotationChart
              data={businessKpis?.charts.top10Rotacion ?? []}
              loading={loadingBusiness}
            />
            <StockByLineChart
              data={businessKpis?.charts.stockPorLinea ?? []}
              loading={loadingBusiness}
            />
          </div>

          <ExpirationHistoryChart
            data={businessKpis?.charts.historialVencidos ?? []}
            loading={loadingBusiness}
          />
        </TabsContent>

        <TabsContent value="system" className="flex flex-col gap-4">
          <StatsCards data={summary} loading={loadingSystem} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ViewsBarChart data={overview?.viewsData ?? []} loading={loadingSystem} />
            <SyncHistoryChart data={overview?.syncHistory ?? []} loading={loadingSystem} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
