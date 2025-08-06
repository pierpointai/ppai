"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"

export function useStatusBadge(status?: string) {
  return useMemo(() => {
    switch (status) {
      case "ballast":
        return (
          <Badge variant="outline" className="text-xs font-medium text-orange-700 border-orange-300 bg-orange-50">
            Ballast
          </Badge>
        )
      case "laden":
        return (
          <Badge variant="outline" className="text-xs font-medium text-green-700 border-green-300 bg-green-50">
            Laden
          </Badge>
        )
      case "available":
        return (
          <Badge variant="outline" className="text-xs font-medium text-blue-700 border-blue-300 bg-blue-50">
            Available
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs font-medium">
            Unknown
          </Badge>
        )
    }
  }, [status])
}

export function useOrderTypeColor(orderType: string): string {
  return useMemo(() => {
    const colors = {
      TC: "bg-purple-100 text-purple-900 border-purple-300",
      VOYAGE: "bg-blue-100 text-blue-900 border-blue-300",
      COA: "bg-emerald-100 text-emerald-900 border-emerald-300",
    }
    return colors[orderType?.toUpperCase()] || "bg-gray-100 text-gray-900 border-gray-300"
  }, [orderType])
}

export function usePriorityColor(priority: string): string {
  return useMemo(() => {
    const colors = {
      High: "bg-red-500",
      Medium: "bg-amber-500",
      Low: "bg-green-500",
    }
    return colors[priority] || "bg-gray-500"
  }, [priority])
}

export function useVesselStatusColor(status: string): string {
  return useMemo(() => {
    const colors = {
      Shortlisted: "bg-blue-100 text-blue-800 border-blue-300",
      Contacted: "bg-amber-100 text-amber-800 border-amber-300",
      Offered: "bg-purple-100 text-purple-800 border-purple-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
      Nominated: "bg-green-100 text-green-800 border-green-300",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
  }, [status])
}
