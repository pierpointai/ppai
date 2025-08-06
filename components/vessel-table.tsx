"use client"
import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Star,
  Clipboard,
  Send,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Offer } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useSimplePagination } from "@/hooks/use-simple-pagination"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ActionButton } from "@/components/ui/action-button"
import { SimpleBadge } from "@/components/ui/simple-badge"
import { formatters } from "@/lib/utils/format"

interface VesselTableProps {
  vessels: Offer[]
  selectedVessels?: Set<string>
  onSelectVessel?: (id: string, selected: boolean) => void
  onView: (offer: Offer) => void
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onToggleFavorite: (offer: Offer) => void
  onToggleCompare?: (offer: Offer) => void
  compareOffers?: Offer[]
  onEdit?: (offer: Offer) => void
  onDelete?: (id: string) => void
  showRank?: boolean
  showMatchScore?: boolean
  className?: string
  pageSize?: number
}

const VesselCard = React.memo(({ offer, index, isSelected, comparing, favorite, ...handlers }: any) => {
  const displayData = useMemo(
    () => ({
      vesselName: offer.vesselName || "N/A",
      vesselType: offer.vesselType || "N/A",
      vesselSize: formatters.vessel(offer.vesselSize),
      vesselFlag: offer.vesselFlag || "N/A",
      imo: offer.imo || "N/A",
      vesselAge: offer.vesselAge ? new Date().getFullYear() - offer.vesselAge : "N/A",
      openPort: offer.openPort || "N/A",
      nextPort: offer.nextPort || "N/A",
      openDates: offer.openDates || "N/A",
      lastCargo: offer.lastCargo || "N/A",
      freightRate: offer.freightRate ? formatters.currency(offer.freightRate) + (offer.rateUnit || "") : "N/A",
      commission: offer.commission ? `${offer.commission}%` : "N/A",
      brokerName: offer.brokerName || "N/A",
      company: offer.company || "N/A",
    }),
    [offer],
  )

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-sm border border-slate-200 dark:border-slate-700",
        isSelected && "ring-1 ring-blue-200 dark:ring-blue-800 bg-blue-50/30 dark:bg-blue-900/10",
        comparing && "ring-1 ring-slate-300 dark:ring-slate-600",
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            {handlers.onSelectVessel && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handlers.onSelectVessel(offer.id, checked)}
                className="mt-1"
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{displayData.vesselName}</h3>
                {favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                <SimpleBadge type="vesselStatus" value={offer.status} />
                {handlers.showRank && (
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                )}
                {handlers.showMatchScore && offer.score && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(offer.score)}% match
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <Badge variant="secondary" className="text-xs font-medium">
                  {displayData.vesselType}
                </Badge>
                <span className="font-medium">{displayData.vesselSize}</span>
                <span>•</span>
                <span>Flag: {displayData.vesselFlag}</span>
                <span>•</span>
                <span>IMO: {displayData.imo}</span>
                <span>•</span>
                <span>Built: {displayData.vesselAge}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ActionButton
              icon={<ExternalLink className="h-4 w-4" />}
              tooltip="View details"
              onClick={() => handlers.onView(offer)}
            />
            <ActionButton
              icon={<Clipboard className="h-4 w-4" />}
              tooltip="Copy details"
              onClick={() => handlers.onCopy(offer.id)}
            />
            <ActionButton
              icon={<Send className="h-4 w-4" />}
              tooltip="Send to client"
              onClick={() => handlers.onSend(offer.id)}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlers.onToggleFavorite(offer)}>
                  <Star className={cn("h-4 w-4 mr-2", favorite && "fill-amber-400 text-amber-400")} />
                  {favorite ? "Remove from favorites" : "Add to favorites"}
                </DropdownMenuItem>
                {handlers.onToggleCompare && (
                  <DropdownMenuItem onClick={() => handlers.onToggleCompare(offer)}>
                    <Checkbox checked={comparing} className="mr-2" />
                    {comparing ? "Remove from comparison" : "Add to comparison"}
                  </DropdownMenuItem>
                )}
                {handlers.onEdit && (
                  <DropdownMenuItem onClick={() => handlers.onEdit(offer)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit vessel
                  </DropdownMenuItem>
                )}
                {handlers.onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlers.onDelete(offer.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete vessel
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route & Position */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <MapPin className="h-4 w-4" />
              Route & Position
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm font-semibold">
                  {displayData.openPort}
                </div>
                <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 relative">
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-2 text-slate-400 text-xs">
                    →
                  </span>
                </div>
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm font-semibold">
                  {displayData.nextPort}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Open Dates:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{displayData.openDates}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Last Cargo:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{displayData.lastCargo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Terms */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <Calendar className="h-4 w-4" />
              Commercial Terms
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Freight Rate</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {displayData.freightRate}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Commission: {displayData.commission}
              </div>
            </div>
          </div>

          {/* Broker Contact */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <Phone className="h-4 w-4" />
              Broker Contact
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{displayData.brokerName}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{displayData.company}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                <div className="space-y-2">
                  {offer.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-slate-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{offer.phoneNumber}</span>
                    </div>
                  )}
                  {offer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 break-all">{offer.email}</span>
                    </div>
                  )}
                  {!offer.phoneNumber && !offer.email && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">No contact info available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

VesselCard.displayName = "VesselCard"

export const VesselTable = React.memo(
  ({
    vessels,
    selectedVessels = new Set(),
    onSelectVessel,
    onView,
    onCopy,
    onSend,
    onToggleFavorite,
    onToggleCompare,
    compareOffers = [],
    onEdit,
    onDelete,
    showRank = false,
    showMatchScore = false,
    className,
    pageSize: initialPageSize = 25,
  }: VesselTableProps) => {
    const pagination = useSimplePagination(vessels, initialPageSize)

    const vesselMetadata = useMemo(() => {
      const compareIds = new Set(compareOffers.map((o) => o.id))
      return pagination.paginatedItems.map((offer) => ({
        id: offer.id,
        isComparing: compareIds.has(offer.id),
        isFavorite: offer.category === "Favorites",
      }))
    }, [pagination.paginatedItems, compareOffers])

    if (vessels.length === 0) {
      return (
        <div className={cn("w-full text-center py-12", className)}>
          <p className="text-slate-500 dark:text-slate-400">No vessels found</p>
        </div>
      )
    }

    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="space-y-3">
          {pagination.paginatedItems.map((offer, index) => {
            const metadata = vesselMetadata[index]
            const globalIndex = (pagination.currentPage - 1) * pagination.pageSize + index

            return (
              <VesselCard
                key={offer.id}
                offer={offer}
                index={showRank ? globalIndex : index}
                isSelected={selectedVessels.has(offer.id)}
                comparing={metadata.isComparing}
                favorite={metadata.isFavorite}
                onSelectVessel={onSelectVessel}
                onView={onView}
                onCopy={onCopy}
                onSend={onSend}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                onEdit={onEdit}
                onDelete={onDelete}
                showRank={showRank}
                showMatchScore={showMatchScore}
              />
            )
          })}
        </div>

        <SimplePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>
    )
  },
)

VesselTable.displayName = "VesselTable"
