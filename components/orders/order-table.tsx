"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Ship, Edit, Trash2, FileText, Zap } from "lucide-react"
import { useOrderStore } from "@/lib/store/order-store"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import type { Order, LinkedVessel } from "@/lib/store/order-store"
import { VesselLinkingDialog } from "./vessel-linking-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderDetailsDialog } from "./order-details-dialog"
import { OrderEditDialog } from "./order-edit-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { statusColors } from "@/lib/design-system"

interface OrderTableProps {
  orders?: Order[]
  onAIMatch?: () => void
}

export function OrderTable({ orders: propOrders, onAIMatch }: OrderTableProps) {
  const { deleteOrder, resetStore } = useOrderStore()
  const orders = propOrders || []

  const [linkingOrderId, setLinkingOrderId] = useState<string | null>(null)
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Debug logging to check order data
  useEffect(() => {
    if (orders.length > 0) {
      console.log("Orders loaded:", orders.length)
      console.log("Sample order:", orders[0])
    }
  }, [orders])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openMenuId])

  const getOrderTypeColor = (orderType: string) => {
    switch (orderType?.toUpperCase()) {
      case "TC":
        return "bg-purple-100 text-purple-900 border-purple-300"
      case "VOYAGE":
        return "bg-blue-100 text-blue-900 border-blue-300"
      case "COA":
        return "bg-emerald-100 text-emerald-900 border-emerald-300"
      default:
        return "bg-gray-100 text-gray-900 border-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-amber-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getVesselStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return statusColors.shortlisted
      case "Contacted":
        return statusColors.contacted
      case "Offered":
        return statusColors.offered
      case "Rejected":
        return statusColors.rejected
      case "Nominated":
        return statusColors.nominated
      default:
        return statusColors.default
    }
  }

  const handleEdit = (orderId: string) => {
    console.log("Edit order:", orderId)
    setEditingOrderId(orderId)
    setOpenMenuId(null)
  }

  const handleDelete = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      console.log("Delete order:", orderId)
      deleteOrder(orderId)
    }
    setOpenMenuId(null)
  }

  const handleViewDetails = (orderId: string) => {
    console.log("View details for order:", orderId)
    setDetailsOrderId(orderId)
  }

  const handleLinkVessels = (orderId: string) => {
    console.log("Link vessels for order:", orderId)
    setLinkingOrderId(orderId)
  }

  const handleAIMatch = (orderId?: string) => {
    console.log("AI Match for order:", orderId || "all orders")
    if (onAIMatch) {
      onAIMatch()
    }

    // If a specific order ID is provided, we could pre-filter the AI matching to that order
    if (orderId) {
      localStorage.setItem("targetOrderId", orderId)
    }
  }

  const handleResetData = () => {
    if (
      confirm("Are you sure you want to reset all order data? This will replace all current orders with sample data.")
    ) {
      console.log("Resetting order data...")
      resetStore()
    }
  }

  const toggleMenu = (orderId: string) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId)
  }

  const formatCargoQuantity = useCallback((order: Order) => {
    if (!order.cargoQuantity) return "N/A"
    return `${order.cargoQuantity.toLocaleString()} ${order.cargoUnit || "MT"}`
  }, [])

  const activeOrdersCount = useMemo(() => {
    return orders.filter((order) => order.status === "Active" || !order.status).length
  }, [orders])

  // Format order ID to be more readable
  const formatOrderId = (id: string) => {
    if (id.startsWith("ord-")) {
      return id.replace("ord-", "#")
    }
    return `#${id.slice(-4)}`
  }

  // Fix the formatDate function to handle invalid dates
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A"

      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return format(date, "MMM dd")
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid Date"
    }
  }

  // Fix the formatOrderType function to handle undefined values
  const formatOrderType = (orderType: string | undefined) => {
    if (!orderType) return "V" // Default to Voyage if undefined

    switch (orderType.toUpperCase()) {
      case "VOYAGE":
        return "V"
      case "TC":
        return "TC"
      case "COA":
        return "COA"
      default:
        return orderType
    }
  }

  // Safe number formatting
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "N/A"
    }
    return num.toLocaleString()
  }

  // Render linked vessels with details
  const renderLinkedVessels = (linkedVessels: LinkedVessel[] | undefined) => {
    if (!linkedVessels || linkedVessels.length === 0) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
          No vessels
        </Badge>
      )
    }

    if (linkedVessels.length === 1) {
      const vessel = linkedVessels[0]
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1">
                <div className="font-medium text-sm truncate max-w-[150px]">
                  {vessel.vesselName || vessel.name || "Unknown Vessel"}
                </div>
                <Badge variant="outline" className={`text-xs ${getVesselStatusColor(vessel.status || "Shortlisted")}`}>
                  {vessel.status || "Shortlisted"}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{vessel.vesselName || vessel.name}</p>
                <p>DWT: {vessel.dwt?.toLocaleString() || "N/A"}</p>
                <p>Open: {vessel.openPort || "N/A"}</p>
                <p>Status: {vessel.status || "Shortlisted"}</p>
                {vessel.matchScore && <p>Match: {vessel.matchScore}/10</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    // Multiple vessels - show count and first vessel name
    const firstVessel = linkedVessels[0]
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                  {linkedVessels.length} vessels
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                {firstVessel.vesselName || firstVessel.name || "Unknown"}
                {linkedVessels.length > 1 && ` +${linkedVessels.length - 1} more`}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2 max-w-xs">
              <p className="font-medium">{linkedVessels.length} Linked Vessels:</p>
              {linkedVessels.slice(0, 5).map((vessel, index) => (
                <div key={vessel.id || index} className="border-b border-gray-200 pb-1 last:border-b-0">
                  <p className="font-medium text-sm">{vessel.vesselName || vessel.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{vessel.dwt?.toLocaleString() || "N/A"} DWT</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getVesselStatusColor(vessel.status || "Shortlisted")}`}
                    >
                      {vessel.status || "Shortlisted"}
                    </Badge>
                  </div>
                  {vessel.matchScore && <p className="text-xs text-muted-foreground">Match: {vessel.matchScore}/10</p>}
                </div>
              ))}
              {linkedVessels.length > 5 && (
                <p className="text-xs text-muted-foreground">...and {linkedVessels.length - 5} more</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Helper function to render the order table
  const renderOrderTable = (ordersToRender: Order[]) => (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Order #</TableHead>
            <TableHead className="w-[60px]">Type</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Vessel Size</TableHead>
            <TableHead>Laycan</TableHead>
            <TableHead>Route</TableHead>
            <TableHead className="w-[180px]">Linked Vessels</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersToRender.map((order) => {
            // Ensure we have fallback values
            const orderType = order.orderType || "Voyage"
            const orderPriority = order.priority || "Medium"

            return (
              <TableRow
                key={order.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Prevent row click when clicking on action buttons
                  if (!(e.target as HTMLElement).closest(".action-buttons")) {
                    handleViewDetails(order.id)
                  }
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full inline-block ${getPriorityColor(orderPriority)}`} />
                    <span>{formatOrderId(order.id)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getOrderTypeColor(orderType)} text-xs font-medium border`}>
                    {formatOrderType(orderType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.cargoType || "Unknown Cargo"}</div>
                    <div className="text-xs text-muted-foreground">{formatCargoQuantity(order)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatNumber(order.dwtMin)} - {formatNumber(order.dwtMax)}k MT
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{formatDate(order.laycanStart)}</div>
                    <div className="text-xs text-muted-foreground">to {formatDate(order.laycanEnd)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm">
                          {order.loadPort || "Unknown"} → {order.dischargePort || "Unknown"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          {order.charterer && <p>Charterer: {order.charterer}</p>}
                          {order.tradeLane && <p>Trade Lane: {order.tradeLane}</p>}
                          {!order.charterer && !order.tradeLane && <p>No additional information available</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="py-2">{renderLinkedVessels(order.linkedVessels)}</TableCell>
                <TableCell className="text-right action-buttons">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* AI Match Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIMatch(order.id)}
                      className="h-8 w-8 p-0"
                      title="AI Match"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order.id)}
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    {/* Popup Menu Button */}
                    <div className="relative" ref={(el) => (menuRefs.current[order.id] = el)}>
                      <Button
                        variant={openMenuId === order.id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => toggleMenu(order.id)}
                        className="h-8 w-8 p-0"
                        title="More Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {/* Popup Menu */}
                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-md z-50 animate-in fade-in-0 zoom-in-95 py-1">
                          <button
                            onClick={() => handleEdit(order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Edit Order Details</span>
                          </button>
                          <button
                            onClick={() => handleLinkVessels(order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Ship className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Link Vessels</span>
                          </button>
                          <div className="border-t border-border my-1"></div>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete Order</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <>
      {orders.length === 0 ? (
        <div className="p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Ship className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No orders found</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first order or reset the data</p>
          <Button onClick={handleResetData} className="mt-4">
            Load Sample Data
          </Button>
        </div>
      ) : (
        renderOrderTable(orders)
      )}

      {/* Order Details Dialog */}
      {detailsOrderId && (
        <OrderDetailsDialog
          open={!!detailsOrderId}
          onOpenChange={(open) => {
            if (!open) {
              setDetailsOrderId(null)
            }
          }}
          order={orders.find((o) => o.id === detailsOrderId)!}
        />
      )}

      {/* Order Edit Dialog */}
      {editingOrderId && (
        <OrderEditDialog
          open={!!editingOrderId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingOrderId(null)
            }
          }}
          order={orders.find((o) => o.id === editingOrderId)!}
        />
      )}

      {/* Vessel Linking Dialog */}
      {linkingOrderId && (
        <VesselLinkingDialog
          open={!!linkingOrderId}
          onOpenChange={(open) => !open && setLinkingOrderId(null)}
          order={orders.find((o) => o.id === linkingOrderId)!}
        />
      )}
    </>
  )
}
