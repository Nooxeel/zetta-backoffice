"use client"

import {
  BarChart,
  Bar,
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

interface ReceivedVsConsumedChartProps {
  data: Array<{
    mes: string
    mesLabel: string
    recibido: number
    consumido: number
  }>
  loading: boolean
}

export function ReceivedVsConsumedChart({ data, loading }: ReceivedVsConsumedChartProps) {
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 250 : 350
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recibido vs Consumido</CardTitle>
        <CardDescription>Cantidades mensuales por línea de producto</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] md:h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] md:h-[350px] items-center justify-center text-muted-foreground">
            Sin datos de recepción/consumo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} margin={margins}>
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
                formatter={(value) => [Number(value ?? 0).toLocaleString(), '']}
              />
              <Legend wrapperStyle={isMobile ? { fontSize: 10 } : undefined} />
              <Bar dataKey="recibido" name="Recibido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumido" name="Consumido" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
