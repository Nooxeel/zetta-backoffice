"use client"

import * as React from "react"
import { Search, SlidersHorizontal, Download, FileSpreadsheet, FileText } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/modules/shared/components/ui/dropdown-menu"
import {
  getDatabases,
  getViews,
  getViewData,
  getViewExportUrl,
  downloadExport,
  type ViewInfo,
  type ViewColumn,
  type ViewDataResponse,
  type ColumnFilter,
} from "@/src/modules/shared/lib/api"
import { DatabasePicker } from "./database-picker"
import { ViewPicker } from "./view-picker"
import { ReportDataTable } from "./report-data-table"
import { FilterBuilder } from "@/src/modules/shared/components/filters/filter-builder"
import { ActiveFilters } from "@/src/modules/shared/components/filters/active-filters"

export function ReportViewer() {
  const [databases, setDatabases] = React.useState<string[]>([])
  const [views, setViews] = React.useState<ViewInfo[]>([])
  const [viewData, setViewData] = React.useState<ViewDataResponse | null>(null)

  const [selectedDb, setSelectedDb] = React.useState<string | null>(null)
  const [selectedView, setSelectedView] = React.useState<ViewInfo | null>(null)

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(50)
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  // Filters
  const [columns, setColumns] = React.useState<ViewColumn[]>([])
  const [filters, setFilters] = React.useState<ColumnFilter[]>([])
  const [appliedFilters, setAppliedFilters] = React.useState<ColumnFilter[]>([])
  const [showFilters, setShowFilters] = React.useState(false)

  const [loadingDb, setLoadingDb] = React.useState(true)
  const [loadingViews, setLoadingViews] = React.useState(false)
  const [loadingData, setLoadingData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [exporting, setExporting] = React.useState(false)
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  // Fetch databases on mount
  React.useEffect(() => {
    getDatabases()
      .then((res) => setDatabases(res.databases))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDb(false))
  }, [])

  // Fetch views when database changes
  React.useEffect(() => {
    if (!selectedDb) {
      setViews([])
      return
    }

    setLoadingViews(true)
    setSelectedView(null)
    setViewData(null)
    setColumns([])
    setFilters([])
    setAppliedFilters([])
    setError(null)

    getViews(selectedDb)
      .then((res) => setViews(res.views))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingViews(false))
  }, [selectedDb])

  // Fetch view data when view/pagination/search/sort/filters change
  React.useEffect(() => {
    if (!selectedDb || !selectedView) return

    setLoadingData(true)
    setError(null)

    const validFilters = appliedFilters.filter(f => f.column && f.value)

    getViewData({
      db: selectedDb,
      view: selectedView.name,
      schema: selectedView.schema,
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      filters: validFilters.length > 0 ? validFilters : undefined,
    })
      .then((res) => {
        setViewData(res)
        // Store columns from response for filter UI
        if (res.columns && res.columns.length > 0) {
          setColumns(res.columns)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [selectedDb, selectedView, page, pageSize, debouncedSearch, sortBy, sortOrder, appliedFilters])

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }

  const handleViewSelect = (view: ViewInfo) => {
    setSelectedView(view)
    setPage(1)
    setSearch("")
    setDebouncedSearch("")
    setSortBy(undefined)
    setSortOrder('asc')
    setFilters([])
    setAppliedFilters([])
    setColumns([])
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
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

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (!selectedDb || !selectedView) return
    setExporting(true)
    try {
      const validFilters = appliedFilters.filter(f => f.column && f.value)
      const url = getViewExportUrl({
        db: selectedDb,
        view: selectedView.name,
        schema: selectedView.schema,
        format,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        filters: validFilters.length > 0 ? validFilters : undefined,
      })
      const ext = format === 'xlsx' ? 'xlsx' : 'csv'
      await downloadExport(url, `${selectedView.name}_${new Date().toISOString().slice(0, 10)}.${ext}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(appliedFilters)

  return (
    <div className="flex flex-col gap-4">
      {/* Controls card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end gap-4">
            {loadingDb ? (
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-[220px]" />
              </div>
            ) : (
              <DatabasePicker
                databases={databases}
                selected={selectedDb}
                onSelect={setSelectedDb}
              />
            )}
            <ViewPicker
              views={views}
              selected={selectedView}
              onSelect={handleViewSelect}
              disabled={!selectedDb}
              loading={loadingViews}
            />
            {selectedView && (
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
            {selectedView && columns.length > 0 && (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="mb-0.5" disabled={exporting}>
                    <Download className="mr-2 h-4 w-4" />
                    {exporting ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {viewData && (
              <Badge variant="secondary" className="mb-1">
                {viewData.pagination.totalRows.toLocaleString()} rows
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Filter section */}
        {(error || (showFilters && columns.length > 0) || appliedFilters.length > 0) && (
          <CardContent className="pt-0 pb-4">
            {error && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Filter Builder */}
            {showFilters && columns.length > 0 && (
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
              <div className={showFilters && columns.length > 0 ? "mt-4" : ""}>
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

      {/* Data card */}
      {(viewData || loadingData || (!selectedView && !error)) && (
        <Card>
          <CardContent className="pt-6">
            {/* Error (shown here only if no filter section is visible) */}
            {error && !showFilters && appliedFilters.length === 0 && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

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
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onSortChange={handleSortChange}
                />
              </div>
            )}

            {/* Empty states */}
            {!viewData && !loadingData && !error && (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {!selectedDb
                  ? "Select a database to get started."
                  : !selectedView
                    ? "Select a view to generate a report."
                    : "No data available."}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
