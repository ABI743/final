"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { verifyPassword } from "@/lib/firebase"

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: "read" | "write"
}

export default function PasswordModal({ isOpen, onClose, onSuccess, mode }: PasswordModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password.trim()) {
      setError("Please enter a password")
      return
    }

    setIsVerifying(true)

    try {
      const isValid = await verifyPassword(mode, password)

      if (isValid) {
        onSuccess()
      } else {
        setError("Incorrect password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-amber-200/30 bg-amber-950 text-amber-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cedarville text-2xl">
            {mode === "read" ? "Enter Reading Password" : "Enter Writing Password"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-amber-200/50 bg-amber-900/30 text-amber-50"
              placeholder="Enter password"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-amber-200 hover:bg-amber-900/50 hover:text-amber-100"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isVerifying} className="bg-amber-800 text-amber-50 hover:bg-amber-700">
              {isVerifying ? "Verifying..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
