"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type React from "react"

interface ResponsiveListProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  dividers?: boolean
  spacing?: "tight" | "normal" | "loose"
  orientation?: "vertical" | "horizontal"
}

export function ResponsiveList({
  children,
  className,
  mobileClassName,
  desktopClassName,
  dividers = true,
  spacing = "normal",
  orientation = "vertical",
}: ResponsiveListProps) {
  const isMobile = useIsMobile()

  const spacingClass = {
    tight: "space-y-2",
    normal: "space-y-4",
    loose: "space-y-6",
  }[spacing]

  const horizontalSpacingClass = {
    tight: "space-x-2",
    normal: "space-x-4",
    loose: "space-x-6",
  }[spacing]

  return (
    <ul
      className={cn(
        "w-full",
        orientation === "vertical" ? spacingClass : "flex items-center",
        orientation === "horizontal" && horizontalSpacingClass,
        dividers && orientation === "vertical" && "divide-y divide-border",
        dividers && orientation === "horizontal" && "divide-x divide-border",
        className,
        isMobile ? mobileClassName : desktopClassName,
      )}
    >
      {children}
    </ul>
  )
}

export interface ResponsiveListItemProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  padding?: "none" | "tight" | "normal" | "loose"
  onClick?: () => void
}

export function ResponsiveListItem({
  children,
  className,
  mobileClassName,
  desktopClassName,
  padding = "normal",
  onClick,
}: ResponsiveListItemProps) {
  const isMobile = useIsMobile()

  const paddingClass = {
    none: "py-0",
    tight: "py-2",
    normal: "py-3",
    loose: "py-4",
  }[padding]

  return (
    <li
      className={cn(
        paddingClass,
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className,
        isMobile ? mobileClassName : desktopClassName,
      )}
      onClick={onClick}
    >
      {children}
    </li>
  )
}
