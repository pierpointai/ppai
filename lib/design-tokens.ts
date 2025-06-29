// Design tokens for the AI Offer Screener platform
// This file centralizes all design values for consistent application

export const designTokens = {
  // Spacing scale (in pixels)
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "2.5rem", // 40px
    "3xl": "3rem", // 48px
  },

  // Border radius
  radius: {
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px", // For circular elements
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  // Typography
  typography: {
    fontSizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacings: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
      wider: "0.05em",
    },
    // Add helper functions for consistent text styling
    textStyles: {
      h1: "text-4xl font-bold tracking-tight",
      h2: "text-3xl font-semibold tracking-tight",
      h3: "text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
      body: "text-base",
      bodySmall: "text-sm",
      caption: "text-xs",
      button: "text-sm font-medium",
      overline: "text-xs uppercase tracking-wider font-medium",
    },
  },

  // Transitions
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },

  // Status colors (to be used consistently across the app)
  statusColors: {
    success: {
      light: "rgba(16, 185, 129, 0.1)",
      default: "rgb(16, 185, 129)",
      dark: "rgb(4, 120, 87)",
      text: "rgb(6, 95, 70)",
    },
    warning: {
      light: "rgba(245, 158, 11, 0.1)",
      default: "rgb(245, 158, 11)",
      dark: "rgb(180, 83, 9)",
      text: "rgb(146, 64, 14)",
    },
    error: {
      light: "rgba(239, 68, 68, 0.1)",
      default: "rgb(239, 68, 68)",
      dark: "rgb(185, 28, 28)",
      text: "rgb(153, 27, 27)",
    },
    info: {
      light: "rgba(59, 130, 246, 0.1)",
      default: "rgb(59, 130, 246)",
      dark: "rgb(37, 99, 235)",
      text: "rgb(30, 64, 175)",
    },
    neutral: {
      light: "rgba(107, 114, 128, 0.1)",
      default: "rgb(107, 114, 128)",
      dark: "rgb(75, 85, 99)",
      text: "rgb(55, 65, 81)",
    },
    available: "text-emerald-500 dark:text-emerald-400",
    pending: "text-amber-500 dark:text-amber-400",
    fixed: "text-blue-500 dark:text-blue-400",
    failed: "text-red-500 dark:text-red-400",
  },

  // Vessel category colors (for consistent use across the app)
  vesselCategoryColors: {
    Handysize: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Handymax/Supramax": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Panamax: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Kamsarmax: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    "Post-Panamax": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Capesize: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    VLOC: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },

  // Contract type colors
  contractTypeColors: {
    voyage: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    time: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    coa: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    bareboat: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  },

  // Match score colors
  matchScoreColors: {
    high: "bg-emerald-500 dark:bg-emerald-600",
    medium: "bg-amber-500 dark:bg-amber-600",
    low: "bg-blue-500 dark:bg-blue-600",
  },

  // Laycan urgency colors
  laycanUrgencyColors: {
    urgent: "text-red-600 dark:text-red-400",
    soon: "text-amber-600 dark:text-amber-400",
    future: "text-green-600 dark:text-green-400",
    past: "text-gray-500 dark:text-gray-400",
  },

  // Button styles
  buttonStyles: {
    // Primary button (blue)
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    // Secondary button (gray)
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200",
    // Outline button
    outline: "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
    // Ghost button
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    // Destructive button
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    // Icon button sizing
    icon: {
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-10 w-10",
    },
    // Text button sizing
    text: {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-5 text-base",
    },
  },
}

// Helper functions to use the design tokens
export const getSpacing = (size: keyof typeof designTokens.spacing) => designTokens.spacing[size]
export const getRadius = (size: keyof typeof designTokens.radius) => designTokens.radius[size]
export const getShadow = (size: keyof typeof designTokens.shadows) => designTokens.shadows[size]
export const getFontSize = (size: keyof typeof designTokens.typography.fontSizes) =>
  designTokens.typography.fontSizes[size]
export const getFontWeight = (weight: keyof typeof designTokens.typography.fontWeights) =>
  designTokens.typography.fontWeights[weight]
export const getLineHeight = (height: keyof typeof designTokens.typography.lineHeights) =>
  designTokens.typography.lineHeights[height]
export const getTransition = (speed: keyof typeof designTokens.transitions) => designTokens.transitions[speed]
export const getZIndex = (level: keyof typeof designTokens.zIndex) => designTokens.zIndex[level]
export const getStatusColor = (
  status: keyof typeof designTokens.statusColors,
  variant: "light" | "default" | "dark" | "text" = "default",
) => designTokens.statusColors[status][variant]
export const getVesselCategoryColor = (category: keyof typeof designTokens.vesselCategoryColors) =>
  designTokens.vesselCategoryColors[category]
export const getContractTypeColor = (type: keyof typeof designTokens.contractTypeColors) =>
  designTokens.contractTypeColors[type]
export const getMatchScoreColor = (level: keyof typeof designTokens.matchScoreColors) =>
  designTokens.matchScoreColors[level]
