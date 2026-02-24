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
import { Input } from "@/src/modules/shared/components/ui/input"
import { Button } from "@/src/modules/shared/components/ui/button"
import { Label } from "@/src/modules/shared/components/ui/label"
import { Separator } from "@/src/modules/shared/components/ui/separator"

export default function SignInPage() {
  const router = useRouter()
  const { loginWithGoogle, loginWithEmail, registerWithEmail, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    router.push("/dashboard")
    return null
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password, name || undefined)
      } else {
        await loginWithEmail(email, password)
      }
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google sign-in failed: no credential received")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await loginWithGoogle(response.credential)
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.")
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setError(null)
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
          <CardTitle className="text-2xl font-bold">
            {isRegisterMode ? "Create an account" : "Welcome to Zetta"}
          </CardTitle>
          <CardDescription>
            {isRegisterMode
              ? "Register with your email to get started"
              : "Sign in to continue to the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {isRegisterMode && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? (isRegisterMode ? "Registering..." : "Signing in...")
                : (isRegisterMode ? "Register" : "Sign in")}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isRegisterMode ? (
              <>
                Already have an account?{" "}
                <button onClick={toggleMode} className="underline hover:text-foreground">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={toggleMode} className="underline hover:text-foreground">
                  Register
                </button>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            {isSubmitting ? (
              <p className="text-muted-foreground text-sm">Please wait...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
