"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

interface ExpirationHistoryChartProps {
  data: Array<{
    mes: string
    mesLabel: string
    vencidasFisica: number
    vencidasDisponible: number
  }>
  loading: boolean
}

export function ExpirationHistoryChart({ data, loading }: ExpirationHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Vencimientos</CardTitle>
        <CardDescription>Unidades vencidas por mes — tendencia histórica</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Sin historial de vencimientos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="mesLabel"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value, name) => [
                  Number(value ?? 0).toLocaleString(),
                  name === 'vencidasFisica' ? 'Vencidas (Física)' : 'Vencidas (Disponible)',
                ]}
              />
              <Legend formatter={(value) => value === 'vencidasFisica' ? 'Vencidas (Física)' : 'Vencidas (Disponible)'} />
              <Area
                type="monotone"
                dataKey="vencidasFisica"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="vencidasDisponible"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
