import SignUpForm from "@/components/auth/signup-form"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function SignUpPage() {
  // Remove Supabase auth check since it's causing issues in Bolt environment
  // The authentication will be handled by the form submission instead

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Xed21</span>
          </Link>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <SignUpForm />

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}