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
  const chartData = data.map((d) => ({
    ...d,
    shortDesc: d.descripcion.length > 30 ? d.descripcion.slice(0, 28) + "…" : d.descripcion,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Mayor Rotación</CardTitle>
        <CardDescription>Productos más consumidos en los últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            Sin datos de rotación
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <YAxis
                dataKey="shortDesc"
                type="category"
                width={160}
                tick={{ fontSize: 10 }}
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
