import { create } from "zustand"
import { immer } from "@/lib/zustand-immer"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
      set((state) => {
        state.isLoading = true
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email,
        name: "John Doe",
        role: "admin",
      }

      set((state) => {
        state.user = mockUser
        state.isAuthenticated = true
        state.isLoading = false
      })
    },

    logout: () => {
      set((state) => {
        state.user = null
        state.isAuthenticated = false
      })
    },

    setUser: (user: User) => {
      set((state) => {
        state.user = user
        state.isAuthenticated = true
      })
    },
  })),
)
