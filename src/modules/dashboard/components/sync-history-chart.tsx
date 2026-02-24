"use client"

import {
  AreaChart,
  Area,
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
import type { SyncHistoryEntry } from "@/src/modules/shared/lib/api"

interface SyncHistoryChartProps {
  data: SyncHistoryEntry[]
  loading: boolean
}

export function SyncHistoryChart({ data, loading }: SyncHistoryChartProps) {
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 250 : 350
  const margins = isMobile
    ? { top: 5, right: 10, left: 0, bottom: 5 }
    : { top: 5, right: 30, left: 20, bottom: 5 }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Activity</CardTitle>
        <CardDescription>Synchronization operations in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] md:h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] md:h-[350px] items-center justify-center text-muted-foreground">
            No sync activity in the last 30 days
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data} margin={margins}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: isMobile ? 9 : 12 }}
                className="fill-muted-foreground"
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
                width={isMobile ? 30 : 60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value, name) => {
                  const label = name === 'success' ? 'Successful' : name === 'failed' ? 'Failed' : 'Rows'
                  return [Number(value ?? 0).toLocaleString(), label]
                }}
              />
              <Area
                type="monotone"
                dataKey="success"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stackId="1"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
