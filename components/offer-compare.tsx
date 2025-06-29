"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/offer-utils"
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Ship,
  Calendar,
  DollarSign,
  BarChart3,
  Download,
  Filter,
  Eye,
  Star,
  StarHalf,
  Anchor,
  Compass,
  Award,
  Info,
  Maximize2,
  Minimize2,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart4,
  TableIcon,
  Grid,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import type { Offer } from "@/lib/types"
import { useOfferStore } from "@/lib/offer-store"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { VesselTable } from "@/components/vessel-table"

interface OfferCompareProps {
  offers: Offer[]
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

type ViewMode = "cards" | "table" | "metrics"

export function OfferCompare({ offers: initialOffers, onClose, isFullscreen, onToggleFullscreen }: OfferCompareProps) {
  const { toggleCompareOffer, clearCompare } = useOfferStore()
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(null)
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vesselDetails: true,
    commercialTerms: true,
    schedule: true,
    performance: true,
    scores: true,
  })

  // Ensure we have offers to compare
  const offers = useMemo(() => {
    return initialOffers.length > 0 ? initialOffers : []
  }, [initialOffers])

  // Calculate scores for each offer
  const offersWithScores = useMemo(() => {
    return offers.map((offer) => {
      // Simple scoring algorithm - normalize and weight each metric
      const ageScore = offer.vesselAge ? Math.max(0, 1 - offer.vesselAge / 25) : 0.5
      const sizeScore = offer.vesselSize / 200
      const rateScore = offer.freightRate / 30

      // Calculate days until laycan
      const now = new Date()
      const daysUntilLaycan = Math.max(0, (offer.laycanStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const laycanScore = Math.max(0, 1 - daysUntilLaycan / 60)

      // Weight the scores (adjust weights as needed)
      const score = ageScore * 0.25 + sizeScore * 0.3 + rateScore * 0.3 + laycanScore * 0.15

      return {
        ...offer,
        score: Math.min(1, score), // Cap at 1
      }
    })
  }, [offers])

  // Find the best offer based on overall score
  const bestOffer = useMemo(() => {
    if (offersWithScores.length === 0) return null
    return offersWithScores.reduce(
      (best, current) => (current.score > (best.score || 0) ? current : best),
      offersWithScores[0],
    )
  }, [offersWithScores])

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  // Get status icon
  const getStatusIcon = useCallback((status?: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "fixed":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }, [])

  // Get status color
  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900"
      case "fixed":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900"
      case "failed":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900"
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }
  }, [])

  // Get score color
  const getScoreColor = useCallback((score: number) => {
    if (score > 0.8) return "text-emerald-600 dark:text-emerald-400"
    if (score > 0.6) return "text-blue-600 dark:text-blue-400"
    if (score > 0.4) return "text-amber-600 dark:text-amber-400"
    return "text-gray-600 dark:text-gray-400"
  }, [])

  // Get score background color
  const getScoreBgColor = useCallback((score: number) => {
    if (score > 0.8) return "bg-emerald-500 dark:bg-emerald-600"
    if (score > 0.6) return "bg-blue-500 dark:bg-blue-600"
    if (score > 0.4) return "bg-amber-500 dark:bg-amber-600"
    return "bg-gray-500 dark:bg-gray-600"
  }, [])

  // Get rating stars based on score
  const getRatingStars = useCallback((score: number) => {
    // Ensure score is between 0 and 1
    const normalizedScore = Math.max(0, Math.min(1, score || 0))

    // Calculate stars with safety checks
    const fullStars = Math.floor(normalizedScore * 5)
    const hasHalfStar = normalizedScore * 5 - fullStars >= 0.5
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0))

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-4 w-4 text-gray-700 fill-gray-700 dark:text-gray-400 dark:fill-gray-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf className="h-4 w-4 text-gray-700 fill-gray-700 dark:text-gray-400 dark:fill-gray-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
    )
  }, [])

  // Export comparison as CSV
  const exportComparison = useCallback(() => {
    // Create headers
    let csvContent = "Feature,"

    // Add vessel names as headers
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}",`
    })
    csvContent += "\n"

    // Add overall score
    csvContent += `"Overall Score",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${(offer.score * 100).toFixed(1)}%",`
    })
    csvContent += "\n"

    // Add vessel details
    csvContent += `"Vessel Type",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.vesselType}",`
    })
    csvContent += "\n"

    csvContent += `"Vessel Size",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.vesselSize}k DWT",`
    })
    csvContent += "\n"

    csvContent += `"Vessel Age",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.vesselAge || "N/A"} years",`
    })
    csvContent += "\n"

    csvContent += `"Vessel Flag",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.vesselFlag || "N/A"}",`
    })
    csvContent += "\n"

    // Add route details
    csvContent += `"Load Port",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.loadPort}",`
    })
    csvContent += "\n"

    csvContent += `"Discharge Port",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.dischargePort}",`
    })
    csvContent += "\n"

    csvContent += `"Laycan Start",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${formatDate(offer.laycanStart)}",`
    })
    csvContent += "\n"

    csvContent += `"Laycan End",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${formatDate(offer.laycanEnd)}",`
    })
    csvContent += "\n"

    // Add commercial terms
    csvContent += `"Freight Rate",`
    offersWithScores.forEach((offer) => {
      csvContent += `"$${offer.freightRate}k/day",`
    })
    csvContent += "\n"

    csvContent += `"Status",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.status || "N/A"}",`
    })
    csvContent += "\n"

    csvContent += `"Cargo Type",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.cargoType || "N/A"}",`
    })
    csvContent += "\n"

    csvContent += `"Cargo Quantity",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.cargoQuantity ? `${offer.cargoQuantity.toLocaleString()} ${offer.cargoUnit}` : "N/A"}",`
    })
    csvContent += "\n"

    csvContent += `"Charterer",`
    offersWithScores.forEach((offer) => {
      csvContent += `"${offer.charterer || "N/A"}",`
    })
    csvContent += "\n"

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vessel-comparison-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Comparison Exported",
      description: "The comparison data has been exported as a CSV file.",
    })
  }, [offersWithScores, toast])

  // Check if we have enough offers to compare
  if (offers.length === 0) {
    return (
      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-900 border-b">
          <CardTitle className="text-lg font-medium">Vessel Comparison</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Ship className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-6" />
          <h3 className="text-xl font-medium mb-3">No Vessels to Compare</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Select vessels from the dashboard to compare their specifications, rates, and other details side by side.
          </p>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="lg">
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderDifference = useCallback((value1: any, value2: any, type = "text") => {
    if (value1 === value2 || value1 === undefined || value2 === undefined) {
      return null
    }

    let diff: React.ReactNode
    let indicator: React.ReactNode

    if (type === "number") {
      const num1 = Number.parseFloat(value1)
      const num2 = Number.parseFloat(value2)

      if (isNaN(num1) || isNaN(num2)) {
        return null
      }

      const difference = num1 - num2
      const percentDiff = (Math.abs(difference) / Math.max(Math.abs(num1), Math.abs(num2))) * 100

      if (Math.abs(percentDiff) < 5) {
        return null // Difference is negligible
      }

      diff = (
        <span className={difference > 0 ? "text-green-600" : "text-red-600"}>
          {difference > 0 ? "+" : ""}
          {difference.toFixed(1)}
        </span>
      )

      indicator =
        difference > 0 ? (
          <TrendingUp className="h-3 w-3 text-green-600" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-600" />
        )
    } else if (type === "date") {
      const date1 = new Date(value1)
      const date2 = new Date(value2)

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return null
      }

      const diffDays = Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

      if (Math.abs(diffDays) < 2) {
        return null // Difference is negligible
      }

      diff = (
        <span className={diffDays > 0 ? "text-amber-600" : "text-green-600"}>
          {diffDays > 0 ? "+" : ""}
          {diffDays} days
        </span>
      )

      indicator =
        diffDays > 0 ? <Clock className="h-3 w-3 text-amber-600" /> : <Clock className="h-3 w-3 text-green-600" />
    } else {
      return null // No meaningful comparison for text
    }

    return (
      <div className="flex items-center gap-1 text-xs mt-1 bg-muted/30 px-1.5 py-0.5 rounded-sm w-fit">
        {indicator}
        {diff}
      </div>
    )
  }, [])

  const handleCopyOffer = useCallback(
    (offerId: string) => {
      const offer = offers.find((offer) => offer.id === offerId)
      if (offer) {
        const offerString = JSON.stringify(offer, null, 2)
        navigator.clipboard.writeText(offerString)
        toast({
          title: "Offer Copied",
          description: "The offer data has been copied to your clipboard.",
        })
      }
    },
    [offers, toast],
  )

  const handleRemoveFromComparison = useCallback(
    (offerId: string) => {
      const offer = offers.find((offer) => offer.id === offerId)
      if (offer) {
        toggleCompareOffer(offer)
        toast({
          title: "Offer Removed",
          description: "The offer has been removed from comparison.",
        })
      }
    },
    [offers, toast, toggleCompareOffer],
  )

  return (
    <Card
      className={cn(
        "shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden",
        isFullscreen && "h-[calc(100vh-2rem)] max-h-none",
      )}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Vessel Comparison</h2>
              <p className="text-sm text-muted-foreground">
                Comparing {offers.length} vessel{offers.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            {bestOffer && (
              <div className="flex items-center mr-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <Award className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-sm font-medium">
                  Best: {bestOffer.vesselName || `${bestOffer.vesselType} ${bestOffer.vesselSize}k`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              {onToggleFullscreen && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={onToggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button variant="outline" size="sm" className="h-8" onClick={clearCompare}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              >
                {showOnlyDifferences ? <Eye className="h-4 w-4 mr-1" /> : <Filter className="h-4 w-4 mr-1" />}
                {showOnlyDifferences ? "Show All" : "Differences"}
              </Button>

              <Button
                size="sm"
                className="h-8 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                onClick={exportComparison}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="px-4 pb-2">
          <div className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 gap-1",
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
              )}
              onClick={() => setViewMode("cards")}
            >
              <Grid className="h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === "metrics" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 gap-1",
                viewMode === "metrics"
                  ? "bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
              )}
              onClick={() => setViewMode("metrics")}
            >
              <BarChart4 className="h-4 w-4" />
              Metrics
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 gap-1",
                viewMode === "table"
                  ? "bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
              )}
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className={cn("", isFullscreen && "h-[calc(100vh-12rem)]")}>
        <div className="p-4">
          {/* Cards View */}
          {viewMode === "cards" && (
            <div className="space-y-8">
              {/* Vessel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="mt-4 border rounded-md overflow-hidden">
                  <VesselTable
                    vessels={offers}
                    onView={() => {}}
                    onCopy={handleCopyOffer}
                    onSend={() => {}}
                    onToggleFavorite={() => {}}
                    onToggleCompare={(offer) => handleRemoveFromComparison(offer.id)}
                    compareOffers={offers}
                  />
                </div>
              </div>

              {/* Recommendation Card */}
              {bestOffer && (
                <Card className="vessel-card border-gray-300 dark:border-gray-700 overflow-hidden">
                  <div className="bg-primary/10 dark:bg-primary/5 border-b border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Recommended Vessel</h3>
                        <p className="text-sm text-muted-foreground">Best balance of size, age, rate, and schedule</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Ship className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium">
                              {bestOffer.vesselName || `${bestOffer.vesselType} ${bestOffer.vesselSize}k`}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {bestOffer.vesselFlag || "Unknown"} Flag, {bestOffer.vesselAge || "N/A"} years old
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Size</div>
                            <div className="text-lg font-medium flex items-center gap-2">
                              <Ship className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              {bestOffer.vesselSize}k DWT
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Rate</div>
                            <div className="text-lg font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />$
                              {bestOffer.freightRate}k/day
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="text-lg font-medium">
                              <Badge
                                variant="outline"
                                className={cn("flex items-center gap-1 px-2 py-1", getStatusColor(bestOffer.status))}
                              >
                                {getStatusIcon(bestOffer.status)}
                                <span>{bestOffer.status}</span>
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Route</div>
                            <div className="text-base font-medium flex items-center gap-2">
                              <Compass className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              <span className="flex items-center">
                                {bestOffer.loadPort} <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />{" "}
                                {bestOffer.dischargePort}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Laycan</div>
                            <div className="text-base font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              {formatDate(bestOffer.laycanStart)}–{formatDate(bestOffer.laycanEnd)}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Cargo</div>
                            <div className="text-base font-medium flex items-center gap-2">
                              <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              {bestOffer.cargoType || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm min-w-[200px] border border-gray-200 dark:border-gray-800">
                        <div className={cn("text-6xl font-bold", getScoreColor(bestOffer.score || 0))}>
                          {((bestOffer.score || 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1 mb-3">
                          Match Score
                        </div>
                        <div className="scale-125 mb-3">{getRatingStars(bestOffer.score || 0)}</div>

                        <div className="w-full mt-4">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
                            <span>Score Breakdown</span>
                            <span>{((bestOffer.score || 0) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress
                            value={(bestOffer.score || 0) * 100}
                            className="h-2.5 w-full bg-gray-200 dark:bg-gray-700"
                          >
                            <div
                              className={cn("h-full rounded-full", getScoreBgColor(bestOffer.score || 0))}
                              style={{ width: `${(bestOffer.score || 0) * 100}%` }}
                            />
                          </Progress>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Key Differences */}
              {offers.length > 1 && (
                <Card className="vessel-card border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Sliders className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Key Differences</h3>
                        <p className="text-sm text-muted-foreground">Comparative analysis of critical vessel metrics</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Size Comparison */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-medium">Vessel Size</h4>
                          </div>
                        </div>
                        <div className="p-3 space-y-3">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => b.vesselSize - a.vesselSize) // Sort by size, largest first
                            .map((offer, index) => {
                              const maxSize = Math.max(...offers.map((o) => o.vesselSize))
                              const percentage = (offer.vesselSize / maxSize) * 100
                              const originalIndex = offersWithScores.findIndex((o) => o.id === offer.id)

                              return (
                                <div key={`size-bar-${offer.id}`} className="relative">
                                  <div className="flex items-center mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                      {originalIndex + 1}
                                    </div>
                                    <span className="text-sm font-medium truncate flex-1">
                                      {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                    </span>
                                    <span className="text-sm font-medium">{offer.vesselSize}k DWT</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full",
                                        offer.id === bestOffer?.id
                                          ? "bg-primary dark:bg-primary"
                                          : getScoreBgColor(offer.score || 0),
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      {/* Rate Comparison */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-medium">Freight Rate</h4>
                          </div>
                        </div>
                        <div className="p-3 space-y-3">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => b.freightRate - a.freightRate) // Sort by rate, highest first
                            .map((offer, index) => {
                              const maxRate = Math.max(...offers.map((o) => o.freightRate))
                              const percentage = (offer.freightRate / maxRate) * 100
                              const originalIndex = offersWithScores.findIndex((o) => o.id === offer.id)

                              return (
                                <div key={`rate-bar-${offer.id}`} className="relative">
                                  <div className="flex items-center mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                      {originalIndex + 1}
                                    </div>
                                    <span className="text-sm font-medium truncate flex-1">
                                      {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                    </span>
                                    <span className="text-sm font-medium">${offer.freightRate}k/day</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full",
                                        offer.id === bestOffer?.id
                                          ? "bg-primary dark:bg-primary"
                                          : getScoreBgColor(offer.score || 0),
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      {/* Age Comparison */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Anchor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-medium">Vessel Age</h4>
                          </div>
                        </div>
                        <div className="p-3 space-y-3">
                          {offersWithScores
                            .filter((offer) => offer.vesselAge !== undefined)
                            .sort((a, b) => (a.vesselAge || 0) - (b.vesselAge || 0)) // Sort by age, youngest first
                            .map((offer, index) => {
                              const maxAge = Math.max(
                                ...offers.filter((o) => o.vesselAge !== undefined).map((o) => o.vesselAge || 0),
                              )
                              // Invert percentage so younger vessels have longer bars
                              const percentage = maxAge > 0 ? 100 - ((offer.vesselAge || 0) / maxAge) * 100 : 50
                              const originalIndex = offersWithScores.findIndex((o) => o.id === offer.id)

                              return (
                                <div key={`age-bar-${offer.id}`} className="relative">
                                  <div className="flex items-center mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                      {originalIndex + 1}
                                    </div>
                                    <span className="text-sm font-medium truncate flex-1">
                                      {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                    </span>
                                    <span className="text-sm font-medium">{offer.vesselAge} years</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full",
                                        offer.id === bestOffer?.id
                                          ? "bg-primary dark:bg-primary"
                                          : getScoreBgColor(offer.score || 0),
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      {/* Laycan Comparison */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-medium">Laycan Start</h4>
                          </div>
                        </div>
                        <div className="p-3 space-y-3">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => a.laycanStart.getTime() - b.laycanStart.getTime()) // Sort by laycan start date
                            .map((offer, index) => {
                              const now = new Date()
                              const daysUntilLaycan = Math.max(
                                0,
                                Math.floor((offer.laycanStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                              )
                              const allDays = offers.map((o) => {
                                return Math.max(
                                  0,
                                  Math.floor((o.laycanStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                                )
                              })
                              const maxDays = Math.max(...allDays)
                              // Invert percentage so earlier laycans have longer bars
                              const percentage = maxDays > 0 ? 100 - (daysUntilLaycan / maxDays) * 100 : 50
                              return (
                                <div key={`laycan-bar-${offer.id}`} className="relative">
                                  <div className="flex items-center mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                      {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                    </div>
                                    <span className="text-sm font-medium truncate flex-1">
                                      {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                    </span>
                                    <span className="text-sm font-medium">{formatDate(offer.laycanStart)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full",
                                        offer.id === bestOffer?.id
                                          ? "bg-primary dark:bg-primary"
                                          : getScoreBgColor(offer.score || 0),
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Spotlight on Key Differences */}
                    <div className="mt-6">
                      <h3 className="text-base font-medium mb-4">Spotlight on Key Differences</h3>
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                        {offers.length >= 2 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Size Range */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center">
                                  <Ship className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                                  Size Range
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.min(...offers.map((o) => o.vesselSize))}k -{" "}
                                  {Math.max(...offers.map((o) => o.vesselSize))}k DWT
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(() => {
                                  const sizes = offers.map((o) => o.vesselSize)
                                  const minSize = Math.min(...sizes)
                                  const maxSize = Math.max(...sizes)
                                  const range = maxSize - minSize

                                  if (range === 0) return "All vessels are the same size."
                                  if (range <= 5) return "Vessels are very similar in size."
                                  if (range <= 20) return "Moderate size variation between vessels."
                                  return `Significant size difference of ${range}k DWT between vessels.`
                                })()}
                              </div>
                            </div>

                            {/* Rate Difference */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                                  Rate Difference
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ${Math.min(...offers.map((o) => o.freightRate))}k - $
                                  {Math.max(...offers.map((o) => o.freightRate))}k/day
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(() => {
                                  const rates = offers.map((o) => o.freightRate)
                                  const minRate = Math.min(...rates)
                                  const maxRate = Math.max(...rates)
                                  const difference = maxRate - minRate
                                  const percentDiff = (difference / minRate) * 100

                                  if (difference === 0) return "All vessels have identical rates."
                                  if (percentDiff <= 5) return "Rates are very competitive with minimal variation."
                                  if (percentDiff <= 15)
                                    return `Moderate rate variation of ${percentDiff.toFixed(1)}% between vessels.`
                                  return `Significant rate difference of ${percentDiff.toFixed(1)}% between lowest and highest offers.`
                                })()}
                              </div>
                            </div>

                            {/* Age Comparison */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center">
                                  <Anchor className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                                  Age Comparison
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.min(
                                    ...offers.filter((o) => o.vesselAge !== undefined).map((o) => o.vesselAge || 0),
                                  )}{" "}
                                  -{" "}
                                  {Math.max(
                                    ...offers.filter((o) => o.vesselAge !== undefined).map((o) => o.vesselAge || 0),
                                  )}{" "}
                                  years
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(() => {
                                  const ages = offers
                                    .filter((o) => o.vesselAge !== undefined)
                                    .map((o) => o.vesselAge || 0)
                                  if (ages.length === 0) return "Age information not available for comparison."

                                  const minAge = Math.min(...ages)
                                  const maxAge = Math.max(...ages)
                                  const difference = maxAge - minAge

                                  if (difference === 0) return "All vessels are the same age."
                                  if (difference <= 2) return "Vessels are of similar age."
                                  if (difference <= 7) return "Moderate age variation between vessels."
                                  return `Significant age difference of ${difference} years between newest and oldest vessels.`
                                })()}
                              </div>
                            </div>

                            {/* Schedule Flexibility */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                                  Schedule Flexibility
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(new Date(Math.min(...offers.map((o) => o.laycanStart.getTime()))))} -{" "}
                                  {formatDate(new Date(Math.max(...offers.map((o) => o.laycanEnd.getTime()))))}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(() => {
                                  const now = new Date()
                                  const earliestStart = Math.min(...offers.map((o) => o.laycanStart.getTime()))
                                  const latestStart = Math.max(...offers.map((o) => o.laycanStart.getTime()))
                                  const daysDifference = Math.floor(
                                    (latestStart - earliestStart) / (1000 * 60 * 60 * 24),
                                  )

                                  if (daysDifference === 0) return "All vessels have the same laycan start date."
                                  if (daysDifference <= 3) return "Very tight schedule window across all vessels."
                                  if (daysDifference <= 10)
                                    return `Moderate schedule flexibility with ${daysDifference} days between earliest and latest laycan.`
                                  return `Wide schedule flexibility with ${daysDifference} days between earliest and latest laycan.`
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Metrics View */}
          {viewMode === "metrics" && (
            <div className="space-y-6">
              {/* Overall Scores */}
              <Card className="vessel-card border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold">Overall Scores</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => toggleSection("scores")}>
                      {expandedSections.scores ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedSections.scores !== false && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {offersWithScores
                        .slice()
                        .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by score, highest first
                        .map((offer, index) => {
                          const percentage = (offer.score || 0) * 100
                          return (
                            <div key={`score-bar-${offer.id}`} className="relative">
                              <div className="flex items-center mb-1">
                                <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                  {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">
                                  {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex">{getRatingStars(offer.score || 0)}</div>
                                  <span className={cn("text-sm font-bold", getScoreColor(offer.score || 0))}>
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    offer.id === bestOffer?.id
                                      ? "bg-primary dark:bg-primary"
                                      : getScoreBgColor(offer.score || 0),
                                  )}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              {offer.id === bestOffer?.id && (
                                <div className="absolute -right-2 -top-2">
                                  <div className="bg-primary text-white dark:text-gray-900 rounded-full p-1">
                                    <Award className="h-3 w-3" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Vessel Details */}
              <Card className="vessel-card border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold">Vessel Details</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => toggleSection("vesselDetails")}
                    >
                      {expandedSections.vesselDetails ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedSections.vesselDetails !== false && (
                  <div className="p-4">
                    <div className="space-y-6">
                      {/* Vessel Type */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Ship className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Vessel Type
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores.map((offer) => (
                            <div
                              key={`type-${offer.id}`}
                              className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                              </div>
                              <span className="text-sm font-medium truncate flex-1">
                                {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                              </span>
                              <span className="text-sm">{offer.vesselType}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vessel Size */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Ship className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Vessel Size
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => b.vesselSize - a.vesselSize)
                            .map((offer) => (
                              <div
                                key={`size-${offer.id}`}
                                className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                              >
                                <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                  {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">
                                  {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                </span>
                                <span className="text-sm">{offer.vesselSize}k DWT</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Vessel Age */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Anchor className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Vessel Age
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => (a.vesselAge || 0) - (b.vesselAge || 0))
                            .map((offer) => (
                              <div
                                key={`age-${offer.id}`}
                                className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                              >
                                <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                  {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">
                                  {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                </span>
                                <span className="text-sm">{offer.vesselAge || "N/A"} years</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Vessel Flag */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Compass className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Vessel Flag
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores.map((offer) => (
                            <div
                              key={`flag-${offer.id}`}
                              className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                              </div>
                              <span className="text-sm font-medium truncate flex-1">
                                {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                              </span>
                              <span className="text-sm">{offer.vesselFlag || "Unknown"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Commercial Terms */}
              <Card className="vessel-card border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold">Commercial Terms</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => toggleSection("commercialTerms")}
                    >
                      {expandedSections.commercialTerms ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedSections.commercialTerms !== false && (
                  <div className="p-4">
                    <div className="space-y-6">
                      {/* Freight Rate */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Freight Rate
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => a.freightRate - b.freightRate)
                            .map((offer) => (
                              <div
                                key={`rate-${offer.id}`}
                                className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                              >
                                <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                  {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">
                                  {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                </span>
                                <span className="text-sm">${offer.freightRate}k/day</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Status
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores.map((offer) => (
                            <div
                              key={`status-${offer.id}`}
                              className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                              </div>
                              <span className="text-sm font-medium truncate flex-1">
                                {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn("px-1.5 py-0.5 text-xs", getStatusColor(offer.status))}
                              >
                                {getStatusIcon(offer.status)}
                                <span className="ml-1">{offer.status}</span>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cargo Type */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Cargo Type
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores.map((offer) => (
                            <div
                              key={`cargo-${offer.id}`}
                              className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                              </div>
                              <span className="text-sm font-medium truncate flex-1">
                                {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                              </span>
                              <span className="text-sm">{offer.cargoType || "N/A"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Schedule */}
              <Card className="vessel-card border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold">Schedule</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => toggleSection("schedule")}>
                      {expandedSections.schedule ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedSections.schedule !== false && (
                  <div className="p-4">
                    <div className="space-y-6">
                      {/* Route */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Compass className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Route
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores.map((offer) => (
                            <div
                              key={`route-${offer.id}`}
                              className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                              </div>
                              <span className="text-sm font-medium truncate flex-1">
                                {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                              </span>
                              <span className="text-sm flex items-center">
                                {offer.loadPort} <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />{" "}
                                {offer.dischargePort}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Laycan */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                          Laycan
                        </h4>
                        <div className="space-y-2">
                          {offersWithScores
                            .slice()
                            .sort((a, b) => a.laycanStart.getTime() - b.laycanStart.getTime())
                            .map((offer) => (
                              <div
                                key={`laycan-${offer.id}`}
                                className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-800"
                              >
                                <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mr-2">
                                  {offersWithScores.findIndex((o) => o.id === offer.id) + 1}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">
                                  {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                                </span>
                                <span className="text-sm">
                                  {formatDate(offer.laycanStart)} - {formatDate(offer.laycanEnd)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vessel
                      </th>
                      {offersWithScores.map((offer, index) => (
                        <th
                          key={`header-${offer.id}`}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold mb-1">
                              {index + 1}
                            </div>
                            <span className="truncate max-w-[120px]">
                              {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
                            </span>
                            {offer.id === bestOffer?.id && (
                              <div className="flex items-center mt-1 text-amber-500">
                                <Award className="h-3 w-3 mr-0.5" />
                                <span className="text-[10px]">BEST</span>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                    {/* Score */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Score</td>
                      {offersWithScores.map((offer) => (
                        <td key={`score-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <div className={cn("font-bold", getScoreColor(offer.score || 0))}>
                              {((offer.score || 0) * 100).toFixed(0)}%
                            </div>
                            <div className="flex mt-1">{getRatingStars(offer.score || 0)}</div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Vessel Type */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Vessel Type</td>
                      {offersWithScores.map((offer) => (
                        <td key={`type-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          {offer.vesselType}
                        </td>
                      ))}
                    </tr>

                    {/* Vessel Size */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Vessel Size</td>
                      {offersWithScores.map((offer, index) => (
                        <td key={`size-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span>{offer.vesselSize}k DWT</span>
                            {offers.length > 1 &&
                              index > 0 &&
                              renderDifference(offer.vesselSize, offers[0].vesselSize, "number")}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Vessel Age */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Vessel Age</td>
                      {offersWithScores.map((offer, index) => (
                        <td key={`age-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span>{offer.vesselAge || "N/A"} years</span>
                            {offers.length > 1 &&
                              index > 0 &&
                              offer.vesselAge &&
                              offers[0].vesselAge &&
                              renderDifference(offer.vesselAge, offers[0].vesselAge, "number")}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Vessel Flag */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Vessel Flag</td>
                      {offersWithScores.map((offer) => (
                        <td key={`flag-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          {offer.vesselFlag || "Unknown"}
                        </td>
                      ))}
                    </tr>

                    {/* Freight Rate */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Freight Rate</td>
                      {offersWithScores.map((offer, index) => (
                        <td key={`rate-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span>${offer.freightRate}k/day</span>
                            {offers.length > 1 &&
                              index > 0 &&
                              renderDifference(offer.freightRate, offers[0].freightRate, "number")}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Status */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Status</td>
                      {offersWithScores.map((offer) => (
                        <td key={`status-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <Badge
                            variant="outline"
                            className={cn("px-1.5 py-0.5 text-xs", getStatusColor(offer.status))}
                          >
                            {getStatusIcon(offer.status)}
                            <span className="ml-1">{offer.status}</span>
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Route */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Route</td>
                      {offersWithScores.map((offer) => (
                        <td key={`route-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center">
                              <span className="truncate max-w-[80px]">{offer.loadPort}</span>
                              <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                              <span className="truncate max-w-[80px]">{offer.dischargePort}</span>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Laycan */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Laycan</td>
                      {offersWithScores.map((offer, index) => (
                        <td key={`laycan-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span>
                              {formatDate(offer.laycanStart)} - {formatDate(offer.laycanEnd)}
                            </span>
                            {offers.length > 1 &&
                              index > 0 &&
                              renderDifference(offer.laycanStart, offers[0].laycanStart, "date")}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Cargo Type */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Cargo Type</td>
                      {offersWithScores.map((offer) => (
                        <td key={`cargo-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          {offer.cargoType || "N/A"}
                        </td>
                      ))}
                    </tr>

                    {/* Cargo Quantity */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Cargo Quantity</td>
                      {offersWithScores.map((offer) => (
                        <td key={`quantity-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          {offer.cargoQuantity ? `${offer.cargoQuantity.toLocaleString()} ${offer.cargoUnit}` : "N/A"}
                        </td>
                      ))}
                    </tr>

                    {/* Charterer */}
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Charterer</td>
                      {offersWithScores.map((offer) => (
                        <td key={`charterer-${offer.id}`} className="px-4 py-3 text-sm text-center">
                          {offer.charterer || "N/A"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
