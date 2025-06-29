"use client"

import { cn } from "@/lib/utils"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"
import type React from "react"

interface AdaptiveLayoutProps {
  children: React.ReactNode
  className?: string
  mobileLayout?: "stack" | "grid" | "flex"
  tabletLayout?: "stack" | "grid" | "flex"
  desktopLayout?: "stack" | "grid" | "flex"
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
}

export function AdaptiveLayout({
  children,
  className,
  mobileLayout = "stack",
  tabletLayout = "grid",
  desktopLayout = "grid",
  mobileClassName,
  tabletClassName,
  desktopClassName,
}: AdaptiveLayoutProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const layoutClass = isMobile
    ? mobileLayout === "stack"
      ? "flex flex-col"
      : mobileLayout === "grid"
        ? "grid grid-cols-1"
        : "flex flex-row flex-wrap"
    : isTablet
      ? tabletLayout === "stack"
        ? "flex flex-col"
        : tabletLayout === "grid"
          ? "grid grid-cols-2"
          : "flex flex-row"
      : desktopLayout === "stack"
        ? "flex flex-col"
        : desktopLayout === "grid"
          ? "grid grid-cols-3"
          : "flex flex-row"

  return (
    <div
      className={cn(
        layoutClass,
        "w-full",
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
