import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for consistent class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Design tokens for consistent styling
export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: "bg-blue-50",
      100: "bg-blue-100",
      500: "bg-blue-500",
      600: "bg-blue-600",
      700: "bg-blue-700",
    },
    success: {
      50: "bg-green-50",
      100: "bg-green-100",
      500: "bg-green-500",
      600: "bg-green-600",
      700: "bg-green-700",
    },
    warning: {
      50: "bg-amber-50",
      100: "bg-amber-100",
      500: "bg-amber-500",
      600: "bg-amber-600",
      700: "bg-amber-700",
    },
    danger: {
      50: "bg-red-50",
      100: "bg-red-100",
      500: "bg-red-500",
      600: "bg-red-600",
      700: "bg-red-700",
    },
    neutral: {
      50: "bg-gray-50",
      100: "bg-gray-100",
      500: "bg-gray-500",
      600: "bg-gray-600",
      700: "bg-gray-700",
    },
  },

  // Spacing
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },

  // Border radius
  borderRadius: {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },

  // Shadows
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },

  // Typography
  typography: {
    heading: {
      h1: "text-3xl font-bold tracking-tight",
      h2: "text-2xl font-semibold tracking-tight",
      h3: "text-xl font-semibold",
      h4: "text-lg font-medium",
      h5: "text-base font-medium",
      h6: "text-sm font-medium",
    },
    body: {
      large: "text-lg",
      base: "text-base",
      small: "text-sm",
      xs: "text-xs",
    },
  },
}

// Button variants for consistent styling
export const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 hover:border-gray-400",
  success: "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700",
  warning: "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 hover:border-amber-700",
  danger: "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700",
  outline: "bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700 border-transparent",
}

// Button sizes for consistency
export const buttonSizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
}

// Badge variants for consistent status indicators
export const badgeVariants = {
  default: "bg-gray-100 text-gray-800 border-gray-300",
  primary: "bg-blue-100 text-blue-800 border-blue-300",
  success: "bg-green-100 text-green-800 border-green-300",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  danger: "bg-red-100 text-red-800 border-red-300",
  info: "bg-cyan-100 text-cyan-800 border-cyan-300",
}

// Status color mappings for consistency
export const statusColors = {
  // Vessel status
  available: badgeVariants.success,
  pending: badgeVariants.warning,
  fixed: badgeVariants.primary,
  failed: badgeVariants.danger,

  // Order status
  active: badgeVariants.primary,
  matched: badgeVariants.warning,
  completed: badgeVariants.success,
  cancelled: badgeVariants.danger,

  // Priority levels
  high: badgeVariants.danger,
  medium: badgeVariants.warning,
  low: badgeVariants.success,

  // Vessel linking status
  shortlisted: badgeVariants.primary,
  contacted: badgeVariants.warning,
  offered: "bg-orange-100 text-orange-800 border-orange-300",
  rejected: badgeVariants.danger,
  nominated: badgeVariants.success,
}

// Icon sizes for consistency
export const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
}

// Animation classes
export const animations = {
  fadeIn: "animate-in fade-in-0 duration-200",
  slideIn: "animate-in slide-in-from-bottom-2 duration-200",
  scaleIn: "animate-in zoom-in-95 duration-200",
  spin: "animate-spin",
}

// Layout constants
export const layout = {
  maxWidth: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  },
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
}
