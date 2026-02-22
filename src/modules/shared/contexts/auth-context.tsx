"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { User, Role } from "../lib/auth-types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const TOKEN_KEY = "zetta_auth_token"

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  hasRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, check for existing token in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      fetchMe(stored)
        .then((userData) => {
          setToken(stored)
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          document.cookie = "zetta_auth_active=; path=/; max-age=0"
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Authentication failed")
    }

    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.token)
    document.cookie = "zetta_auth_active=1; path=/; max-age=604800; SameSite=Lax"
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    document.cookie = "zetta_auth_active=; path=/; max-age=0"
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: Role) => {
      if (!user) return false
      if (user.role === "ADMIN") return true
      return user.role === role
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        loginWithGoogle,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

async function fetchMe(token: string): Promise<User> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  if (!res.ok) throw new Error("Invalid token")
  const data = await res.json()
  return data.user
}
