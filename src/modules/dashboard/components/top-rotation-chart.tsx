"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import { useIsMobile } from "@/src/modules/shared/hooks/use-mobile"

interface TopRotationChartProps {
  data: Array<{
    codigo: string
    descripcion: string
    lineaDesc: string
    qtyConsumida12M: number
    ranking: number
  }>
  loading: boolean
}

export function TopRotationChart({ data, loading }: TopRotationChartProps) {
  const isMobile = useIsMobile()

  const maxDescLength = isMobile ? 14 : 30
  const chartData = data.map((d) => ({
    ...d,
    shortDesc: d.descripcion.length > maxDescLength
      ? d.descripcion.slice(0, maxDescLength - 2) + "…"
      : d.descripcion,
  }))

  const chartHeight = isMobile ? 300 : 350
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 }
  const yAxisWidth = isMobile ? 80 : 160

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Mayor Rotación</CardTitle>
        <CardDescription>Productos más consumidos en los últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] md:h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] md:h-[350px] items-center justify-center text-muted-foreground">
            Sin datos de rotación
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} layout="vertical" margin={margins}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fontSize: isMobile ? 9 : 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <YAxis
                dataKey="shortDesc"
                type="category"
                width={yAxisWidth}
                tick={{ fontSize: isMobile ? 8 : 10 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Consumidas 12M']}
                labelFormatter={(_label, payload) => {
                  const item = payload?.[0]?.payload
                  return item ? `${item.descripcion}\n(${item.lineaDesc || 'Sin línea'})` : ''
                }}
              />
              <Bar dataKey="qtyConsumida12M" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
