const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

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

// --- Warehouse API Functions ---

export interface WarehouseDataParams {
  syncedViewId: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getWarehouseData(params: WarehouseDataParams): Promise<ViewDataResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('syncedViewId', params.syncedViewId)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  return apiFetch(`/api/warehouse/data?${searchParams.toString()}`)
}
