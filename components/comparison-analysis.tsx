"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/offer-utils"
import { AlertTriangle, CheckCircle, Calendar, DollarSign, BarChart3, Ship, ThumbsUp, Info } from "lucide-react"
import type { Offer } from "@/lib/types"

interface ComparisonAnalysisProps {
  offers: Offer[]
}

export function ComparisonAnalysis({ offers }: ComparisonAnalysisProps) {
  const rateAnalysis = useMemo(() => {
    if (offers.length < 2) {
      return null
    }
    const rates = offers.map((o) => o.freightRate)
    const minRate = Math.min(...rates)
    const maxRate = Math.max(...rates)
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
    const rateRange = maxRate - minRate
    const rateVariance = rateRange / avgRate

    // Find the offers with min and max rates
    const minRateOffer = offers.find((o) => o.freightRate === minRate)
    const maxRateOffer = offers.find((o) => o.freightRate === maxRate)

    return {
      minRate,
      maxRate,
      avgRate,
      rateRange,
      rateVariance,
      minRateOffer,
      maxRateOffer,
    }
  }, [offers])

  const scheduleAnalysis = useMemo(() => {
    if (offers.length < 2) {
      return null
    }
    // Convert laycan dates to timestamps for easier comparison
    const laycanStarts = offers.map((o) => o.laycanStart.getTime())
    const laycanEnds = offers.map((o) => o.laycanEnd.getTime())

    // Find earliest and latest dates
    const earliestStart = new Date(Math.min(...laycanStarts))
    const latestEnd = new Date(Math.max(...laycanEnds))

    // Calculate total window span in days
    const totalSpan = Math.round((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24))

    // Check for overlapping laycan windows
    let hasOverlap = false
    for (let i = 0; i < offers.length; i++) {
      for (let j = i + 1; j < offers.length; j++) {
        const a = offers[i]
        const b = offers[j]

        // Check if laycan periods overlap
        if (
          (a.laycanStart <= b.laycanEnd && a.laycanEnd >= b.laycanStart) ||
          (b.laycanStart <= a.laycanEnd && b.laycanEnd >= a.laycanStart)
        ) {
          hasOverlap = true
          break
        }
      }
      if (hasOverlap) break
    }

    // Find the offer with the earliest start
    const earliestOffer = offers.find((o) => o.laycanStart.getTime() === Math.min(...laycanStarts))

    return {
      earliestStart,
      latestEnd,
      totalSpan,
      hasOverlap,
      earliestOffer,
    }
  }, [offers])

  const vesselAnalysis = useMemo(() => {
    if (offers.length < 2) {
      return null
    }
    // Get vessel sizes
    const sizes = offers.map((o) => o.vesselSize)
    const minSize = Math.min(...sizes)
    const maxSize = Math.max(...sizes)
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length
    const sizeRange = maxSize - minSize
    const sizeVariance = sizeRange / avgSize

    // Check if all vessels are the same type
    const vesselTypes = new Set(offers.map((o) => o.vesselType))
    const sameType = vesselTypes.size === 1

    // Check if all vessels have the same flag
    const vesselFlags = new Set(offers.map((o) => o.vesselFlag).filter(Boolean))
    const sameFlag = vesselFlags.size === 1 && vesselFlags.has(offers[0].vesselFlag)

    // Calculate average vessel age if available
    const ages = offers.map((o) => o.vesselAge).filter((age): age is number => age !== undefined)
    const avgAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : undefined

    return {
      minSize,
      maxSize,
      avgSize,
      sizeRange,
      sizeVariance,
      sameType,
      sameFlag,
      avgAge,
    }
  }, [offers])

  // Skip analysis if we don't have enough offers
  if (offers.length < 2) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          At least two vessels are needed for comparison analysis.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Key Differences at a Glance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Comparison - Fixed */}
        <div className="border rounded-lg p-4">
          <h3 className="text-base font-medium flex items-center mb-4">
            <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
            Price Comparison
          </h3>

          <div className="space-y-4">
            {/* Best Price Callout */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Best Price</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">${rateAnalysis?.minRate}</span> from{" "}
                  <Badge variant="outline" className="ml-1">
                    {rateAnalysis?.minRateOffer?.vesselName ||
                      `${rateAnalysis?.minRateOffer?.vesselType} ${rateAnalysis?.minRateOffer?.vesselSize}k`}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Price Comparison Table */}
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">Vessel</th>
                    <th className="text-right text-sm font-medium text-gray-500 pb-2">Price</th>
                    <th className="text-right text-sm font-medium text-gray-500 pb-2">Comparison</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    // Calculate percentage difference from lowest price
                    const priceDiff = rateAnalysis
                      ? Math.round(((offer.freightRate - rateAnalysis.minRate) / rateAnalysis.minRate) * 100)
                      : 0

                    // Calculate percentage for progress bar (how close to lowest price)
                    const pricePercentage = rateAnalysis
                      ? 100 - Math.min(((offer.freightRate - rateAnalysis.minRate) / rateAnalysis.minRate) * 100, 100)
                      : 100

                    return (
                      <tr key={offer.id} className="border-t">
                        <td className="py-2 text-sm">
                          {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                        </td>
                        <td className="py-2 text-sm text-right font-medium">${offer.freightRate}</td>
                        <td className="py-2 pl-4 w-1/3">
                          <div className="flex items-center gap-2">
                            <Progress value={pricePercentage} className="h-2 flex-grow" />
                            <span className="text-xs whitespace-nowrap w-16 text-right">
                              {priceDiff === 0 ? (
                                <span className="text-green-600 dark:text-green-400">Best</span>
                              ) : (
                                <span className="text-gray-500">+{priceDiff}%</span>
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Price Insight */}
            <div className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rateAnalysis && rateAnalysis.rateVariance > 0.15 ? (
                  <>
                    There's a <strong>{Math.round(rateAnalysis.rateVariance * 100)}%</strong> price difference between
                    the cheapest and most expensive options. This is a significant variation.
                  </>
                ) : (
                  <>
                    The price difference between options is relatively small at
                    <strong> {rateAnalysis ? Math.round(rateAnalysis.rateVariance * 100) : 0}%</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Comparison - Fixed */}
        <div className="border rounded-lg p-4">
          <h3 className="text-base font-medium flex items-center mb-4">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            Schedule Comparison
          </h3>

          <div className="space-y-4">
            {/* Schedule Table */}
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">Vessel</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">Laycan Start</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">Laycan End</th>
                    <th className="text-right text-sm font-medium text-gray-500 pb-2">Window</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    // Calculate laycan window in days
                    const laycanDays = Math.round(
                      (offer.laycanEnd.getTime() - offer.laycanStart.getTime()) / (1000 * 60 * 60 * 24),
                    )

                    // Check if this is the earliest vessel
                    const isEarliest = scheduleAnalysis?.earliestOffer?.id === offer.id

                    return (
                      <tr key={offer.id} className="border-t">
                        <td className="py-2 text-sm">
                          {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                        </td>
                        <td className="py-2 text-sm">
                          {formatDate(offer.laycanStart, true)}
                          {isEarliest && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs bg-green-50 border-green-200 text-green-700"
                            >
                              Earliest
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 text-sm">{formatDate(offer.laycanEnd, true)}</td>
                        <td className="py-2 text-sm text-right font-medium">{laycanDays} days</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Schedule Insight */}
            <div className="flex items-start gap-2 mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-1">
                  {scheduleAnalysis?.hasOverlap ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 inline mr-1" />
                      <span>Good news! The schedules overlap, giving you flexibility.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500 inline mr-1" />
                      <span>The schedules don't overlap. You'll need to choose based on your timing needs.</span>
                    </>
                  )}
                </p>
                <p>
                  Total time span: <strong>{scheduleAnalysis?.totalSpan} days</strong> from earliest to latest option.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vessel Comparison - Simplified */}
        <div className="border rounded-lg p-4">
          <h3 className="text-base font-medium flex items-center mb-4">
            <Ship className="h-5 w-5 mr-2 text-gray-500" />
            Vessel Comparison
          </h3>

          <div className="space-y-4">
            {/* Size Comparison */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Vessel Size Comparison</span>
                <span className="text-xs text-gray-500">
                  Range: {vesselAnalysis?.minSize}k - {vesselAnalysis?.maxSize}k DWT
                </span>
              </div>

              <div className="space-y-2">
                {offers.map((offer) => {
                  // Calculate percentage of max size
                  const percentage = vesselAnalysis ? (offer.vesselSize / vesselAnalysis.maxSize) * 100 : 0

                  return (
                    <div key={offer.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}</span>
                        <span>{offer.vesselSize}k DWT</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vessel Type & Flag */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="text-sm">Vessel Type:</div>
                <div className="text-sm font-medium">
                  {vesselAnalysis?.sameType ? (
                    <span className="flex items-center">
                      Same <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Different <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm">Flag:</div>
                <div className="text-sm font-medium">
                  {vesselAnalysis?.sameFlag ? (
                    <span className="flex items-center">
                      Same <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Different <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vessel Insight */}
            <div className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {vesselAnalysis?.sizeVariance > 0.15 ? (
                  <>
                    There's a significant size difference between vessels. Consider if the larger vessel is necessary
                    for your cargo needs.
                  </>
                ) : (
                  <>The vessels are similar in size, making them comparable options.</>
                )}
                {!vesselAnalysis?.sameType && <> Different vessel types may affect cargo handling capabilities.</>}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
