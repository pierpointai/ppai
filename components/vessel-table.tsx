"use client"
import React, { useMemo, useCallback, useState } from "react"
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VesselTableProps {
  vessels: Offer[]
  selectedVessels?: Set<string>
  onSelectVessel?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
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

// Memoized vessel card component to prevent unnecessary re-renders
const VesselCard = React.memo(
  ({
    offer,
    index,
    isSelected,
    comparing,
    favorite,
    highPriority,
    onSelectVessel,
    onView,
    onCopy,
    onSend,
    onToggleFavorite,
    onToggleCompare,
    onEdit,
    onDelete,
    showRank,
    showMatchScore,
  }: {
    offer: Offer
    index: number
    isSelected: boolean
    comparing: boolean
    favorite: boolean
    highPriority: boolean
    onSelectVessel?: (id: string, selected: boolean) => void
    onView: (offer: Offer) => void
    onCopy: (id: string) => void
    onSend: (id: string) => void
    onToggleFavorite: (offer: Offer) => void
    onToggleCompare?: (offer: Offer) => void
    onEdit?: (offer: Offer) => void
    onDelete?: (id: string) => void
    showRank?: boolean
    showMatchScore?: boolean
  }) => {
    // Memoize status badge to prevent recreation
    const statusBadge = useMemo(() => {
      switch (offer.status) {
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
    }, [offer.status])

    // Memoize display values
    const displayValues = useMemo(
      () => ({
        vesselName: offer.vesselName || "N/A",
        vesselType: offer.vesselType || "N/A",
        vesselSize: offer.vesselSize || "N/A",
        vesselFlag: offer.vesselFlag || "N/A",
        imo: offer.imo || "N/A",
        vesselAge: offer.vesselAge ? new Date().getFullYear() - offer.vesselAge : "N/A",
        openPort: offer.openPort || "N/A",
        nextPort: offer.nextPort || "N/A",
        openDates: offer.openDates || "N/A",
        lastCargo: offer.lastCargo || "N/A",
        freightRate: offer.freightRate ? `$${offer.freightRate}${offer.rateUnit || ""}` : "N/A",
        commission: offer.commission ? `${offer.commission}%` : "N/A",
        brokerName: offer.brokerName || "N/A",
        company: offer.company || "N/A",
      }),
      [offer],
    )

    // Memoized event handlers
    const handleSelectChange = useCallback(
      (checked: boolean) => {
        onSelectVessel?.(offer.id, checked)
      },
      [offer.id, onSelectVessel],
    )

    const handleView = useCallback(() => {
      onView(offer)
    }, [offer, onView])

    const handleCopy = useCallback(() => {
      onCopy(offer.id)
    }, [offer.id, onCopy])

    const handleSend = useCallback(() => {
      onSend(offer.id)
    }, [offer.id, onSend])

    const handleToggleFavorite = useCallback(() => {
      onToggleFavorite(offer)
    }, [offer, onToggleFavorite])

    const handleToggleCompare = useCallback(() => {
      onToggleCompare?.(offer)
    }, [offer, onToggleCompare])

    const handleEdit = useCallback(() => {
      onEdit?.(offer)
    }, [offer, onEdit])

    const handleDelete = useCallback(() => {
      onDelete?.(offer.id)
    }, [offer.id, onDelete])

    return (
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-sm",
          isSelected && "ring-1 ring-blue-200 dark:ring-blue-800 bg-blue-50/30 dark:bg-blue-900/10",
          comparing && "ring-1 ring-slate-300 dark:ring-slate-600",
          highPriority && "border-l-2 border-l-blue-600",
          "border border-slate-200 dark:border-slate-700",
        )}
      >
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {onSelectVessel && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelectChange}
                  aria-label={`Select ${displayValues.vesselName}`}
                  className="mt-1"
                />
              )}

              <div className="space-y-2">
                {/* Vessel Name & Status */}
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {displayValues.vesselName}
                  </h3>
                  {favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  {statusBadge}
                  {showRank && (
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  )}
                  {showMatchScore && offer.score && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(offer.score)}% match
                    </Badge>
                  )}
                </div>

                {/* Vessel Specifications */}
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {displayValues.vesselType}
                  </Badge>
                  <span className="font-medium">{displayValues.vesselSize}k DWT</span>
                  <span>•</span>
                  <span>Flag: {displayValues.vesselFlag}</span>
                  <span>•</span>
                  <span>IMO: {displayValues.imo}</span>
                  <span>•</span>
                  <span>Built: {displayValues.vesselAge}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleView}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopy}>
                      <Clipboard className="h-4 w-4" />
                      <span className="sr-only">Copy details</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleSend}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send to client</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send to client</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleFavorite}>
                    <Star className={cn("h-4 w-4 mr-2", favorite && "fill-amber-400 text-amber-400")} />
                    {favorite ? "Remove from favorites" : "Add to favorites"}
                  </DropdownMenuItem>

                  {onToggleCompare && (
                    <DropdownMenuItem onClick={handleToggleCompare}>
                      <Checkbox checked={comparing} className="mr-2" />
                      {comparing ? "Remove from comparison" : "Add to comparison"}
                    </DropdownMenuItem>
                  )}

                  {onEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit vessel
                    </DropdownMenuItem>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
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
                {/* Main Route */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm font-semibold">
                    {displayValues.openPort}
                  </div>
                  <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 relative">
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-2 text-slate-400 text-xs">
                      →
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm font-semibold">
                    {displayValues.nextPort}
                  </div>
                </div>

                {/* Position Details */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Open Dates:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {displayValues.openDates}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Last Cargo:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {displayValues.lastCargo}
                      </span>
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

              <div className="flex flex-col gap-3 flex-1">
                {/* Rate */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Freight Rate</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {displayValues.freightRate}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Commission: {displayValues.commission}
                  </div>
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
                {/* Broker Info */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 flex-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {displayValues.brokerName}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{displayValues.company}</div>
                </div>

                {/* Contact Information */}
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300 break-all">
                          {offer.email}
                        </span>
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
  },
)

VesselCard.displayName = "VesselCard"

// Pagination component
const Pagination = React.memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    totalItems,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    onPageSizeChange: (size: number) => void
    totalItems: number
  }) => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Show</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>of {totalItems} vessels</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {startItem}-{endItem} of {totalItems}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  },
)

