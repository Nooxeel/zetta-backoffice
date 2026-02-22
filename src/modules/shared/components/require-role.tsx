"use client"

import { useAuth } from "@/src/modules/shared/contexts/auth-context"
import type { Role } from "@/src/modules/shared/lib/auth-types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RequireRoleProps {
  role: Role
  children: React.ReactNode
  fallbackPath?: string
}

export function RequireRole({
  role,
  children,
  fallbackPath = "/dashboard",
}: RequireRoleProps) {
  const { hasRole, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole(role)) {
      router.replace(fallbackPath)
    }
  }, [isLoading, isAuthenticated, hasRole, role, fallbackPath, router])

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">Loading...</div>
  }

  if (!hasRole(role)) {
    return null
  }

  return <>{children}</>
}
