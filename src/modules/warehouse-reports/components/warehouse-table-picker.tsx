"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import type { WarehouseTableInfo } from "@/src/modules/shared/lib/api"

interface WarehouseTablePickerProps {
  tables: WarehouseTableInfo[]
  selected: WarehouseTableInfo | null
  onSelect: (table: WarehouseTableInfo) => void
  loading?: boolean
}

export function WarehouseTablePicker({
  tables,
  selected,
  onSelect,
  loading,
}: WarehouseTablePickerProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-[280px]" />
      </div>
    )
  }

  // Group tables by dbName
  const grouped = tables.reduce<Record<string, WarehouseTableInfo[]>>((acc, t) => {
    const key = t.dbName || "unknown"
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const dbNames = Object.keys(grouped)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">Table</label>
      <Select
        value={selected?.id || ""}
        onValueChange={(id) => {
          const table = tables.find((t) => t.id === id)
          if (table) onSelect(table)
        }}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select table..." />
        </SelectTrigger>
        <SelectContent>
          {dbNames.length <= 1 ? (
            tables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.sourceView}
                <span className="ml-1 text-muted-foreground text-xs">
                  ({table.lastSyncRows?.toLocaleString() ?? 0} rows)
                </span>
              </SelectItem>
            ))
          ) : (
            dbNames.map((dbName) => (
              <SelectGroup key={dbName}>
                <SelectLabel>{dbName}</SelectLabel>
                {grouped[dbName].map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.sourceView}
                    <span className="ml-1 text-muted-foreground text-xs">
                      ({table.lastSyncRows?.toLocaleString() ?? 0} rows)
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
