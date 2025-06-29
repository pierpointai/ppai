"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type React from "react"

interface BottomActionBarProps {
  children: React.ReactNode
  className?: string
  show?: boolean
  position?: "fixed" | "sticky"
  showOnDesktop?: boolean
}

export function BottomActionBar({
  children,
  className,
  show = true,
  position = "fixed",
  showOnDesktop = false,
}: BottomActionBarProps) {
  const isMobile = useIsMobile()

  if (!isMobile && !showOnDesktop) {
    return null
  }

  return (
    <motion.div
      className={cn(
        position === "fixed" ? "fixed bottom-0 left-0 right-0 z-30" : "sticky bottom-0 z-30",
        "bg-background border-t border-border pb-safe",
        !show && "hidden",
        className,
      )}
      initial={{ y: 100 }}
      animate={{ y: show ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">{children}</div>
    </motion.div>
  )
}

interface BottomActionBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
}

export function BottomActionBarButton({
  children,
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  ...props
}: BottomActionBarButtonProps) {
  return (
    <Button variant={variant} size={size} className={cn(fullWidth && "flex-1 w-full", className)} {...props}>
      {children}
    </Button>
  )
}
