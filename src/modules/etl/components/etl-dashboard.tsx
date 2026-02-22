"use client"

import * as React from "react"
import { RefreshCw, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react"
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
import { Badge } from "@/src/modules/shared/components/ui/badge"
import {
  getDatabases,
  getViews,
  getEtlStatus,
  triggerSync,
  syncAllViews,
  type ViewInfo,
  type SyncedViewInfo,
  type SyncAllEvent,
} from "@/src/modules/shared/lib/api"
import { DatabasePicker } from "@/src/modules/reports/components/database-picker"
import { ViewPicker } from "@/src/modules/reports/components/view-picker"
import { SyncStatusTable } from "./sync-status-table"

interface ViewProgress {
  name: string
  status: "pending" | "syncing" | "success" | "failed"
  rowsSynced?: number
  durationMs?: number
  error?: string
}

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

  // Sync All state
  const [syncAllRunning, setSyncAllRunning] = React.useState(false)
  const [syncAllProgress, setSyncAllProgress] = React.useState<ViewProgress[]>([])
  const [syncAllCurrent, setSyncAllCurrent] = React.useState(0)
  const [syncAllTotal, setSyncAllTotal] = React.useState(0)
  const abortRef = React.useRef<AbortController | null>(null)

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

  const handleSyncAll = () => {
    if (!selectedDb) return

    setSyncAllRunning(true)
    setSyncAllProgress([])
    setSyncAllCurrent(0)
    setSyncAllTotal(0)
    setError(null)

    const controller = syncAllViews(selectedDb, (event: SyncAllEvent) => {
      if (event.type === "start") {
        setSyncAllTotal(event.total || 0)
        setSyncAllProgress(
          (event.views || []).map((name) => ({
            name,
            status: "pending" as const,
          }))
        )
      } else if (event.type === "progress") {
        setSyncAllCurrent(event.current || 0)
        setSyncAllProgress((prev) =>
          prev.map((v) =>
            v.name === event.view
              ? {
                  ...v,
                  status: event.status === "syncing" ? "syncing" : event.status === "success" ? "success" : "failed",
                  rowsSynced: event.rowsSynced,
                  durationMs: event.durationMs,
                  error: event.error,
                }
              : v
          )
        )
      } else if (event.type === "complete") {
        setSyncAllRunning(false)
        refreshStatus()
        const s = event.successCount || 0
        const f = event.failCount || 0
        if (f === 0) {
          toast.success(`All ${s} views synced successfully`)
        } else {
          toast.warning(`Sync complete: ${s} succeeded, ${f} failed`)
        }
      } else if (event.type === "error") {
        setSyncAllRunning(false)
        toast.error(`Sync All failed: ${event.error}`)
        setError(event.error || "Unknown error")
      }
    })

    abortRef.current = controller
  }

  const completedCount = syncAllProgress.filter(
    (v) => v.status === "success" || v.status === "failed"
  ).length

  const progressPercent = syncAllTotal > 0 ? (completedCount / syncAllTotal) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      {/* Sync trigger section */}
      <Card>
        <CardHeader>
          <CardTitle>New Sync</CardTitle>
          <CardDescription>
            Select a database and view to sync to the PostgreSQL warehouse, or sync all views at once.
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
              disabled={!selectedDb || !selectedView || syncing || syncAllRunning}
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
            <Button
              variant="secondary"
              onClick={handleSyncAll}
              disabled={!selectedDb || syncAllRunning || syncing}
            >
              {syncAllRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing All...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Sync All
                </>
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

      {/* Sync All progress */}
      {syncAllProgress.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {syncAllRunning
                    ? `Syncing All Views (${completedCount}/${syncAllTotal})`
                    : `Sync Complete (${completedCount}/${syncAllTotal})`}
                </CardTitle>
                <CardDescription>
                  {syncAllRunning
                    ? "Progress of each view being synced to PostgreSQL."
                    : "All views have been processed."}
                </CardDescription>
              </div>
              {!syncAllRunning && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSyncAllProgress([])}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress bar */}
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* View list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {syncAllProgress.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {v.status === "pending" && (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    {v.status === "syncing" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    )}
                    {v.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    {v.status === "failed" && (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="truncate">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {v.status === "syncing" && (
                      <Badge variant="secondary">Syncing</Badge>
                    )}
                    {v.status === "success" && (
                      <span className="text-xs text-muted-foreground">
                        {v.rowsSynced?.toLocaleString()} rows
                        {v.durationMs != null && ` · ${v.durationMs < 1000 ? `${v.durationMs}ms` : `${(v.durationMs / 1000).toFixed(1)}s`}`}
                      </span>
                    )}
                    {v.status === "failed" && (
                      <span className="text-xs text-destructive truncate max-w-[200px]" title={v.error}>
                        {v.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
