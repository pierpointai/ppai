"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { VESSEL_TYPES, REGIONS } from "@/lib/mock-data"
import { useOfferStore } from "@/lib/offer-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { OFFER_CATEGORIES, OFFER_PRIORITIES, DEFAULT_TAGS, VESSEL_CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getCategoryColor, getPriorityColor, getVesselCategoryColor } from "@/lib/offer-utils"
import { toast } from "@/components/ui/use-toast"

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useOfferStore()
  const [minFreightRate, setMinFreightRate] = useState(10)
  const [maxDaysToLaycan, setMaxDaysToLaycan] = useState(30)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])

  const handleApplyFilters = () => {
    // Validate filters before applying
    if (minFreightRate < 0) {
      toast({
        title: "Invalid filter",
        description: "Minimum freight rate cannot be negative.",
        variant: "destructive",
      })
      return
    }

    if (maxDaysToLaycan < 0) {
      toast({
        title: "Invalid filter",
        description: "Maximum days to laycan cannot be negative.",
        variant: "destructive",
      })
      return
    }

    setFilters({
      ...filters,
      minFreightRate,
      maxDaysToLaycan,
      showOnlyAvailable,
      tags: selectedTags.length > 0 ? selectedTags : null,
    })

    toast({
      title: "Filters applied",
      description: "Your filter settings have been applied.",
    })
  }

  const handleResetFilters = () => {
    // Reset all filter state variables
    setMinFreightRate(10)
    setMaxDaysToLaycan(30)
    setShowOnlyAvailable(true)
    setSelectedTags([])

    // Reset the global filters
    resetFilters()

    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    })
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="vessel">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="vessel">Vessel</TabsTrigger>
          <TabsTrigger value="cargo">Cargo</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="vessel" className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Vessel Type</label>
            <Select
              value={filters.vesselType || ""}
              onValueChange={(value) => setFilters({ ...filters, vesselType: value === "all" ? null : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Vessel Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessel Types</SelectItem>
                {VESSEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Vessel Category</label>
            <Select
              value={filters.vesselCategory || ""}
              onValueChange={(value) => setFilters({ ...filters, vesselCategory: value === "all" ? null : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Vessel Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessel Categories</SelectItem>
                {VESSEL_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", getVesselCategoryColor(category))} />
                      <span>{category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Minimum Freight Rate</label>
              <span className="text-sm">${minFreightRate}k/day</span>
            </div>
            <Slider
              value={[minFreightRate]}
              min={5}
              max={30}
              step={0.5}
              onValueChange={(value) => setMinFreightRate(value[0])}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="available-switch" checked={showOnlyAvailable} onCheckedChange={setShowOnlyAvailable} />
            <Label htmlFor="available-switch">Show only available vessels</Label>
          </div>
        </TabsContent>

        <TabsContent value="cargo" className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Region</label>
            <Select
              value={filters.region || ""}
              onValueChange={(value) => setFilters({ ...filters, region: value === "all" ? null : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map((region) => (
                  <SelectItem key={region.name} value={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Laycan Month</label>
            <Select
              value={filters.laycanMonth || ""}
              onValueChange={(value) => setFilters({ ...filters, laycanMonth: value === "all" ? null : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="May">May</SelectItem>
                <SelectItem value="June">June</SelectItem>
                <SelectItem value="July">July</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Days to Laycan</label>
              <span className="text-sm">{maxDaysToLaycan} days</span>
            </div>
            <Slider
              value={[maxDaysToLaycan]}
              min={7}
              max={60}
              step={1}
              onValueChange={(value) => setMaxDaysToLaycan(value[0])}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Cargo Type</label>
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
              {DEFAULT_TAGS.filter((tag) =>
                ["Grain", "Coal", "Iron Ore", "Steel Products", "Fertilizer"].includes(tag),
              ).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedTags.includes(tag) ? "bg-primary" : "hover:bg-primary/10",
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click on tags to toggle selection</p>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Filter by Category</label>
            <div className="space-y-2">
              {OFFER_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Switch
                    id={`category-${category}`}
                    checked={filters.category === category}
                    onCheckedChange={(checked) =>
                      setFilters({
                        ...filters,
                        category: checked ? category : null,
                      })
                    }
                  />
                  <Label htmlFor={`category-${category}`} className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", getCategoryColor(category))} />
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <label className="text-sm font-medium mb-3 block">Filter by Priority</label>
            <div className="space-y-2">
              {OFFER_PRIORITIES.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Switch
                    id={`priority-${priority}`}
                    checked={filters.priority === priority}
                    onCheckedChange={(checked) =>
                      setFilters({
                        ...filters,
                        priority: checked ? priority : null,
                      })
                    }
                  />
                  <Label htmlFor={`priority-${priority}`} className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", getPriorityColor(priority))} />
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <label className="text-sm font-medium mb-3 block">Other Tags</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.filter(
                (tag) => !["Grain", "Coal", "Iron Ore", "Steel Products", "Fertilizer"].includes(tag),
              ).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset All Filters
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}
