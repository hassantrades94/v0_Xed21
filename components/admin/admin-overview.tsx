"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, AlertCircle, TrendingUp, CheckCircle, Clock, ArrowRight, Activity } from "lucide-react"

interface AdminOverviewProps {
  data: {
    totalUsers: number
    totalQuestions: number
    pendingQuestions: number
    totalRequests: number
    recentUsers: any[]
    recentQuestions: any[]
  }
}

export default function AdminOverview({ data }: AdminOverviewProps) {
  const stats = [
    {
      title: "Total Users",
      value: data.totalUsers.toString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-900",
      change: "+12% from last month",
    },
    {
      title: "Questions Generated",
      value: data.totalQuestions.toString(),
      icon: FileText,
      color: "text-green-400",
      bgColor: "bg-green-900",
      change: "+8% from last month",
    },
    {
      title: "Pending Approval",
      value: data.pendingQuestions.toString(),
      icon: AlertCircle,
      color: "text-orange-400",
      bgColor: "bg-orange-900",
      change: "Requires attention",
    },
    {
      title: "Total Requests",
      value: data.totalRequests.toString(),
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-900",
      change: "+15% from last month",
    },
  ]

  const quickActions = [
    {
      title: "Review Questions",
      description: "Approve or reject pending questions",
      href: "/admin/questions",
      icon: FileText,
      color: "bg-blue-600 hover:bg-blue-700",
      count: data.pendingQuestions,
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      href: "/admin/users",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700",
      count: data.totalUsers,
    },
    {
      title: "System Analytics",
      description: "View platform performance metrics",
      href: "/admin/analytics",
      icon: Activity,
      color: "bg-purple-600 hover:bg-purple-700",
      count: null,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Monitor and manage the Xed21 platform</p>
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300">System Status: Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{action.title}</h3>
                      {action.count !== null && (
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{action.description}</p>
                    <Link href={action.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        Access
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.full_name || "User"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                        className={user.is_active ? "bg-green-600" : "bg-gray-600"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-gray-400 hover:text-white">
                    View All Users
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Questions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <FileText className="h-5 w-5 text-green-400" />
              <span>Recent Questions</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Latest generated questions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentQuestions.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent questions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentQuestions.map((question, index) => (
                  <div key={index} className="py-2 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white line-clamp-2">
                          {question.question_text?.substring(0, 80)}...
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">{question.user_name || "Unknown User"}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{question.topic_name || "Unknown Topic"}</span>
                        </div>
                      </div>
                      <Badge
                        variant={question.is_approved ? "default" : "secondary"}
                        className={question.is_approved ? "bg-green-600" : "bg-orange-600"}
                      >
                        {question.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/admin/questions">
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-gray-400 hover:text-white">
                    View All Questions
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5 text-green-400" />
            <span>System Health</span>
          </CardTitle>
          <CardDescription className="text-green-200">Platform performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-sm text-green-200">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">1.2s</p>
              <p className="text-sm text-green-200">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-green-200">Active Issues</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-sm text-green-200">API Health</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
