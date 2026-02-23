"use client"

import { Package, PackageCheck, Boxes, Layers, AlertTriangle, ShieldAlert } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import type { BusinessKpisData } from "@/src/modules/shared/lib/api"

interface BusinessKpiCardsProps {
  data: BusinessKpisData["kpis"] | null
  loading: boolean
}

export function BusinessKpiCards({ data, loading }: BusinessKpiCardsProps) {
  const cards = [
    {
      title: "Stock Físico Total",
      value: data?.totalStockFisico.toLocaleString() ?? "—",
      icon: Package,
      description: "Unidades en existencia física",
      alert: false,
    },
    {
      title: "Stock Disponible",
      value: data?.totalStockDisponible.toLocaleString() ?? "—",
      icon: PackageCheck,
      description: "Unidades disponibles para uso",
      alert: false,
    },
    {
      title: "Productos en Stock",
      value: data?.productosUnicosEnStock.toLocaleString() ?? "—",
      icon: Boxes,
      description: "Productos únicos con existencia",
      alert: false,
    },
    {
      title: "Líneas de Producto",
      value: data?.lineasProductoActivas.toString() ?? "—",
      icon: Layers,
      description: "Líneas LIEQ activas",
      alert: false,
    },
    {
      title: "Próx. a Vencer (90d)",
      value: data?.unidadesProxVencer90d.toLocaleString() ?? "—",
      icon: AlertTriangle,
      description: "Unidades que vencen en 90 días",
      alert: (data?.unidadesProxVencer90d ?? 0) > 0,
    },
    {
      title: "Vencidas (último mes)",
      value: data?.unidadesVencidasUltimoMes.toLocaleString() ?? "—",
      icon: ShieldAlert,
      description: "Unidades vencidas en el mes reciente",
      alert: (data?.unidadesVencidasUltimoMes ?? 0) > 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className={card.alert ? "border-destructive/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.alert ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${card.alert ? "text-destructive" : ""}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
