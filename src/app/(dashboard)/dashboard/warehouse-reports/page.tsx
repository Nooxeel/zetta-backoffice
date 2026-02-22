import { WarehouseReportViewer } from "@/src/modules/warehouse-reports/components/warehouse-report-viewer"

export default function WarehouseReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warehouse Reports</h1>
        <p className="text-muted-foreground">
          Query synced warehouse data with advanced filters.
        </p>
      </div>
      <WarehouseReportViewer />
    </div>
  )
}
