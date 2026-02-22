"use client"

import * as React from "react"
import { X, ChevronsUpDown, Check } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/src/modules/shared/components/ui/button"
import { Input } from "@/src/modules/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/modules/shared/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/src/modules/shared/components/ui/command"
import { Calendar } from "@/src/modules/shared/components/ui/calendar"
import { cn } from "@/src/modules/shared/lib/utils"
import type { ColumnFilter, WarehouseColumn, FilterOperator } from "@/src/modules/shared/lib/api"
import { OPERATORS_BY_CATEGORY, getDefaultOperator, isBetweenOperator } from "../lib/filter-utils"

interface FilterRowProps {
  filter: ColumnFilter
  columns: WarehouseColumn[]
  onChange: (updated: ColumnFilter) => void
  onRemove: () => void
}

export function FilterRow({ filter, columns, onChange, onRemove }: FilterRowProps) {
  const [colPickerOpen, setColPickerOpen] = React.useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false)
  const [date2PopoverOpen, setDate2PopoverOpen] = React.useState(false)

  const selectedCol = columns.find(c => c.column === filter.column)
  const category = selectedCol?.filterCategory || 'text'
  const operators = OPERATORS_BY_CATEGORY[category] || []
  const showValue2 = isBetweenOperator(filter.operator)

  const handleColumnChange = (colName: string) => {
    const col = columns.find(c => c.column === colName)
    if (!col) return
    const defaultOp = getDefaultOperator(col.filterCategory)
    onChange({ ...filter, column: colName, operator: defaultOp, value: '', value2: undefined })
    setColPickerOpen(false)
  }

  const handleOperatorChange = (op: string) => {
    const updated: ColumnFilter = { ...filter, operator: op as FilterOperator }
    if (!isBetweenOperator(op as FilterOperator)) {
      updated.value2 = undefined
    }
    onChange(updated)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Column Picker (Combobox) */}
      <Popover open={colPickerOpen} onOpenChange={setColPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={colPickerOpen}
            className="w-[200px] justify-between font-normal"
          >
            {filter.column || "Select column..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search column..." />
            <CommandList>
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup>
                {columns.filter(c => c.filterCategory !== 'unsupported').map((col) => (
                  <CommandItem
                    key={col.column}
                    value={col.column}
                    onSelect={handleColumnChange}
                  >
                    <Check className={cn("mr-2 h-4 w-4", filter.column === col.column ? "opacity-100" : "opacity-0")} />
                    {col.column}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Operator Picker */}
      <Select
        value={filter.operator}
        onValueChange={handleOperatorChange}
        disabled={!filter.column}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input — type-specific */}
      {filter.column && (
        <>
          {category === 'date' ? (
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !filter.value && "text-muted-foreground")}>
                  {filter.value || "Pick date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filter.value ? new Date(filter.value) : undefined}
                  onSelect={(date) => {
                    if (date) onChange({ ...filter, value: format(date, 'yyyy-MM-dd') })
                    setDatePopoverOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : category === 'boolean' ? (
            <Select
              value={filter.value}
              onValueChange={(val) => onChange({ ...filter, value: val })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={category === 'number' ? 'number' : 'text'}
              placeholder="Value..."
              value={filter.value}
              onChange={(e) => onChange({ ...filter, value: e.target.value })}
              className="w-[150px]"
            />
          )}

          {/* Value2 for "between" */}
          {showValue2 && (
            <>
              <span className="text-sm text-muted-foreground">and</span>
              {category === 'date' ? (
                <Popover open={date2PopoverOpen} onOpenChange={setDate2PopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !filter.value2 && "text-muted-foreground")}>
                      {filter.value2 || "Pick date..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filter.value2 ? new Date(filter.value2) : undefined}
                      onSelect={(date) => {
                        if (date) onChange({ ...filter, value2: format(date, 'yyyy-MM-dd') })
                        setDate2PopoverOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type={category === 'number' ? 'number' : 'text'}
                  placeholder="Value 2..."
                  value={filter.value2 || ''}
                  onChange={(e) => onChange({ ...filter, value2: e.target.value })}
                  className="w-[150px]"
                />
              )}
            </>
          )}
        </>
      )}

      {/* Remove button */}
      <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
