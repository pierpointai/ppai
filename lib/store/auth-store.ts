import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { devtools } from "zustand/middleware"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  company?: string
  role: "user" | "admin"
}

// Define the store state interface
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Define the store actions interface
interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => void
  demoLogin: () => void
  updateProfile: (data: Partial<User>) => void
  clearError: () => void
}

// Combine state and actions
type AuthStore = AuthState & AuthActions

// Mock user database for MVP
const mockUsers = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password",
    company: "Demo Shipping Co.",
    role: "user" as const,
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    company: "Cargo Manager Inc.",
    role: "admin" as const,
  },
]

// Create the store with middleware
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,

        // Actions
        signIn: async (email, password) => {
          set({ isLoading: true, error: null })

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          const foundUser = mockUsers.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
          )

          if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser

            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              isLoading: false,
            })

            return true
          }

          set({
            error: "Invalid email or password",
            isLoading: false,
          })

          return false
        },

        signUp: async (name, email, password) => {
          set({ isLoading: true, error: null })

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Check if user already exists
          if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            set({
              error: "User with this email already exists",
              isLoading: false,
            })

            return false
          }

          // Create new user
          const newUser = {
            id: `${mockUsers.length + 1}`,
            name,
            email,
            role: "user" as const,
          }

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        },

        signOut: () => {
          set({
            user: null,
            isAuthenticated: false,
          })
        },

        demoLogin: () => {
          const demoUser = {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
            company: "Demo Shipping Co.",
            role: "user" as const,
          }

          set({
            user: demoUser,
            isAuthenticated: true,
          })
        },

        updateProfile: (data) => {
          const currentUser = get().user
          if (currentUser) {
            set({
              user: { ...currentUser, ...data },
            })
          }
        },

        clearError: () => {
          set({ error: null })
        },
      }),
      {
        name: "auth-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "auth-store" },
  ),
)

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
