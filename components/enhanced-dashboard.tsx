"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useOfferStore } from "@/lib/offer-store"
import { useCompareStore } from "@/lib/compare-store"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Ship, Mail, RefreshCw, ChevronDown, Loader2, Eye, TrendingUp } from "lucide-react"
import { OfferDetails } from "@/components/offer-details"
import { ClientRequestCard } from "@/components/client-request-card"
import { formatDate, getVesselCategoryBySize } from "@/lib/offer-utils"
import { getRandomOffer, getRandomOfferForCategory, MOCK_CLIENTS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { VESSEL_CATEGORIES, CARGO_TYPES, TRADE_LANES } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Offer } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useSheetsVessels } from "@/hooks/use-sheety-vessels"
import { VesselTableNew } from "@/components/vessel-table-new"
import { SheetsSyncPanel } from "@/components/sheets-sync-panel"

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

  // Consolidate these state declarations into a single object:
  const [uiState, setUiState] = useState({
    viewMode: "vesselTypes" as "vesselTypes" | "list",
    searchTerm: "",
    sortBy: "priority" as "score" | "rate" | "date" | "vessel" | "priority",
    sortOrder: "desc" as "asc" | "desc",
    activeTab: "urgent",
    isLoading: false,
    isInitialLoading: true,
    filterSheetOpen: false,
    searchSheetOpen: false,
    sheetsDialogOpen: false,
    clientEmailMatcherOpen: false,
    isAddVesselDialogOpen: false,
    isEditVesselDialogOpen: false,
    isDeleteAlertOpen: false,
    showDemurrage: false,
    showScenarioComparison: false,
    isExpanded: true,
    settingsDialogOpen: false,
    keyboardShortcutsOpen: false,
    helpDialogOpen: false,
    exportDialogOpen: false,
    isFullscreen: false,
    sidebarOpen: !isMobile,
  })

  // State for mobile view
  const {
    viewMode,
    searchTerm,
    sortBy,
    sortOrder,
    activeTab,
    isLoading,
    isInitialLoading,
    filterSheetOpen,
    searchSheetOpen,
    sheetsDialogOpen,
    clientEmailMatcherOpen,
    isAddVesselDialogOpen,
    isEditVesselDialogOpen,
    isDeleteAlertOpen,
    isExpanded,
    settingsDialogOpen,
    keyboardShortcutsOpen,
    helpDialogOpen,
    exportDialogOpen,
    isFullscreen,
  } = uiState

  const [vesselTypeFilter, setVesselTypeFilter] = useState<string | null>(null)
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string | null>(null)
  const [contractTypeFilter, setContractTypeFilter] = useState<string | null>(null)
  const [chartererFilter, setChartererFilter] = useState<string | null>(null)
  const [initialStatusFilter, setInitialStatusFilter] = useState<string | null>(null)
  const [expandedVesselCategories, setExpandedVesselCategories] = useState<Record<string, boolean>>(() => {
    // Initialize with urgent categories expanded
    const initialState: Record<string, boolean> = {}
    VESSEL_CATEGORIES.forEach((category) => {
      initialState[category] = false
    })
    return initialState
  })

  // Calculate metrics for broker dashboard
  const metrics = useMemo(
    () => ({
      totalOffers: offers.length,
      displayedOffers: filteredOffers.length,
      screenedToday: Math.floor(Math.random() * 25) + 15,
      highPriority: filteredOffers.filter((o) => o.priority === "urgent").length,
      fixedToday: filteredOffers.filter((o) => o.category === "Fixed").length,
      onSubjects: filteredOffers.filter((o) => o.category === "On Subjects").length,
    }),
    [offers, filteredOffers],
  )

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
    setUiState((prev) => ({ ...prev, isLoading: true }))

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

      setUiState((prev) => ({ ...prev, isLoading: false }))
    }, 800)
  }

  // Handle adding a vessel manually
  const [currentVessel, setCurrentVessel] = useState<Offer | null>(null)

  const handleAddVesselManually = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
    })
  }

  const handleEditVessel = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
    })
  }

  const handleDeleteVessel = (id: string) => {
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
    })
  }

  const confirmDeleteVessel = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
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
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
    })
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
      setUiState((prev) => ({ ...prev, isInitialLoading: true }))
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

      setUiState((prev) => ({ ...prev, isInitialLoading: false }))
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
        } else if (offer.freightRate >= request.rateMin * 0.9 && request.freightRate <= request.rateMax * 1.1) {
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
  const toggleVesselCategory = (category: string) => {
    if (navigator.vibrate) navigator.vibrate(5)
    setExpandedVesselCategories((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  // Handle adding a sample offer
  const handleAddSampleOffer = () => {
    setUiState((prev) => ({ ...prev, isLoading: true }))

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

        setUiState((prev) => ({ ...prev, isLoading: false }))
      }, 800)
    } catch (error) {
      console.error("Error adding sample offer:", error)
      toast({
        title: "Error",
        description: "Failed to add sample vessel. Please try again.",
        variant: "destructive",
      })
      setUiState((prev) => ({ ...prev, isLoading: false }))
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
    setUiState((prev) => ({ ...prev, sortOrder: sortOrder === "desc" ? "asc" : "desc" }))
  }

  const VesselCategoryCard = ({ category, vessels }: { category: string; vessels: Offer[] }) => {
    if (vessels.length === 0) return null

    const isExpanded = expandedVesselCategories[category]

    return (
      <Card
        className={cn("w-full overflow-hidden border border-slate-200 dark:border-slate-800", isMobile && "rounded-xl")}
      >
        <div
          className={cn(
            "px-4 py-3 flex items-center justify-between cursor-pointer",
            "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200",
            "hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700",
          )}
          onClick={() => toggleVesselCategory(category)}
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
                isExpanded ? "transform rotate-180" : "",
              )}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="bg-white dark:bg-gray-950">
            <VesselTableNew
              vessels={vessels}
              onView={selectOffer}
              onEdit={(vessel) => handleDeleteVessel(vessel.id)}
              onDelete={handleDeleteVessel}
            />
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleVesselCategory(category)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {isExpanded ? "Hide" : "Show"} {vessels.length} {vessels.length === 1 ? "vessel" : "vessels"}
          </Button>
        </div>
      </Card>
    )
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
          return <VesselCategoryCard key={category} category={category} vessels={vessels} />
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
              onClick={() => handleProcessEmail()}
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
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setUiState((prev) => ({ ...prev, activeTab: value }))}
        className="mb-4"
      >
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
              <SheetsSyncPanel onAddVessel={() => handleAddVesselManually()} isAddingVessel={isLoading} />
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
    </div>
  )
}
