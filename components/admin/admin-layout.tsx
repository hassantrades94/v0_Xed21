"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, FileText, LogOut, Brain, Edit3 } from "lucide-react"
import { signOut } from "@/lib/actions/auth"

interface AdminLayoutProps {
  children: React.ReactNode
  admin: any
}

export default function AdminLayout({ children, admin }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  const navigation = [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Content Management", href: "/admin/content", icon: FileText },
    { name: "AI Rule Management", href: "/admin/ai-rules", icon: Brain },
    { name: "Bloom Samples", href: "/admin/bloom-samples", icon: Edit3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <span className="bg-blue-500 px-2 py-1 rounded text-sm">Xed21</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-white hover:bg-blue-50 bg-transparent"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="p-6">{children}</main>
    </div>
  )
}
