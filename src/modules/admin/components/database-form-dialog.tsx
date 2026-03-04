"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/modules/shared/components/ui/dialog"
import { Button } from "@/src/modules/shared/components/ui/button"
import { Input } from "@/src/modules/shared/components/ui/input"
import { Label } from "@/src/modules/shared/components/ui/label"
import {
  createDatabase,
  updateDatabase,
  type AdminDatabase,
} from "@/src/modules/shared/lib/api"

interface DatabaseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  database: AdminDatabase | null
  onSuccess: () => void
}

export function DatabaseFormDialog({ open, onOpenChange, database, onSuccess }: DatabaseFormDialogProps) {
  const isEdit = !!database

  const [name, setName] = React.useState("")
  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (database) {
      setName(database.dbName)
      setLabel(database.label || "")
      setDescription(database.description || "")
    } else {
      setName("")
      setLabel("")
      setDescription("")
    }
  }, [database, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        const res = await updateDatabase(database.id, { label: label || undefined, description: description || undefined })
        toast.success(res.message)
      } else {
        const res = await createDatabase({ name, label: label || undefined, description: description || undefined })
        toast.success(res.message)
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Database" : "Add Database"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the label and description for this database."
                : "Register a new SQL Server database. Configure environment variables DB_{NAME}_SERVER, DB_{NAME}_DATABASE, DB_{NAME}_USER, and DB_{NAME}_PASSWORD in your deployment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="db-name">Name</Label>
              <Input
                id="db-name"
                placeholder="e.g. my_database"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEdit}
                pattern="^[a-zA-Z0-9_]+$"
                required
              />
              {!isEdit && (
                <p className="text-xs text-muted-foreground">
                  Alphanumeric and underscores only. Used to look up env vars: DB_{name.toUpperCase() || "NAME"}_*
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="db-label">Label</Label>
              <Input
                id="db-label"
                placeholder="e.g. Esaab Bupa"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="db-description">Description</Label>
              <Input
                id="db-description"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || (!isEdit && !name)}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
