"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Building, Mail, LogOut } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isLoading, updateProfile, signOut } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.name || "")
  const [company, setCompany] = useState(user?.company || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  // Fix the handleSave function to properly await the update and show feedback
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ name, company })
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageLayout title="Profile" description="Manage your personal information and account settings">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setName(user.name)
                      setCompany(user.company || "")
                      setIsEditing(false)
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.name}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.company || "Not specified"}</span>
                  </div>
                </div>

                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Type</Label>
              <div className="p-3 rounded-md bg-secondary">
                <span className="font-medium">{user.role === "admin" ? "Administrator" : "Standard User"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Status</Label>
              <div className="p-3 rounded-md bg-secondary">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={signOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}
