"use client"

import * as React from "react"
import { RefreshCw, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/modules/shared/components/ui/table"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import { Button } from "@/src/modules/shared/components/ui/button"
import {
  triggerSync,
  deleteSync,
  type SyncedViewInfo,
  type SyncStatus,
} from "@/src/modules/shared/lib/api"
import { SyncLogViewer } from "./sync-log-viewer"

interface SyncStatusTableProps {
  views: SyncedViewInfo[]
  onRefresh: () => void
}

const statusConfig: Record<SyncStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  SYNCED: { label: "Synced", variant: "default" },
  SYNCING: { label: "Syncing", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
  NEVER_SYNCED: { label: "Never Synced", variant: "outline" },
  SCHEMA_CHANGED: { label: "Schema Changed", variant: "secondary" },
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function SyncStatusTable({ views, onRefresh }: SyncStatusTableProps) {
  const [resyncingId, setResyncingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [logsViewId, setLogsViewId] = React.useState<string | null>(null)

  const handleResync = async (view: SyncedViewInfo) => {
    if (!view.dbName) return
    setResyncingId(view.id)
    try {
      const result = await triggerSync({
        db: view.dbName,
        schema: view.sourceSchema,
        view: view.sourceView,
      })
      toast.success(result.message)
      onRefresh()
    } catch (err: any) {
      toast.error(`Re-sync failed: ${err.message}`)
    } finally {
      setResyncingId(null)
    }
  }

  const handleDelete = async (view: SyncedViewInfo) => {
    setDeletingId(view.id)
    try {
      const result = await deleteSync(view.id)
      toast.success(result.message)
      onRefresh()
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source DB</TableHead>
            <TableHead>View</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sync</TableHead>
            <TableHead className="text-right">Rows</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {views.map((view) => {
            const config = statusConfig[view.status] || statusConfig.NEVER_SYNCED

            return (
              <TableRow key={view.id}>
                <TableCell className="font-medium">{view.dbName || "—"}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{view.sourceSchema}.</span>
                  {view.sourceView}
                </TableCell>
                <TableCell>
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {view.lastError && (
                    <p className="mt-1 text-xs text-destructive truncate max-w-[200px]" title={view.lastError}>
                      {view.lastError}
                    </p>
                  )}
                </TableCell>
                <TableCell>{formatRelativeTime(view.lastSyncAt)}</TableCell>
                <TableCell className="text-right">
                  {view.lastSyncRows?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {formatDuration(view.lastSyncDurationMs)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View logs"
                      onClick={() => setLogsViewId(view.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Re-sync"
                      disabled={resyncingId === view.id}
                      onClick={() => handleResync(view)}
                    >
                      <RefreshCw className={`h-4 w-4 ${resyncingId === view.id ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      disabled={deletingId === view.id}
                      onClick={() => handleDelete(view)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {logsViewId && (
        <SyncLogViewer
          syncedViewId={logsViewId}
          open={!!logsViewId}
          onClose={() => setLogsViewId(null)}
        />
      )}
    </>
  )
}
