import { create } from "zustand"
import type { Entity } from "./types"

type Store<T extends Entity> = {
  items: T[]
  loading: boolean
  error: string | null
  add: (item: T) => void
  update: (id: string, updates: Partial<T>) => void
  remove: (id: string) => void
  setItems: (items: T[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const createStore = <T extends Entity>() =>
  create<Store<T>>((set) => ({
    items: [],
    loading: false,
    error: null,
    add: (item) => set((state) => ({ items: [...state.items, item] })),
    update: (id, updates) =>
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      })),
    remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    setItems: (items) => set({ items }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))

// Pre-created stores
export const useOffers = createStore()
export const useOrders = createStore()
export const useVessels = createStore()
