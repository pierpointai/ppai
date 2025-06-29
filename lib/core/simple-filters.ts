export type FilterValue = string | number | boolean | null | undefined

export interface FilterConfig<T> {
  [key: string]: (item: T, value: FilterValue) => boolean
}

export function createFilter<T>(items: T[], filters: Record<string, FilterValue>, config: FilterConfig<T>): T[] {
  return items.filter((item) =>
    Object.entries(filters).every((entry) => {
      const key = entry[0]
      const value = entry[1]
      if (!value || value === "all" || value === "") return true
      const filterFn = config[key]
      return filterFn ? filterFn(item, value) : true
    }),
  )
}

export function createSearch<T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[] {
  if (!searchTerm.trim()) return items

  const term = searchTerm.toLowerCase()
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(term)
    }),
  )
}
