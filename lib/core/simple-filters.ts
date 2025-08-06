export interface FilterValue {
  value: any;
  label: string;
}

export interface FilterConfig<T> {
  [key: string]: {
    type: 'select' | 'range' | 'search';
    options?: FilterValue[];
    field: keyof T;
  };
}

export const applyFilters = function<T>(
  items: T[],
  filters: Record<string, FilterValue>,
  config: FilterConfig<T>
): T[] {
  return items.filter(item => 
    Object.entries(filters).every(([key, filterValue]) => {
      const filterConfig = config[key];
      if (!filterConfig || !filterValue.value) return true;
      
      const itemValue = item[filterConfig.field];
      
      switch (filterConfig.type) {
        case 'select':
          return itemValue === filterValue.value;
        case 'search':
          return String(itemValue || '').toLowerCase().includes(String(filterValue.value).toLowerCase());
        case 'range':
          const [min, max] = filterValue.value;
          const numValue = Number(itemValue);
          return numValue >= min && numValue <= max;
        default:
          return true;
      }
    })
  );
}

export const createFilterOptions = function<T>(items: T[], field: keyof T): FilterValue[] {
  const uniqueValues = Array.from(new Set(items.map(item => item[field])));
  return uniqueValues.map(value => ({
    value,
    label: String(value)
  }));
}
