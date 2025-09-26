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
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Building, Shield, Save, Key, Trash2 } from "lucide-react"
import { updateUserProfile, updateUserPassword } from "@/lib/actions/profile"
import { useToast } from "@/components/ui/toast"

interface ProfileSettingsProps {
  user: any
  userProfile: any
}

export default function ProfileSettings({ user, userProfile }: ProfileSettingsProps) {
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.full_name || "",
    email: user?.email || "",
    phone: userProfile?.phone || "",
    organization: userProfile?.organization || "",
    role: userProfile?.role || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("fullName", profileData.fullName)
      formData.append("phone", profileData.phone)
      formData.append("organization", profileData.organization)
      formData.append("role", profileData.role)

      const result = await updateUserProfile(formData)
      if (result.success) {
        setSuccess(result.message)
        toast({ title: "Success", description: result.message })
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile. Please try again."
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match.")
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      setPasswordLoading(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append("currentPassword", passwordData.currentPassword)
      formData.append("newPassword", passwordData.newPassword)
      formData.append("confirmPassword", passwordData.confirmPassword)

      const result = await updateUserPassword(formData)
      if (result.success) {
        setSuccess(result.message)
        toast({ title: "Success", description: result.message })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password. Please try again."
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setPasswordLoading(false)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const updatePasswordData = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
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
                        value={profileData.fullName}
                        onChange={(e) => updateProfileData("fullName", e.target.value)}
                        className="pl-10"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="email" type="email" value={profileData.email} className="pl-10 bg-gray-50" disabled />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => updateProfileData("phone", e.target.value)}
                        className="pl-10"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={profileData.role} onValueChange={(value) => updateProfileData("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educator">Educator</SelectItem>
                        <SelectItem value="content_creator">Content Creator</SelectItem>
                        <SelectItem value="institution">Institution</SelectItem>
                        <SelectItem value="tutor">Private Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="organization"
                      value={profileData.organization}
                      onChange={(e) => updateProfileData("organization", e.target.value)}
                      className="pl-10"
                      placeholder="School/Institution name"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-green-600" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>Update your account password for better security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => updatePasswordData("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => updatePasswordData("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => updatePasswordData("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {getUserInitials(profileData.fullName || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{profileData.fullName || "User"}</h3>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{profileData.role?.replace("_", " ") || "User"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(userProfile?.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wallet Balance</span>
                  <span className="text-sm font-medium text-blue-600">
                    ₹{userProfile?.wallet_balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-0 shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
