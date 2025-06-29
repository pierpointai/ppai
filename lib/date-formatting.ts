import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"

// Standardized date formats throughout the application
export const dateFormats = {
  // Display formats
  short: "MMM dd", // Jan 15
  medium: "MMM dd, yyyy", // Jan 15, 2024
  long: "MMMM dd, yyyy", // January 15, 2024
  full: "EEEE, MMMM dd, yyyy", // Monday, January 15, 2024

  // Time formats
  time: "HH:mm", // 14:30
  timeWithSeconds: "HH:mm:ss", // 14:30:45
  time12: "h:mm a", // 2:30 PM

  // Combined date and time
  datetime: "MMM dd, yyyy HH:mm", // Jan 15, 2024 14:30
  datetimeFull: "MMMM dd, yyyy 'at' h:mm a", // January 15, 2024 at 2:30 PM

  // ISO formats
  iso: "yyyy-MM-dd", // 2024-01-15
  isoDateTime: "yyyy-MM-dd'T'HH:mm:ss", // 2024-01-15T14:30:00

  // Laycan specific
  laycan: "dd MMM", // 15 Jan
  laycanWithYear: "dd MMM yyyy", // 15 Jan 2024
  laycanRange: "dd-dd MMM", // 15-20 Jan
}

// Safe date parsing function
export function parseDate(dateInput: string | Date | undefined | null): Date | null {
  if (!dateInput) return null

  try {
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : null
    }

    if (typeof dateInput === "string") {
      // Try parsing ISO string first
      const parsed = parseISO(dateInput)
      if (isValid(parsed)) return parsed

      // Try parsing as regular date
      const date = new Date(dateInput)
      return isValid(date) ? date : null
    }

    return null
  } catch (error) {
    console.warn("Date parsing error:", error)
    return null
  }
}

// Standardized date formatting functions
export function formatDate(
  dateInput: string | Date | undefined | null,
  formatType: keyof typeof dateFormats = "medium",
): string {
  const date = parseDate(dateInput)
  if (!date) return "N/A"

  try {
    return format(date, dateFormats[formatType])
  } catch (error) {
    console.warn("Date formatting error:", error)
    return "Invalid Date"
  }
}

// Format date range (for laycans)
export function formatDateRange(
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null,
  formatType: keyof typeof dateFormats = "laycan",
): string {
  const start = parseDate(startDate)
  const end = parseDate(endDate)

  if (!start && !end) return "N/A"
  if (!start) return `Until ${formatDate(endDate, formatType)}`
  if (!end) return `From ${formatDate(startDate, formatType)}`

  try {
    const startFormatted = format(start, dateFormats[formatType])
    const endFormatted = format(end, dateFormats[formatType])

    // If same month and year, show as range
    if (format(start, "MMM yyyy") === format(end, "MMM yyyy")) {
      const startDay = format(start, "dd")
      const endDay = format(end, "dd")
      const monthYear = format(start, "MMM yyyy")
      return `${startDay}-${endDay} ${monthYear}`
    }

    return `${startFormatted} - ${endFormatted}`
  } catch (error) {
    console.warn("Date range formatting error:", error)
    return "Invalid Date Range"
  }
}

// Format relative time (time ago)
export function formatTimeAgo(dateInput: string | Date | undefined | null): string {
  const date = parseDate(dateInput)
  if (!date) return "N/A"

  try {
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.warn("Time ago formatting error:", error)
    return "Unknown"
  }
}

// Format laycan specifically for maritime use
export function formatLaycan(
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null,
): string {
  return formatDateRange(startDate, endDate, "laycan")
}

// Get current date in various formats
export function getCurrentDate(formatType: keyof typeof dateFormats = "medium"): string {
  return formatDate(new Date(), formatType)
}

// Validate if a date string is valid
export function isValidDate(dateInput: string | Date | undefined | null): boolean {
  return parseDate(dateInput) !== null
}

// Get date for display in tables (consistent format)
export function getTableDate(dateInput: string | Date | undefined | null): string {
  return formatDate(dateInput, "short")
}

// Get date for forms (ISO format)
export function getFormDate(dateInput: string | Date | undefined | null): string {
  const date = parseDate(dateInput)
  if (!date) return ""

  try {
    return format(date, dateFormats.iso)
  } catch (error) {
    return ""
  }
}
