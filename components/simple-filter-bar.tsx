"use client"

import type React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SimpleFilterBarProps {
  filters?: any // Replace 'any' with a more specific type if possible
  setFilters?: (filters: any) => void // Replace 'any' with a more specific type if possible
  quickTags?: string[]
  selectedTags?: string[]
  toggleTag?: (tag: string) => void
  VESSEL_TYPES?: string[]
  REGIONS?: { name: string }[]
}

const SimpleFilterBar: React.FC<SimpleFilterBarProps> = ({
  filters = {},
  setFilters = () => {},
  quickTags = [],
  selectedTags = [],
  toggleTag = () => {},
  VESSEL_TYPES = [],
  REGIONS = [],
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Vessel Type Filter */}
      <Select
        value={filters.vesselType || "all"}
        onValueChange={(value) => {
          setFilters({
            ...filters,
            vesselType: value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Vessel Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {VESSEL_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Region Filter */}
      <Select
        value={filters.region || "all"}
        onValueChange={(value) => {
          setFilters({
            ...filters,
            region: value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Region" />
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

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => {
          setFilters({
            ...filters,
            status: value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="fixed">Fixed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Quick Tag Filters */}
      <div className="flex flex-wrap gap-1 ml-auto">
        {quickTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedTags.includes(tag) ? "bg-primary" : "hover:bg-primary/10",
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default SimpleFilterBar
