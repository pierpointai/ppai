export const calculate = {
  percentage: (value: number, total: number): number => (total === 0 ? 0 : Math.round((value / total) * 100)),

  average: (values: number[]): number => (values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length),

  sum: (values: number[]): number => values.reduce((a, b) => a + b, 0),

  range: (values: number[]): { min: number; max: number } => ({
    min: Math.min(...values),
    max: Math.max(...values),
  }),

  matchScore: (actual: number, target: number, tolerance = 0.1): number => {
    const diff = Math.abs(actual - target) / target
    return Math.max(0, Math.round((1 - diff / tolerance) * 100))
  },
}
