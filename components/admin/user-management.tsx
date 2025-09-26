"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { updateUserCoins, suspendUser, deleteUser } from "@/lib/actions/admin"
import { toast } from "@/components/ui/sonner"

interface UserManagementProps {
  users: any[]
  totalCount: number
}

export default function UserManagement({ users, totalCount }: UserManagementProps) {
  const [showCoinsModal, setShowCoinsModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newCoinsAmount, setNewCoinsAmount] = useState("")
  const [pendingAction, setPendingAction] = useState<() => void>(() => {})
  const [isPending, startTransition] = useTransition()

  const handleUpdateCoins = (user: any) => {
    setSelectedUser(user)
    setNewCoinsAmount(user.wallet_balance.toString())
    setShowCoinsModal(true)
  }

  const handleSuspendUser = (user: any) => {
    setSelectedUser(user)
    setPendingAction(() => () => {
      startTransition(async () => {
        const result = await suspendUser(user.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    })
    setShowConfirmDialog(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setPendingAction(() => () => {
      startTransition(async () => {
        const result = await deleteUser(user.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    })
    setShowDeleteDialog(true)
  }

  const executeCoinsUpdate = () => {
    if (!selectedUser || !newCoinsAmount) return

    startTransition(async () => {
      const result = await updateUserCoins(selectedUser.id, Number.parseInt(newCoinsAmount))
      if (result.success) {
        toast.success(result.message)
        setShowCoinsModal(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage registered users and their accounts</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Coins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.wallet_balance}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateCoins(user)} disabled={isPending}>
                      Update Coins
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSuspendUser(user)}
                      disabled={isPending}
                    >
                      Suspend
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} disabled={isPending}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showCoinsModal} onOpenChange={setShowCoinsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Coins</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User: {selectedUser?.full_name}</label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance: {selectedUser?.wallet_balance} coins
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Coin Balance</label>
              <Input
                type="number"
                value={newCoinsAmount}
                onChange={(e) => setNewCoinsAmount(e.target.value)}
                placeholder="Enter new coin balance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoinsModal(false)}>
              Cancel
            </Button>
            <Button onClick={executeCoinsUpdate} disabled={isPending}>
              {isPending ? "Updating..." : "Update Coins"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to suspend user "{selectedUser?.full_name}"? This will prevent them from accessing the
            platform.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                pendingAction()
                setShowConfirmDialog(false)
              }}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete user "{selectedUser?.full_name}"? This action cannot be undone
            and will remove all user data.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                pendingAction()
                setShowDeleteDialog(false)
              }}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}