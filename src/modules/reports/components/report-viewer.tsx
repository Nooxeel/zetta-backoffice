"use client"

import * as React from "react"
import { Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/modules/shared/components/ui/card"
import { Input } from "@/src/modules/shared/components/ui/input"
import { Skeleton } from "@/src/modules/shared/components/ui/skeleton"
import { Badge } from "@/src/modules/shared/components/ui/badge"
import {
  getDatabases,
  getViews,
  getViewData,
  type ViewInfo,
  type ViewDataResponse,
} from "@/src/modules/shared/lib/api"
import { DatabasePicker } from "./database-picker"
import { ViewPicker } from "./view-picker"
import { ReportDataTable } from "./report-data-table"

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

  const [loadingDb, setLoadingDb] = React.useState(true)
  const [loadingViews, setLoadingViews] = React.useState(false)
  const [loadingData, setLoadingData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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
    setError(null)

    getViews(selectedDb)
      .then((res) => setViews(res.views))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingViews(false))
  }, [selectedDb])

  // Fetch view data when view/pagination/search/sort changes
  React.useEffect(() => {
    if (!selectedDb || !selectedView) return

    setLoadingData(true)
    setError(null)

    getViewData({
      db: selectedDb,
      view: selectedView.name,
      schema: selectedView.schema,
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    })
      .then((res) => setViewData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [selectedDb, selectedView, page, pageSize, debouncedSearch, sortBy, sortOrder])

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

  return (
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
          {viewData && (
            <Badge variant="secondary" className="mb-1">
              {viewData.pagination.totalRows.toLocaleString()} rows
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {loadingData && !viewData && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

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
  )
}
