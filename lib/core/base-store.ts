export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface StoreActions<T extends BaseEntity> {
  items: T[]
  add: (item: Omit<T, "id" | "createdAt" | "updatedAt">) => void
  update: (id: string, updates: Partial<T>) => void
  remove: (id: string) => void
  getById: (id: string) => T | undefined
  reset: () => void
}

export const createBaseStore = <T extends BaseEntity>(name: string, initialItems: T[] = []) => ({
  items: initialItems,

  add: (item: Omit<T, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const id = `${name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    } as T
  },

  update: (items: T[], id: string, updates: Partial<T>) =>
    items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item)),

  remove: (items: T[], id: string) => items.filter((item) => item.id !== id),

  getById: (items: T[], id: string) => items.find((item) => item.id === id),
})
