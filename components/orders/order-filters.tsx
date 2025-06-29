"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"
import { useOrderStore } from "@/lib/store/order-store"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function OrderFilters() {
  const { filters, setFilters } = useOrderStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value === "all" ? undefined : value })
  }

  const clearFilters = () => {
    setFilters({})
  }

  const activeFilterCount = Object.values(filters).filter((value) => value && value !== "" && value !== "all").length

  return (
    <div className="space-y-4">
      {/* Primary Search Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by cargo, ports, charterer..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 border-gray-200",
            activeFilterCount > 0 && "border-blue-500 bg-blue-50 text-blue-700",
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Order Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Order Type</label>
            <Select
              value={filters.orderType || "all"}
              onValueChange={(value) => handleFilterChange("orderType", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Voyage">Voyage Charter</SelectItem>
                <SelectItem value="TC">Time Charter</SelectItem>
                <SelectItem value="COA">Contract of Affreightment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Matched">Matched</SelectItem>
                <SelectItem value="Fixed">Fixed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <Select value={filters.priority || "all"} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High Priority</SelectItem>
                <SelectItem value="Medium">Medium Priority</SelectItem>
                <SelectItem value="Low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cargo Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cargo Type</label>
            <Select
              value={filters.cargoType || "all"}
              onValueChange={(value) => handleFilterChange("cargoType", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cargo</SelectItem>
                <SelectItem value="Iron Ore">Iron Ore</SelectItem>
                <SelectItem value="Coal">Coal</SelectItem>
                <SelectItem value="Grain">Grain</SelectItem>
                <SelectItem value="Bauxite">Bauxite</SelectItem>
                <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                <SelectItem value="Steel Products">Steel Products</SelectItem>
                <SelectItem value="Cement">Cement</SelectItem>
                <SelectItem value="Salt">Salt</SelectItem>
                <SelectItem value="Sand">Sand</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trade Lane */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Trade Lane</label>
            <Select
              value={filters.tradeLane || "all"}
              onValueChange={(value) => handleFilterChange("tradeLane", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Trade Lanes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trade Lanes</SelectItem>
                <SelectItem value="Australia-China (Iron Ore)">Australia-China (Iron Ore)</SelectItem>
                <SelectItem value="Australia-Europe">Australia-Europe</SelectItem>
                <SelectItem value="US Gulf-Europe (Grain)">US Gulf-Europe (Grain)</SelectItem>
                <SelectItem value="West Africa-Europe">West Africa-Europe</SelectItem>
                <SelectItem value="Brazil-China">Brazil-China</SelectItem>
                <SelectItem value="Black Sea-Asia">Black Sea-Asia</SelectItem>
                <SelectItem value="Worldwide Trading">Worldwide Trading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Charterer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Charterer</label>
            <Select
              value={filters.charterer || "all"}
              onValueChange={(value) => handleFilterChange("charterer", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="All Charterers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Charterers</SelectItem>
                <SelectItem value="Cargill">Cargill</SelectItem>
                <SelectItem value="Trafigura">Trafigura</SelectItem>
                <SelectItem value="Bunge">Bunge</SelectItem>
                <SelectItem value="Oldendorff">Oldendorff</SelectItem>
                <SelectItem value="Alcoa">Alcoa</SelectItem>
                <SelectItem value="Vale">Vale</SelectItem>
                <SelectItem value="Rio Tinto">Rio Tinto</SelectItem>
                <SelectItem value="BHP">BHP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Load Port */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Load Port</label>
            <Input
              placeholder="Enter load port..."
              value={filters.loadPort || ""}
              onChange={(e) => handleFilterChange("loadPort", e.target.value)}
              className="bg-white border-gray-200"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === "" || value === "all") return null
            return (
              <Badge
                key={key}
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1"
              >
                <span className="capitalize">{key}:</span>
                <span>{value}</span>
                <button
                  onClick={() => handleFilterChange(key, "")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
