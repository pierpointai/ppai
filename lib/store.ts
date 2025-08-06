import { create } from "zustand"

type Item = { id: string; [key: string]: any }

const createSimpleStore = <T extends Item>() =>
  create<{
    items: T[]
    loading: boolean
    add: (item: T) => void
    update: (id: string, data: Partial<T>) => void
    remove: (id: string) => void
    set: (items: T[]) => void
  }>((set) => ({
    items: [],
    loading: false,
    add: (item) => set((s) => ({ items: [...s.items, item] })),
    update: (id, data) =>
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
      })),
    remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    set: (items) => set({ items }),
  }))

export const useOffers = createSimpleStore()
export const useOrders = createSimpleStore()
export const useVessels = createSimpleStore()
