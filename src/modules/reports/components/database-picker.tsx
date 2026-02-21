"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"

interface DatabasePickerProps {
  databases: string[]
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
            <SelectItem key={db} value={db}>
              {db}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
