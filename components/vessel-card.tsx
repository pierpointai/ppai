import type React from "react"
import { MapPin } from "lucide-react"
import { createDisplayVessel, normalizeVesselData } from "@/lib/data-normalization"
import { designTokens } from "@/lib/design-system"

interface VesselCardProps {
  offer: any // Replace 'any' with a more specific type if possible
}

const VesselCard: React.FC<VesselCardProps> = ({ offer }) => {
  // Normalize the vessel data to ensure consistent property access
  const normalized = normalizeVesselData(offer)
  const display = createDisplayVessel(offer)

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full">
      <div className={`flex flex-col space-y-${designTokens.spacing.sm} p-${designTokens.spacing.md}`}>
        <div className="space-y-1">
          <h3 className={`font-semibold text-lg`}>{display.vesselName}</h3>
          <p className="text-sm text-muted-foreground">{display.vesselType}</p>
          {/* Add prominent port display with normalized data */}
          <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
            <MapPin className="h-4 w-4" />
            <span>{display.openPort}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{display.vesselSize}</span>
            <span>{display.vesselAge}</span>
            <span>{display.vesselFlag}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VesselCard
export { VesselCard }
