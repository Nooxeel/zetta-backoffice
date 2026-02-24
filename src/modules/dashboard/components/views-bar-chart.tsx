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
import type { ViewChartData } from "@/src/modules/shared/lib/api"

interface ViewsBarChartProps {
  data: ViewChartData[]
  loading: boolean
}

export function ViewsBarChart({ data, loading }: ViewsBarChartProps) {
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 280 : 350
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 40 }
    : { top: 5, right: 30, left: 20, bottom: 60 }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rows per View</CardTitle>
        <CardDescription>Row count for each synced warehouse view</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] md:h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[280px] md:h-[350px] items-center justify-center text-muted-foreground">
            No synced views yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} margin={margins}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={isMobile ? -45 : -35}
                textAnchor="end"
                interval={isMobile ? "preserveStartEnd" : 0}
                tick={{ fontSize: isMobile ? 8 : 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                className="fill-muted-foreground"
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                width={isMobile ? 35 : 60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Rows']}
                labelFormatter={(label) => `View: ${label}`}
              />
              <Bar dataKey="rows" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
