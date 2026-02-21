"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/modules/shared/components/ui/table"
import { Button } from "@/src/modules/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/modules/shared/components/ui/select"
import { DataTableColumnHeader } from "@/src/modules/shared/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/src/modules/shared/components/ui/data-table-view-options"
import type { ViewColumn, ViewDataResponse } from "@/src/modules/shared/lib/api"

interface ReportDataTableProps {
  data: ViewDataResponse
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (sortBy: string | undefined, sortOrder: 'asc' | 'desc') => void
}

function buildColumns(columns: ViewColumn[]): ColumnDef<Record<string, unknown>>[] {
  return columns.map((col) => ({
    accessorKey: col.column,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={col.column} />
    ),
    cell: ({ row }) => {
      const value = row.getValue(col.column)
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">NULL</span>
      }
      return <span className="max-w-[300px] truncate block">{String(value)}</span>
    },
    enableSorting: true,
    enableHiding: true,
  }))
}

export function ReportDataTable({
  data,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: ReportDataTableProps) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo(() => buildColumns(data.columns), [data.columns])

  const table = useReactTable({
    data: data.data,
    columns,
    pageCount: data.pagination.totalPages,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: data.pagination.page - 1,
        pageSize: data.pagination.pageSize,
      },
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      if (newSorting.length > 0) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      } else {
        onSortChange(undefined, 'asc')
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  const { page, pageSize, totalRows, totalPages } = data.pagination
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalRows)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Server-side pagination controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalRows > 0
            ? `Showing ${from}-${to} of ${totalRows.toLocaleString()} rows`
            : "No rows"}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
