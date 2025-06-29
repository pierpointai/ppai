"use client"
import type { Offer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Ship, MapPin, Calendar, DollarSign, Repeat, ChevronDown, Search, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { VesselTable } from "@/components/vessel-table"

interface ClientRequestCardProps {
  request: any
  matchedOffers: Offer[]
  isExpanded: boolean
  onToggleExpand: (requestId: string) => void
  onSelectOffer: (offer: Offer) => void
  onToggleCompareOffer: (offer: Offer) => void
  compareOffers: Offer[]
  onCompareMatches: () => void
}

export function ClientRequestCard({
  request,
  matchedOffers,
  isExpanded,
  onToggleExpand,
  onSelectOffer,
  onToggleCompareOffer,
  compareOffers,
  onCompareMatches,
}: ClientRequestCardProps) {
  const urgencyColor =
    request.urgency === "high" ? "text-red-500" : request.urgency === "medium" ? "text-amber-500" : "text-blue-500"

  // Calculate days since request was received
  const daysSinceReceived = request.receivedDate
    ? Math.floor((new Date().getTime() - new Date(request.receivedDate).getTime()) / (1000 * 3600 * 24))
    : 0

  const [isExpandedEmail, setIsExpandedEmail] = useState(false)

  return (
    <div className="border rounded-lg hover:shadow-sm transition-shadow overflow-hidden">
      {/* Collapsible header - always visible */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/30"
        onClick={() => onToggleExpand(request.id)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-12 rounded-full ${urgencyColor}`}></div>
          <div className="flex flex-col">
            <h3 className="font-medium text-base flex items-center gap-2">
              {request.clientName}
              <span className="text-sm text-muted-foreground">• {request.clientCompany}</span>
              {request.urgency === "high" && (
                <Badge variant="destructive" className="ml-2">
                  Urgent
                </Badge>
              )}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <Ship className="h-3.5 w-3.5" />
                {request.extractedData?.vesselType || "Any vessel"}
                {request.extractedData?.vesselSize && ` (${request.extractedData.vesselSize}k DWT)`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {request.extractedData?.loadPort || "?"} → {request.extractedData?.dischargePort || "?"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {request.extractedData?.laycanFrom
                  ? new Date(request.extractedData.laycanFrom).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Flexible"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <Badge
              className={
                request.status === "new"
                  ? "bg-blue-500"
                  : request.status === "processing"
                    ? "bg-yellow-500"
                    : request.status === "matched"
                      ? "bg-green-500"
                      : "bg-gray-500"
              }
            >
              {request.status}
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">
              {daysSinceReceived === 0
                ? "Today"
                : daysSinceReceived === 1
                  ? "Yesterday"
                  : `${daysSinceReceived} days ago`}{" "}
              • {matchedOffers.length} matches
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isExpanded ? "transform rotate-180" : "",
            )}
          />
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t">
          {/* Request details */}
          <div className="bg-muted/30 rounded-md p-3 mb-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Vessel:</span> {request.extractedData?.vesselType || "Any vessel"}
                  {request.extractedData?.vesselSize && <span> ({request.extractedData.vesselSize}k DWT)</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Route:</span> {request.extractedData?.loadPort || "?"} →{" "}
                  {request.extractedData?.dischargePort || "?"}
                </div>
              </div>
              {request.extractedData?.laycanFrom && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Laycan:</span>{" "}
                    {new Date(request.extractedData.laycanFrom).toLocaleDateString()} -{" "}
                    {new Date(request.extractedData.laycanTo).toLocaleDateString()}
                  </div>
                </div>
              )}
              {request.extractedData?.rateMin && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Rate:</span> ${request.extractedData.rateMin}k - $
                    {request.extractedData.rateMax}k
                  </div>
                </div>
              )}
              {request.extractedData?.cargoType && (
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Cargo:</span> {request.extractedData.cargoType}
                    {request.extractedData.cargoQuantity &&
                      ` (${request.extractedData.cargoQuantity.toLocaleString()} MT)`}
                  </div>
                </div>
              )}
              {request.receivedDate && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Received:</span> {new Date(request.receivedDate).toLocaleDateString()}{" "}
                    {new Date(request.receivedDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Email subject and excerpt */}
            {(request.emailSubject || request.emailExcerpt) && (
              <div className="mt-3 pt-3 border-t border-border/30">
                {request.emailSubject && <p className="text-sm font-medium mb-1">Subject: {request.emailSubject}</p>}

                {/* Email content with View More/Less button */}
                <div className="relative">
                  <div className={isExpandedEmail ? "" : "max-h-24 overflow-hidden relative"}>
                    <p className="text-muted-foreground italic whitespace-pre-wrap">
                      "{request.emailContent || request.emailExcerpt}"
                    </p>

                    {/* Gradient overlay when collapsed */}
                    {!isExpandedEmail && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
                    )}
                  </div>

                  {/* View More/Less button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full flex items-center justify-center gap-1 border-dashed"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpandedEmail(!isExpandedEmail)
                    }}
                  >
                    {isExpandedEmail ? "View Less" : "View Full Email"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpandedEmail ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Top matching vessels */}
          {isExpanded && (
            <div className="mt-4">
              <div className="border rounded-md overflow-hidden">
                <VesselTable
                  vessels={matchedOffers.slice(0, 3)}
                  onView={onSelectOffer}
                  onCopy={() => {}}
                  onSend={() => {}}
                  onToggleFavorite={() => {}}
                  onToggleCompare={onToggleCompareOffer}
                  compareOffers={compareOffers}
                  showRank={true}
                />
              </div>

              {matchedOffers.length > 3 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" onClick={onCompareMatches}>
                    Compare Top Matches
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation()
                // This would open an email composer in a real app
                console.log(`Preparing to email ${request.clientName} at ${request.clientCompany}`)
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              Reply to client
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  // View all matches
                  console.log(`Viewing all ${matchedOffers.length} matches for this request`)
                }}
              >
                <Search className="h-3.5 w-3.5" />
                View all
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onCompareMatches()
                }}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Compare matches
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
