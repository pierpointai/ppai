"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/offer-utils"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertTriangle, Ship, Calendar, DollarSign, MapPin } from "lucide-react"
import type { Offer, ClientRequest } from "@/lib/types"

interface ClientRequirementComparisonProps {
  offers: Offer[]
  clientRequest: ClientRequest
}

export function ClientRequirementComparison({ offers, clientRequest }: ClientRequirementComparisonProps) {
  if (!clientRequest || !clientRequest.extractedData) {
    return null
  }

  const requirements = clientRequest.extractedData

  // Calculate match scores for each offer
  const matchScores = offers.map((offer) => {
    let score = 0
    let maxScore = 0

    // Vessel type match (25%)
    if (requirements.vesselType) {
      maxScore += 25
      if (offer.vesselType.toLowerCase().includes(requirements.vesselType.toLowerCase())) {
        score += 25
      }
    }

    // Vessel size match (20%)
    if (requirements.vesselSize) {
      maxScore += 20
      const sizeRange = 0.1 * requirements.vesselSize // 10% tolerance
      if (
        offer.vesselSize >= requirements.vesselSize - sizeRange &&
        offer.vesselSize <= requirements.vesselSize + sizeRange
      ) {
        score += 20
      } else if (
        offer.vesselSize >= requirements.vesselSize - sizeRange * 2 &&
        offer.vesselSize <= requirements.vesselSize + sizeRange * 2
      ) {
        // Within 20% tolerance
        score += 10
      }
    }

    // Route match (20%)
    if (requirements.loadPort && requirements.dischargePort) {
      maxScore += 20
      const loadPortMatch = offer.loadPort.toLowerCase().includes(requirements.loadPort.toLowerCase())
      const dischargePortMatch = offer.dischargePort.toLowerCase().includes(requirements.dischargePort.toLowerCase())

      if (loadPortMatch && dischargePortMatch) {
        score += 20
      } else if (loadPortMatch || dischargePortMatch) {
        score += 10
      }
    }

    // Laycan match (15%)
    if (requirements.laycanStart && requirements.laycanEnd) {
      maxScore += 15
      const reqStart = new Date(requirements.laycanStart)
      const reqEnd = new Date(requirements.laycanEnd)

      // Check if offer laycan overlaps with required laycan
      const laycanOverlap = !(offer.laycanEnd < reqStart || offer.laycanStart > reqEnd)

      if (laycanOverlap) {
        score += 15
      } else {
        // Check if it's close (within 5 days)
        const daysBefore = (reqStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
        const daysAfter = (offer.laycanStart.getTime() - reqEnd.getTime()) / (1000 * 3600 * 24)

        if ((daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)) {
          score += 7
        }
      }
    }

    // Rate match (20%)
    if (requirements.targetRate && offer.freightRate) {
      maxScore += 20
      const rateRange = 0.1 * requirements.targetRate // 10% tolerance
      if (
        offer.freightRate >= requirements.targetRate - rateRange &&
        offer.freightRate <= requirements.targetRate + rateRange
      ) {
        score += 20
      } else if (
        offer.freightRate >= requirements.targetRate - rateRange * 2 &&
        offer.freightRate <= requirements.targetRate + rateRange * 2
      ) {
        // Within 20% tolerance
        score += 10
      }
    }

    // Calculate percentage match
    const percentMatch = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    return {
      offerId: offer.id,
      score,
      maxScore,
      percentMatch,
    }
  })

  // Find the best match
  const bestMatch = [...matchScores].sort((a, b) => b.percentMatch - a.percentMatch)[0]
  const bestMatchOffer = bestMatch ? offers.find((o) => o.id === bestMatch.offerId) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Ship className="h-4 w-4 mr-2" />
          Client Requirements
        </CardTitle>
        <CardDescription>
          Comparing vessels against requirements from {clientRequest.emailSubject || "client request"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Requirements Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {requirements.vesselType && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <Ship className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Vessel Type</div>
                  <div className="font-medium">{requirements.vesselType}</div>
                </div>
              </div>
            )}

            {requirements.vesselSize && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <Ship className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Vessel Size</div>
                  <div className="font-medium">{requirements.vesselSize}k DWT</div>
                </div>
              </div>
            )}

            {requirements.loadPort && requirements.dischargePort && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <MapPin className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Route</div>
                  <div className="font-medium">
                    {requirements.loadPort} → {requirements.dischargePort}
                  </div>
                </div>
              </div>
            )}

            {requirements.laycanStart && requirements.laycanEnd && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <Calendar className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Laycan</div>
                  <div className="font-medium">
                    {formatDate(requirements.laycanStart)} – {formatDate(requirements.laycanEnd)}
                  </div>
                </div>
              </div>
            )}

            {requirements.targetRate && (
              <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Target Rate</div>
                  <div className="font-medium">${requirements.targetRate}k/day</div>
                </div>
              </div>
            )}
          </div>

          {/* Best Match */}
          {bestMatchOffer && bestMatch && bestMatch.percentMatch > 50 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium">Best Match: {bestMatchOffer.vesselName || bestMatchOffer.vesselType}</h4>
                <Badge className="ml-auto bg-green-600">{bestMatch.percentMatch}% Match</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This vessel meets {bestMatch.percentMatch}% of the client's requirements and is the best match among the
                compared vessels.
              </p>
            </div>
          )}

          {/* Match Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Requirement</th>
                  {offers.map((offer) => (
                    <th key={offer.id} className="text-left py-2 px-3 font-medium">
                      {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Vessel Type */}
                {requirements.vesselType && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Vessel Type</td>
                    {offers.map((offer) => {
                      const isMatch = offer.vesselType.toLowerCase().includes(requirements.vesselType!.toLowerCase())
                      return (
                        <td
                          key={offer.id}
                          className={cn("py-2 px-3", isMatch ? "text-green-600 dark:text-green-400" : "")}
                        >
                          <div className="flex items-center gap-1">
                            {isMatch ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            )}
                            {offer.vesselType}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}

                {/* Vessel Size */}
                {requirements.vesselSize && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Vessel Size</td>
                    {offers.map((offer) => {
                      const sizeRange = 0.1 * requirements.vesselSize! // 10% tolerance
                      const isExactMatch =
                        offer.vesselSize >= requirements.vesselSize! - sizeRange &&
                        offer.vesselSize <= requirements.vesselSize! + sizeRange
                      const isCloseMatch =
                        offer.vesselSize >= requirements.vesselSize! - sizeRange * 2 &&
                        offer.vesselSize <= requirements.vesselSize! + sizeRange * 2
                      return (
                        <td
                          key={offer.id}
                          className={cn(
                            "py-2 px-3",
                            isExactMatch
                              ? "text-green-600 dark:text-green-400"
                              : isCloseMatch
                                ? "text-amber-600 dark:text-amber-400"
                                : "",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {isExactMatch ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : isCloseMatch ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            {offer.vesselSize}k DWT
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}

                {/* Route */}
                {requirements.loadPort && requirements.dischargePort && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Route</td>
                    {offers.map((offer) => {
                      const loadPortMatch = offer.loadPort.toLowerCase().includes(requirements.loadPort!.toLowerCase())
                      const dischargePortMatch = offer.dischargePort
                        .toLowerCase()
                        .includes(requirements.dischargePort!.toLowerCase())
                      const isFullMatch = loadPortMatch && dischargePortMatch
                      const isPartialMatch = loadPortMatch || dischargePortMatch
                      return (
                        <td
                          key={offer.id}
                          className={cn(
                            "py-2 px-3",
                            isFullMatch
                              ? "text-green-600 dark:text-green-400"
                              : isPartialMatch
                                ? "text-amber-600 dark:text-amber-400"
                                : "",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {isFullMatch ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : isPartialMatch ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            {offer.loadPort} → {offer.dischargePort}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}

                {/* Laycan */}
                {requirements.laycanStart && requirements.laycanEnd && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Laycan</td>
                    {offers.map((offer) => {
                      const reqStart = new Date(requirements.laycanStart!)
                      const reqEnd = new Date(requirements.laycanEnd!)
                      const laycanOverlap = !(offer.laycanEnd < reqStart || offer.laycanStart > reqEnd)
                      const daysBefore = (reqStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
                      const daysAfter = (offer.laycanStart.getTime() - reqEnd.getTime()) / (1000 * 3600 * 24)
                      const isCloseMatch = (daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)
                      return (
                        <td
                          key={offer.id}
                          className={cn(
                            "py-2 px-3",
                            laycanOverlap
                              ? "text-green-600 dark:text-green-400"
                              : isCloseMatch
                                ? "text-amber-600 dark:text-amber-400"
                                : "",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {laycanOverlap ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : isCloseMatch ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            {formatDate(offer.laycanStart)} – {formatDate(offer.laycanEnd)}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}

                {/* Rate */}
                {requirements.targetRate && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Rate</td>
                    {offers.map((offer) => {
                      const rateRange = 0.1 * requirements.targetRate! // 10% tolerance
                      const isExactMatch =
                        offer.freightRate >= requirements.targetRate! - rateRange &&
                        offer.freightRate <= requirements.targetRate! + rateRange
                      const isCloseMatch =
                        offer.freightRate >= requirements.targetRate! - rateRange * 2 &&
                        offer.freightRate <= requirements.targetRate! + rateRange * 2
                      return (
                        <td
                          key={offer.id}
                          className={cn(
                            "py-2 px-3",
                            isExactMatch
                              ? "text-green-600 dark:text-green-400"
                              : isCloseMatch
                                ? "text-amber-600 dark:text-amber-400"
                                : "",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {isExactMatch ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : isCloseMatch ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            ${offer.freightRate}
                            {offer.rateUnit}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}

                {/* Overall Match */}
                <tr>
                  <td className="py-2 px-3 font-medium">Overall Match</td>
                  {offers.map((offer) => {
                    const matchScore = matchScores.find((m) => m.offerId === offer.id)
                    const percentMatch = matchScore ? matchScore.percentMatch : 0
                    let matchColor = "text-red-600 dark:text-red-400"
                    let matchIcon = <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />

                    if (percentMatch >= 80) {
                      matchColor = "text-green-600 dark:text-green-400"
                      matchIcon = <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    } else if (percentMatch >= 50) {
                      matchColor = "text-amber-600 dark:text-amber-400"
                      matchIcon = <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    }

                    return (
                      <td key={offer.id} className={cn("py-2 px-3 font-medium", matchColor)}>
                        <div className="flex items-center gap-1">
                          {matchIcon}
                          {percentMatch}%
                        </div>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
