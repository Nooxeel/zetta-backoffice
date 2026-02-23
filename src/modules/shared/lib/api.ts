const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'zetta_auth_token'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`

  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      document.cookie = 'zetta_auth_active=; path=/; max-age=0'
      window.location.href = '/sign-in'
    }
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }

  return res.json()
}

// --- Types ---

export interface DatabaseListResponse {
  databases: string[]
  count: number
}

export interface ViewInfo {
  schema: string
  name: string
  isUpdatable: string
}

export interface ViewListResponse {
  database: string
  views: ViewInfo[]
  count: number
}

export interface ViewColumn {
  column: string
  type: string
}

export interface ViewDataResponse {
  database: string
  view: string
  schema: string
  columns: ViewColumn[]
  data: Record<string, unknown>[]
  pagination: {
    page: number
    pageSize: number
    totalRows: number
    totalPages: number
  }
}

// --- API Functions ---

export async function getDatabases(): Promise<DatabaseListResponse> {
  return apiFetch('/api/databases')
}

export async function getViews(db: string): Promise<ViewListResponse> {
  return apiFetch(`/api/views?db=${encodeURIComponent(db)}`)
}

export interface ViewDataParams {
  db: string
  view: string
  schema?: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getViewData(params: ViewDataParams): Promise<ViewDataResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('db', params.db)
  searchParams.set('view', params.view)
  if (params.schema) searchParams.set('schema', params.schema)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  return apiFetch(`/api/views/data?${searchParams.toString()}`)
}

// --- ETL Types ---

export type SyncStatus = 'NEVER_SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'SCHEMA_CHANGED'

export interface SyncedViewInfo {
  id: string
  dbName: string | null
  sourceSchema: string
  sourceView: string
  pgTableName: string
  status: SyncStatus
  lastSyncAt: string | null
  lastSyncRows: number | null
  lastSyncDurationMs: number | null
  lastError: string | null
  schemaVersion: number
}

export interface EtlStatusResponse {
  views: SyncedViewInfo[]
  count: number
}

export interface SyncTriggerRequest {
  db: string
  schema?: string
  view: string
}

export interface SyncTriggerResponse {
  syncedView: SyncedViewInfo | null
  result: { rowsSynced: number; durationMs: number }
  message: string
}

export interface SyncLogEntry {
  id: string
  status: string
  rowsSynced: number | null
  durationMs: number | null
  error: string | null
  schemaChanges: string | null
  startedAt: string
  completedAt: string | null
}

export interface SyncLogsResponse {
  logs: SyncLogEntry[]
}

// --- ETL API Functions ---

export async function getEtlStatus(): Promise<EtlStatusResponse> {
  return apiFetch('/api/etl/status')
}

export async function triggerSync(params: SyncTriggerRequest): Promise<SyncTriggerResponse> {
  return apiFetch('/api/etl/sync', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function getSyncLogs(syncedViewId: string): Promise<SyncLogsResponse> {
  return apiFetch(`/api/etl/status/${syncedViewId}/logs`)
}

export async function deleteSync(syncedViewId: string): Promise<{ message: string }> {
  return apiFetch(`/api/etl/sync/${syncedViewId}`, { method: 'DELETE' })
}

// --- Sync All (SSE) ---

export type SyncAllEventType = 'start' | 'progress' | 'complete' | 'error'

export interface SyncAllEvent {
  type: SyncAllEventType
  total?: number
  views?: string[]
  current?: number
  view?: string
  status?: 'syncing' | 'success' | 'failed'
  rowsSynced?: number
  durationMs?: number
  error?: string
  successCount?: number
  failCount?: number
}

export function syncAllViews(
  db: string,
  onEvent: (event: SyncAllEvent) => void,
): AbortController {
  const controller = new AbortController()
  const url = `${API_URL}/api/etl/sync-all?db=${encodeURIComponent(db)}`
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  fetch(url, {
    signal: controller.signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        onEvent({ type: 'error', error: body.error || `API error: ${res.status}` })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const line = part.trim()
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onEvent(data)
            } catch {
              // ignore malformed JSON
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onEvent({ type: 'error', error: err.message })
      }
    })

  return controller
}

// --- Warehouse Types ---

export type FilterCategory = 'text' | 'number' | 'date' | 'boolean' | 'unsupported'
export type TextOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'not_equals'
export type NumberOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
export type DateOperator = 'eq' | 'before' | 'after' | 'between'
export type BooleanOperator = 'eq'
export type FilterOperator = TextOperator | NumberOperator | DateOperator | BooleanOperator

export interface ColumnFilter {
  id: string
  column: string
  operator: FilterOperator
  value: string
  value2?: string
}

export interface WarehouseColumn {
  column: string
  sqlType: string
  pgType: string
  nullable: boolean
  filterCategory: FilterCategory
}

export interface WarehouseColumnsResponse {
  columns: WarehouseColumn[]
  count: number
}

export interface WarehouseTableInfo {
  id: string
  dbName: string
  sourceSchema: string
  sourceView: string
  pgTableName: string
  lastSyncAt: string | null
  lastSyncRows: number | null
}

export interface WarehouseTablesResponse {
  tables: WarehouseTableInfo[]
  count: number
}

export interface WarehouseDataParams {
  syncedViewId: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: ColumnFilter[]
}

// --- Warehouse API Functions ---

export async function getWarehouseTables(): Promise<WarehouseTablesResponse> {
  return apiFetch('/api/warehouse/tables')
}

export async function getWarehouseColumns(syncedViewId: string): Promise<WarehouseColumnsResponse> {
  return apiFetch(`/api/warehouse/columns?syncedViewId=${encodeURIComponent(syncedViewId)}`)
}

export function getWarehouseExportUrl(params: {
  syncedViewId: string
  format: 'csv' | 'xlsx'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: ColumnFilter[]
}): string {
  const searchParams = new URLSearchParams()
  searchParams.set('syncedViewId', params.syncedViewId)
  searchParams.set('format', params.format)
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.filters && params.filters.length > 0) {
    const serialized = params.filters.map(({ column, operator, value, value2 }) => ({
      column, operator, value, ...(value2 ? { value2 } : {}),
    }))
    searchParams.set('filters', JSON.stringify(serialized))
  }
  return `${API_URL}/api/warehouse/export?${searchParams.toString()}`
}

export function getViewExportUrl(params: {
  db: string
  view: string
  schema?: string
  format: 'csv' | 'xlsx'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): string {
  const searchParams = new URLSearchParams()
  searchParams.set('db', params.db)
  searchParams.set('view', params.view)
  searchParams.set('format', params.format)
  if (params.schema) searchParams.set('schema', params.schema)
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  return `${API_URL}/api/views/export?${searchParams.toString()}`
}

export async function downloadExport(url: string, filename: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Export failed: ${res.status}`)
  }
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function getWarehouseData(params: WarehouseDataParams): Promise<ViewDataResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('syncedViewId', params.syncedViewId)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.filters && params.filters.length > 0) {
    const serialized = params.filters.map(({ column, operator, value, value2 }) => ({
      column, operator, value, ...(value2 ? { value2 } : {}),
    }))
    searchParams.set('filters', JSON.stringify(serialized))
  }
  return apiFetch(`/api/warehouse/data?${searchParams.toString()}`)
}

// --- Admin Types ---

export interface AdminUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'ADMIN' | 'BASIC'
  createdAt: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  count: number
}

// --- Admin API Functions ---

export async function getUsers(): Promise<AdminUsersResponse> {
  return apiFetch('/api/admin/users')
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'BASIC'): Promise<{ user: AdminUser }> {
  return apiFetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export async function deleteUser(userId: string): Promise<{ message: string }> {
  return apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
}
