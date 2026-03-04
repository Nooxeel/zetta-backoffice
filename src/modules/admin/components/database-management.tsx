"use client"

import * as React from "react"
import { Plus, Database, Eye, Power, PowerOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/modules/shared/components/ui/table"
import { Button } from "@/src/modules/shared/components/ui/button"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import {
  getAdminDatabases,
  deactivateDatabase,
  updateDatabase,
  type AdminDatabase,
} from "@/src/modules/shared/lib/api"
import { DatabaseFormDialog } from "./database-form-dialog"
import { ViewWhitelistManager } from "./view-whitelist-manager"

export function DatabaseManagement() {
  const [databases, setDatabases] = React.useState<AdminDatabase[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<AdminDatabase | null>(null)
  const [viewsTarget, setViewsTarget] = React.useState<AdminDatabase | null>(null)

  const refresh = React.useCallback(() => {
    setLoading(true)
    getAdminDatabases()
      .then((res) => {
        setDatabases(res.databases)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const handleToggleActive = async (db: AdminDatabase) => {
    try {
      if (db.isActive) {
        await deactivateDatabase(db.id)
        toast.success(`"${db.label || db.dbName}" deactivated`)
      } else {
        await updateDatabase(db.id, { isActive: true })
        toast.success(`"${db.label || db.dbName}" activated`)
      }
      refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const statusBadge = (db: AdminDatabase) => {
    if (!db.configured) {
      return <Badge variant="outline">Pending Config</Badge>
    }
    if (db.connectionStatus === "connected") {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Connected</Badge>
    }
    return <Badge variant="destructive">Error</Badge>
  }

  if (viewsTarget) {
    return (
      <ViewWhitelistManager
        database={viewsTarget}
        onBack={() => {
          setViewsTarget(null)
          refresh()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {databases.length} database{databases.length !== 1 ? "s" : ""} registered
        </p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Database
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Synced</TableHead>
              <TableHead className="w-[130px]">Added</TableHead>
              <TableHead className="w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {databases.map((db) => (
              <TableRow key={db.id} className={!db.isActive ? "opacity-50" : ""}>
                <TableCell className="font-mono text-sm">{db.dbName}</TableCell>
                <TableCell>{db.label || "—"}</TableCell>
                <TableCell>{statusBadge(db)}</TableCell>
                <TableCell className="text-center">{db.allowedViewsCount}</TableCell>
                <TableCell className="text-center">{db.syncedViewsCount}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(db.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewsTarget(db)}
                      title="Manage views"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditTarget(db)}
                      title="Edit"
                    >
                      <Database className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${db.isActive ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-emerald-600"}`}
                      onClick={() => handleToggleActive(db)}
                      title={db.isActive ? "Deactivate" : "Activate"}
                    >
                      {db.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DatabaseFormDialog
        open={showForm || !!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditTarget(null)
          }
        }}
        database={editTarget}
        onSuccess={() => {
          setShowForm(false)
          setEditTarget(null)
          refresh()
        }}
      />
    </>
  )
}
