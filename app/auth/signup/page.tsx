"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

export default function SignUpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8 flex items-center justify-center">
        <Image
          src="/images/pierpoint-ai-logo.png"
          alt="PierPoint AI"
          width={200}
          height={50}
          className="object-contain"
        />
      </div>
      <AuthForm type="signup" />
    </div>
  )
}
