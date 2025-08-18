import { Suspense } from "react"
import { VerifyEmail } from "@/components/auth/verify-email"

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmail />
      </Suspense>
    </div>
  )
}
