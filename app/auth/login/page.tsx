import LoginForm from "@/components/auth/login-form"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Xed21</span>
          </Link>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            <Link href="/admin/login" className="hover:text-gray-700">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
