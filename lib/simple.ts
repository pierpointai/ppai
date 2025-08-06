// One file for all utilities
export const format = {
  date: (d: any) => (d ? new Date(d).toLocaleDateString() : ""),
  currency: (n: any) => `$${Number(n || 0).toLocaleString()}`,
  number: (n: any) => Number(n || 0).toLocaleString(),
}

export const filter = function<T>(items: T[], term: string, fields: string[]): T[] {
  return term ? items.filter(item => 
    fields.some(field => String((item as any)[field] || '').toLowerCase().includes(term.toLowerCase()))
  ) : items
}

export const paginate = function<T>(items: T[], page: number, size: number) {
  return {
    items: items.slice((page - 1) * size, page * size),
    total: items.length,
    pages: Math.ceil(items.length / size),
  }
}

export const colors = {
  status: (s: string) => s === 'active' ? 'green' : s === 'pending' ? 'yellow' : 'gray',
  priority: (p: string) => p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'blue',
}
