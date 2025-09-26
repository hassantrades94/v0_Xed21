import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", user.email)
        .eq("is_active", true)
        .single()

      if (adminError || !adminUser) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (error) {
      console.error("Middleware error:", error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Handle dashboard routes
  if (pathname.startsWith('/dashboard')) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Check if user exists in users table
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .eq("is_active", true)
        .single()

      if (userError || !userProfile) {
        return NextResponse.redirect(new URL('/auth/signup', request.url))
      }
    } catch (error) {
      console.error("Middleware error:", error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}