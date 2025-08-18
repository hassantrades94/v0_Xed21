"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token)
        if (result.success) {
          setStatus("success")
          setMessage("Email verified successfully! You have been awarded 500 coins.")
        } else {
          setStatus("error")
          setMessage(result.error || "Verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verify()
  }, [token])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-cyan-600 mx-auto" />
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
            <p className="text-emerald-600 font-medium">{message}</p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              Continue to Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            <p className="text-red-600 font-medium">{message}</p>
            <Button onClick={() => router.push("/auth/signup")} variant="outline" className="w-full">
              Back to Signup
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
