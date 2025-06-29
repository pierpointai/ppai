"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type React from "react"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  withHeader?: boolean
  withFooter?: boolean
  withSidebar?: boolean
  fullHeight?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "screen"
  padding?: "none" | "sm" | "md" | "lg"
  mobilePadding?: "none" | "sm" | "md" | "lg"
  desktopPadding?: "none" | "sm" | "md" | "lg"
  contentClassName?: string
}

export function PageContainer({
  children,
  className,
  mobileClassName,
  desktopClassName,
  withHeader = true,
  withFooter = false,
  withSidebar = false,
  fullHeight = false,
  maxWidth = "xl",
  padding = "md",
  mobilePadding,
  desktopPadding,
  contentClassName,
}: PageContainerProps) {
  const isMobile = useIsMobile()

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
    screen: "max-w-screen",
  }[maxWidth]

  const getPaddingClass = (size: "none" | "sm" | "md" | "lg") => {
    switch (size) {
      case "none":
        return "px-0"
      case "sm":
        return "px-2 md:px-4"
      case "md":
        return "px-4 md:px-6"
      case "lg":
        return "px-6 md:px-8"
      default:
        return "px-4 md:px-6"
    }
  }

  const effectivePadding = isMobile ? mobilePadding || padding : desktopPadding || padding

  return (
    <div
      className={cn(
        "w-full mx-auto",
        maxWidthClass,
        getPaddingClass(effectivePadding),
        withHeader && "pt-16", // Account for fixed header
        withFooter && "pb-16", // Account for fixed footer
        withSidebar && !isMobile && "ml-64", // Account for sidebar on desktop
        fullHeight && "min-h-screen",
        className,
        isMobile ? mobileClassName : desktopClassName,
      )}
    >
      <div className={cn("w-full", contentClassName)}>{children}</div>
    </div>
  )
}
