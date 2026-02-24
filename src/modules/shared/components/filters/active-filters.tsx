"use client"

import { X } from "lucide-react"

import { Badge } from "@/src/modules/shared/components/ui/badge"
import { Button } from "@/src/modules/shared/components/ui/button"
import type { ColumnFilter, FilterableColumn } from "@/src/modules/shared/lib/api"
import { getOperatorLabel, isBetweenOperator } from "@/src/modules/shared/lib/filter-utils"

interface ActiveFiltersProps {
  filters: ColumnFilter[]
  columns: FilterableColumn[]
  onRemove: (filterId: string) => void
  onClearAll: () => void
}

function formatFilterLabel(filter: ColumnFilter): string {
  const opLabel = getOperatorLabel(filter.operator)
  if (isBetweenOperator(filter.operator)) {
    return `${filter.column} ${opLabel} ${filter.value} - ${filter.value2 || '?'}`
  }
  return `${filter.column} ${opLabel} ${filter.value}`
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Badge key={filter.id} variant="secondary" className="gap-1 pr-1">
          {formatFilterLabel(filter)}
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs text-muted-foreground">
        Clear all
      </Button>
    </div>
  )
}
