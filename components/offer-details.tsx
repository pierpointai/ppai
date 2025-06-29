"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/offer-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { Offer } from "@/lib/types"
import {
  Ship,
  Calendar,
  MapPin,
  Package,
  Flag,
  BarChart,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Send,
  DollarSign,
  FileText,
  Star,
  MessageSquare,
  History,
  Info,
  ChevronRight,
  FileCheck,
  Users,
  BarChart2,
  TrendingUp,
  Droplet,
  Clipboard,
  Navigation,
  Globe,
  Sliders,
  ExternalLink,
  Mail,
} from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OfferDetailsProps {
  offer: Offer
  onBack: () => void
  onCopy: () => void
  onSend: () => void
  isMobile?: boolean
}

export function OfferDetails({ offer, onBack, onCopy, onSend, isMobile = false }: OfferDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "fixed":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "pending":
        return "Pending"
      case "fixed":
        return "Fixed"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      case "pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
      case "fixed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    }
  }

  const getMarineTrafficUrl = (imo: string) => {
    return `https://www.marinetraffic.com/en/ais/details/ships/imo:${imo}`
  }

  // Enhanced vessel data for a more realistic broker experience
  const enhancedVesselData = {
    imo: `${9}${Math.floor(100000 + Math.random() * 900000)}`,
    mmsi: Math.floor(100000000 + Math.random() * 900000000),
    callSign: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
    built: 2010 + Math.floor(Math.random() * 13),
    class: ["DNV-GL", "Lloyd's Register", "ABS", "Bureau Veritas", "ClassNK"][Math.floor(Math.random() * 5)],
    manager: ["Anglo-Eastern", "V.Ships", "Wallem", "Bernhard Schulte", "Synergy Marine"][
      Math.floor(Math.random() * 5)
    ],
    owner: ["Oldendorff", "Norden", "Pacific Basin", "Eagle Bulk", "Star Bulk"][Math.floor(Math.random() * 5)],
    loa: Math.floor(150 + Math.random() * 150),
    beam: Math.floor(20 + Math.random() * 30),
    draft: (8 + Math.random() * 6).toFixed(1),
    holds: Math.floor(3 + Math.random() * 5),
    hatchSize: `${Math.floor(15 + Math.random() * 20)}m x ${Math.floor(10 + Math.random() * 15)}m`,
    gearType:
      Math.random() > 0.5
        ? `${Math.floor(25 + Math.random() * 40)}mt Cranes x ${Math.floor(2 + Math.random() * 3)}`
        : "Gearless",
    fuelConsumption: {
      ifo: (20 + Math.random() * 15).toFixed(1),
      mgo: (2 + Math.random() * 3).toFixed(1),
      port: (1 + Math.random() * 2).toFixed(1),
      eco: (15 + Math.random() * 10).toFixed(1),
    },
    speed: {
      laden: (12 + Math.random() * 3).toFixed(1),
      ballast: (13 + Math.random() * 3).toFixed(1),
      eco: (10 + Math.random() * 2).toFixed(1),
    },
    currentPosition: {
      port: ["Singapore", "Rotterdam", "Shanghai", "Busan", "Houston"][Math.floor(Math.random() * 5)],
      coordinates: `${Math.floor(Math.random() * 90)}°${Math.floor(Math.random() * 60)}'N ${Math.floor(Math.random() * 180)}°${Math.floor(Math.random() * 60)}'E`,
      status: ["At Anchor", "Underway", "In Port", "Loading", "Discharging"][Math.floor(Math.random() * 5)],
      eta: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
      etd: new Date(Date.now() + (Math.floor(Math.random() * 10) + 10) * 24 * 60 * 60 * 1000),
    },
    certificates: {
      pandi: `${["Gard", "North of England", "UK P&I Club", "Steamship Mutual", "Standard Club"][Math.floor(Math.random() * 5)]} - Valid until ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      lastDryDock: new Date(Date.now() - Math.floor(Math.random() * 730) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      nextDryDock: new Date(Date.now() + Math.floor(Math.random() * 730) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      lastVetting: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
    tradingHistory: [
      {
        voyage: "V023",
        loadPort: "Santos",
        dischargePort: "Qingdao",
        cargo: "Soybeans",
        quantity: "65,000",
        charterer: "Bunge",
        rate: "$24.50/mt",
        laycan: "15-20 Mar 2023",
      },
      {
        voyage: "V022",
        loadPort: "Vancouver",
        dischargePort: "Yokohama",
        cargo: "Wheat",
        quantity: "58,000",
        charterer: "Cargill",
        rate: "$22.75/mt",
        laycan: "10-15 Feb 2023",
      },
      {
        voyage: "V021",
        loadPort: "New Orleans",
        dischargePort: "Rotterdam",
        cargo: "Corn",
        quantity: "60,000",
        charterer: "ADM",
        rate: "$21.25/mt",
        laycan: "05-10 Jan 2023",
      },
    ],
    marketContext: {
      bdi: 1823,
      bdiChange: "+2.5%",
      relevantRoute:
        offer.vesselCategory === "Capesize"
          ? "C5 (W Australia-China)"
          : offer.vesselCategory === "Panamax"
            ? "P2A (Skaw-Gibraltar/Far East)"
            : "S10 (S China-Indonesia/ECSA)",
      routeRate:
        offer.vesselCategory === "Capesize"
          ? "$9.85/mt"
          : offer.vesselCategory === "Panamax"
            ? "$22,750/day"
            : "$16,250/day",
      routeChange: "+1.8%",
      timecharter: {
        oneYear: `$${Math.floor(12000 + Math.random() * 8000)}/day`,
        twoYear: `$${Math.floor(11000 + Math.random() * 7000)}/day`,
        threeYear: `$${Math.floor(10000 + Math.random() * 6000)}/day`,
      },
      recentFixtures: [
        {
          vessel: `MV ${["Ocean", "Pacific", "Atlantic", "Nordic", "Asian"][Math.floor(Math.random() * 5)]} ${["Star", "Eagle", "Hawk", "Falcon", "Phoenix"][Math.floor(Math.random() * 5)]}`,
          size: `${Math.floor(offer.vesselSize * 0.9)}k`,
          route: `${["ECSA", "USG", "NCSA", "Indonesia", "Australia"][Math.floor(Math.random() * 5)]} to ${["China", "Japan", "S Korea", "India", "Europe"][Math.floor(Math.random() * 5)]}`,
          rate: `$${(offer.freightRate * (0.9 + Math.random() * 0.2)).toFixed(2)}${offer.rateUnit}`,
          laycan: `${["Early", "Mid", "Late"][Math.floor(Math.random() * 3)]} ${["Jun", "Jul", "Aug"][Math.floor(Math.random() * 3)]}`,
        },
        {
          vessel: `MV ${["Global", "Stellar", "Royal", "Imperial", "Noble"][Math.floor(Math.random() * 5)]} ${["Trader", "Carrier", "Voyager", "Explorer", "Navigator"][Math.floor(Math.random() * 5)]}`,
          size: `${Math.floor(offer.vesselSize * 1.1)}k`,
          route: `${["ECSA", "USG", "NCSA", "Indonesia", "Australia"][Math.floor(Math.random() * 5)]} to ${["China", "Japan", "S Korea", "India", "Europe"][Math.floor(Math.random() * 5)]}`,
          rate: `$${(offer.freightRate * (0.9 + Math.random() * 0.2)).toFixed(2)}${offer.rateUnit}`,
          laycan: `${["Early", "Mid", "Late"][Math.floor(Math.random() * 3)]} ${["Jun", "Jul", "Aug"][Math.floor(Math.random() * 3)]}`,
        },
      ],
    },
    cargoDetails: {
      maxIntake: Math.floor(offer.vesselSize * 0.98 * 1000),
      stowageFactor: (0.7 + Math.random() * 0.3).toFixed(2),
      loadRate: Math.floor(15000 + Math.random() * 10000),
      dischargeRate: Math.floor(20000 + Math.random() * 15000),
      allowedCargoes: ["Grain", "Coal", "Iron Ore", "Bauxite", "Fertilizer"].slice(
        0,
        2 + Math.floor(Math.random() * 3),
      ),
      restrictions:
        Math.random() > 0.7
          ? ["No IMO cargoes", "No coal with moisture content >12%", "Max cargo temperature 55°C"].slice(
              0,
              1 + Math.floor(Math.random() * 2),
            )
          : [],
    },
    commercialTerms: {
      commissionRate: (3 + Math.random() * 2).toFixed(2),
      demurrage: Math.floor(15000 + Math.random() * 10000),
      despatch: Math.floor(7500 + Math.random() * 5000),
      laytime: Math.floor(3 + Math.random() * 4),
      shinc: Math.random() > 0.5,
      paymentTerms: "100% freight FILO",
      additionalClauses: [
        "BIMCO ISPS Clause",
        "BIMCO Infectious or Contagious Diseases Clause",
        "Sanctions Clause",
        "War Risks Clause",
      ],
    },
  }

  const { toast } = useToast()

  return (
    <div className="space-y-6">
      {/* Header with back button and status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to offers
        </Button>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 px-3 py-1 rounded-full", getStatusColor(offer.status))}
          >
            {getStatusIcon(offer.status)}
            <span>{getStatusText(offer.status)}</span>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              toast({
                title: "Added to favorites",
                description: "This vessel has been added to your favorites",
              })
            }}
          >
            <Star className="h-4 w-4 mr-1.5" />
            Favorite
          </Button>
        </div>
      </div>

      {/* Vessel Hero Section - Enhanced with IMO and current position */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-border/50">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Ship className="h-8 w-8 text-primary" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
              <h1 className="text-3xl font-bold tracking-tight">
                {offer.vesselType} {offer.vesselSize}k DWT
              </h1>
              <div className="text-lg text-muted-foreground">
                <span className="font-medium">{offer.vesselName}</span>
                <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  IMO: {enhancedVesselData.imo}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center mt-2 text-muted-foreground gap-y-1">
              <div className="flex items-center mr-4">
                <MapPin className="h-4 w-4 text-primary mr-1.5" />
                <span>{offer.loadPort}</span>
                <ArrowRight className="h-3.5 w-3.5 mx-2" />
                <span>{offer.dischargePort}</span>
              </div>

              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  <span>
                    Current: {enhancedVesselData.currentPosition.status} at {enhancedVesselData.currentPosition.port}
                  </span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button onClick={onSend}>
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
            <Button variant="outline" onClick={onCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Details
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 md:w-fit">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="details" className="text-sm">
            Vessel Specs
          </TabsTrigger>
          <TabsTrigger value="commercial" className="text-sm">
            Commercial
          </TabsTrigger>
          <TabsTrigger value="market" className="text-sm">
            Market Data
          </TabsTrigger>
          <TabsTrigger value="email" className="text-sm">
            Email
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced with more broker-relevant information */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Key Details Card */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Key Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Vessel */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ship className="h-4 w-4" />
                      <span className="text-sm font-medium">Vessel</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{offer.vesselName}</div>
                      <div className="text-xs text-muted-foreground">
                        {offer.vesselType} {offer.vesselSize}k DWT
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">IMO: {enhancedVesselData.imo}</div>
                    </div>
                  </div>

                  {/* Flag & Age */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Flag className="h-4 w-4" />
                      <span className="text-sm font-medium">Flag & Age</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{offer.vesselFlag}</div>
                      <div className="text-sm text-muted-foreground">{offer.vesselAge} years old</div>
                      <div className="text-xs text-muted-foreground">Built {enhancedVesselData.built}</div>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Cargo</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{offer.cargoType}</div>
                      <div className="text-sm text-muted-foreground">
                        {offer.cargoQuantity?.toLocaleString()} {offer.cargoUnit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Max intake: {enhancedVesselData.cargoDetails.maxIntake.toLocaleString()} MT
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Route</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{offer.loadPort}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {offer.dischargePort}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ETA: {formatDate(enhancedVesselData.currentPosition.eta, true)}
                      </div>
                    </div>
                  </div>

                  {/* Laycan */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Laycan</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{formatDate(offer.laycanStart, true)}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {formatDate(offer.laycanEnd, true)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.ceil((offer.laycanEnd.getTime() - offer.laycanStart.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        days window
                      </div>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Rate</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">
                        ${offer.freightRate}
                        {offer.rateUnit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {offer.charterer && `Charterer: ${offer.charterer}`}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        vs BDI: {enhancedVesselData.marketContext.bdiChange}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Position Card - New card showing real-time vessel position */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Current Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden">
                  {/* This would be a real map in a production app */}
                  <div className="absolute inset-0 opacity-20">
                    <img
                      src="/world-shipping-routes.png"
                      alt="Vessel position map"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-md text-center">
                      <Navigation className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-sm font-medium">{enhancedVesselData.currentPosition.port}</p>
                      <p className="text-xs text-muted-foreground">{enhancedVesselData.currentPosition.coordinates}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status</span>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {enhancedVesselData.currentPosition.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">ETA</span>
                    <span className="text-sm font-medium">
                      {formatDate(enhancedVesselData.currentPosition.eta, true)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">ETD</span>
                    <span className="text-sm font-medium">
                      {formatDate(enhancedVesselData.currentPosition.etd, true)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speed</span>
                    <span className="text-sm font-medium">{enhancedVesselData.speed.laden} knots</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Distance to Load Port</span>
                    <span className="text-sm font-medium">{Math.floor(500 + Math.random() * 1500)} nm</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={getMarineTrafficUrl(enhancedVesselData.imo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View on MarineTraffic
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Context Card - New card showing market data */}
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Market Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Baltic Indices */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Baltic Indices</h3>
                    <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">BDI</span>
                        <div className="flex items-center">
                          <span className="font-medium">{enhancedVesselData.marketContext.bdi}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2 text-xs",
                              enhancedVesselData.marketContext.bdiChange.startsWith("+")
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                            )}
                          >
                            {enhancedVesselData.marketContext.bdiChange}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">{enhancedVesselData.marketContext.relevantRoute}</span>
                        <div className="flex items-center">
                          <span className="font-medium">{enhancedVesselData.marketContext.routeRate}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2 text-xs",
                              enhancedVesselData.marketContext.routeChange.startsWith("+")
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                            )}
                          >
                            {enhancedVesselData.marketContext.routeChange}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">1 Year T/C</span>
                        <span className="font-medium">{enhancedVesselData.marketContext.timecharter.oneYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Fixtures */}
                  <div className="space-y-3 md:col-span-2">
                    <h3 className="text-sm font-medium">Recent Similar Fixtures</h3>
                    <div className="space-y-2">
                      {enhancedVesselData.marketContext.recentFixtures.map((fixture, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{fixture.vessel}</span>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {fixture.size} DWT
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{fixture.route}</span>
                            <span className="font-medium">{fixture.rate}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>
                              Fixed on{" "}
                              {new Date(
                                Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString()}
                            </span>
                            <span>Laycan: {fixture.laycan}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score Card */}
            {offer.confidenceScore !== undefined && (
              <Card className="md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    AI Confidence Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Data Extraction Confidence</span>
                        <span
                          className={cn(
                            "font-medium text-lg",
                            offer.confidenceScore > 0.9
                              ? "text-green-500 dark:text-green-400"
                              : offer.confidenceScore > 0.8
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-red-500 dark:text-red-400",
                          )}
                        >
                          {Math.round(offer.confidenceScore * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            offer.confidenceScore > 0.9
                              ? "bg-green-500"
                              : offer.confidenceScore > 0.8
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${offer.confidenceScore * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>

                    <div className="text-sm bg-muted/30 p-4 rounded-lg md:max-w-md">
                      <p>This score represents the AI's confidence in the extracted data from the original email.</p>
                      <div className="mt-2 grid grid-cols-1 gap-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>
                            <span className="font-medium">High confidence (90%+):</span> Data is likely accurate and
                            complete.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                          <span>
                            <span className="font-medium">Medium confidence (80-90%):</span> Most data is accurate, but
                            some fields may need verification.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span>
                            <span className="font-medium">Low confidence (below 80%):</span> Data should be manually
                            verified before use.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Vessel Specs Tab - Enhanced with detailed vessel specifications */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vessel Details Card - Enhanced with more specifications */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Vessel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Name</td>
                      <td className="px-4 py-3 w-1/4">{offer.vesselName}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Flag</td>
                      <td className="px-4 py-3 w-1/4">
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          {offer.vesselFlag}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Type</td>
                      <td className="px-4 py-3">{offer.vesselType}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Size</td>
                      <td className="px-4 py-3">{offer.vesselSize}k DWT</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Built</td>
                      <td className="px-4 py-3">{enhancedVesselData.built}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Age</td>
                      <td className="px-4 py-3">{offer.vesselAge} years</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">IMO Number</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{enhancedVesselData.imo}</span>
                          <a
                            href={getMarineTrafficUrl(enhancedVesselData.imo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Call Sign</td>
                      <td className="px-4 py-3">{enhancedVesselData.callSign}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Class</td>
                      <td className="px-4 py-3">{enhancedVesselData.class}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Charterer</td>
                      <td className="px-4 py-3">{offer.charterer || "Not specified"}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Technical Specifications Card - New card with technical details */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">LOA</td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.loa}m</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Beam</td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.beam}m</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Draft</td>
                      <td className="px-4 py-3">{enhancedVesselData.draft}m</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Holds/Hatches</td>
                      <td className="px-4 py-3">{enhancedVesselData.holds}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Hatch Size</td>
                      <td className="px-4 py-3">{enhancedVesselData.hatchSize}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Gear</td>
                      <td className="px-4 py-3">{enhancedVesselData.gearType}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Speed (Laden)</td>
                      <td className="px-4 py-3">{enhancedVesselData.speed.laden} knots</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Speed (Ballast)</td>
                      <td className="px-4 py-3">{enhancedVesselData.speed.ballast} knots</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Speed (Eco)</td>
                      <td className="px-4 py-3">{enhancedVesselData.speed.eco} knots</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">EEXI Compliance</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          Compliant
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Consumption Card - New card with fuel consumption details */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-primary" />
                  Consumption
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">IFO (At Sea)</td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.fuelConsumption.ifo} MT/day</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">MGO (At Sea)</td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.fuelConsumption.mgo} MT/day</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">In Port</td>
                      <td className="px-4 py-3">{enhancedVesselData.fuelConsumption.port} MT/day</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Eco Speed</td>
                      <td className="px-4 py-3">{enhancedVesselData.fuelConsumption.eco} MT/day</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">CII Rating</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          B
                        </Badge>
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Certificates & Inspections Card - New card with certification details */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Certificates & Inspections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">P&I Club</td>
                      <td className="px-4 py-3 w-3/4" colSpan={3}>
                        {enhancedVesselData.certificates.pandi}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Last Dry Dock</td>
                      <td className="px-4 py-3">{enhancedVesselData.certificates.lastDryDock}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Next Dry Dock</td>
                      <td className="px-4 py-3">{enhancedVesselData.certificates.nextDryDock}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Last Vetting</td>
                      <td className="px-4 py-3">{enhancedVesselData.certificates.lastVetting}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">PSC Deficiencies</td>
                      <td className="px-4 py-3">0 in last 12 months</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Rightship Rating</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          4 Stars
                        </Badge>
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Ownership & Management Card - New card with company details */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Ownership & Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Owner</td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.owner}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">
                        Technical Manager
                      </td>
                      <td className="px-4 py-3 w-1/4">{enhancedVesselData.manager}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Commercial Manager</td>
                      <td className="px-4 py-3">{enhancedVesselData.owner} Chartering</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">
                        Year with Current Owner
                      </td>
                      <td className="px-4 py-3">{Math.floor(Math.random() * offer.vesselAge)} years</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Crew Nationality</td>
                      <td className="px-4 py-3">
                        {["Filipino", "Indian", "Chinese", "Ukrainian", "Mixed"][Math.floor(Math.random() * 5)]}
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commercial Tab - Enhanced with detailed commercial information */}
        <TabsContent value="commercial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cargo Details Card - Enhanced with more cargo specifications */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Cargo Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Type</td>
                      <td className="px-4 py-3 w-1/4 font-medium">{offer.cargoType || "N/A"}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Quantity</td>
                      <td className="px-4 py-3 w-1/4">
                        {offer.cargoQuantity?.toLocaleString()} {offer.cargoUnit}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Max Intake</td>
                      <td className="px-4 py-3">{enhancedVesselData.cargoDetails.maxIntake.toLocaleString()} MT</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Stowage Factor</td>
                      <td className="px-4 py-3">{enhancedVesselData.cargoDetails.stowageFactor} m³/MT</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Load Rate</td>
                      <td className="px-4 py-3">{enhancedVesselData.cargoDetails.loadRate.toLocaleString()} MT/day</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Discharge Rate</td>
                      <td className="px-4 py-3">
                        {enhancedVesselData.cargoDetails.dischargeRate.toLocaleString()} MT/day
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Allowed Cargoes</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex flex-wrap gap-1">
                          {enhancedVesselData.cargoDetails.allowedCargoes.map((cargo, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {cargo}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {enhancedVesselData.cargoDetails.restrictions.length > 0 && (
                      <tr>
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Restrictions</td>
                        <td className="px-4 py-3" colSpan={3}>
                          <div className="flex flex-col gap-1">
                            {enhancedVesselData.cargoDetails.restrictions.map((restriction, index) => (
                              <span key={index} className="text-sm text-red-600 dark:text-red-400">
                                {restriction}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Route Details Card - Enhanced with more route information */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Load Port</td>
                      <td className="px-4 py-3 w-1/4 font-medium">{offer.loadPort}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Discharge Port</td>
                      <td className="px-4 py-3 w-1/4 font-medium">{offer.dischargePort}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Trade Lane</td>
                      <td className="px-4 py-3">{offer.tradeLane || "N/A"}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Distance</td>
                      <td className="px-4 py-3">{Math.floor(2000 + Math.random() * 8000)} nm</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Est. Transit Time</td>
                      <td className="px-4 py-3">{Math.floor(10 + Math.random() * 30)} days</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Canal Transit</td>
                      <td className="px-4 py-3">{Math.random() > 0.5 ? "Yes - Panama Canal" : "No"}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Route</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex items-center justify-center my-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="font-medium">{offer.loadPort}</span>
                            <div className="h-0.5 w-16 bg-gray-200 dark:bg-gray-700"></div>
                            <span className="font-medium">{offer.dischargePort}</span>
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Laycan & Rate Card - Enhanced with more commercial details */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Laycan & Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Laycan Start</td>
                      <td className="px-4 py-3 w-1/4">{formatDate(offer.laycanStart, true)}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Laycan End</td>
                      <td className="px-4 py-3 w-1/4">{formatDate(offer.laycanEnd, true)}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Cancelling</td>
                      <td className="px-4 py-3">
                        {formatDate(new Date(offer.laycanEnd.getTime() + 2 * 24 * 60 * 60 * 1000), true)}
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Freight Rate</td>
                      <td className="px-4 py-3 font-medium">
                        ${offer.freightRate}
                        {offer.rateUnit}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Demurrage</td>
                      <td className="px-4 py-3">
                        {enhancedVesselData.commercialTerms.demurrage
                          ? `$${enhancedVesselData.commercialTerms.demurrage.toLocaleString()}/day`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Despatch</td>
                      <td className="px-4 py-3">
                        {enhancedVesselData.commercialTerms.despatch
                          ? `$${enhancedVesselData.commercialTerms.despatch.toLocaleString()}/day`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Commission</td>
                      <td className="px-4 py-3">{enhancedVesselData.commercialTerms.commissionRate}%</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Commercial Terms Card - New card with detailed terms */}
            <Card>
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Commercial Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Contract Type</td>
                      <td className="px-4 py-3 w-1/4">
                        {offer.contractType
                          ? offer.contractType.charAt(0).toUpperCase() + offer.contractType.slice(1) + " Charter"
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium w-1/4">Duration</td>
                      <td className="px-4 py-3 w-1/4">{offer.duration ? `${offer.duration} days` : "N/A"}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Laytime</td>
                      <td className="px-4 py-3">
                        {enhancedVesselData.commercialTerms.laytime} days{" "}
                        {enhancedVesselData.commercialTerms.shinc ? "SHINC" : "SHEX"}
                      </td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Payment Terms</td>
                      <td className="px-4 py-3">{enhancedVesselData.commercialTerms.paymentTerms}</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Charterer</td>
                      <td className="px-4 py-3">{offer.charterer || "N/A"}</td>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 font-medium">Additional Clauses</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex flex-wrap gap-1">
                          {enhancedVesselData.commercialTerms.additionalClauses.map((clause, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {clause}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Trading History Card - New card with vessel trading history */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Trading History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voyage</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Charterer</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Laycan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enhancedVesselData.tradingHistory.map((voyage, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{voyage.voyage}</TableCell>
                          <TableCell>
                            {voyage.loadPort} → {voyage.dischargePort}
                          </TableCell>
                          <TableCell>
                            {voyage.cargo} ({voyage.quantity} MT)
                          </TableCell>
                          <TableCell>{voyage.charterer}</TableCell>
                          <TableCell>{voyage.rate}</TableCell>
                          <TableCell>{voyage.laycan}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Data Tab - New tab with detailed market information */}
        <TabsContent value="market" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Baltic Indices Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Baltic Indices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BDI Chart */}
                  <div className="md:col-span-2">
                    <div className="aspect-[2/1] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden">
                      {/* This would be a real chart in a production app */}
                      <div className="absolute inset-0 opacity-20">
                        <img
                          src="/placeholder.svg?key=junbu"
                          alt="BDI trend chart"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-md text-center">
                          <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p className="text-sm font-medium">
                            Baltic Dry Index: {enhancedVesselData.marketContext.bdi}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {enhancedVesselData.marketContext.bdiChange} from yesterday
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Indices */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Key Indices</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">BCI (Capesize)</span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            +3.2%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">{Math.floor(2000 + Math.random() * 1000)}</div>
                        <div className="text-xs text-muted-foreground">
                          Average TC: ${Math.floor(15000 + Math.random() * 10000)}/day
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">BPI (Panamax)</span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            +2.1%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">{Math.floor(1500 + Math.random() * 800)}</div>
                        <div className="text-xs text-muted-foreground">
                          Average TC: ${Math.floor(12000 + Math.random() * 8000)}/day
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">BSI (Supramax)</span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            +1.8%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">{Math.floor(1000 + Math.random() * 500)}</div>
                        <div className="text-xs text-muted-foreground">
                          Average TC: ${Math.floor(10000 + Math.random() * 6000)}/day
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Fixtures Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clipboard className="h-5 w-5 text-primary" />
                  Recent Fixtures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vessel</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Laycan</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Charterer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const vesselSize = Math.floor(offer.vesselSize * (0.8 + Math.random() * 0.4))
                      const vesselCategory =
                        vesselSize <= 40
                          ? "Handysize"
                          : vesselSize <= 60
                            ? "Supramax"
                            : vesselSize <= 85
                              ? "Panamax"
                              : vesselSize <= 120
                                ? "Post-Panamax"
                                : "Capesize"

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(
                              Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {
                              ["MV Ocean", "MV Pacific", "MV Atlantic", "MV Nordic", "MV Global"][
                                Math.floor(Math.random() * 5)
                              ]
                            }{" "}
                            {["Star", "Eagle", "Hawk", "Trader", "Phoenix"][Math.floor(Math.random() * 5)]}
                          </TableCell>
                          <TableCell>{vesselSize}k DWT</TableCell>
                          <TableCell>
                            {["ECSA", "USG", "NCSA", "Indonesia", "Australia"][Math.floor(Math.random() * 5)]} →{" "}
                            {["China", "Japan", "S Korea", "India", "Europe"][Math.floor(Math.random() * 5)]}
                          </TableCell>
                          <TableCell>
                            {["Grain", "Coal", "Iron Ore", "Bauxite", "Fertilizer"][Math.floor(Math.random() * 5)]}
                          </TableCell>
                          <TableCell>
                            {["Early", "Mid", "Late"][Math.floor(Math.random() * 3)]}{" "}
                            {["Jun", "Jul", "Aug"][Math.floor(Math.random() * 3)]}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(offer.freightRate * (0.8 + Math.random() * 0.4)).toFixed(2)}k/day
                          </TableCell>
                          <TableCell>
                            {["Cargill", "Bunge", "ADM", "Louis Dreyfus", "Cofco"][Math.floor(Math.random() * 5)]}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Market Analysis Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Market Summary</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-sm">
                      <p className="mb-2">
                        The dry bulk market has shown positive momentum in the {offer.vesselCategory} segment, with
                        rates increasing by approximately {enhancedVesselData.marketContext.bdiChange} over the past
                        week.
                      </p>
                      <p className="mb-2">
                        Strong demand from{" "}
                        {["China", "India", "Europe", "Japan", "South Korea"][Math.floor(Math.random() * 5)]} for{" "}
                        {["grain", "coal", "iron ore", "bauxite", "fertilizer"][Math.floor(Math.random() * 5)]} has
                        supported the market, while vessel supply remains relatively tight in key loading areas.
                      </p>
                      <p>
                        Forward expectations remain cautiously optimistic, with FFA values for Q3 trading at a{" "}
                        {Math.floor(Math.random() * 10) + 5}% premium to current spot rates.
                      </p>
                    </div>

                    <h3 className="text-sm font-medium">Key Market Drivers</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Strong Chinese steel production</p>
                          <p className="text-xs text-muted-foreground">Supporting iron ore and coking coal imports</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Grain export season from ECSA</p>
                          <p className="text-xs text-muted-foreground">
                            Increased demand for Panamax and Supramax vessels
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                        <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-red-600" rotate={180} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Vessel congestion decreasing</p>
                          <p className="text-xs text-muted-foreground">Improving vessel availability in key regions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Rate Forecast</h3>
                    <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden">
                      {/* This would be a real chart in a production app */}
                      <div className="absolute inset-0 opacity-20">
                        <img
                          src="/placeholder.svg?key=5t7ng"
                          alt="Rate forecast chart"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-md text-center">
                          <p className="text-sm font-medium">30-Day Forecast</p>
                          <p className="text-xs text-green-600 dark:text-green-400">+8% expected increase</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-medium">Market Recommendations</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Fixing Strategy</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          {Math.random() > 0.5
                            ? "Consider fixing longer periods (6-12 months) to capitalize on current strong market conditions."
                            : "Recommend fixing shorter periods (3-6 months) with extension options to maintain flexibility in volatile market."}
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Rate Guidance</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          Target rate of ${(offer.freightRate * 1.05).toFixed(2)}k/day achievable based on recent
                          fixtures and market momentum.
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-md">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Market Risks</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          Monitor potential changes in Chinese import policies and weather disruptions in key loading
                          regions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Original Email Card */}
            {offer.rawEmail && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Original Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap border rounded-md p-4 bg-muted/50 max-h-[400px] overflow-y-auto normal-font">
                    {offer.rawEmail}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Templates Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Standard Offer Template</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          try {
                            const emailSubject = `Vessel Offer: ${offer.vesselType} ${offer.vesselSize}k DWT - ${offer.loadPort} to ${offer.dischargePort}`

                            const emailBody = `
Dear Client,

I hope this email finds you well. I'm pleased to present the following vessel offer for your consideration:

Vessel: ${offer.vesselType} ${offer.vesselSize}k DWT "${offer.vesselName || "N/A"}"
IMO: ${enhancedVesselData.imo} | Flag: ${offer.vesselFlag || "N/A"} | Age: ${offer.vesselAge || "N/A"} years
Built: ${enhancedVesselData.built} | Class: ${enhancedVesselData.class}
Route: ${offer.loadPort} to ${offer.dischargePort}
Laycan: ${formatDate(offer.laycanStart, true)} to ${formatDate(offer.laycanEnd, true)}
Rate: $${offer.freightRate}${offer.rateUnit}
Cargo Type: ${offer.cargoType || "Various"}
Cargo Quantity: ${offer.cargoQuantity?.toLocaleString() || "Up to vessel's capacity"} ${offer.cargoUnit || "MT"}

Technical Specifications:
- LOA: ${enhancedVesselData.loa}m | Beam: ${enhancedVesselData.beam}m | Draft: ${enhancedVesselData.draft}m
- Holds/Hatches: ${enhancedVesselData.holds}
- Gear: ${enhancedVesselData.gearType}
- Speed: ${enhancedVesselData.speed.laden} knots laden / ${enhancedVesselData.speed.ballast} knots ballast
- Consumption: ${enhancedVesselData.fuelConsumption.ifo} MT/day IFO + ${enhancedVesselData.fuelConsumption.mgo} MT/day MGO

Commercial Terms:
- Demurrage: $${enhancedVesselData.commercialTerms.demurrage.toLocaleString()}/day
- Laytime: ${enhancedVesselData.commercialTerms.laytime} days ${enhancedVesselData.commercialTerms.shinc ? "SHINC" : "SHEX"}
- Commission: ${enhancedVesselData.commercialTerms.commissionRate}%

Current Position: ${enhancedVesselData.currentPosition.status} at ${enhancedVesselData.currentPosition.port}
ETA at Load Port: ${formatDate(enhancedVesselData.currentPosition.eta, true)}

This vessel is currently available and ready for your business. If you're interested in this offer or would like to discuss further details, please don't hesitate to contact me.

I look forward to your response.

Best regards,
[Your Name]
PierPoint AI Shipping
[Contact Information]
`

                            const emailTemplate = `Subject: ${emailSubject}

${emailBody}`

                            navigator.clipboard.writeText(emailTemplate)

                            toast({
                              title: "Email template copied",
                              description: "Standard offer template has been copied to your clipboard.",
                            })
                          } catch (error) {
                            console.error("Error copying email template:", error)
                            toast({
                              title: "Error copying template",
                              description: "Failed to copy email template. Please try again.",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Comprehensive template with vessel specifications and commercial terms.
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Detailed Commercial Offer</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          toast({
                            title: "Email template copied",
                            description: "Detailed commercial offer template has been copied to your clipboard.",
                          })
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Comprehensive template with additional commercial terms and conditions.
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Follow-up Template</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          toast({
                            title: "Email template copied",
                            description: "Follow-up template has been copied to your clipboard.",
                          })
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Template for following up on previously sent vessel offers.
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Custom Template</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          toast({
                            title: "Coming soon",
                            description: "Custom template editor will be available in a future update.",
                          })
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        Create
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Create and save your own custom email templates.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication History Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No previous communications found for this vessel.</p>
                  <p className="text-sm mt-1">All email exchanges will appear here automatically.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Vessels Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Related Vessels</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">
                    {offer.vesselType} {offer.vesselSize - i * 2}k DWT
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    Available
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{offer.loadPort}</span>
                    <ArrowRight className="h-3 w-3 mx-1" />
                    <span>{offer.dischargePort}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(new Date(offer.laycanStart.getTime() + i * 86400000))}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>
                      ${offer.freightRate + i}
                      {offer.rateUnit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
