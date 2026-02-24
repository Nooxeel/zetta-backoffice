"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/src/modules/shared/components/ui/button"
import type { ColumnFilter, FilterableColumn } from "@/src/modules/shared/lib/api"
import { FilterRow } from "./filter-row"

interface FilterBuilderProps {
  columns: FilterableColumn[]
  filters: ColumnFilter[]
  onFiltersChange: (filters: ColumnFilter[]) => void
}

export function FilterBuilder({ columns, filters, onFiltersChange }: FilterBuilderProps) {
  const addFilter = () => {
    const newFilter: ColumnFilter = {
      id: crypto.randomUUID(),
      column: '',
      operator: 'contains',
      value: '',
    }
    onFiltersChange([...filters, newFilter])
  }

  const updateFilter = (id: string, updated: ColumnFilter) => {
    onFiltersChange(filters.map(f => f.id === id ? updated : f))
  }

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id))
  }

  const clearAll = () => {
    onFiltersChange([])
  }

  return (
    <div className="space-y-2">
      {filters.map((filter) => (
        <FilterRow
          key={filter.id}
          filter={filter}
          columns={columns}
          onChange={(updated) => updateFilter(filter.id, updated)}
          onRemove={() => removeFilter(filter.id)}
        />
      ))}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addFilter}>
          <Plus className="mr-1 h-4 w-4" />
          Add Filter
        </Button>
        {filters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
            <Trash2 className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
