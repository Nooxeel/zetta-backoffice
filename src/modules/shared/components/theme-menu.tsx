"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenuItem,
} from "@/src/modules/shared/components/ui/dropdown-menu"

export function ThemeMenuItem() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const nextTheme = themes[(themes.findIndex(t => t.value === theme) + 1) % themes.length]
  const NextIcon = nextTheme.icon

  return (
    <DropdownMenuItem onClick={() => setTheme(nextTheme.value)}>
      <NextIcon className="mr-2 h-4 w-4" />
      <span>Switch to {nextTheme.label}</span>
    </DropdownMenuItem>
  )
}
