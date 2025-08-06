import type React from "react"
import { Badge } from "@/components/ui/badge"
import { getColor } from "@/lib/utils/colors"

interface SimpleBadgeProps {
  type: "vesselStatus" | "orderType" | "priority" | "status"
  value?: string
  children?: React.ReactNode
}

export function SimpleBadge({ type, value, children }: SimpleBadgeProps) {
  const colorClass = getColor[type](value)

  return (
    <Badge variant="outline" className={colorClass}>
      {children || value || "Unknown"}
    </Badge>
  )
}
