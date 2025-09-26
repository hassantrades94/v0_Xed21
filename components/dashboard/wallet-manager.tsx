"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, TrendingUp, Loader2 } from "lucide-react"
import { topUpWallet } from "@/lib/actions/wallet"
import { toast } from "@/components/ui/sonner"

interface WalletManagerProps {
  userProfile: any
  transactions: any[]
  stats: any
}

export default function WalletManager({ userProfile, transactions, stats }: WalletManagerProps) {
  const [topUpAmount, setTopUpAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [isPending, startTransition] = useTransition()

  const handleTopUp = async (amount: number) => {
    if (amount < 10 || amount > 50000) {
      toast.error("Amount must be between ₹10 and ₹50,000")
      return
    }

    const formData = new FormData()
    formData.append("amount", amount.toString())
    formData.append("payment_method", paymentMethod)

    startTransition(async () => {
      try {
        const result = await topUpWallet(formData)
        toast.success(result.message)
        setTopUpAmount("")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to process payment")
      }
    })
  }

  const getTransactionIcon = (type: string) => {
    return type === "credit" ? ArrowUpRight : ArrowDownRight
  }

  const getTransactionColor = (type: string) => {
    return type === "credit" ? "text-green-600" : "text-red-600"
  }

  const formatTransactionType = (type: string, referenceType?: string | null) => {
    if (type === "credit") {
      return referenceType === "top_up" ? "Wallet Top-up" : "Credit"
    } else if (type === "debit") {
      return referenceType === "question_generation" ? "Question Generation" : "Debit"
    }
    return type
  }

  const quickTopUpAmounts = [100, 500, 1000, 2000, 5000]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and view transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Balance */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-6 w-6" />
                <span>Current Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">₹{userProfile?.wallet_balance?.toFixed(2) || "0.00"}</div>
              <p className="text-green-100">Available for question generation</p>
            </CardContent>
          </Card>

          {/* Enhanced Top-up */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <span>Add Funds</span>
              </CardTitle>
              <CardDescription>Top up your wallet to generate more questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Custom Amount</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="10"
                    max="50000"
                  />
                  <Button
                    onClick={() => handleTopUp(Number.parseInt(topUpAmount))}
                    disabled={!topUpAmount || Number.parseInt(topUpAmount) < 10 || isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-1" />
                    )}
                    Pay
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quick Top-up</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickTopUpAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTopUp(amount)}
                      disabled={isPending}
                      className="text-sm"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <strong>Cost:</strong> ₹5 per question generated. Minimum top-up: ₹10
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Transaction History</span>
              </CardTitle>
              <CardDescription>Your recent wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600">
                    Your transaction history will appear here once you start using your wallet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const Icon = getTransactionIcon(transaction.type)
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatTransactionType(transaction.type, transaction.reference_type)}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(transaction.created_at).toLocaleString()}</span>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                          </p>
                          {transaction.balance_after && (
                            <p className="text-sm text-gray-500">Balance: ₹{transaction.balance_after.toFixed(2)}</p>
                          )}
                          <Badge
                            variant={transaction.status === "completed" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Usage Statistics */}
      <Card className="border-0 shadow-lg bg-gray-50">
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Your wallet usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalSpent?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats?.questionBatches || 0}</p>
              <p className="text-sm text-gray-600">Question Batches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{stats?.totalAdded?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-600">Total Added</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{stats?.avgPerBatch?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-600">Avg. per Batch</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
