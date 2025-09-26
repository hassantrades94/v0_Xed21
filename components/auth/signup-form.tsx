"use client"
import { useActionState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Gift } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, null)

  // Auto-redirect on successful signup
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        window.location.href = "/auth/login"
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join Xed21</CardTitle>
          <p className="text-center text-muted-foreground">Create your account to get started</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-cyan-700">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">🎉 Get 500 Free Coins on Email Verification!</span>
            </div>
            <p className="text-center text-sm text-cyan-600 mt-1">Verify your email to start generating questions</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state?.success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.success}
                  <div className="mt-2 text-sm">
                    Redirecting to login page in 2 seconds...
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  defaultValue="+91 "
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-cyan-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-cyan-600 hover:underline">
                Privacy Policy
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
