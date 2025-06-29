"use client"

import { cn } from "@/lib/utils"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"
import type React from "react"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export function ResponsiveGrid({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  gap = {
    mobile: 4,
    tablet: 6,
    desktop: 8,
  },
}: ResponsiveGridProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const mobileCols = cols.mobile || 1
  const tabletCols = cols.tablet || 2
  const desktopCols = cols.desktop || 3

  const mobileGap = gap.mobile || 4
  const tabletGap = gap.tablet || 6
  const desktopGap = gap.desktop || 8

  const gridColsClass = isMobile
    ? `grid-cols-${mobileCols}`
    : isTablet
      ? `grid-cols-${tabletCols}`
      : `grid-cols-${desktopCols}`

  const gapClass = isMobile ? `gap-${mobileGap}` : isTablet ? `gap-${tabletGap}` : `gap-${desktopGap}`

  return (
    <div
      className={cn(
        "grid w-full",
        gridColsClass,
        gapClass,
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
