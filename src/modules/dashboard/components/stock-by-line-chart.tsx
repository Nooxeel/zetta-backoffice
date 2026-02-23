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

interface StockByLineChartProps {
  data: Array<{
    lineaCod: string
    lineaDesc: string
    stockFisico: number
    stockDisponible: number
  }>
  loading: boolean
}

export function StockByLineChart({ data, loading }: StockByLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock por Línea</CardTitle>
        <CardDescription>Existencia física y disponible por línea de producto</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            Sin datos de stock por línea
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="lineaDesc"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val)}
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
                  name === 'stockFisico' ? 'Stock Físico' : 'Disponible',
                ]}
              />
              <Legend formatter={(value) => value === 'stockFisico' ? 'Stock Físico' : 'Disponible'} />
              <Bar dataKey="stockFisico" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stockDisponible" fill="hsl(var(--primary))" opacity={0.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