Pagination.displayName = "Pagination"

export const VesselTable = React.memo(
  ({
    vessels,
    selectedVessels = new Set(),
    onSelectVessel,
    onSelectAll,
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
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)

    // Memoize expensive calculations
    const { paginatedVessels, totalPages, totalItems } = useMemo(() => {
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginated = vessels.slice(startIndex, endIndex)

      return {
        paginatedVessels: paginated,
        totalPages: Math.ceil(vessels.length / pageSize),
        totalItems: vessels.length,
      }
    }, [vessels, currentPage, pageSize])

    // Memoize vessel metadata calculations
    const vesselMetadata = useMemo(() => {
      const compareOfferIds = new Set(compareOffers.map((o) => o.id))

      return paginatedVessels.map((offer) => ({
        id: offer.id,
        isComparing: compareOfferIds.has(offer.id),
        isFavorite: offer.category === "Favorites",
        isHighPriority: offer.score && offer.score > 0.85,
      }))
    }, [paginatedVessels, compareOffers])

    // Reset to first page when vessels change
    React.useEffect(() => {
      setCurrentPage(1)
    }, [vessels.length])

    // Memoized event handlers
    const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
      setPageSize(size)
      setCurrentPage(1) // Reset to first page when changing page size
    }, [])

    // Show loading state for empty vessels
    if (vessels.length === 0) {
      return (
        <div className={cn("w-full", className)}>
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No vessels found</p>
          </div>
        </div>
      )
    }

    return (
      <div className={cn("w-full space-y-4", className)}>
        {/* Vessel Cards */}
        <div className="space-y-3">
          {paginatedVessels.map((offer, index) => {
            const metadata = vesselMetadata[index]
            const globalIndex = (currentPage - 1) * pageSize + index

            return (
              <VesselCard
                key={offer.id}
                offer={offer}
                index={showRank ? globalIndex : index}
                isSelected={selectedVessels.has(offer.id)}
                comparing={metadata.isComparing}
                favorite={metadata.isFavorite}
                highPriority={metadata.isHighPriority}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={totalItems}
          />
        )}
      </div>
    )
  },
)

VesselTable.displayName = "VesselTable"
