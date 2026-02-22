"use client"

import {
  Select,
  SelectContent,
  SelectItem,
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
          {tables.map((table) => (
            <SelectItem key={table.id} value={table.id}>
              {table.sourceView}
              <span className="ml-1 text-muted-foreground text-xs">
                ({table.lastSyncRows?.toLocaleString() ?? 0} rows)
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
