import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminLoginForm from "@/components/auth/admin-login-form"
import Link from "next/link"
import { BookOpen, Shield } from "lucide-react"

export default async function AdminLoginPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is admin (this would need proper role checking in real implementation)
  if (user) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Xed21</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <p className="text-gray-300">Admin Portal</p>
          </div>
        </div>

        {/* Admin Login Form */}
        <AdminLoginForm />

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            <Link href="/auth/login" className="hover:text-gray-300">
              ← Back to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
