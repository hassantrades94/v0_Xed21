"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Coins, X, CreditCard, History, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import QuestionHistoryModal from "./question-history-modal"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  userProfile: any
}

export default function DashboardLayout({ children, user, userProfile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [walletTab, setWalletTab] = useState<"recharge" | "history">("recharge")
  const [customAmount, setCustomAmount] = useState("500")
  const [realUserData, setRealUserData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadUserData()
    loadTransactions()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profile) {
          setRealUserData(profile)
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const loadTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (data) {
          setTransactions(data)
        }
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayUser = realUserData ||
    userProfile || {
      full_name: "Mamun",
      email: "geology.cupb16@gmail.com",
      wallet_balance: 9500,
    }

  const rechargePackages = [
    { amount: 100, coins: 200, bonus: 0 },
    { amount: 500, coins: 1100, bonus: 100, popular: true },
    { amount: 1000, coins: 2300, bonus: 300 },
  ]

  const calculateCoins = (amount: number) => {
    const baseCoins = amount * 2 // ₹0.5 = 1 coin
    const bonus = rechargePackages.find((pkg) => pkg.amount === amount)?.bonus || 0
    return { baseCoins, bonus, total: baseCoins + bonus }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-white text-2xl font-bold">
                <span className="text-red-400">X</span>ed21
              </div>
            </div>

            {/* Right side - Coins, Actions, Profile */}
            <div className="flex items-center space-x-4">
              {/* Coins Display */}
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                <Coins className="h-4 w-4 text-yellow-300" />
                <span className="text-white font-medium">{displayUser.wallet_balance || 0}</span>
                <span className="text-white/80 text-sm">coins</span>
              </div>

              {/* Add Coins Button */}
              <Button
                onClick={() => setWalletModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Add Coins
              </Button>

              {/* Activity Button */}
              <Button
                onClick={() => setActivityModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Activity
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-800 text-white text-sm">
                    {getUserInitials(displayUser.full_name || displayUser.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <div className="text-sm font-medium">{displayUser.full_name || displayUser.name}</div>
                  <div className="text-xs text-white/80">{displayUser.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>

      {/* Wallet Management Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Coins className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold">Wallet Management</h2>
              </div>
              <button onClick={() => setWalletModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setWalletTab("recharge")}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  walletTab === "recharge"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Recharge
              </button>
              <button
                onClick={() => setWalletTab("history")}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  walletTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                History
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {walletTab === "recharge" ? (
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800">Current Balance</h3>
                        <p className="text-3xl font-bold text-yellow-900">{displayUser.wallet_balance || 0} coins</p>
                      </div>
                      <Coins className="h-12 w-12 text-yellow-600" />
                    </div>
                  </div>

                  {/* Quick Recharge Packages */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Recharge Packages</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {rechargePackages.map((pkg) => (
                        <div
                          key={pkg.amount}
                          className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                            pkg.popular
                              ? "border-blue-500 bg-blue-50 relative"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                Most Popular
                              </span>
                            </div>
                          )}
                          <div className="text-lg font-semibold">₹{pkg.amount}</div>
                          <div className="text-2xl font-bold text-blue-600 my-2">{pkg.coins}</div>
                          <div className="text-sm text-gray-600">coins</div>
                          {pkg.bonus > 0 && (
                            <div className="text-sm text-green-600 font-medium mt-1">+{pkg.bonus} bonus coins!</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Custom Amount</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount (₹)</label>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="500"
                        />
                        <p className="text-sm text-gray-500 mt-1">Minimum ₹100 • Must be in multiples of ₹100</p>
                      </div>

                      {/* Conversion Details */}
                      <div>
                        <h4 className="font-semibold mb-3">Conversion Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span>Base coins (₹0.5 = 1 coin):</span>
                            <span>{calculateCoins(Number(customAmount) || 0).baseCoins} coins</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Bonus coins:</span>
                            <span>+{calculateCoins(Number(customAmount) || 0).bonus} coins</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total coins:</span>
                            <span>{calculateCoins(Number(customAmount) || 0).total} coins</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                        <CreditCard className="h-4 w-4 inline mr-2" />
                        Recharge ₹{customAmount}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                  <div className="space-y-3">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No transactions found</p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${transaction.type === "credit" ? "bg-green-100" : "bg-red-100"}`}
                            >
                              <Coins
                                className={`h-4 w-4 ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {transaction.amount} coins
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question History Modal */}
      {activityModalOpen && (
        <QuestionHistoryModal isOpen={activityModalOpen} onClose={() => setActivityModalOpen(false)} />
      )}
    </div>
  )
}
