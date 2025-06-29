"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useOfferStore } from "@/lib/offer-store"
import { useCompareStore } from "@/lib/compare-store"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Ship, Mail, RefreshCw, ChevronDown, Loader2, Search, Eye, TrendingUp } from "lucide-react"
import { OfferDetails } from "@/components/offer-details"
import { ClientRequestCard } from "@/components/client-request-card"
import { formatDate, getVesselCategoryBySize } from "@/lib/offer-utils"
import { getRandomOffer, getRandomOfferForCategory, MOCK_CLIENTS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VESSEL_CATEGORIES, CARGO_TYPES, TRADE_LANES, FLAGS } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import type { Offer } from "@/lib/types"
import { useRouter } from "next/navigation"
import { ClientEmailMatcher } from "@/components/client-email-matcher"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
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

  // Pull to refresh functionality
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollRef.current && scrollRef.current.scrollTop === 0) {
        setPullStartY(e.touches[0].clientY)
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isPulling && pullStartY > 0) {
        setPullMoveY(e.touches[0].clientY - pullStartY)

        if (pullMoveY > 0) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = () => {
      if (pullMoveY > 70) {
        handleRefresh()
      }

      setPullStartY(0)
      setPullMoveY(0)
      setIsPulling(false)
    }

    const content = scrollRef.current
    if (content) {
      content.addEventListener("touchstart", handleTouchStart, { passive: true })
      content.addEventListener("touchmove", handleTouchMove, { passive: false })
      content.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      if (content) {
        content.removeEventListener("touchstart", handleTouchStart)
        content.removeEventListener("touchmove", handleTouchMove)
        content.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isMobile, isPulling, pullStartY, pullMoveY])

  // Handle refresh with realistic broker data
  const handleRefresh = () => {
    setIsRefreshing(true)

    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    // Add realistic vessel positions
    handleAddRealisticVessels()

    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  // Add realistic vessels for broker operations
  const handleAddRealisticVessels = () => {
    setIsLoading(true)

    setTimeout(() => {
      // Add vessels across different categories with realistic distribution
      const vesselDistribution = {
        Capesize: 8,
        Kamsarmax: 12,
        Panamax: 10,
        Supramax: 15,
        Handysize: 8,
      }

      for (const [category, count] of Object.entries(vesselDistribution)) {
        for (let i = 0; i < count; i++) {
          const newOffer = getRandomOfferForCategory(category)

          // Set realistic broker priorities
          if (Math.random() > 0.8) newOffer.priority = "urgent"
          else if (Math.random() > 0.6) newOffer.priority = "firm"
          else newOffer.priority = "indication"

          // Set realistic deal stages
          const stages = ["New Inquiries", "Firm Offers", "Under Negotiation", "On Subjects", "Fixed"]
          newOffer.category = stages[Math.floor(Math.random() * stages.length)]

          // Add realistic subjects for deals in progress
          if (newOffer.category === "On Subjects") {
            newOffer.subjects = [
              "Stem/Details",
              "Charterer's Approval",
              Math.random() > 0.5 ? "Vessel Inspection" : "Port Approval",
            ].filter(Boolean)
          }

          addOffer(newOffer)
        }
      }

      toast({
        title: "Market positions updated",
        description: `Added ${Object.values(vesselDistribution).reduce((a, b) => a + b, 0)} new vessel positions.`,
      })

      setIsLoading(false)
    }, 800)
  }

  // Add this function at the beginning of the EnhancedDashboard component, right after the destructured useOfferStore hooks
  const forceRefreshAllVessels = () => {
    setIsLoading(true)

    try {
      // Clear existing offers from the store
      const { clearOffers } = useOfferStore.getState()
      clearOffers()

      // Wait a moment to ensure state is updated
      setTimeout(() => {
        // Add a balanced distribution of vessels across all categories
        const categoriesToAdd = {
          Handysize: 20,
          "Handymax/Supramax": 20,
          Panamax: 18,
          Kamsarmax: 18,
          "Post-Panamax": 16,
          Capesize: 16,
          VLOC: 14,
        }

        // Add vessels for each category
        for (const [category, count] of Object.entries(categoriesToAdd)) {
          for (let i = 0; i < count; i++) {
            try {
              const newOffer = getRandomOfferForCategory(category)

              // Ensure vessel type matches category
              newOffer.vesselType = category

              // Add dry cargo specific fields
              newOffer.contractType = ["voyage", "time", "coa"][Math.floor(Math.random() * 3)]
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

              // Assign to different categories for the kanban view
              const categories = [
                "New Inquiries",
                "Active Negotiations",
                "Countered",
                "On Subs",
                "Subject Lifted",
                "Fixed",
                "Failed",
              ]
              newOffer.category = categories[Math.floor(Math.random() * categories.length)]

              addOffer(newOffer)
            } catch (error) {
              console.error(`Error adding ${category} vessel:`, error)
            }
          }
        }

        // Make sure all categories are expanded
        const initialExpandedState: Record<string, boolean> = {}
        VESSEL_CATEGORIES.forEach((category) => {
          initialExpandedState[category] = false // Keep collapsed after refresh
        })
        setExpandedVesselCategories(initialExpandedState)

        toast({
          title: "Vessels refreshed",
          description: `Added ${Object.values(categoriesToAdd).reduce((a, b) => a + b, 0)} vessels to the dashboard.`,
        })

        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error refreshing vessels:", error)
      toast({
        title: "Error",
        description: "Failed to refresh vessels. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Handle adding a vessel manually
  const [isAddVesselDialogOpen, setIsAddVesselDialogOpen] = useState(false)
  const [isEditVesselDialogOpen, setIsEditVesselDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentVessel, setCurrentVessel] = useState<Offer | null>(null)
  const [newVesselData, setNewVesselData] = useState<Partial<any>>({
    vesselname: "",
    type: "Handysize",
    dwt: 32,
    built: new Date().getFullYear() - 10,
    flag: "Panama",
    openport: "",
    opendates: "",
    nextport: "",
    lastcargo: "",
    ballast: "no",
    laden: "no",
    freightrate: 15,
    commission: 2.5,
    imo: "",
    brokername: "",
    company: "",
    phonenumber: "",
    email: "",
  })

  const handleAddVesselManually = () => {
    if (!newVesselData.vesselname || !newVesselData.openport) {
      toast({
        title: "Missing information",
        description: "Please fill in vessel name and open port.",
        variant: "destructive",
      })
      return
    }

    // Transform the sheet data format to internal offer format
    const vesselToAdd: Offer = {
      id: Math.random().toString(36).substring(2, 9),
      vesselName: newVesselData.vesselname,
      vesselType: newVesselData.type || "Handysize",
      vesselSize: newVesselData.dwt || 32,
      vesselAge: newVesselData.built ? new Date().getFullYear() - newVesselData.built : 10,
      vesselFlag: newVesselData.flag || "Panama",
      openPort: newVesselData.openport,
      openDates: newVesselData.opendates || "",
      nextPort: newVesselData.nextport || "",
      lastCargo: newVesselData.lastcargo || "",
      freightRate: newVesselData.freightrate || 15,
      commission: newVesselData.commission || 2.5,
      imo: newVesselData.imo || "",
      brokerName: newVesselData.brokername || "",
      company: newVesselData.company || "",
      phoneNumber: newVesselData.phonenumber || "",
      email: newVesselData.email || "",
      ballast: newVesselData.ballast === "yes",
      laden: newVesselData.laden === "yes",
      loadPort: newVesselData.openport,
      dischargePort: newVesselData.nextport || "",
      laycanStart: new Date(),
      laycanEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      vesselCategory: getVesselCategoryBySize(newVesselData.dwt || 32),
      score: Math.random() * 0.3 + 0.7,
      confidenceScore: 1,
      rateUnit: "k/day",
      cargoType: newVesselData.lastcargo || "Grain",
      status: newVesselData.ballast === "yes" ? "ballast" : newVesselData.laden === "yes" ? "laden" : "available",
      contractType: "voyage",
      tradeLane: `${newVesselData.openport} - ${newVesselData.nextport || "TBN"}`,
      marketSegment: "Major Bulks",
      category: "New Inquiries",
      priority: "medium",
      lastUpdated: new Date(),
      charterer: "",
      bdiComparison: 0,
      freightTotal: (newVesselData.freightrate || 15) * (newVesselData.dwt || 32) * 1000,
      demurrage: (newVesselData.freightrate || 15) * 0.8,
      loadRate: 10000,
      dischargeRate: 12000,
      laydays: 5,
      duration: 30,
      cargoQuantity: (newVesselData.dwt || 32) * 1000,
    } as Offer

    addOffer(vesselToAdd)
    setIsAddVesselDialogOpen(false)

    // Reset form
    setNewVesselData({
      vesselname: "",
      type: "Handysize",
      dwt: 32,
      built: new Date().getFullYear() - 10,
      flag: "Panama",
      openport: "",
      opendates: "",
      nextport: "",
      lastcargo: "",
      ballast: "no",
      laden: "no",
      freightrate: 15,
      commission: 2.5,
      imo: "",
      brokername: "",
      company: "",
      phonenumber: "",
      email: "",
    })

    toast({
      title: "Vessel added",
      description: `${vesselToAdd.vesselName} has been added to your inventory.`,
    })
  }

  const handleEditVessel = () => {
    if (!currentVessel) return

    if (!currentVessel.vesselName || !currentVessel.loadPort || !currentVessel.dischargePort) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Get the updateOffer function from the store
    const { updateOffer } = useOfferStore.getState()

    // Update the vessel
    updateOffer(currentVessel.id, currentVessel)

    setIsEditVesselDialogOpen(false)
    setCurrentVessel(null)

    toast({
      title: "Vessel updated",
      description: `${currentVessel.vesselName} has been updated.`,
    })
  }

  const handleDeleteVessel = (id: string) => {
    // Find the vessel to delete
    const vesselToDelete = offers.find((o) => o.id === id)
    if (!vesselToDelete) return

    setCurrentVessel(vesselToDelete)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteVessel = () => {
    if (!currentVessel) return

    // Get the removeOffer function from the store
    const { removeOffer } = useOfferStore.getState()

    // Delete the vessel
    removeOffer(currentVessel.id)

    setIsDeleteAlertOpen(false)
    setCurrentVessel(null)

    toast({
      title: "Vessel deleted",
      description: `${currentVessel.vesselName || "Vessel"} has been removed from your inventory.`,
    })
  }

  // Add this state inside the EnhancedDashboard component with the other state declarations

  // Email matching state
  const [emailContent, setEmailContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const [matchedOffers, setMatchedOffers] = useState<Array<{ offer: Offer; matchScore: number }>>([])
  const [requirements, setRequirements] = useState<Record<string, any> | null>(null)
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set())
  const [emailMatchView, setEmailMatchView] = useState<"input" | "results">("input")

  const [isExpanded, setIsExpanded] = useState(true)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [regionFilter, setRegionFilter] = useState<string | null>(null)
  const [tradeLaneFilter, setTradeLaneFilter] = useState<string | null>(null)
  const [marketSegmentFilter, setMarketSegmentFilter] = useState<string | null>(null)
  const [laycanPeriodFilter, setLaycanPeriodFilter] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean }[]>([
    {
      id: "1",
      title: "New market report available",
      message: "The weekly dry bulk market report is now available for download.",
      read: false,
    },
    {
      id: "2",
      title: "BDI update",
      message: "Baltic Dry Index increased by 3.2% today to 1,823 points.",
      read: true,
    },
    {
      id: "3",
      title: "New vessel position",
      message: "MV Atlantic Eagle will be open in Singapore on June 15.",
      read: true,
    },
  ])
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Freight Rates by Vessel Type",
        data: [],
        backgroundColor: [],
      },
    ],
  })
  const [vesselDistribution, setVesselDistribution] = useState({
    labels: [],
    datasets: [
      {
        label: "Vessel Distribution",
        data: [],
        backgroundColor: [],
      },
    ],
  })
  const [cargoDistribution, setCargoDistribution] = useState({
    labels: [],
    datasets: [
      {
        label: "Cargo Distribution",
        data: [],
        backgroundColor: [],
      },
    ],
  })
  const [tradeLaneData, setTradeLaneData] = useState({
    labels: [],
    datasets: [
      {
        label: "Trade Lane Activity",
        data: [],
        backgroundColor: [],
      },
    ],
  })
  const [bdiComparisonData, setBdiComparisonData] = useState({
    labels: [],
    datasets: [
      {
        label: "Rate vs BDI (%)",
        data: [],
        backgroundColor: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  })
  const [bdiTrendData, setBdiTrendData] = useState({
    labels: ["May 1", "May 8", "May 15", "May 22", "May 29", "Jun 5", "Jun 12"],
    datasets: [
      {
        label: "BDI",
        data: [1650, 1720, 1680, 1750, 1820, 1790, 1823],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Cape T/C Avg",
        data: [18500, 19200, 18700, 19500, 20100, 19800, 20300],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Panamax T/C Avg",
        data: [14200, 14800, 14500, 15100, 15600, 15400, 15800],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  })

  const { theme } = useTheme()

  // Sample client email for demo
  const sampleEmail = `From: client@example.com
Subject: Vessel Requirements

Hi,

We are looking for a Supramax vessel, around 55-60k DWT for a grain cargo.
Route: US Gulf to China
Laycan: June 15-25
Budget: Around $18-20k/day

Please let me know if you have any suitable vessels.

Thanks,
John`

  const handleUseSample = () => {
    setEmailContent(sampleEmail)
  }

  const simulateProcessing = async () => {
    setProcessingProgress(0)
    setProcessingStatus("Analyzing client email...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(20)
    setProcessingStatus("Extracting vessel requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(40)
    setProcessingStatus("Identifying route preferences...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(60)
    setProcessingStatus("Parsing date requirements...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(80)
    setProcessingStatus("Analyzing budget constraints...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    setProcessingProgress(100)
    setProcessingStatus("Finding matching offers...")
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const extractRequirements = (email: string) => {
    // In a real app, this would use NLP to extract requirements
    // For this demo, we'll use simple regex patterns

    // Extract vessel type
    const vesselTypeMatch = email.match(/(?:looking for|need|require|want).*?(\w+max|\w+size)(?:\s+vessel)?/i)
    const vesselType = vesselTypeMatch ? vesselTypeMatch[1] : null

    // Extract vessel size
    const vesselSizeMatch = email.match(/(\d+)(?:-(\d+))?\s*k\s*(?:DWT|dwt)/i)
    const vesselSizeMin = vesselSizeMatch ? Number.parseInt(vesselSizeMatch[1]) : null
    const vesselSizeMax =
      vesselSizeMatch && vesselSizeMatch[2]
        ? Number.parseInt(vesselSizeMatch[2])
        : vesselSizeMin
          ? vesselSizeMin + 10
          : null

    // Extract route
    const routeMatch = email.match(
      /(?:route|from|voyage)(?:\s*:\s*|\s+)([A-Za-z\s]+)(?:\s+to\s+|\s*-\s*|\s*\/\s*)([A-Za-z\s]+)/i,
    )
    const loadPort = routeMatch ? routeMatch[1].trim() : null
    const dischargePort = routeMatch ? routeMatch[2].trim() : null

    // Extract laycan
    const laycanMatch = email.match(
      /(?:laycan|dates|date|period)(?:\s*:\s*|\s+)(?:[A-Za-z]+\s+)?(\d+)(?:\s*-\s*|\s+to\s+)(?:[A-Za-z]+\s+)?(\d+)/i,
    )
    const laycanStart = laycanMatch ? Number.parseInt(laycanMatch[1]) : null
    const laycanEnd = laycanMatch ? Number.parseInt(laycanMatch[2]) : null

    // Extract month
    const monthMatch = email.match(
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
    )
    const month = monthMatch ? monthMatch[0] : "June" // Default to current month

    // Extract budget/rate
    const rateMatch = email.match(
      /(?:budget|rate|price)(?:\s*:\s*|\s+)(?:\$|USD)?\s*(\d+)(?:\.?\d*)?(?:\s*-\s*|\s+to\s+)(?:\$|USD)?\s*(\d+)(?:\.?\d*)?(?:\s*k)?(?:\/day)?/i,
    )
    const rateMin = rateMatch ? Number.parseFloat(rateMatch[1]) : null
    const rateMax = rateMatch ? Number.parseFloat(rateMatch[2]) : null

    // Extract cargo type
    const cargoMatch = email.match(/(?:cargo|commodity)(?:\s*:\s*|\s+)([A-Za-z\s]+)(?:,|\.|$)/i)
    const cargoType = cargoMatch ? cargoMatch[1].trim() : null

    return {
      vesselType,
      vesselSizeMin,
      vesselSizeMax,
      loadPort,
      dischargePort,
      laycanStart,
      laycanEnd,
      month,
      rateMin,
      rateMax,
      cargoType,
    }
  }

  const matchOffers = (requirements: Record<string, any>, availableOffers: Offer[]) => {
    // Calculate match score for each offer
    const matchedOffers = availableOffers.map((offer) => {
      let matchScore = 0
      let totalFactors = 0

      // Match vessel type (25%)
      if (requirements.vesselType && offer.vesselType) {
        totalFactors += 25
        if (offer.vesselType.toLowerCase().includes(requirements.vesselType.toLowerCase())) {
          matchScore += 25
        }
      }

      // Match vessel size (20%)
      if (requirements.vesselSizeMin && requirements.vesselSizeMax && offer.vesselSize) {
        totalFactors += 20
        if (offer.vesselSize >= requirements.vesselSizeMin && offer.vesselSize <= requirements.vesselSizeMax) {
          matchScore += 20
        } else if (
          offer.vesselSize >= requirements.vesselSizeMin * 0.9 &&
          offer.vesselSize <= requirements.vesselSizeMax * 1.1
        ) {
          // Close match
          matchScore += 10
        }
      }

      // Match route (20%)
      if (requirements.loadPort && requirements.dischargePort) {
        totalFactors += 20
        const loadPortMatch =
          offer.loadPort.toLowerCase().includes(requirements.loadPort.toLowerCase()) ||
          requirements.loadPort.toLowerCase().includes(offer.loadPort.toLowerCase())
        const dischargePortMatch =
          offer.dischargePort.toLowerCase().includes(requirements.dischargePort.toLowerCase()) ||
          requirements.dischargePort.toLowerCase().includes(offer.dischargePort.toLowerCase())

        if (loadPortMatch && dischargePortMatch) {
          matchScore += 20
        } else if (loadPortMatch || dischargePortMatch) {
          matchScore += 10
        }
      }

      // Match laycan (15%)
      if (requirements.laycanStart && requirements.laycanEnd && requirements.month) {
        totalFactors += 15

        // Convert requirements to dates
        const currentYear = new Date().getFullYear()
        const monthIndex = new Date(Date.parse(`${requirements.month} 1, ${currentYear}`)).getMonth()
        const reqLaycanStart = new Date(currentYear, monthIndex, requirements.laycanStart)
        const reqLaycanEnd = new Date(currentYear, monthIndex, requirements.laycanEnd)

        // Check if offer laycan overlaps with required laycan
        const laycanOverlap = !(offer.laycanEnd < reqLaycanStart || offer.laycanStart > reqLaycanEnd)

        if (laycanOverlap) {
          matchScore += 15
        } else {
          // Check if it's close (within 5 days)
          const daysBefore = (reqLaycanStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
          const daysAfter = (offer.laycanStart.getTime() - reqLaycanEnd.getTime()) / (1000 * 3600 * 24)

          if ((daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)) {
            matchScore += 7
          }
        }
      }

      // Match rate (20%)
      if (requirements.rateMin && requirements.rateMax && offer.freightRate) {
        totalFactors += 20
        if (offer.freightRate >= requirements.rateMin && offer.freightRate <= requirements.rateMax) {
          matchScore += 20
        } else if (offer.freightRate >= requirements.rateMin * 0.9 && offer.freightRate <= requirements.rateMax * 1.1) {
          // Close match
          matchScore += 10
        }
      }

      // Normalize score if we have requirements
      const normalizedScore = totalFactors > 0 ? (matchScore / totalFactors) * 100 : 0

      return {
        offer,
        matchScore: normalizedScore,
      }
    })

    // Sort by match score (descending)
    return matchedOffers.sort((a, b) => b.matchScore - a.matchScore)
  }

  const handleProcessEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "No content to process",
        description: "Please enter client email content or use the sample.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setMatchedOffers([])
    setSelectedOffers(new Set())

    try {
      // Simulate AI processing with visual feedback
      await simulateProcessing()

      // Extract requirements from email
      const extractedRequirements = extractRequirements(emailContent)
      setRequirements(extractedRequirements)

      // Match offers against requirements
      const matches = matchOffers(extractedRequirements, offers)

      // Filter to show only reasonable matches (>30%)
      const goodMatches = matches.filter((match) => match.matchScore > 30)
      setMatchedOffers(goodMatches)

      if (goodMatches.length === 0) {
        toast({
          title: "No matching offers found",
          description: "Try adjusting the client requirements or adding more offers.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Matching complete",
          description: `Found ${goodMatches.length} matching offers for this client.`,
        })
        setEmailMatchView("results")
      }
    } catch (error) {
      console.error("Error processing email:", error)
      toast({
        title: "Error processing email",
        description: "An error occurred while analyzing the client email.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStatus("")
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 dark:text-green-400"
    if (score >= 60) return "text-amber-700 dark:text-amber-400"
    if (score >= 40) return "text-blue-700 dark:text-blue-400"
    return "text-gray-700 dark:text-gray-400"
  }

  const toggleOfferSelection = (offerId: string) => {
    const newSelected = new Set(selectedOffers)
    if (newSelected.has(offerId)) {
      newSelected.delete(offerId)
    } else {
      newSelected.add(offerId)
    }
    setSelectedOffers(newSelected)
  }

  const compareSelectedOffers = () => {
    // Clear any existing comparison
    clearCompareOffers()

    // Add all selected offers to comparison
    matchedOffers
      .filter(({ offer }) => selectedOffers.has(offer.id))
      .forEach(({ offer }) => {
        toggleCompareOffer(offer)
      })

    // Show success message
    toast({
      title: "Comparison Ready",
      description: `${selectedOffers.size} vessels added to comparison view.`,
    })

    // Navigate to the comparison page
    navigation.push("/comparison")
  }

  const selectAllOffers = () => {
    const allIds = matchedOffers.map(({ offer }) => offer.id)
    setSelectedOffers(new Set(allIds))
  }

  const deselectAllOffers = () => {
    setSelectedOffers(new Set())
  }

  // Initialize expanded vessel categories
  useEffect(() => {
    if (!isInitialLoading && filteredOffers.length > 0) {
      // Keep all categories collapsed by default
      const initialExpandedState: Record<string, boolean> = {}
      VESSEL_CATEGORIES.forEach((category) => {
        initialExpandedState[category] = false
      })
      setExpandedVesselCategories(initialExpandedState)
    }
  }, [isInitialLoading, filteredOffers])

  // Pass sidebar props to the AppSidebar component in the layout
  useEffect(() => {
    // Find the AppSidebar component and pass props to it
    const appSidebar = document.querySelector("[data-app-sidebar]")
    if (appSidebar) {
      // This is a workaround since we can't directly pass props to the AppSidebar in the layout
      // In a real app, you'd use a context provider or state management library
      appSidebar.setAttribute("data-view-mode", viewMode)
      appSidebar.setAttribute("data-vessel-filter", vesselTypeFilter || "")
      appSidebar.setAttribute("data-cargo-filter", cargoTypeFilter || "")
      appSidebar.setAttribute("data-contract-filter", contractTypeFilter || "")
    }
  }, [viewMode, vesselTypeFilter, cargoTypeFilter, contractTypeFilter])

  // Add this state inside the EnhancedDashboard component with the other state declarations
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({})

  // Add this function to toggle request expansion (add it near the other toggle functions)
  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }))
  }

  // Add this useEffect after the other useEffect hooks to load client requests and find matches
  useEffect(() => {
    if (offers.length > 0) {
      // Extract all requests from mock clients
      const allRequests = MOCK_CLIENTS.flatMap((client) =>
        (client.requests || [])
          .filter((req) => req.status === "new" || req.status === "processing")
          .map((req) => ({
            ...req,
            clientId: client.id,
            clientName: client.name,
            clientCompany: client.company,
            receivedDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            urgency: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
            emailSubject: req.emailSubject || `Vessel inquiry: ${req.extractedData?.vesselType || "Bulk carrier"}`,
            emailExcerpt: req.emailContent?.substring(0, 120) + "..." || undefined,
          })),
      )

      // Find matching offers for each request
      const requestsWithMatches = allRequests
        .map((request) => {
          const matchedOffers = findMatchingOffers(request, offers)
          return {
            request,
            matchedOffers,
          }
        })
        .filter((item) => item.matchedOffers.length > 0)

      // Sort by number of matches (descending)
      requestsWithMatches.sort((a, b) => b.matchedOffers.length - a.matchedOffers.length)

      // Take top 3 requests with matches
      setActiveRequests(requestsWithMatches.slice(0, 3))
    }
  }, [offers])

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

  // Load client requests
  useEffect(() => {
    if (offers.length > 0) {
      // Extract all requests from mock clients
      const allRequests = MOCK_CLIENTS.flatMap((client) =>
        (client.requests || [])
          .filter((req) => req.status === "new" || req.status === "processing")
          .map((req) => ({
            ...req,
            clientId: client.id,
            clientName: client.name,
            clientCompany: client.company,
            receivedDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            urgency: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
            emailSubject: req.emailSubject || `Vessel inquiry: ${req.extractedData?.vesselType || "Bulk carrier"}`,
            emailExcerpt: req.emailContent?.substring(0, 120) + "..." || undefined,
          })),
      )

      // Find matching offers for each request
      const requestsWithMatches = allRequests
        .map((request) => {
          const matchedOffers = findMatchingOffers(request, offers)
          return {
            request,
            matchedOffers,
          }
        })
        .filter((item) => item.matchedOffers.length > 0)

      // Sort by number of matches (descending)
      requestsWithMatches.sort((a, b) => b.matchedOffers.length - a.matchedOffers.length)

      // Take top 3 requests with matches
      setActiveRequests(requestsWithMatches.slice(0, 3))
    }
  }, [offers])

  // Toggle request expansion

  // Find matching offers for a client request
  const findMatchingOffers = (request: any, availableOffers: Offer[]) => {
    // Calculate match score for each offer
    const matchedOffers = availableOffers.map((offer) => {
      let matchScore = 0
      let totalFactors = 0

      // Match vessel type (25%)
      if (request.vesselType && offer.vesselType) {
        totalFactors += 25
        if (offer.vesselType.toLowerCase().includes(request.vesselType.toLowerCase())) {
          matchScore += 25
        }
      }

      // Match vessel size (20%)
      if (request.sizeMin && request.sizeMax && offer.vesselSize) {
        totalFactors += 20
        if (offer.vesselSize >= request.sizeMin && offer.vesselSize <= request.sizeMax) {
          matchScore += 20
        } else if (offer.vesselSize >= request.sizeMin * 0.9 && offer.vesselSize <= request.sizeMax * 1.1) {
          // Close match
          matchScore += 10
        }
      }

      // Match route (20%)
      if (request.loadPort && request.dischargePort) {
        totalFactors += 20
        const loadPortMatch =
          offer.loadPort.toLowerCase().includes(request.loadPort.toLowerCase()) ||
          request.loadPort.toLowerCase().includes(offer.loadPort.toLowerCase())
        const dischargePortMatch =
          offer.dischargePort.toLowerCase().includes(request.dischargePort.toLowerCase()) ||
          request.dischargePort.toLowerCase().includes(offer.dischargePort.toLowerCase())

        if (loadPortMatch && dischargePortMatch) {
          matchScore += 20
        } else if (loadPortMatch || dischargePortMatch) {
          matchScore += 10
        }
      }

      // Match laycan (15%)
      if (request.laycanFrom && request.laycanTo) {
        totalFactors += 15

        // Convert requirements to dates
        const reqLaycanStart = new Date(request.laycanFrom)
        const reqLaycanEnd = new Date(request.laycanTo)

        // Check if offer laycan overlaps with required laycan
        const laycanOverlap = !(offer.laycanEnd < reqLaycanStart || offer.laycanStart > reqLaycanEnd)

        if (laycanOverlap) {
          matchScore += 15
        } else {
          // Check if it's close (within 5 days)
          const daysBefore = (reqLaycanStart.getTime() - offer.laycanEnd.getTime()) / (1000 * 3600 * 24)
          const daysAfter = (offer.laycanStart.getTime() - reqLaycanEnd.getTime()) / (1000 * 3600 * 24)

          if ((daysBefore > 0 && daysBefore <= 5) || (daysAfter > 0 && daysAfter <= 5)) {
            matchScore += 7
          }
        }
      }

      // Match rate (20%)
      if (request.rateMin && request.rateMax && offer.freightRate) {
        totalFactors += 20
        if (offer.freightRate >= request.rateMin && request.freightRate <= request.rateMax) {
          matchScore += 20
        } else if (offer.freightRate >= request.rateMin * 0.9 && offer.freightRate <= request.rateMax * 1.1) {
          // Close match
          matchScore += 10
        }
      }

      // Normalize score if we have requirements
      const normalizedScore = totalFactors > 0 ? (matchScore / totalFactors) * 100 : 0

      return {
        offer,
        matchScore: normalizedScore,
      }
    })

    // Sort by match score (descending)
    return matchedOffers.sort((a, b) => b.matchScore - a.matchScore).map((m) => m.offer)
  }

  // Filter offers based on search term and filters
  const getFilteredOffers = useCallback(() => {
    let result = [...filteredOffers]

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (offer) =>
          offer.vesselType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.loadPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.dischargePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (offer.cargoType && offer.cargoType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          offer.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.charterer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.tradeLane?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply vessel type filter
    if (vesselTypeFilter) {
      result = result.filter((o) => o.vesselCategory === vesselTypeFilter)
    }

    // Apply cargo type filter
    if (cargoTypeFilter) {
      result = result.filter((o) => o.cargoType === cargoTypeFilter)
    }

    // Apply contract type filter
    if (contractTypeFilter) {
      result = result.filter((o) => o.contractType === contractTypeFilter)
    }

    // Apply tab filter
    if (activeTab === "high-priority") {
      result = result.filter((o) => o.score && o.score > 0.85)
    } else if (activeTab === "available") {
      result = result.filter((o) => o.status === "available")
    } else if (activeTab === "favorites") {
      result = result.filter((o) => o.category === "Favorites")
    } else if (activeTab === "voyage") {
      result = result.filter((o) => o.contractType === "voyage")
    } else if (activeTab === "time") {
      result = result.filter((o) => o.contractType === "time")
    } else if (activeTab === "coa") {
      result = result.filter((o) => o.contractType === "coa")
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      if (sortBy === "score") {
        comparison = (b.score || 0) - (a.score || 0)
      } else if (sortBy === "rate") {
        comparison = b.freightRate - a.freightRate
      } else if (sortBy === "date") {
        comparison = a.laycanStart.getTime() - b.laycanStart.getTime()
      } else if (sortBy === "vessel") {
        comparison = a.vesselSize - b.vesselSize
      }

      return sortOrder === "desc" ? comparison : -comparison
    })

    return result
  }, [filteredOffers, searchTerm, vesselTypeFilter, cargoTypeFilter, contractTypeFilter, activeTab, sortBy, sortOrder])

  const displayedOffers = useMemo(() => getFilteredOffers(), [getFilteredOffers])
  const priorityOffers = useMemo(() => filteredOffers.filter((o) => o.score && o.score > 0.85), [filteredOffers])

  // Group offers by vessel category
  const offersByVesselCategory = useMemo(() => {
    const grouped: Record<string, typeof displayedOffers> = {}

    // First, ensure all vessel categories are represented, even if empty
    VESSEL_CATEGORIES.forEach((category) => {
      grouped[category] = []
    })

    // Then add offers to their respective categories
    displayedOffers.forEach((offer) => {
      // Debug logging
      console.log(
        `Grouping vessel: ${offer.vesselName}, Size: ${offer.vesselSize}k, Category: ${offer.vesselCategory}, Type: ${offer.vesselType}`,
      )

      // Use vesselCategory field for grouping (this should be the correct one)
      const category = offer.vesselCategory || "Uncategorized"

      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(offer)
    })

    // Debug the final grouping
    Object.entries(grouped).forEach(([category, vessels]) => {
      if (vessels.length > 0) {
        console.log(`Category ${category}: ${vessels.length} vessels`)
        vessels.forEach((v) => console.log(`  - ${v.vesselName}: ${v.vesselSize}k DWT`))
      }
    })

    return grouped
  }, [displayedOffers])

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

  // Handle copying offer details
  const handleCopyOffer = (id: string) => {
    const offer = offers.find((o) => o.id === id)
    if (!offer) return

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    navigator.clipboard
      .writeText(`
VESSEL DETAILS:
${offer.vesselType} ${offer.vesselSize}k DWT
Name: ${offer.vesselName || "N/A"}
Route: ${offer.loadPort} → ${offer.dischargePort}
Laycan: ${formatDate(offer.laycanStart, true)}–${formatDate(offer.laycanEnd, true)}
Rate: $${offer.freightRate}${offer.rateUnit}
    `)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Vessel details have been copied to your clipboard.",
        })
      })
  }

  // Handle sending offer to client
  const handleSendToClient = (id: string) => {
    const offer = offers.find((o) => o.id === id)
    if (!offer) return

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    toast({
      title: "Offer sent",
      description: `${offer.vesselType} ${offer.vesselSize}k offer has been sent to the client.`,
    })
  }

  // Toggle favorite status
  const toggleFavorite = (offer: any) => {
    const isFavorite = offer.category === "Favorites"

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5)
    }

    setCategoryForOffer(offer.id, isFavorite ? "New Inquiries" : "Favorites")

    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${offer.vesselType} ${offer.vesselSize}k vessel has been ${isFavorite ? "removed from" : "added to"} favorites.`,
    })
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

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
                      <VesselTableNew
                        vessels={vessels}
                        onView={selectOffer}
                        onEdit={(vessel) => {
                          setCurrentVessel({ ...vessel })
                          setIsEditVesselDialogOpen(true)
                        }}
                        onDelete={handleDeleteVessel}
                      />
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

  // Render client requests section
  const renderMatchingRequestsSection = () => {
    if (activeRequests.length === 0) {
      return null
    }

    return (
      <Card className={cn("mb-4", isMobile && "rounded-xl shadow-sm")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">{/* CardTitle and Badge removed */}</div>
          {/* CardDescription removed */}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeRequests.map(({ request, matchedOffers }) => (
              <ClientRequestCard
                key={request.id}
                request={request}
                matchedOffers={matchedOffers}
                isExpanded={expandedRequests[request.id] || false}
                onToggleExpand={toggleRequestExpansion}
                onSelectOffer={selectOffer}
                onToggleCompareOffer={toggleCompareOffer}
                compareOffers={compareOffers}
                onCompareMatches={() => {
                  // Add these vessels to comparison
                  clearCompareOffers()
                  matchedOffers.slice(0, 3).forEach((offer) => {
                    toggleCompareOffer(offer)
                  })
                  toast({
                    title: "Vessels added to comparison",
                    description: `Added ${Math.min(matchedOffers.length, 3)} matching vessels to comparison view.`,
                  })

                  // Navigate to the comparison page
                  navigation.push("/comparison")
                }}
                isMobile={isMobile}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t pt-3 pb-3">
          <div className="w-full flex justify-center">
            <Button
              onClick={() => setClientEmailMatcherOpen(true)}
              className={isMobile ? "w-full bg-blue-500 hover:bg-blue-600 text-white" : ""}
            >
              <Mail className="h-4 w-4 mr-2" />
              Match New Client Email
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Render mobile tabs
  const renderMobileTabs = () => {
    if (!isMobile) return null

    return (
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="available"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
          >
            Available
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
          >
            Favorites
          </TabsTrigger>
          <TabsTrigger
            value="high-priority"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
          >
            Priority
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
  }

  // Render pull to refresh indicator
  const renderPullToRefresh = () => {
    if (!isMobile || !isPulling) return null

    const pullHeight = Math.min(Math.max(0, pullMoveY), 100)
    const progress = Math.min(pullHeight / 70, 1)

    return (
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{ height: `${pullHeight}px`, opacity: progress }}
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        ) : (
          <RefreshCw className="h-6 w-6 text-blue-500" style={{ transform: `rotate(${progress * 360}deg)` }} />
        )}
      </div>
    )
  }

  // Render mobile filter sheet
  const renderMobileFilterSheet = () => {
    return (
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl max-h-[90vh] overflow-auto">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-5" />
          <SheetHeader>
            <SheetTitle>Filter Vessels</SheetTitle>
            <SheetDescription>Customize which vessels are displayed</SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Vessel Type</label>
              <Select
                value={vesselTypeFilter || "all"}
                onValueChange={(value) => setVesselTypeFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Vessel Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessel Types</SelectItem>
                  {VESSEL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cargo Type</label>
              <Select
                value={cargoTypeFilter || "all"}
                onValueChange={(value) => setCargoTypeFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Cargo Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cargo Types</SelectItem>
                  {CARGO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Contract Type</label>
              <Select
                value={contractTypeFilter || "all"}
                onValueChange={(value) => setContractTypeFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Contract Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contract Types</SelectItem>
                  <SelectItem value="voyage">Voyage</SelectItem>
                  <SelectItem value="time">Time Charter</SelectItem>
                  <SelectItem value="coa">Contract of Affreightment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Match Score</SelectItem>
                  <SelectItem value="rate">Freight Rate</SelectItem>
                  <SelectItem value="date">Laycan Date</SelectItem>
                  <SelectItem value="vessel">Vessel Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setVesselTypeFilter(null)
                  setCargoTypeFilter(null)
                  setContractTypeFilter(null)
                  setSortBy("score")
                  setSortOrder("desc")
                }}
                className="flex-1 mr-2"
              >
                Reset
              </Button>
              <Button
                onClick={() => setFilterSheetOpen(false)}
                className="flex-1 ml-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Render mobile search sheet
  const renderMobileSearchSheet = () => {
    return (
      <Sheet open={searchSheetOpen} onOpenChange={setSearchSheetOpen}>
        <SheetContent side="top" className="pt-safe">
          <div className="pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="search"
                placeholder="Search vessels, ports, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchTerm("")}
                >
                  <span className="sr-only">Clear</span>
                  <span className="text-lg">×</span>
                </Button>
              )}
            </div>

            {searchTerm && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Search Results</h3>
                <div className="space-y-2">
                  {displayedOffers.length > 0 ? (
                    displayedOffers.slice(0, 5).map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                        onClick={() => {
                          selectOffer(offer)
                          setSearchSheetOpen(false)
                        }}
                      >
                        <div>
                          <div className="font-medium">
                            {offer.vesselType} {offer.vesselSize}k
                          </div>
                          <div className="text-sm text-gray-500">
                            {offer.loadPort} → {offer.dischargePort}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          ${offer.freightRate}
                          {offer.rateUnit}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No vessels match your search</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("w-full py-4 px-6", isMobile && "px-4 pb-4")} ref={scrollRef}>
      {renderPullToRefresh()}

      {selectedOffer ? (
        <div>
          <OfferDetails
            offer={selectedOffer}
            onBack={() => selectOffer(null)}
            onCopy={() => handleCopyOffer(selectedOffer.id)}
            onSend={() => handleSendToClient(selectedOffer.id)}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Mobile tabs */}
          {renderMobileTabs()}

          {/* Client Requests Section */}
          <section aria-labelledby="client-requests-heading">
            <h2
              id="client-requests-heading"
              className={cn("text-xl font-semibold mb-4 flex items-center", isMobile && "text-lg")}
            >
              Client Requests
              <Badge variant="outline" className="ml-2 font-normal">
                {activeRequests.length} active
              </Badge>
            </h2>
            {renderMatchingRequestsSection()}
          </section>

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
              <SheetsSyncPanel onAddVessel={() => setIsAddVesselDialogOpen(true)} isAddingVessel={isLoading} />
            </div>

            {/* Vessel List */}
            {displayedOffers.length === 0 && !isInitialLoading ? (
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

      {/* Mobile filter sheet */}
      {renderMobileFilterSheet()}

      {/* Mobile search sheet */}
      {renderMobileSearchSheet()}

      {/* Client Email Matcher Dialog */}
      <Dialog open={clientEmailMatcherOpen && !isMobile} onOpenChange={setClientEmailMatcherOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0" style={{ maxHeight: "90vh", overflow: "hidden" }}>
          <ClientEmailMatcher
            onSelectOffer={(offer) => {
              selectOffer(offer)
              setClientEmailMatcherOpen(false)
            }}
            onClose={() => setClientEmailMatcherOpen(false)}
            isMobile={isMobile}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile Email Matcher Sheet */}
      {isMobile && (
        <Sheet open={clientEmailMatcherOpen} onOpenChange={setClientEmailMatcherOpen}>
          <SheetContent
            side="bottom"
            className="h-[90vh] p-0 rounded-t-xl"
            style={{ maxHeight: "90vh", overflow: "hidden" }}
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-2" />
            <ClientEmailMatcher
              onSelectOffer={(offer) => {
                selectOffer(offer)
                setClientEmailMatcherOpen(false)
              }}
              onClose={() => setClientEmailMatcherOpen(false)}
              isMobile={isMobile}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Add Vessel Dialog */}
      <Dialog open={isAddVesselDialogOpen} onOpenChange={setIsAddVesselDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Vessel Manually</DialogTitle>
            <DialogDescription>Enter the details of the vessel you want to add to your inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="vesselname" className="text-right text-sm font-medium">
                Vessel Name*
              </label>
              <Input
                id="vesselname"
                value={newVesselData.vesselname || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, vesselname: e.target.value })}
                className="col-span-2"
                placeholder="Ocean Pioneer"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="type" className="text-right text-sm font-medium">
                Type
              </label>
              <Select
                value={newVesselData.type}
                onValueChange={(value) => setNewVesselData({ ...newVesselData, type: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="dwt" className="text-right text-sm font-medium">
                DWT (k)
              </label>
              <Input
                id="dwt"
                type="number"
                value={newVesselData.dwt || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, dwt: Number(e.target.value) })}
                className="col-span-2"
                placeholder="32"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="built" className="text-right text-sm font-medium">
                Built
              </label>
              <Input
                id="built"
                type="number"
                value={newVesselData.built || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, built: Number(e.target.value) })}
                className="col-span-2"
                placeholder="2010"
                min="1980"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="flag" className="text-right text-sm font-medium">
                Flag
              </label>
              <Select
                value={newVesselData.flag}
                onValueChange={(value) => setNewVesselData({ ...newVesselData, flag: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select flag" />
                </SelectTrigger>
                <SelectContent>
                  {FLAGS.map((flag) => (
                    <SelectItem key={flag} value={flag}>
                      {flag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="openport" className="text-right text-sm font-medium">
                Open Port*
              </label>
              <Input
                id="openport"
                value={newVesselData.openport || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, openport: e.target.value })}
                className="col-span-2"
                placeholder="US Gulf"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="opendates" className="text-right text-sm font-medium">
                Open Dates
              </label>
              <Input
                id="opendates"
                value={newVesselData.opendates || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, opendates: e.target.value })}
                className="col-span-2"
                placeholder="15-20 Jun"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="nextport" className="text-right text-sm font-medium">
                Next Port
              </label>
              <Input
                id="nextport"
                value={newVesselData.nextport || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, nextport: e.target.value })}
                className="col-span-2"
                placeholder="China"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="lastcargo" className="text-right text-sm font-medium">
                Last Cargo
              </label>
              <Select
                value={newVesselData.lastcargo}
                onValueChange={(value) => setNewVesselData({ ...newVesselData, lastcargo: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select cargo type" />
                </SelectTrigger>
                <SelectContent>
                  {CARGO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="ballast" className="text-right text-sm font-medium">
                Ballast
              </label>
              <Select
                value={newVesselData.ballast}
                onValueChange={(value) => setNewVesselData({ ...newVesselData, ballast: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select ballast status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="laden" className="text-right text-sm font-medium">
                Laden
              </label>
              <Select
                value={newVesselData.laden}
                onValueChange={(value) => setNewVesselData({ ...newVesselData, laden: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select laden status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="freightrate" className="text-right text-sm font-medium">
                Freight Rate
              </label>
              <div className="col-span-2 flex items-center">
                <span className="mr-2">$</span>
                <Input
                  id="freightrate"
                  type="number"
                  value={newVesselData.freightrate || ""}
                  onChange={(e) => setNewVesselData({ ...newVesselData, freightrate: Number(e.target.value) })}
                  className="flex-1"
                  placeholder="15"
                  step="0.1"
                />
                <span className="ml-2">k/day</span>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="commission" className="text-right text-sm font-medium">
                Commission (%)
              </label>
              <Input
                id="commission"
                type="number"
                value={newVesselData.commission || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, commission: Number(e.target.value) })}
                className="col-span-2"
                placeholder="2.5"
                step="0.1"
                min="0"
                max="10"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="imo" className="text-right text-sm font-medium">
                IMO
              </label>
              <Input
                id="imo"
                value={newVesselData.imo || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, imo: e.target.value })}
                className="col-span-2"
                placeholder="9123456"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="brokername" className="text-right text-sm font-medium">
                Broker Name
              </label>
              <Input
                id="brokername"
                value={newVesselData.brokername || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, brokername: e.target.value })}
                className="col-span-2"
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="company" className="text-right text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                value={newVesselData.company || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, company: e.target.value })}
                className="col-span-2"
                placeholder="Maritime Brokers Ltd"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="phonenumber" className="text-right text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phonenumber"
                value={newVesselData.phonenumber || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, phonenumber: e.target.value })}
                className="col-span-2"
                placeholder="+1 555 123 4567"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newVesselData.email || ""}
                onChange={(e) => setNewVesselData({ ...newVesselData, email: e.target.value })}
                className="col-span-2"
                placeholder="broker@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVesselDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVesselManually}>Add Vessel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vessel Dialog */}
      <Dialog open={isEditVesselDialogOpen} onOpenChange={setIsEditVesselDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vessel</DialogTitle>
            <DialogDescription>Update the details of this vessel.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-vesselName" className="text-right text-sm font-medium">
                Vessel Name*
              </label>
              <Input
                id="edit-vesselName"
                value={currentVessel?.vesselName || ""}
                onChange={(e) => setCurrentVessel((prev) => (prev ? { ...prev, vesselName: e.target.value } : null))}
                className="col-span-3"
                placeholder="Ocean Pioneer"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-vesselType" className="text-right text-sm font-medium">
                Vessel Type
              </label>
              <Select
                value={currentVessel?.vesselType}
                onValueChange={(value) => setCurrentVessel((prev) => (prev ? { ...prev, vesselType: value } : null))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-vesselSize" className="text-right text-sm font-medium">
                Size (k DWT)
              </label>
              <Input
                id="edit-vesselSize"
                type="number"
                value={currentVessel?.vesselSize || ""}
                onChange={(e) =>
                  setCurrentVessel((prev) => (prev ? { ...prev, vesselSize: Number(e.target.value) } : null))
                }
                className="col-span-3"
                placeholder="32"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-loadPort" className="text-right text-sm font-medium">
                Load Port*
              </label>
              <Input
                id="edit-loadPort"
                value={currentVessel?.loadPort || ""}
                onChange={(e) => setCurrentVessel((prev) => (prev ? { ...prev, loadPort: e.target.value } : null))}
                className="col-span-3"
                placeholder="US Gulf"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-dischargePort" className="text-right text-sm font-medium">
                Discharge Port*
              </label>
              <Input
                id="edit-dischargePort"
                value={currentVessel?.dischargePort || ""}
                onChange={(e) => setCurrentVessel((prev) => (prev ? { ...prev, dischargePort: e.target.value } : null))}
                className="col-span-3"
                placeholder="China"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-freightRate" className="text-right text-sm font-medium">
                Freight Rate
              </label>
              <div className="col-span-3 flex items-center">
                <span className="mr-2">$</span>
                <Input
                  id="edit-freightRate"
                  type="number"
                  value={currentVessel?.freightRate || ""}
                  onChange={(e) =>
                    setCurrentVessel((prev) => (prev ? { ...prev, freightRate: Number(e.target.value) } : null))
                  }
                  className="flex-1"
                  placeholder="15"
                />
                <span className="ml-2">k/day</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-vesselFlag" className="text-right text-sm font-medium">
                Flag
              </label>
              <Select
                value={currentVessel?.vesselFlag}
                onValueChange={(value) => setCurrentVessel((prev) => (prev ? { ...prev, vesselFlag: value } : null))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select flag" />
                </SelectTrigger>
                <SelectContent>
                  {FLAGS.map((flag) => (
                    <SelectItem key={flag} value={flag}>
                      {flag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-cargoType" className="text-right text-sm font-medium">
                Cargo Type
              </label>
              <Select
                value={currentVessel?.cargoType}
                onValueChange={(value) => setCurrentVessel((prev) => (prev ? { ...prev, cargoType: value } : null))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select cargo type" />
                </SelectTrigger>
                <SelectContent>
                  {CARGO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditVesselDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVessel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vessel {currentVessel?.vesselName || ""} from your inventory. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVessel} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
