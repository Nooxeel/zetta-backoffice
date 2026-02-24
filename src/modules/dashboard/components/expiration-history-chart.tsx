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
import { useIsMobile } from "@/src/modules/shared/hooks/use-mobile"

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
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 220 : 300
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Vencimientos</CardTitle>
        <CardDescription>Unidades vencidas por mes — tendencia histórica</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] md:h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[220px] md:h-[300px] items-center justify-center text-muted-foreground">
            Sin historial de vencimientos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data} margin={margins}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="mesLabel"
                tick={{ fontSize: isMobile ? 9 : 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
                width={isMobile ? 35 : 60}
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
              <Legend
                formatter={(value) => value === 'vencidasFisica' ? 'Vencidas (Física)' : 'Vencidas (Disponible)'}
                wrapperStyle={isMobile ? { fontSize: 10 } : undefined}
              />
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
