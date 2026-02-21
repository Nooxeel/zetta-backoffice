import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"

export default function DatabasesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
        <p className="text-muted-foreground">
          Monitor database connections and explore schemas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Database Connections</CardTitle>
          <CardDescription>
            Connectivity status and schema exploration will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
