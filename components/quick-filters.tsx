"use client"

import type React from "react"

import { Layers, CheckCircle2, Clock, DollarSign, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickFiltersProps {
  activeFilter?: string
  setActiveFilter?: (filter: string) => void
  resetFilters?: () => void
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilter = "all",
  setActiveFilter = () => {},
  resetFilters = () => {},
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter("all")}
        className="transition-all"
      >
        <Layers className="h-4 w-4 mr-2" />
        All Offers
      </Button>

      <Button
        variant={activeFilter === "available" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter("available")}
        className="transition-all"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Available
      </Button>

      <Button
        variant={activeFilter === "urgent" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter("urgent")}
        className="transition-all"
      >
        <Clock className="h-4 w-4 mr-2" />
        Urgent
      </Button>

      <Button
        variant={activeFilter === "premium" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter("premium")}
        className="transition-all"
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Premium Rates
      </Button>

      <Button
        variant={activeFilter === "favorites" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter("favorites")}
        className="transition-all"
      >
        <Star className="h-4 w-4 mr-2" />
        Favorites
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setActiveFilter("all")
          resetFilters()
        }}
        className="ml-auto transition-all"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  )
}

export default QuickFilters
