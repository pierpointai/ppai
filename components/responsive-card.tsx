"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

interface ResponsiveCardProps {
  children?: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  fullWidthOnMobile?: boolean
  noPadding?: boolean
  mobilePadding?: "none" | "sm" | "md" | "lg"
  desktopPadding?: "none" | "sm" | "md" | "lg"
  mobileHeaderPadding?: "none" | "sm" | "md" | "lg"
  desktopHeaderPadding?: "none" | "sm" | "md" | "lg"
  mobileFooterPadding?: "none" | "sm" | "md" | "lg"
  desktopFooterPadding?: "none" | "sm" | "md" | "lg"
  mobileContentPadding?: "none" | "sm" | "md" | "lg"
  desktopContentPadding?: "none" | "sm" | "md" | "lg"
}

export function ResponsiveCard({
  children,
  className,
  mobileClassName,
  desktopClassName,
  title,
  description,
  footer,
  fullWidthOnMobile = true,
  noPadding = false,
  mobilePadding = "md",
  desktopPadding = "md",
  mobileHeaderPadding,
  desktopHeaderPadding,
  mobileFooterPadding,
  desktopFooterPadding,
  mobileContentPadding,
  desktopContentPadding,
}: ResponsiveCardProps) {
  const isMobile = useIsMobile()

  const getPaddingClass = (size: "none" | "sm" | "md" | "lg") => {
    switch (size) {
      case "none":
        return "p-0"
      case "sm":
        return "p-2"
      case "md":
        return "p-4"
      case "lg":
        return "p-6"
      default:
        return "p-4"
    }
  }

  const getHeaderPaddingClass = () => {
    if (mobileHeaderPadding && isMobile) {
      return getPaddingClass(mobileHeaderPadding)
    }
    if (desktopHeaderPadding && !isMobile) {
      return getPaddingClass(desktopHeaderPadding)
    }
    if (isMobile) {
      return getPaddingClass(mobilePadding)
    }
    return getPaddingClass(desktopPadding)
  }

  const getContentPaddingClass = () => {
    if (mobileContentPadding && isMobile) {
      return getPaddingClass(mobileContentPadding)
    }
    if (desktopContentPadding && !isMobile) {
      return getPaddingClass(desktopContentPadding)
    }
    if (isMobile) {
      return getPaddingClass(mobilePadding)
    }
    return getPaddingClass(desktopPadding)
  }

  const getFooterPaddingClass = () => {
    if (mobileFooterPadding && isMobile) {
      return getPaddingClass(mobileFooterPadding)
    }
    if (desktopFooterPadding && !isMobile) {
      return getPaddingClass(desktopFooterPadding)
    }
    if (isMobile) {
      return getPaddingClass(mobilePadding)
    }
    return getPaddingClass(desktopPadding)
  }

  return (
    <Card
      className={cn(
        fullWidthOnMobile && isMobile ? "w-full" : "",
        noPadding ? "p-0" : "",
        className,
        isMobile ? mobileClassName : desktopClassName,
      )}
    >
      {(title || description) && (
        <CardHeader className={getHeaderPaddingClass()}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : getContentPaddingClass())}>{children}</CardContent>
      {footer && <CardFooter className={getFooterPaddingClass()}>{footer}</CardFooter>}
    </Card>
  )
}
