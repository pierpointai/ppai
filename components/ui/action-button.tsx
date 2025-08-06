"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { SimpleTooltip } from "./simple-tooltip"

interface ActionButtonProps {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "icon"
}

export function ActionButton({ icon, tooltip, onClick, variant = "ghost", size = "sm" }: ActionButtonProps) {
  return (
    <SimpleTooltip content={tooltip}>
      <Button variant={variant} size={size} className="h-8 w-8 p-0" onClick={onClick}>
        {icon}
        <span className="sr-only">{tooltip}</span>
      </Button>
    </SimpleTooltip>
  )
}
