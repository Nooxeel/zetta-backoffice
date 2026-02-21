"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/modules/shared/components/ui/dialog"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import { getSyncLogs, type SyncLogEntry } from "@/src/modules/shared/lib/api"

interface SyncLogViewerProps {
  syncedViewId: string
  open: boolean
  onClose: () => void
}

const logStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  COMPLETED: { label: "Completed", variant: "default" },
  STARTED: { label: "Started", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
}

export function SyncLogViewer({ syncedViewId, open, onClose }: SyncLogViewerProps) {
  const [logs, setLogs] = React.useState<SyncLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    getSyncLogs(syncedViewId)
      .then((res) => setLogs(res.logs))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [syncedViewId, open])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sync History</DialogTitle>
          <DialogDescription>
            Recent sync operations for this view.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No sync logs found.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const config = logStatusConfig[log.status] || logStatusConfig.STARTED

              return (
                <div key={log.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      Rows: <span className="text-foreground">{log.rowsSynced?.toLocaleString() ?? "—"}</span>
                    </div>
                    <div>
                      Duration: <span className="text-foreground">
                        {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                      </span>
                    </div>
                  </div>
                  {log.error && (
                    <p className="mt-2 text-xs text-destructive">{log.error}</p>
                  )}
                  {log.schemaChanges && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Schema changes: {log.schemaChanges}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
