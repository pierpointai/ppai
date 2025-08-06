import { format } from "date-fns"

/**
 * Utility functions for consistent formatting across the application
 */

export function formatDate(date: Date | string): string {
  try {
    if (!date) return "N/A"
    const dateObj = typeof date === "string" ? new Date(date) : date
    return isNaN(dateObj.getTime()) ? "Invalid Date" : format(dateObj, "MMM dd")
  } catch {
    return "Invalid Date"
  }
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const startFormatted = formatDate(start)
  const endFormatted = formatDate(end)
  return `${startFormatted} - ${endFormatted}`
}

export function formatOrderId(id: string): string {
  return id.startsWith("ord-") ? id.replace("ord-", "#") : `#${id.slice(-4)}`
}

export function formatOrderType(type: string | undefined): string {
  if (!type) return "V"
  switch (type.toUpperCase()) {
    case "VOYAGE":
      return "V"
    case "TC":
      return "TC"
    case "COA":
      return "COA"
    default:
      return type
  }
}

export function formatNumber(num: number | undefined): string {
  return num === undefined || isNaN(num) ? "N/A" : num.toLocaleString()
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCargoQuantity(quantity: number | undefined, unit = "MT"): string {
  if (!quantity) return "N/A"
  return `${quantity.toLocaleString()} ${unit}`
}

export function formatVesselSize(size: number | undefined): string {
  if (!size) return "N/A"
  return `${size}k DWT`
}

export function formatRoute(loadPort?: string, dischargePort?: string): string {
  const load = loadPort || "Unknown"
  const discharge = dischargePort || "Unknown"
  return `${load} → ${discharge}`
}
