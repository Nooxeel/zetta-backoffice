"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { LayoutDashboard } from "lucide-react"
import { useAuth } from "@/src/modules/shared/contexts/auth-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/modules/shared/components/ui/card"

export default function SignInPage() {
  const router = useRouter()
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    router.push("/dashboard")
    return null
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google sign-in failed: no credential received")
      return
    }

    setIsSigningIn(true)
    setError(null)

    try {
      await loginWithGoogle(response.credential)
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed. Please try again."
      setError(message)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.")
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md px-4">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Zetta</CardTitle>
          <CardDescription>
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {error && (
            <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {isSigningIn ? (
            <p className="text-muted-foreground">Signing in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
