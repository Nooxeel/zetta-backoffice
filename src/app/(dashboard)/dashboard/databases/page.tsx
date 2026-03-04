import { DatabaseManagement } from "@/src/modules/admin/components/database-management"

export default function DatabasesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
        <p className="text-muted-foreground">
          Manage database connections and view whitelists.
        </p>
      </div>
      <DatabaseManagement />
    </div>
  )
}
