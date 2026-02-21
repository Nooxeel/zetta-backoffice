"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"
import { Button } from "@/src/modules/shared/components/ui/button"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import {
  getDatabases,
  getViews,
  getEtlStatus,
  triggerSync,
  type ViewInfo,
  type SyncedViewInfo,
} from "@/src/modules/shared/lib/api"
import { DatabasePicker } from "@/src/modules/reports/components/database-picker"
import { ViewPicker } from "@/src/modules/reports/components/view-picker"
import { SyncStatusTable } from "./sync-status-table"

export function EtlDashboard() {
  const [databases, setDatabases] = React.useState<string[]>([])
  const [views, setViews] = React.useState<ViewInfo[]>([])
  const [syncedViews, setSyncedViews] = React.useState<SyncedViewInfo[]>([])

  const [selectedDb, setSelectedDb] = React.useState<string | null>(null)
  const [selectedView, setSelectedView] = React.useState<ViewInfo | null>(null)

  const [loadingDb, setLoadingDb] = React.useState(true)
  const [loadingViews, setLoadingViews] = React.useState(false)
  const [loadingStatus, setLoadingStatus] = React.useState(true)
  const [syncing, setSyncing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch databases on mount
  React.useEffect(() => {
    getDatabases()
      .then((res) => setDatabases(res.databases))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDb(false))
  }, [])

  // Fetch ETL status on mount
  const refreshStatus = React.useCallback(() => {
    setLoadingStatus(true)
    getEtlStatus()
      .then((res) => setSyncedViews(res.views))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingStatus(false))
  }, [])

  React.useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  // Fetch views when database changes
  React.useEffect(() => {
    if (!selectedDb) {
      setViews([])
      return
    }
    setLoadingViews(true)
    setSelectedView(null)
    getViews(selectedDb)
      .then((res) => setViews(res.views))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingViews(false))
  }, [selectedDb])

  const handleSync = async () => {
    if (!selectedDb || !selectedView) return

    setSyncing(true)
    setError(null)

    try {
      const result = await triggerSync({
        db: selectedDb,
        schema: selectedView.schema,
        view: selectedView.name,
      })
      toast.success(result.message)
      refreshStatus()
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sync trigger section */}
      <Card>
        <CardHeader>
          <CardTitle>New Sync</CardTitle>
          <CardDescription>
            Select a database and view to sync to the PostgreSQL warehouse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {loadingDb ? (
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-[220px]" />
              </div>
            ) : (
              <DatabasePicker
                databases={databases}
                selected={selectedDb}
                onSelect={setSelectedDb}
              />
            )}
            <ViewPicker
              views={views}
              selected={selectedView}
              onSelect={setSelectedView}
              disabled={!selectedDb}
              loading={loadingViews}
            />
            <Button
              onClick={handleSync}
              disabled={!selectedDb || !selectedView || syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Now"
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Synced Views</CardTitle>
              <CardDescription>
                Status of all views synced to the PostgreSQL warehouse.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshStatus} disabled={loadingStatus}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStatus && syncedViews.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : syncedViews.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No views synced yet. Use the form above to start a sync.
            </div>
          ) : (
            <SyncStatusTable
              views={syncedViews}
              onRefresh={refreshStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
