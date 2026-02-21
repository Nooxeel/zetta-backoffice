import { ReportViewer } from "@/src/modules/reports/components/report-viewer"

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Select a database and view to generate a report.
        </p>
      </div>
      <ReportViewer />
    </div>
  )
}
