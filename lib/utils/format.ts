import { format } from "date-fns"

export const formatters = {
  date: (date: Date | string) => {
    try {
      if (!date) return "N/A"
      const d = typeof date === "string" ? new Date(date) : date
      return isNaN(d.getTime()) ? "Invalid Date" : format(d, "MMM dd")
    } catch {
      return "Invalid Date"
    }
  },

  orderId: (id: string) => (id.startsWith("ord-") ? id.replace("ord-", "#") : `#${id.slice(-4)}`),

  orderType: (type?: string) => {
    const types = { VOYAGE: "V", TC: "TC", COA: "COA" }
    return types[type?.toUpperCase()] || type || "V"
  },

  number: (num?: number) => (num === undefined || isNaN(num) ? "N/A" : num.toLocaleString()),

  currency: (amount: number) => `$${amount.toLocaleString()}`,

  cargo: (quantity?: number, unit = "MT") => (quantity ? `${quantity.toLocaleString()} ${unit}` : "N/A"),

  vessel: (size?: number) => (size ? `${size}k DWT` : "N/A"),

  route: (load?: string, discharge?: string) => `${load || "Unknown"} → ${discharge || "Unknown"}`,
}
