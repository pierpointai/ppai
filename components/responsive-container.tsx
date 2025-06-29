"use client"

import { cn } from "@/lib/utils"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"
import type React from "react"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  fullWidthOnMobile?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  fullWidthOnMobile = true,
  maxWidth = "xl",
  padding = "md",
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  }[maxWidth]

  const paddingClass = {
    none: "px-0",
    sm: "px-2 md:px-4",
    md: "px-4 md:px-6",
    lg: "px-6 md:px-8",
  }[padding]

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClass,
        paddingClass,
        fullWidthOnMobile && isMobile ? "w-full" : "",
        className,
        isMobile ? mobileClassName : "",
        isTablet ? tabletClassName : "",
        !isMobile && !isTablet ? desktopClassName : "",
      )}
    >
      {children}
    </div>
  )
}
