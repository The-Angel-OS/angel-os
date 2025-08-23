"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

// Extend the ColumnMeta interface to include className
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string
  }
}
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from "next/link"

// Utility function to safely get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export interface DataTableColumn<T> {
  accessorKey: string
  header: string
  cell?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  className?: string
}

export interface DataTableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  href?: string
  condition?: (row: T) => boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  title?: string
  description?: string
  searchKey?: string
  searchPlaceholder?: string
  actions?: DataTableAction<T>[]
  addButton?: {
    label: string
    href: string
  }
  exportButton?: boolean
  loading?: boolean
  error?: string
  onRefresh?: () => void
  className?: string
}

function DataTableColumnHeader<T>({ column, title }: { column: any; title: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-8 px-2 lg:px-3"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchKey = "name",
  searchPlaceholder = "Search...",
  actions = [],
  addButton,
  exportButton = false,
  loading = false,
  error,
  onRefresh,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Build table columns with selection and actions
  const tableColumns: ColumnDef<T>[] = React.useMemo(() => {
    const cols: ColumnDef<T>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]

    // Add data columns
    columns.forEach((col) => {
      cols.push({
        accessorKey: col.accessorKey,
        header: col.sortable !== false ? ({ column }) => (
          <DataTableColumnHeader column={column} title={col.header} />
        ) : col.header,
        cell: ({ row }) => {
          // Use nested value getter for dot notation accessorKeys
          const value = col.accessorKey.includes('.') 
            ? getNestedValue(row.original, col.accessorKey)
            : row.getValue(col.accessorKey)
          
          if (col.cell) {
            return col.cell(value, row.original)
          }
          return <div className={col.className}>{value as React.ReactNode}</div>
        },
        enableSorting: col.sortable !== false,
        enableHiding: true,
        meta: {
          className: col.className,
        },
      })
    })

    // Add actions column if actions exist
    if (actions.length > 0) {
      cols.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const rowData = row.original
          const visibleActions = actions.filter(action => 
            !action.condition || action.condition(rowData)
          )

          if (visibleActions.length === 0) return null

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick(rowData)}
                    className={action.variant === "destructive" ? "text-red-600" : ""}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      })
    }

    return cols
  }, [columns, actions])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : data

    // Simple CSV export
    const headers = columns.map(col => col.header).join(',')
    const rows = dataToExport.map(item => 
      columns.map(col => {
        const value = col.accessorKey.includes('.') 
          ? getNestedValue(item, col.accessorKey)
          : item[col.accessorKey]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'data'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        {(title || description) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {exportButton && (
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
                {addButton && (
                  <Button asChild>
                    <Link href={addButton.href}>
                      <Plus className="h-4 w-4 mr-2" />
                      {addButton.label}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className="p-0">
          {/* Filters and Search */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(String(event.target.value))}
                  className="pl-10 w-[300px]"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {tableColumns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                  }}
                  className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
                  aria-label="Rows per page"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  {"<<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  {"<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  {">"}
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  {">>"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function to create common column types
export const createColumn = {
  text: (key: string, header: string, options?: Partial<DataTableColumn<any>>) => ({
    accessorKey: key,
    header,
    ...options,
  }),
  
  badge: (key: string, header: string, statusMap?: Record<string, { variant: any; label?: string }>) => ({
    accessorKey: key,
    header,
    cell: (value: string) => {
      const config = statusMap?.[value] || { variant: "secondary" }
      return (
        <Badge variant={config.variant}>
          {config.label || value}
        </Badge>
      )
    },
  }),
  
  currency: (key: string, header: string, currency = "USD") => ({
    accessorKey: key,
    header,
    cell: (value: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(value || 0)
    },
    className: "text-right font-medium",
  }),
  
  date: (key: string, header: string) => ({
    accessorKey: key,
    header,
    cell: (value: string) => {
      if (!value) return "-"
      return new Date(value).toLocaleDateString()
    },
  }),
  
  link: (key: string, header: string, hrefKey: string) => ({
    accessorKey: key,
    header,
    cell: (value: string, row: any) => (
      <Link href={row[hrefKey]} className="text-blue-600 hover:underline">
        {value}
      </Link>
    ),
  }),
}
