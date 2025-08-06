export const format = {
  date: (date: any) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  },
  currency: (amount: any) => {
    const num = Number(amount || 0);
    return `$${num.toLocaleString()}`;
  },
  number: (value: any) => {
    return Number(value || 0).toLocaleString();
  },
  percentage: (value: any) => {
    return `${Number(value || 0).toFixed(1)}%`;
  }
};

export const paginate = function<T>(data: T[], page: number, size: number) {
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  
  return {
    items: data.slice(startIndex, endIndex),
    total: data.length,
    pages: Math.ceil(data.length / size),
    currentPage: page,
    hasNext: endIndex < data.length,
    hasPrev: page > 1
  };
}

export const sort = function<T>(data: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

export const filter = function<T>(data: T[], searchTerm: string, fields: (keyof T)[]): T[] {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    fields.some(field => {
      const value = item[field];
      return String(value || '').toLowerCase().includes(term);
    })
  );
}

export const search = function<T>(data: T[], query: string, searchFields: (keyof T)[]): T[] {
  return filter(data, query, searchFields);
}

export const colors = {
  status: (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'inactive': return 'gray';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  },
  priority: (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  },
  type: (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vessel': return 'blue';
      case 'order': return 'green';
      case 'offer': return 'purple';
      default: return 'gray';
    }
  }
};
