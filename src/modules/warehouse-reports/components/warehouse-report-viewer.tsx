"use client"

import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/modules/shared/components/ui/card"
import { Input } from "@/src/modules/shared/components/ui/input"
import { Button } from "@/src/modules/shared/components/ui/button"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import {
  getWarehouseTables,
  getWarehouseColumns,
  getWarehouseData,
  type WarehouseTableInfo,
  type WarehouseColumn,
  type ColumnFilter,
  type ViewDataResponse,
} from "@/src/modules/shared/lib/api"
import { ReportDataTable } from "@/src/modules/reports/components/report-data-table"
import { WarehouseTablePicker } from "./warehouse-table-picker"
import { FilterBuilder } from "./filter-builder"
import { ActiveFilters } from "./active-filters"

export function WarehouseReportViewer() {
  // Selection
  const [tables, setTables] = React.useState<WarehouseTableInfo[]>([])
  const [columns, setColumns] = React.useState<WarehouseColumn[]>([])
  const [selectedTable, setSelectedTable] = React.useState<WarehouseTableInfo | null>(null)

  // Data
  const [viewData, setViewData] = React.useState<ViewDataResponse | null>(null)

  // Pagination, sorting, search
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(50)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filters
  const [filters, setFilters] = React.useState<ColumnFilter[]>([])
  const [appliedFilters, setAppliedFilters] = React.useState<ColumnFilter[]>([])
  const [showFilters, setShowFilters] = React.useState(false)

  // Loading
  const [loadingTables, setLoadingTables] = React.useState(true)
  const [loadingColumns, setLoadingColumns] = React.useState(false)
  const [loadingData, setLoadingData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch tables on mount
  React.useEffect(() => {
    getWarehouseTables()
      .then((res) => setTables(res.tables))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTables(false))
  }, [])

  // Fetch columns when table changes
  React.useEffect(() => {
    if (!selectedTable) {
      setColumns([])
      return
    }
    setLoadingColumns(true)
    setViewData(null)
    setFilters([])
    setAppliedFilters([])
    setSearch("")
    setDebouncedSearch("")
    setSortBy(undefined)
    setSortOrder('asc')
    setPage(1)
    setError(null)

    getWarehouseColumns(selectedTable.id)
      .then((res) => setColumns(res.columns))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingColumns(false))
  }, [selectedTable])

  // Fetch data when table/pagination/search/sort/filters change
  React.useEffect(() => {
    if (!selectedTable) return

    setLoadingData(true)
    setError(null)

    // Only send complete filters (have column + value)
    const validFilters = appliedFilters.filter(f => f.column && f.value)

    getWarehouseData({
      syncedViewId: selectedTable.id,
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      filters: validFilters.length > 0 ? validFilters : undefined,
    })
      .then((res) => setViewData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [selectedTable, page, pageSize, debouncedSearch, sortBy, sortOrder, appliedFilters])

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }

  const handleTableSelect = (table: WarehouseTableInfo) => {
    setSelectedTable(table)
  }

  const handleSortChange = (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1)
  }

  const handleApplyFilters = () => {
    setAppliedFilters([...filters])
    setPage(1)
  }

  const handleRemoveAppliedFilter = (filterId: string) => {
    const updated = appliedFilters.filter(f => f.id !== filterId)
    setAppliedFilters(updated)
    setFilters(updated)
    setPage(1)
  }

  const handleClearAppliedFilters = () => {
    setAppliedFilters([])
    setFilters([])
    setPage(1)
  }

  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(appliedFilters)

  return (
    <div className="flex flex-col gap-4">
      {/* Controls card — table picker, search, filters (no horizontal scroll) */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end gap-4">
            <WarehouseTablePicker
              tables={tables}
              selected={selectedTable}
              onSelect={handleTableSelect}
              loading={loadingTables}
            />
            {selectedTable && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search across text columns..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-9 w-[250px] pl-8"
                  />
                </div>
              </div>
            )}
            {selectedTable && (
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="mb-0.5"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {appliedFilters.length > 0 && (
                  <Badge variant="default" className="ml-2 h-5 px-1.5 text-xs">
                    {appliedFilters.length}
                  </Badge>
                )}
              </Button>
            )}
            {viewData && (
              <Badge variant="secondary" className="mb-1">
                {viewData.pagination.totalRows.toLocaleString()} rows
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Filter section — isolated from data table scroll */}
        {(error || (showFilters && selectedTable && !loadingColumns) || appliedFilters.length > 0) && (
          <CardContent className="pt-0 pb-4">
            {error && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Filter Builder */}
            {showFilters && selectedTable && !loadingColumns && (
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Column Filters</h3>
                </div>
                <FilterBuilder
                  columns={columns}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
                {filters.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleApplyFilters}
                      disabled={!filtersChanged}
                    >
                      Apply Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Active Filters Badges */}
            {appliedFilters.length > 0 && (
              <div className={showFilters && selectedTable && !loadingColumns ? "mt-4" : ""}>
                <ActiveFilters
                  filters={appliedFilters}
                  columns={columns}
                  onRemove={handleRemoveAppliedFilter}
                  onClearAll={handleClearAppliedFilters}
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Data card — table with its own horizontal scroll, separate from controls */}
      {(viewData || loadingData || (!selectedTable && !error)) && (
        <Card>
          <CardContent className="pt-6">
            {/* Loading skeleton */}
            {loadingData && !viewData && (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {/* Data table */}
            {viewData && (
              <div className={loadingData ? "opacity-50 pointer-events-none" : ""}>
                <ReportDataTable
                  data={viewData}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1) }}
                  onSortChange={handleSortChange}
                />
              </div>
            )}

            {/* Empty states */}
            {!viewData && !loadingData && !error && (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {!selectedTable
                  ? "Select a table to get started."
                  : loadingColumns
                    ? "Loading columns..."
                    : "No data available."}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
