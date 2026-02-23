"use client"

import { Database, Users, Clock, Rows3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import type { StatsSummary } from "@/src/modules/shared/lib/api"

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface StatsCardsProps {
  data: StatsSummary | null
  loading: boolean
}

export function StatsCards({ data, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "Warehouse Rows",
      value: data?.totalWarehouseRows.toLocaleString() ?? "—",
      icon: Rows3,
      description: "Total rows synced to PostgreSQL",
    },
    {
      title: "Synced Views",
      value: data?.syncedViews.toString() ?? "—",
      icon: Database,
      description: "Active synchronized views",
    },
    {
      title: "Last Sync",
      value: data ? timeAgo(data.lastSyncAt) : "—",
      icon: Clock,
      description: data?.lastSyncAt
        ? new Date(data.lastSyncAt).toLocaleString()
        : "No syncs yet",
    },
    {
      title: "Registered Users",
      value: data?.totalUsers.toString() ?? "—",
      icon: Users,
      description: "Total platform users",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
