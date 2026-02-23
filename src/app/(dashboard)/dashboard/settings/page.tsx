import { UserManagement } from "@/src/modules/admin/components/user-management"
import { RequireRole } from "@/src/modules/shared/components/require-role"

export default function SettingsPage() {
  return (
    <RequireRole role="ADMIN">
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their roles.
          </p>
        </div>
        <UserManagement />
      </div>
    </RequireRole>
  )
}
