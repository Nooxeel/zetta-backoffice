"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"
import type { DatabaseInfo } from "@/src/modules/shared/lib/api"

/** Fallback label for a database name (used when full DatabaseInfo is not available) */
export function getDbLabel(db: string): string {
  return db
}

interface DatabasePickerProps {
  databases: DatabaseInfo[]
  selected: string | null
  onSelect: (db: string) => void
  disabled?: boolean
}

export function DatabasePicker({ databases, selected, onSelect, disabled }: DatabasePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">Database</label>
      <Select
        value={selected ?? undefined}
        onValueChange={onSelect}
        disabled={disabled || databases.length === 0}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select database..." />
        </SelectTrigger>
        <SelectContent>
          {databases.map((db) => (
            <SelectItem key={db.name} value={db.name}>
              {db.label || db.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
