"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, Building, Calendar, Shield, CheckCircle } from "lucide-react"
import { updateUserProfile } from "@/lib/actions/profile"
import { useToast } from "@/components/ui/toast"

interface ProfileManagerProps {
  user: any
  userProfile: any
}

export default function ProfileManager({ user, userProfile }: ProfileManagerProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || "",
    phone: userProfile?.phone || "",
    organization: userProfile?.organization || "",
    role: userProfile?.role || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")


    try {
      const formDataObj = new FormData()
      formDataObj.append("fullName", formData.fullName)
      formDataObj.append("phone", formData.phone)
      formDataObj.append("organization", formData.organization)
      formDataObj.append("role", formData.role)

      const result = await updateUserProfile(formDataObj)
      if (result.success) {
        setSuccess(result.message)
        toast({ title: "Success", description: result.message })
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    const colors = {
      educator: "bg-blue-100 text-blue-800",
      content_creator: "bg-green-100 text-green-800",
      institution: "bg-purple-100 text-purple-800",
      tutor: "bg-orange-100 text-orange-800",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getUserInitials(userProfile?.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{userProfile?.full_name || "User"}</CardTitle>
              <CardDescription className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Badge className={getRoleColor(userProfile?.role || "")}>
                  {userProfile?.role?.replace("_", " ").toUpperCase() || "USER"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <div className="flex items-center space-x-1">
                  {userProfile?.is_verified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">Unverified</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm text-gray-900">{new Date(userProfile?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallet Balance</span>
                <span className="text-sm font-medium text-green-600">
                  ₹{userProfile?.wallet_balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Questions Generated</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-sm font-medium text-gray-900">₹0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-gray-900">100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => updateFormData("fullName", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educator">K-12 Educator</SelectItem>
                        <SelectItem value="content_creator">Content Creator</SelectItem>
                        <SelectItem value="institution">Educational Institution</SelectItem>
                        <SelectItem value="tutor">Private Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" type="email" value={user.email} className="pl-10 bg-gray-50" disabled />
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="organization"
                        type="text"
                        placeholder="School/Institution name"
                        value={formData.organization}
                        onChange={(e) => updateFormData("organization", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Account Created</p>
                    <p className="text-sm text-blue-700">
                      {new Date(userProfile?.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
