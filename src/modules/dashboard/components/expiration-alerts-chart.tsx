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

interface ExpirationAlertsChartProps {
  data: Array<{
    lineaCod: string
    lineaDesc: string
    bucket_0_30: number
    bucket_31_60: number
    bucket_61_90: number
    bucket_91_120: number
    bucket_121_150: number
    bucket_151_180: number
  }>
  loading: boolean
}

const BUCKET_COLORS = {
  bucket_0_30: "#ef4444",
  bucket_31_60: "#f97316",
  bucket_61_90: "#eab308",
  bucket_91_120: "#84cc16",
  bucket_121_150: "#22c55e",
  bucket_151_180: "#10b981",
} as const

const BUCKET_LABELS: Record<string, string> = {
  bucket_0_30: "0-30 días",
  bucket_31_60: "31-60 días",
  bucket_61_90: "61-90 días",
  bucket_91_120: "91-120 días",
  bucket_121_150: "121-150 días",
  bucket_151_180: "151-180 días",
}

export function ExpirationAlertsChart({ data, loading }: ExpirationAlertsChartProps) {
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 280 : 350
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 }
  const yAxisWidth = isMobile ? 60 : 120

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas de Vencimiento</CardTitle>
        <CardDescription>Unidades próximas a vencer por línea de producto</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] md:h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[280px] md:h-[350px] items-center justify-center text-muted-foreground">
            Sin alertas de vencimiento
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} layout="vertical" margin={margins}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fontSize: isMobile ? 9 : 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <YAxis
                dataKey="lineaDesc"
                type="category"
                width={yAxisWidth}
                tick={{ fontSize: isMobile ? 8 : 10 }}
                className="fill-muted-foreground"
                tickFormatter={isMobile ? (val: string) => (val.length > 10 ? val.slice(0, 8) + "…" : val) : undefined}
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
                  BUCKET_LABELS[name as string] || name,
                ]}
              />
              {!isMobile && <Legend formatter={(value) => BUCKET_LABELS[value] || value} />}
              {Object.entries(BUCKET_COLORS).map(([key, color]) => (
                <Bar key={key} dataKey={key} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
