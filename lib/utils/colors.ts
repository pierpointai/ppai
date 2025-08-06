import { VESSEL_STATUS_COLORS, ORDER_TYPE_COLORS, PRIORITY_COLORS, STATUS_COLORS } from "@/lib/constants"

export const getColor = {
  vesselStatus: (status?: string) => VESSEL_STATUS_COLORS[status] || VESSEL_STATUS_COLORS.default,
  orderType: (type?: string) => ORDER_TYPE_COLORS[type?.toUpperCase()] || ORDER_TYPE_COLORS.default,
  priority: (priority?: string) => PRIORITY_COLORS[priority] || PRIORITY_COLORS.default,
  status: (status?: string) => STATUS_COLORS[status] || STATUS_COLORS.default,
}

export const getStatusColor = (status?: string): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.default
}
