// Simple immer middleware for zustand without external dependencies
export const immer =
  <T extends {}>(config: (set: (fn: (state: T) => void) => void, get: () => T, api: any) => T) =>
  (set: any, get: any, api: any) =>
    config(
      (fn) =>
        set((state: T) => {
          const draft = JSON.parse(JSON.stringify(state))
          fn(draft)
          return draft
        }),
      get,
      api,
    )
