"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useOfferStore } from "@/lib/offer-store"
import { useCompareStore } from "@/lib/compare-store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Ship, ChevronDown, Loader2, Eye, TrendingUp } from "lucide-react"
import { OfferDetails } from "@/components/offer-details"
import { getVesselCategoryBySize } from "@/lib/offer-utils"
import { getRandomOffer, getRandomOfferForCategory } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { VESSEL_CATEGORIES, CARGO_TYPES, TRADE_LANES } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSheetsVessels } from "@/hooks/use-sheety-vessels"
import { SheetsSyncPanel } from "@/components/sheets-sync-panel"
import { VesselTableNew } from "@/components/vessel-table-new"

interface MetricsBarProps {
  totalOffers: number
  displayedOffers: number
  screenedToday: number
  highPriority: number
  fixedToday: number
  onSubjects: number
}

function MetricsBar({
  totalOffers,
  displayedOffers,
  screenedToday,
  highPriority,
  fixedToday,
  onSubjects,
}: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
            <div className="text-2xl font-semibold">
              {displayedOffers} <span className="text-sm font-normal text-muted-foreground">/ {totalOffers}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Screened Today</p>
            <div className="text-2xl font-semibold">{screenedToday}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Urgent Inquiries</p>
            <div className="text-2xl font-semibold text-red-600">{highPriority}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Fixed Today</p>
            <div className="text-2xl font-semibold text-green-600">{fixedToday}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">On Subjects</p>
            <div className="text-2xl font-semibold text-amber-600">{onSubjects}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Market Update</p>
            <div className="text-lg font-semibold flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              BDI 1,823
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EnhancedDashboard() {
  const { offers, filteredOffers, selectedOffer, selectOffer, setCategoryForOffer, setPriorityForOffer } =
    useOfferStore()

  const { compareOffers, toggleCompareOffer, clearCompareOffers } = useCompareStore()
  const { isLoading: isSheetsLoading, lastSync } = useSheetsVessels()
  const [activeRequests, setActiveRequests] = useState<Array<{ request: any; matchedOffers: any[] }>>([])
  const navigation = useRouter()
  const { addOffer, refreshOffers } = useOfferStore()
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullStartY, setPullStartY] = useState(0)
  const [pullMoveY, setPullMoveY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [searchSheetOpen, setSearchSheetOpen] = useState(false)
  const [sheetsDialogOpen, setSheetsDialogOpen] = useState(false)

  // State for mobile view
  const [viewMode, setViewMode] = useState<"vesselTypes" | "list">("vesselTypes")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"score" | "rate" | "date" | "vessel" | "priority">("priority")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [clientEmailMatcherOpen, setClientEmailMatcherOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("urgent")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string | null>(null)
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string | null>(null)
  const [contractTypeFilter, setContractTypeFilter] = useState<string | null>(null)
  const [chartererFilter, setChartererFilter] = useState<string | null>(null)
  const [initialStatusFilter, setInitialStatusFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [expandedVesselCategories, setExpandedVesselCategories] = useState<Record<string, boolean>>(() => {
    // Initialize with urgent categories expanded
    const initialState: Record<string, boolean> = {}
    VESSEL_CATEGORIES.forEach((category) => {
      initialState[category] = false
    })
    return initialState
  })

  // Calculate metrics for broker dashboard
  const metrics = useMemo(() => {
    const today = new Date().toDateString()
    const urgentOffers = filteredOffers.filter((o) => o.priority === "urgent").length
    const fixedToday = filteredOffers.filter(
      (o) => o.category === "Fixed" && o.lastUpdated && new Date(o.lastUpdated).toDateString() === today,
    ).length
    const onSubjects = filteredOffers.filter((o) => o.category === "On Subjects").length
    const screenedToday = Math.floor(Math.random() * 25) + 15 // Mock data

    return {
      totalOffers: offers.length,
      displayedOffers: filteredOffers.length,
      screenedToday,
      highPriority: urgentOffers,
      fixedToday,
      onSubjects,
    }
  }, [offers, filteredOffers])

  // Group offers by vessel category
  const offersByVesselCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredOffers> = {}

    // First, ensure all vessel categories are represented, even if empty
    VESSEL_CATEGORIES.forEach((category) => {
      grouped[category] = []
    })

    // Then add offers to their respective categories
    filteredOffers.forEach((offer) => {
      const category = offer.vesselCategory || "Uncategorized"

      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(offer)
    })

    return grouped
  }, [filteredOffers])

  // Toggle vessel category expansion
  const toggleVesselCategoryExpansion = (category: string) => {
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5)
    }

    setExpandedVesselCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Handle adding a sample offer
  const handleAddSampleOffer = () => {
    setIsLoading(true)

    try {
      setTimeout(() => {
        const newOffer = getRandomOffer()

        // Ensure vessel category is correctly set based on size
        newOffer.vesselCategory = getVesselCategoryBySize(newOffer.vesselSize)
        // Make sure vesselType matches the category
        newOffer.vesselType = newOffer.vesselCategory

        // Add dry cargo specific fields
        newOffer.contractType = ["voyage", "time", "coa"][Math.floor(Math.random() * 3)] as any
        newOffer.cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
        newOffer.tradeLane = TRADE_LANES[Math.floor(Math.random() * TRADE_LANES.length)]
        const MARKET_SEGMENTS = ["Major Bulks", "Minor Bulks", "Containers", "Gas", "Oil"]
        newOffer.marketSegment = MARKET_SEGMENTS[Math.floor(Math.random() * MARKET_SEGMENTS.length)]
        newOffer.bdiComparison = Math.floor(Math.random() * 40) - 20 // -20% to +20%

        if (newOffer.contractType === "voyage") {
          newOffer.freightTotal = Math.round(newOffer.freightRate * newOffer.vesselSize * 1000)
          newOffer.demurrage = Math.round(newOffer.freightRate * 0.8)
          newOffer.loadRate = Math.round(8000 + Math.random() * 7000)
          newOffer.dischargeRate = Math.round(10000 + Math.random() * 10000)
          newOffer.laydays = Math.round(3 + Math.random() * 5)
        } else if (newOffer.contractType === "time") {
          newOffer.duration = Math.round(30 + Math.random() * 335) // 1-12 months
          newOffer.rateUnit = "k/day"
        } else {
          newOffer.duration = Math.round(90 + Math.random() * 275) // 3-12 months
          newOffer.cargoQuantity = Math.round(newOffer.vesselSize * 1000 * (2 + Math.random() * 10))
        }

        addOffer(newOffer)

        toast({
          title: "New vessel added",
          description: "A new vessel has been added to your inventory.",
        })

        setIsLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error adding sample offer:", error)
      toast({
        title: "Error",
        description: "Failed to add sample vessel. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Initialize with sample data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true)
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add sample offers if none exist
      if (offers.length === 0) {
        // Add a balanced distribution of vessels across all categories
        const categoriesToAdd = {
          Handysize: 5,
          "Handymax/Supramax": 5,
          Panamax: 4,
          Kamsarmax: 4,
          "Post-Panamax": 3,
          Capesize: 3,
          VLOC: 2,
        }

        // Add vessels for each category
        for (const [category, count] of Object.entries(categoriesToAdd)) {
          for (let i = 0; i < count; i++) {
            const newOffer = getRandomOfferForCategory(category)

            // Ensure vessel type matches category
            newOffer.vesselType = category

            // Add dry cargo specific fields
            newOffer.contractType = ["voyage", "time", "coa"][Math.floor(Math.random() * 3)] as any
            newOffer.cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
            newOffer.tradeLane = TRADE_LANES[Math.floor(Math.random() * TRADE_LANES.length)]
            const MARKET_SEGMENTS = ["Major Bulks", "Minor Bulks", "Containers", "Gas", "Oil"]
            newOffer.marketSegment = MARKET_SEGMENTS[Math.floor(Math.random() * MARKET_SEGMENTS.length)]
            newOffer.bdiComparison = Math.floor(Math.random() * 40) - 20 // -20% to +20%

            if (newOffer.contractType === "voyage") {
              newOffer.freightTotal = Math.round(newOffer.freightRate * newOffer.vesselSize * 1000)
              newOffer.demurrage = Math.round(newOffer.freightRate * 0.8)
              newOffer.loadRate = Math.round(8000 + Math.random() * 7000)
              newOffer.dischargeRate = Math.round(10000 + Math.random() * 10000)
              newOffer.laydays = Math.round(3 + Math.random() * 5)
            } else if (newOffer.contractType === "time") {
              newOffer.duration = Math.round(30 + Math.random() * 335) // 1-12 months
              newOffer.rateUnit = "k/day"
            } else {
              newOffer.duration = Math.round(90 + Math.random() * 275) // 3-12 months
              newOffer.cargoQuantity = Math.round(newOffer.vesselSize * 1000 * (2 + Math.random() * 10))
            }

            addOffer(newOffer)
          }
        }
      }

      setIsInitialLoading(false)
    }

    loadInitialData()
  }, [addOffer, offers.length])

  // Render vessel types view
  const renderVesselTypesView = () => {
    if (isInitialLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className={cn("overflow-hidden", isMobile && "rounded-xl shadow-sm")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {VESSEL_CATEGORIES.map((category) => {
          const vessels = offersByVesselCategory[category] || []
          if (vessels.length === 0) return null

          return (
            <Card
              key={category}
              className={cn(
                "w-full overflow-hidden border border-slate-200 dark:border-slate-800",
                isMobile && "rounded-xl",
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 flex items-center justify-between cursor-pointer",
                  "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200",
                  "hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700",
                )}
                onClick={() => toggleVesselCategoryExpansion(category)}
              >
                <div className="flex items-center">
                  <Ship className="h-5 w-5 mr-2 text-slate-500" />
                  <h3 className="text-base font-medium">
                    {category}{" "}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      ({vessels.length} {vessels.length === 1 ? "vessel" : "vessels"})
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                  >
                    {vessels.length}
                  </Badge>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-600 dark:text-slate-400 transition-transform duration-200",
                      expandedVesselCategories[category] ? "transform rotate-180" : "",
                    )}
                  />
                </div>
              </div>

              <AnimatePresence>
                {expandedVesselCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white dark:bg-gray-950">
                      <VesselTableNew vessels={vessels} onView={selectOffer} onEdit={() => {}} onDelete={() => {}} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleVesselCategoryExpansion(category)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  {expandedVesselCategories[category] ? "Hide" : "Show"} {vessels.length}{" "}
                  {vessels.length === 1 ? "vessel" : "vessels"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("w-full py-4 px-6", isMobile && "px-4 pb-4")} ref={scrollRef}>
      {selectedOffer ? (
        <div>
          <OfferDetails
            offer={selectedOffer}
            onBack={() => selectOffer(null)}
            onCopy={() => {}}
            onSend={() => {}}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Metrics Bar */}
          <MetricsBar {...metrics} />

          {/* Vessel Inventory Section */}
          <section aria-labelledby="vessel-inventory-heading">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2
                  id="vessel-inventory-heading"
                  className={cn("text-xl font-semibold flex items-center", isMobile && "text-lg")}
                >
                  Vessel Inventory
                  <Badge variant="outline" className="ml-2 font-normal">
                    {filteredOffers.length} vessels
                  </Badge>
                </h2>
              </div>
            </div>

            {/* Data Integration Section */}
            <div className="mb-4">
              <SheetsSyncPanel onAddVessel={() => {}} isAddingVessel={isLoading} />
            </div>

            {/* Vessel List */}
            {filteredOffers.length === 0 && !isInitialLoading ? (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ship className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No vessels found</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    No vessels match your current filters. Try adjusting your search criteria or add some sample
                    vessels.
                  </p>
                  <Button
                    onClick={handleAddSampleOffer}
                    disabled={isLoading}
                    className={isMobile ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Add Sample Vessel"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>{renderVesselTypesView()}</>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
