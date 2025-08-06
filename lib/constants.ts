export const VESSEL_STATUS_COLORS = {
  ballast: "text-xs font-medium text-orange-700 border-orange-300 bg-orange-50",
  laden: "text-xs font-medium text-green-700 border-green-300 bg-green-50",
  available: "text-xs font-medium text-blue-700 border-blue-300 bg-blue-50",
  default: "text-xs font-medium",
} as const

export const ORDER_TYPE_COLORS = {
  TC: "bg-purple-100 text-purple-900 border-purple-300",
  VOYAGE: "bg-blue-100 text-blue-900 border-blue-300",
  COA: "bg-emerald-100 text-emerald-900 border-emerald-300",
  default: "bg-gray-100 text-gray-900 border-gray-300",
} as const

export const PRIORITY_COLORS = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-green-500",
  default: "bg-gray-500",
} as const

export const STATUS_COLORS = {
  Shortlisted: "bg-blue-100 text-blue-800 border-blue-300",
  Contacted: "bg-amber-100 text-amber-800 border-amber-300",
  Offered: "bg-purple-100 text-purple-800 border-purple-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
  Nominated: "bg-green-100 text-green-800 border-green-300",
  default: "bg-gray-100 text-gray-800 border-gray-300",
} as const

export const PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 25
