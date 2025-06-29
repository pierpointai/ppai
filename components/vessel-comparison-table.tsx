"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Star, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Offer } from "@/lib/types"

interface ChartererRequest {
  vesselType?: string
  dwtMin?: number
  dwtMax?: number
  laycanStart?: Date
  laycanEnd?: Date
  loadPort?: string
  dischargePort?: string
  maxAge?: number
  cargoType?: string
  targetRate?: number
  gearRequirement?: string
}

interface VesselComparisonTableProps {
  vessels: Offer[]
  request: ChartererRequest
  bestVessel: Offer | null
  allVessels?: Offer[]
  selectedVesselIds?: string[]
  onVesselSelection?: (vesselId: string, selected: boolean) => void
  onSelectAll?: () => void
  onClearSelection?: () => void
}

export function VesselComparisonTable({
  vessels,
  request,
  bestVessel,
  allVessels,
  selectedVesselIds,
  onVesselSelection,
  onSelectAll,
  onClearSelection,
}: VesselComparisonTableProps) {
  const getMatchStatus = (vessel: Offer, field: string): "match" | "mismatch" | "neutral" => {
    switch (field) {
      case "vesselType":
        if (!request.vesselType) return "neutral"
        return vessel.vesselType?.toLowerCase().includes(request.vesselType.toLowerCase()) ? "match" : "mismatch"

      case "dwt":
        if (!request.dwtMin && !request.dwtMax) return "neutral"
        const vesselDWT = vessel.vesselSize * 1000
        if (request.dwtMin && request.dwtMax) {
          return vesselDWT >= request.dwtMin && vesselDWT <= request.dwtMax ? "match" : "mismatch"
        } else if (request.dwtMin) {
          return vesselDWT >= request.dwtMin ? "match" : "mismatch"
        } else if (request.dwtMax) {
          return vesselDWT <= request.dwtMax ? "match" : "mismatch"
        }
        return "neutral"

      case "laycan":
        if (!request.laycanStart || !request.laycanEnd) return "neutral"
        const vesselStart = new Date(vessel.laycanStart)
        const vesselEnd = new Date(vessel.laycanEnd)
        return !(vesselEnd < request.laycanStart || vesselStart > request.laycanEnd) ? "match" : "mismatch"

      case "loadPort":
        if (!request.loadPort) return "neutral"
        return vessel.openPort?.toLowerCase().includes(request.loadPort.toLowerCase()) ? "match" : "mismatch"

      case "dischargePort":
        if (!request.dischargePort) return "neutral"
        return vessel.nextPort?.toLowerCase().includes(request.dischargePort.toLowerCase()) ? "match" : "mismatch"

      case "age":
        if (!request.maxAge) return "neutral"
        return vessel.vesselAge && vessel.vesselAge <= request.maxAge ? "match" : "mismatch"

      case "rate":
        if (!request.targetRate) return "neutral"
        if (!vessel.freightRate) return "neutral"
        return Math.abs(vessel.freightRate - request.targetRate) <= request.targetRate * 0.1 ? "match" : "mismatch"

      default:
        return "neutral"
    }
  }

  const getCellClassName = (status: "match" | "mismatch" | "neutral") => {
    switch (status) {
      case "match":
        return "bg-green-50 text-green-800 border-green-200"
      case "mismatch":
        return "bg-red-50 text-red-800 border-red-200"
      default:
        return "bg-white text-gray-900 border-gray-200"
    }
  }

  const handleCopyVessel = (vessel: Offer) => {
    const vesselInfo = `${vessel.vesselName} - ${vessel.vesselType} ${vessel.vesselSize}k DWT
Built: ${new Date().getFullYear() - (vessel.vesselAge || 0)}
Flag: ${vessel.vesselFlag}
Open: ${vessel.openPort} (${vessel.openDates})
Rate: $${vessel.freightRate}/day
Contact: ${vessel.brokerName} (${vessel.company})
Phone: ${vessel.phoneNumber}
Email: ${vessel.email}`

    navigator.clipboard.writeText(vesselInfo)
  }

  if (vessels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">No vessels available for comparison</CardContent>
      </Card>
    )
  }

  const dataFields = [
    { key: "vesselName", label: "Vessel Name", matchField: null },
    { key: "vesselType", label: "Type", matchField: "vesselType" },
    { key: "dwt", label: "DWT (tons)", matchField: "dwt" },
    { key: "buildYear", label: "Built Year", matchField: "age" },
    { key: "vesselFlag", label: "Flag", matchField: null },
    { key: "openPort", label: "Open Port", matchField: "loadPort" },
    { key: "openDates", label: "Open Dates", matchField: "laycan" },
    { key: "nextPort", label: "Next Port", matchField: "dischargePort" },
    { key: "lastCargo", label: "Last Cargo", matchField: null },
    { key: "status", label: "Ballast/Laden", matchField: null },
    { key: "freightRate", label: "Freight Rate ($/day)", matchField: "rate" },
    { key: "commission", label: "Commission (%)", matchField: null },
    { key: "imo", label: "IMO Number", matchField: null },
    { key: "brokerName", label: "Broker Name", matchField: null },
    { key: "company", label: "Company", matchField: null },
    { key: "phoneNumber", label: "Phone Number", matchField: null },
    { key: "email", label: "Email", matchField: null },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vessel Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 border border-gray-200 bg-gray-50 font-medium min-w-[150px]">Details</th>
                {vessels.slice(0, 5).map((vessel) => (
                  <th key={vessel.id} className="text-center p-3 border border-gray-200 bg-gray-50 min-w-[200px]">
                    <div className="space-y-2">
                      <div className="font-medium">{vessel.vesselName || "Unknown"}</div>
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant={vessel.id === bestVessel?.id ? "default" : "secondary"}
                          className={vessel.id === bestVessel?.id ? "bg-blue-600" : ""}
                        >
                          Score: {vessel.matchScore || 0}/10
                        </Badge>
                        {vessel.id === bestVessel?.id && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <div className="flex justify-center gap-1">
                        {vessel.phoneNumber && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(`tel:${vessel.phoneNumber}`, "_self")}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {vessel.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(`mailto:${vessel.email}`, "_self")}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopyVessel(vessel)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataFields.map((field) => (
                <tr key={field.key}>
                  <td className="p-3 border border-gray-200 bg-gray-50 font-medium">{field.label}</td>
                  {vessels.slice(0, 5).map((vessel) => {
                    const matchStatus = field.matchField ? getMatchStatus(vessel, field.matchField) : "neutral"
                    let cellValue = ""

                    switch (field.key) {
                      case "vesselName":
                        cellValue = vessel.vesselName || "N/A"
                        break
                      case "vesselType":
                        cellValue = vessel.vesselType || "N/A"
                        break
                      case "dwt":
                        cellValue = vessel.vesselSize ? `${(vessel.vesselSize * 1000).toLocaleString()}` : "N/A"
                        break
                      case "buildYear":
                        cellValue = vessel.vesselAge ? `${new Date().getFullYear() - vessel.vesselAge}` : "N/A"
                        break
                      case "vesselFlag":
                        cellValue = vessel.vesselFlag || "N/A"
                        break
                      case "openPort":
                        cellValue = vessel.openPort || "N/A"
                        break
                      case "openDates":
                        cellValue = vessel.openDates || "N/A"
                        break
                      case "nextPort":
                        cellValue = vessel.nextPort || "N/A"
                        break
                      case "lastCargo":
                        cellValue = vessel.lastCargo || "N/A"
                        break
                      case "status":
                        cellValue = vessel.ballast ? "Ballast" : vessel.laden ? "Laden" : "N/A"
                        break
                      case "freightRate":
                        cellValue = vessel.freightRate ? `$${vessel.freightRate.toLocaleString()}` : "N/A"
                        break
                      case "commission":
                        cellValue = vessel.commission ? `${vessel.commission}%` : "N/A"
                        break
                      case "imo":
                        cellValue = vessel.imo || "N/A"
                        break
                      case "brokerName":
                        cellValue = vessel.brokerName || "N/A"
                        break
                      case "company":
                        cellValue = vessel.company || "N/A"
                        break
                      case "phoneNumber":
                        cellValue = vessel.phoneNumber || "N/A"
                        break
                      case "email":
                        cellValue = vessel.email || "N/A"
                        break
                      default:
                        cellValue = "N/A"
                    }

                    return (
                      <td
                        key={vessel.id}
                        className={cn("p-3 border text-center text-sm", getCellClassName(matchStatus))}
                      >
                        {cellValue}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vessels.length > 5 && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            Showing first 5 vessels. Total: {vessels.length} vessels available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
