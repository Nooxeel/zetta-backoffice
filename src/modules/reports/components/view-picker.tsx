"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"
import type { ViewInfo } from "@/src/modules/shared/lib/api"

interface ViewPickerProps {
  views: ViewInfo[]
  selected: ViewInfo | null
  onSelect: (view: ViewInfo) => void
  disabled?: boolean
  loading?: boolean
}

export function ViewPicker({ views, selected, onSelect, disabled, loading }: ViewPickerProps) {
  const selectedValue = selected ? `${selected.schema}.${selected.name}` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">View</label>
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          const [schema, ...nameParts] = value.split('.')
          const name = nameParts.join('.')
          const view = views.find((v) => v.schema === schema && v.name === name)
          if (view) onSelect(view)
        }}
        disabled={disabled || loading || views.length === 0}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder={loading ? "Loading views..." : "Select view..."} />
        </SelectTrigger>
        <SelectContent>
          {views.map((v) => {
            const key = `${v.schema}.${v.name}`
            return (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
