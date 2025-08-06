"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Send, Eye, Star, StarOff, Anchor } from "lucide-react"
import type { Offer } from "@/lib/types"
import { useOfferStore } from "@/lib/offer-store"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { formatters } from "@/lib/utils/format"
import { getVesselCategoryColor, getAgeColor } from "@/lib/offer-utils"

interface OfferTableProps {
  offers: Offer[]
  onCopy: (id: string) => void
  onSend: (id: string) => void
  onView: (offer: Offer) => void
}

export function OfferTable({ offers, onCopy, onSend, onView }: OfferTableProps) {
  const { toggleCompareOffer, compareOffers, setCategoryForOffer } = useOfferStore()

  const toggleFavorite = useCallback(
    (offer: Offer) => {
      const isFavorite = offer.category === "Favorites"
      setCategoryForOffer(offer.id, isFavorite ? "New Opportunities" : "Favorites")
    },
    [setCategoryForOffer],
  )

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800">
              <TableHead className="w-[50px] text-sm font-medium text-slate-700 dark:text-slate-300">Rank</TableHead>
              <TableHead className="font-medium text-slate-700 dark:text-slate-300">Vessel</TableHead>
              <TableHead className="font-medium text-slate-700 dark:text-slate-300">Route</TableHead>
              <TableHead className="font-medium text-slate-700 dark:text-slate-300">Laycan</TableHead>
              <TableHead className="font-medium text-slate-700 dark:text-slate-300">Rate</TableHead>
              <TableHead className="w-[50px] font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={offers.length > 0 && offers.every((offer) => compareOffers.some((o) => o.id === offer.id))}
                    onCheckedChange={(checked) => {
                      offers.forEach((offer) => {
                        const isComparing = compareOffers.some((o) => o.id === offer.id)
                        if (checked && !isComparing) toggleCompareOffer(offer)
                        if (!checked && isComparing) toggleCompareOffer(offer)
                      })
                    }}
                  />
                </div>
              </TableHead>
              <TableHead className="text-right font-medium text-slate-700 dark:text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer, index) => {
              const isComparing = compareOffers.some((o) => o.id === offer.id)
              const isFavorite = offer.category === "Favorites"

              return (
                <TableRow
                  key={offer.id}
                  className={cn("transition-colors", isComparing && "bg-blue-50/50 dark:bg-blue-900/10")}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1">
                        {offer.vesselType} {offer.vesselSize}k
                        {isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {offer.vesselName}{" "}
                        <span
                          className={cn(
                            "px-1 rounded-sm",
                            offer.vesselAge !== undefined && getAgeColor(offer.vesselAge),
                          )}
                        >
                          ({offer.vesselAge} yrs)
                        </span>
                      </div>
                      {offer.vesselCategory && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs flex items-center gap-1 mt-1 rounded-full",
                            getVesselCategoryColor(offer.vesselCategory),
                          )}
                        >
                          <Anchor className="h-3 w-3" />
                          <span>{offer.vesselCategory}</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <span>{formatters.route(offer.loadPort, offer.dischargePort)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{offer.cargoType}</div>
                  </TableCell>
                  <TableCell>
                    {formatters.date(offer.laycanStart)}–{formatters.date(offer.laycanEnd)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {formatters.currency(offer.freightRate)}
                      {offer.rateUnit}
                    </div>
                    <div className="text-xs text-muted-foreground">{offer.charterer}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox checked={isComparing} onCheckedChange={() => toggleCompareOffer(offer)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(offer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(offer.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSend(offer.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavorite(offer)}>
                        {isFavorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden p-4 text-center text-sm text-muted-foreground">
        Scroll horizontally to view all data
      </div>
    </div>
  )
}
