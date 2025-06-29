"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/offer-utils"
import { cn } from "@/lib/utils"
import {
  Ship,
  Calendar,
  DollarSign,
  ArrowRight,
  Clipboard,
  Send,
  X,
  MapPin,
  Briefcase,
  Anchor,
  Sparkles,
} from "lucide-react"
import type { Offer } from "@/lib/types"

interface ComparisonCardProps {
  offer: Offer
  isPrimary?: boolean
  highlightDifferences?: boolean
  differences?: Record<string, boolean>
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onRemove: (id: string) => void
}

export function ComparisonCard({
  offer,
  isPrimary = false,
  highlightDifferences = false,
  differences = {},
  onCopy,
  onSend,
  onRemove,
}: ComparisonCardProps) {
  // Helper to determine if a field should be highlighted
  const shouldHighlight = (field: string) => highlightDifferences && differences[field]

  return (
    <Card
      className={cn(
        "comparison-card h-full border-2",
        isPrimary ? "border-blue-200 dark:border-blue-900" : "border-gray-200 dark:border-gray-800",
      )}
    >
      <CardHeader
        className={cn(
          "p-3 border-b flex flex-row items-center justify-between space-y-0",
          isPrimary
            ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
            : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              isPrimary
                ? "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
            )}
          >
            <Ship className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-sm">
              {offer.vesselName || `${offer.vesselType} ${offer.vesselSize}k`}
              {isPrimary && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 text-xs"
                >
                  Primary
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span
                className={cn(
                  shouldHighlight("vesselType") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.vesselType}
              </span>
              <span>•</span>
              <span
                className={cn(
                  shouldHighlight("vesselSize") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.vesselSize}k DWT
              </span>
              {offer.vesselFlag && (
                <>
                  <span>•</span>
                  <span
                    className={cn(
                      shouldHighlight("vesselFlag") &&
                        "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                    )}
                  >
                    {offer.vesselFlag}
                  </span>
                </>
              )}
              {offer.vesselAge !== undefined && (
                <>
                  <span>•</span>
                  <span
                    className={cn(
                      shouldHighlight("vesselAge") &&
                        "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                    )}
                  >
                    {offer.vesselAge} yrs
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          onClick={() => onRemove(offer.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove from comparison</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Cargo Section */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Cargo Details</h4>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div
              className={cn(
                "text-sm",
                shouldHighlight("cargoType") &&
                  "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
              )}
            >
              {offer.cargoType || "Not specified"}
            </div>
          </div>
          {offer.cargoQuantity && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
              <span
                className={cn(
                  shouldHighlight("cargoQuantity") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.cargoQuantity.toLocaleString()} {offer.cargoUnit || "MT"}
              </span>
            </div>
          )}
        </div>

        {/* Route Section */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Route Information</h4>
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span
                className={cn(
                  "text-sm",
                  shouldHighlight("loadPort") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.loadPort}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span
                className={cn(
                  "text-sm",
                  shouldHighlight("dischargePort") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.dischargePort}
              </span>
            </div>
          </div>
          {offer.tradeLane && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
              Trade Lane:
              <span
                className={cn(
                  "ml-1",
                  shouldHighlight("tradeLane") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.tradeLane}
              </span>
            </div>
          )}
        </div>

        {/* Laycan Section */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Laycan Window</h4>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div>
              <div
                className={cn(
                  "text-sm",
                  shouldHighlight("laycan") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {formatDate(offer.laycanStart, true)} - {formatDate(offer.laycanEnd, true)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {Math.round((offer.laycanEnd.getTime() - offer.laycanStart.getTime()) / (1000 * 60 * 60 * 24))} days
                window
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Terms Section */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Commercial Terms</h4>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div
              className={cn(
                "text-base font-medium",
                shouldHighlight("freightRate") &&
                  "text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
              )}
            >
              ${offer.freightRate}
              <span
                className={cn(
                  "text-sm font-normal",
                  shouldHighlight("rateUnit") &&
                    "text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.rateUnit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Anchor className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div>
              <span
                className={cn(
                  "text-sm capitalize",
                  shouldHighlight("contractType") &&
                    "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                )}
              >
                {offer.contractType || "Not specified"}
                {offer.contractType && " Charter"}
              </span>
              {offer.contractType === "time" && offer.duration && (
                <span
                  className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 ml-1",
                    shouldHighlight("duration") &&
                      "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                  )}
                >
                  ({offer.duration} days)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Compatibility Score */}
        {offer.score !== undefined && (
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">AI Compatibility</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      offer.score >= 0.85
                        ? "text-green-600 dark:text-green-500"
                        : offer.score >= 0.7
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-blue-600 dark:text-blue-500",
                      shouldHighlight("score") &&
                        "font-medium text-gray-900 dark:text-gray-100 underline decoration-amber-500 decoration-2 underline-offset-2",
                    )}
                  >
                    {Math.round(offer.score * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      offer.score >= 0.85 ? "bg-green-500" : offer.score >= 0.7 ? "bg-amber-500" : "bg-blue-500",
                    )}
                    style={{ width: `${Math.round(offer.score * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onCopy(offer.id)}>
            <Clipboard className="h-3.5 w-3.5 mr-1" />
            Copy
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onSend(offer.id)}>
            <Send className="h-3.5 w-3.5 mr-1" />
            Send to Client
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
