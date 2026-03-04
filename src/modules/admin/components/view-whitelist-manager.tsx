"use client"

import * as React from "react"
import { ArrowLeft, Search, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/src/modules/shared/components/ui/button"
import { Input } from "@/src/modules/shared/components/ui/input"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import { Checkbox } from "@/src/modules/shared/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/modules/shared/components/ui/table"
import {
  discoverViews,
  getAllowedViews,
  addAllowedViews,
  removeAllowedView,
  type AdminDatabase,
  type DiscoveredView,
  type AllowedViewInfo,
} from "@/src/modules/shared/lib/api"

interface ViewWhitelistManagerProps {
  database: AdminDatabase
  onBack: () => void
}

export function ViewWhitelistManager({ database, onBack }: ViewWhitelistManagerProps) {
  const [discovered, setDiscovered] = React.useState<DiscoveredView[]>([])
  const [allowed, setAllowed] = React.useState<AllowedViewInfo[]>([])
  const [loadingDiscover, setLoadingDiscover] = React.useState(false)
  const [loadingAllowed, setLoadingAllowed] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Selected views to add (from discovery)
  const [toAdd, setToAdd] = React.useState<Set<string>>(new Set())

  // Load allowed views on mount
  React.useEffect(() => {
    getAllowedViews(database.id)
      .then((res) => setAllowed(res.views))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingAllowed(false))
  }, [database.id])

  const handleDiscover = async () => {
    setLoadingDiscover(true)
    setError(null)
    setToAdd(new Set())
    try {
      const res = await discoverViews(database.id)
      setDiscovered(res.views)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingDiscover(false)
    }
  }

  const toggleView = (key: string) => {
    setToAdd((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleAddSelected = async () => {
    const views = Array.from(toAdd).map((key) => {
      const [schema, ...nameParts] = key.split(".")
      return { schema, name: nameParts.join(".") }
    })
    if (views.length === 0) return

    setSaving(true)
    try {
      const res = await addAllowedViews(database.id, views)
      toast.success(res.message)
      // Refresh allowed list
      const updatedAllowed = await getAllowedViews(database.id)
      setAllowed(updatedAllowed.views)
      // Update discovered to reflect new allowed state
      setDiscovered((prev) =>
        prev.map((v) => ({
          ...v,
          isAllowed: updatedAllowed.views.some(
            (a) => a.viewSchema === v.schema && a.viewName === v.name
          ) || v.isAllowed,
        }))
      )
      setToAdd(new Set())
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (viewId: string) => {
    try {
      await removeAllowedView(database.id, viewId)
      setAllowed((prev) => prev.filter((v) => v.id !== viewId))
      // Update discovered state
      const removed = allowed.find((v) => v.id === viewId)
      if (removed) {
        setDiscovered((prev) =>
          prev.map((v) =>
            v.schema === removed.viewSchema && v.name === removed.viewName
              ? { ...v, isAllowed: false }
              : v
          )
        )
      }
      toast.success("View removed from whitelist")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const filteredDiscovered = discovered.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.schema.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">
            Manage Views — {database.label || database.dbName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {allowed.length} view{allowed.length !== 1 ? "s" : ""} allowed
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Allowed Views */}
      <div>
        <h3 className="text-sm font-medium mb-2">Allowed Views</h3>
        {loadingAllowed ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : allowed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No views allowed yet. Use "Discover Views" to find and add views.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schema</TableHead>
                  <TableHead>View Name</TableHead>
                  <TableHead className="w-[100px]">Added</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allowed.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-muted-foreground">{v.viewSchema}</TableCell>
                    <TableCell className="font-mono text-sm">{v.viewName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(v.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Discover Views */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Discover Views from SQL Server</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscover}
            disabled={loadingDiscover || !database.configured}
          >
            {loadingDiscover ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering...
              </>
            ) : (
              "Discover Views"
            )}
          </Button>
        </div>

        {!database.configured && (
          <p className="text-sm text-muted-foreground">
            Configure environment variables DB_{database.dbName.toUpperCase()}_* to discover views.
          </p>
        )}

        {discovered.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter views..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-8"
                />
              </div>
              {toAdd.size > 0 && (
                <Button size="sm" onClick={handleAddSelected} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add ${toAdd.size} view${toAdd.size !== 1 ? "s" : ""}`
                  )}
                </Button>
              )}
              <Badge variant="secondary">{discovered.length} views found</Badge>
            </div>

            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Schema</TableHead>
                    <TableHead>View Name</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscovered.map((v) => {
                    const key = `${v.schema}.${v.name}`
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <Checkbox
                            checked={v.isAllowed || toAdd.has(key)}
                            disabled={v.isAllowed}
                            onCheckedChange={() => toggleView(key)}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{v.schema}</TableCell>
                        <TableCell className="font-mono text-sm">{v.name}</TableCell>
                        <TableCell>
                          {v.isAllowed ? (
                            <Badge variant="outline" className="text-emerald-600">
                              <Check className="mr-1 h-3 w-3" />
                              Allowed
                            </Badge>
                          ) : toAdd.has(key) ? (
                            <Badge variant="secondary">Selected</Badge>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
