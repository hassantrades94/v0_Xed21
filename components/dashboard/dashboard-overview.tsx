"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Zap, FileText, Wallet, TrendingUp, Clock, CheckCircle, ArrowRight, Users, Target, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardOverviewProps {
  user: any
  userProfile: any
}

export default function DashboardOverview({ user, userProfile }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    thisMonthQuestions: 0,
    avgTimeSaved: 0,
    totalSpent: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [userProfile?.id])

  const fetchDashboardData = async () => {
    if (!userProfile?.id) return

    const supabase = createClient()

    try {
      // Fetch question requests stats
      const { data: questionRequests } = await supabase
        .from("question_requests")
        .select("*")
        .eq("user_id", userProfile.id)

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false })
        .limit(5)

      const totalQuestions = questionRequests?.reduce((sum, req) => sum + (req.generated_questions_count || 0), 0) || 0

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthQuestions =
        questionRequests
          ?.filter((req) => new Date(req.created_at) >= thisMonth)
          .reduce((sum, req) => sum + (req.generated_questions_count || 0), 0) || 0

      const totalSpent =
        transactions?.filter((t) => t.transaction_type === "debit").reduce((sum, t) => sum + t.amount, 0) || 0

      setStats({
        totalQuestions,
        thisMonthQuestions,
        avgTimeSaved: totalQuestions * 15, // Assume 15 minutes saved per question
        totalSpent,
      })

      setRecentActivity(transactions || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const dashboardStats = [
    {
      title: "Questions Generated",
      value: loading ? "..." : stats.totalQuestions.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: stats.thisMonthQuestions > 0 ? `+${stats.thisMonthQuestions} this month` : "No activity this month",
    },
    {
      title: "Wallet Balance",
      value: `₹${userProfile?.wallet_balance?.toFixed(2) || "0.00"}`,
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `₹${stats.totalSpent.toFixed(2)} spent total`,
    },
    {
      title: "Time Saved",
      value: loading ? "..." : `${Math.floor(stats.avgTimeSaved / 60)}h ${stats.avgTimeSaved % 60}m`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "Estimated time saved",
    },
    {
      title: "Success Rate",
      value: "98%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Question approval rate",
    },
  ]

  const quickActions = [
    {
      title: "Generate Questions",
      description: "Create AI-powered questions for any topic",
      href: "/dashboard/generate",
      icon: Zap,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "View Questions",
      description: "Browse your generated question library",
      href: "/dashboard/questions",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Add Funds",
      description: "Top up your wallet to generate more questions",
      href: "/dashboard/wallet",
      icon: Wallet,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ]

  const getCompletionPercentage = () => {
    let completed = 0
    const total = 4

    if (userProfile?.full_name) completed++
    if (userProfile?.organization) completed++
    if (stats.totalQuestions > 0) completed++
    if (userProfile?.wallet_balance > 0) completed++

    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.full_name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-gray-600 mt-2">Ready to create some amazing questions today?</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600 capitalize">
                  {userProfile?.role?.replace("_", " ") || "User"}
                </span>
              </div>
              {userProfile?.organization && (
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">{userProfile.organization}</span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium text-gray-900">{new Date(userProfile?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <Link href={action.href}>
                      <Button variant="outline" size="sm" className="group bg-transparent">
                        Get Started
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
        {/* Getting Started */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span>Getting Started with Xed21</span>
            </CardTitle>
            <CardDescription>Complete these steps to make the most of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Setup Progress</span>
                <span className="text-sm font-medium text-gray-900">{getCompletionPercentage()}%</span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-2" />
              <div className="grid grid-cols-1 gap-3 mt-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Account created</span>
                </div>
                <div className="flex items-center space-x-3">
                  {userProfile?.full_name ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Profile completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  {stats.totalQuestions > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">First question generated</span>
                </div>
                <div className="flex items-center space-x-3">
                  {userProfile?.wallet_balance > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Wallet funded</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Your latest transactions and activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 4).map((activity: any, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1 rounded-full ${
                          activity.transaction_type === "credit" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {activity.transaction_type === "credit" ? (
                          <Wallet className="h-3 w-3 text-green-600" />
                        ) : (
                          <Zap className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.transaction_type === "credit" ? "Wallet Top-up" : "Question Generation"}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        activity.transaction_type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.transaction_type === "credit" ? "+" : "-"}₹{activity.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {recentActivity.length > 4 && (
                  <Link href="/dashboard/wallet">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View All Transactions
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
