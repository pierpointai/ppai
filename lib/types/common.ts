export interface BaseVessel {
  id: string
  vesselName?: string
  vesselType: string
  vesselSize: number
  vesselAge?: number
  vesselFlag?: string
  loadPort: string
  dischargePort: string
  laycanStart: Date
  laycanEnd: Date
  freightRate: number
  rateUnit?: string
  cargoType?: string
  status?: string
  category?: string
  priority?: string
}

export interface BaseOrder {
  id: string
  orderType: string
  cargoType: string
  cargoQuantity?: number
  loadPort: string
  dischargePort: string
  laycanStart: string
  laycanEnd?: string
  status: string
  charterer?: string
  priority?: string
}

export interface MatchResult {
  vessel: BaseVessel
  order: BaseOrder
  matchScore: number
  reasons: string[]
  warnings?: string[]
}

export interface UIState {
  isLoading: boolean
  error: string | null
  selectedItems: Set<string>
}

export type SortField = "score" | "rate" | "date" | "vessel" | "priority"
export type SortOrder = "asc" | "desc"
export type ViewMode = "list" | "grid" | "vesselTypes"
