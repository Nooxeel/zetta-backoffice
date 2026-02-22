import { EtlDashboard } from "@/src/modules/etl/components/etl-dashboard"
import { RequireRole } from "@/src/modules/shared/components/require-role"

export default function EtlPage() {
  return (
    <RequireRole role="ADMIN">
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ETL Warehouse</h1>
          <p className="text-muted-foreground">
            Sync SQL Server views to PostgreSQL for optimized querying.
          </p>
        </div>
        <EtlDashboard />
      </div>
    </RequireRole>
  )
}
