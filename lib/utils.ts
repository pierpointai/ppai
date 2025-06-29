import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate as formatDateStandard, formatDateRange } from "@/lib/date-formatting"
import { standardizeText } from "@/lib/terminology"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date for display using standardized formats
 * @param date The date to format
 * @param formatType The format type to use
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | undefined,
  formatType: "short" | "medium" | "long" = "medium",
): string {
  return formatDateStandard(date, formatType)
}

/**
 * Formats a date range (useful for laycans)
 */
export function formatLaycan(startDate: string | Date | undefined, endDate: string | Date | undefined): string {
  return formatDateRange(startDate, endDate, "laycan")
}

/**
 * Standardizes text to use consistent terminology
 */
export function standardizeTerminology(text: string): string {
  return standardizeText(text)
}
