"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  company?: string
  role: "user" | "admin"
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => void
  demoLogin: () => void
  updateProfile: (data: Partial<User>) => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
  demoLogin: () => {},
  updateProfile: () => {},
})

/**
 * Auth provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Mock user database for MVP
  const mockUsers = [
    {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
      password: "password",
      company: "PierPoint AI Shipping Co.",
      role: "user" as const,
    },
    {
      id: "2",
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      company: "PierPoint AI Inc.",
      role: "admin" as const,
    },
  ]

  /**
   * Sign in function
   * @param email User email
   * @param password User password
   * @returns Success status
   */
  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  /**
   * Sign up function
   * @param name User name
   * @param email User email
   * @param password User password
   * @returns Success status
   */
  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user already exists
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return false
    }

    // Create new user
    const newUser = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      role: "user" as const,
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    return true
  }

  /**
   * Sign out function
   */
  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/auth/signin")
  }

  /**
   * Demo login function
   */
  const demoLogin = () => {
    const demoUser = {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
      company: "PierPoint AI Shipping Co.",
      role: "user" as const,
    }

    setUser(demoUser)
    localStorage.setItem("user", JSON.stringify(demoUser))
    router.push("/")
  }

  /**
   * Update profile function
   * @param data Updated user data
   */
  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        demoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use auth context
 */
export const useAuth = () => useContext(AuthContext)
