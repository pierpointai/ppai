"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Ship, Edit, Trash2, FileText, Zap } from "lucide-react"
import { useOrderStore } from "@/lib/store/order-store"
import { useState, useEffect, useRef } from "react"
import type { Order, LinkedVessel } from "@/lib/store/order-store"
import { VesselLinkingDialog } from "./vessel-linking-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderDetailsDialog } from "./order-details-dialog"
import { OrderEditDialog } from "./order-edit-dialog"
import { SimpleTooltip } from "@/components/ui/simple-tooltip"
import { SimpleBadge } from "@/components/ui/simple-badge"
import { formatters } from "@/lib/utils/format"
import { getColor } from "@/lib/utils/colors"

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openMenuId])

  const handleAction = (action: string, orderId: string) => {
    setOpenMenuId(null)
    const actions = {
      edit: () => setEditingOrderId(orderId),
      delete: () => confirm("Are you sure you want to delete this order?") && deleteOrder(orderId),
      details: () => setDetailsOrderId(orderId),
      link: () => setLinkingOrderId(orderId),
      "ai-match": () => {
        onAIMatch?.()
        if (orderId) localStorage.setItem("targetOrderId", orderId)
      },
    }
    actions[action]?.()
  }

  const renderLinkedVessels = (linkedVessels?: LinkedVessel[]) => {
    if (!linkedVessels?.length) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
          No vessels
        </Badge>
      )
    }

    if (linkedVessels.length === 1) {
      const vessel = linkedVessels[0]
      return (
        <SimpleTooltip
          content={
            <div className="space-y-1">
              <p className="font-medium">{vessel.vesselName || vessel.name}</p>
              <p>DWT: {vessel.dwt?.toLocaleString() || "N/A"}</p>
              <p>Open: {vessel.openPort || "N/A"}</p>
              <p>Status: {vessel.status || "Shortlisted"}</p>
              {vessel.matchScore && <p>Match: {vessel.matchScore}/10</p>}
            </div>
          }
        >
          <div className="space-y-1">
            <div className="font-medium text-sm truncate max-w-[150px]">
              {vessel.vesselName || vessel.name || "Unknown Vessel"}
            </div>
            <SimpleBadge type="status" value={vessel.status || "Shortlisted"} />
          </div>
        </SimpleTooltip>
      )
    }

    return (
      <SimpleTooltip
        content={
          <div className="space-y-2 max-w-xs">
            <p className="font-medium">{linkedVessels.length} Linked Vessels:</p>
            {linkedVessels.slice(0, 5).map((vessel, index) => (
              <div key={vessel.id || index} className="border-b border-gray-200 pb-1 last:border-b-0">
                <p className="font-medium text-sm">{vessel.vesselName || vessel.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{vessel.dwt?.toLocaleString() || "N/A"} DWT</span>
                  <SimpleBadge type="status" value={vessel.status || "Shortlisted"} />
                </div>
              </div>
            ))}
            {linkedVessels.length > 5 && (
              <p className="text-xs text-muted-foreground">...and {linkedVessels.length - 5} more</p>
            )}
          </div>
        }
      >
        <div className="space-y-1">
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
            {linkedVessels.length} vessels
          </Badge>
          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
            {linkedVessels[0].vesselName || linkedVessels[0].name || "Unknown"}
            {linkedVessels.length > 1 && ` +${linkedVessels.length - 1} more`}
          </div>
        </div>
      </SimpleTooltip>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Ship className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="text-sm text-muted-foreground mt-1">Create your first order or reset the data</p>
        <Button onClick={() => confirm("Reset all order data?") && resetStore()} className="mt-4">
          Load Sample Data
        </Button>
      </div>
    )
  }

  return (
    <>
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
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest(".action-buttons")) {
                    handleAction("details", order.id)
                  }
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full inline-block ${getColor.priority(order.priority)}`} />
                    <span>{formatters.orderId(order.id)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <SimpleBadge type="orderType" value={order.orderType}>
                    {formatters.orderType(order.orderType)}
                  </SimpleBadge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.cargoType || "Unknown Cargo"}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatters.cargo(order.cargoQuantity, order.cargoUnit)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatters.number(order.dwtMin)} - {formatters.number(order.dwtMax)}k MT
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{formatters.date(order.laycanStart)}</div>
                    <div className="text-xs text-muted-foreground">to {formatters.date(order.laycanEnd)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <SimpleTooltip
                    content={
                      <div>
                        {order.charterer && <p>Charterer: {order.charterer}</p>}
                        {order.tradeLane && <p>Trade Lane: {order.tradeLane}</p>}
                        {!order.charterer && !order.tradeLane && <p>No additional information available</p>}
                      </div>
                    }
                  >
                    <div className="text-sm">{formatters.route(order.loadPort, order.dischargePort)}</div>
                  </SimpleTooltip>
                </TableCell>
                <TableCell className="py-2">{renderLinkedVessels(order.linkedVessels)}</TableCell>
                <TableCell className="text-right action-buttons">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("ai-match", order.id)}
                      className="h-8 w-8 p-0"
                      title="AI Match"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("details", order.id)}
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <div className="relative" ref={(el) => (menuRefs.current[order.id] = el)}>
                      <Button
                        variant={openMenuId === order.id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-md z-50 animate-in fade-in-0 zoom-in-95 py-1">
                          <button
                            onClick={() => handleAction("edit", order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                            Edit Order Details
                          </button>
                          <button
                            onClick={() => handleAction("link", order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Ship className="h-4 w-4 mr-2 text-muted-foreground" />
                            Link Vessels
                          </button>
                          <div className="border-t border-border my-1"></div>
                          <button
                            onClick={() => handleAction("delete", order.id)}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {detailsOrderId && (
        <OrderDetailsDialog
          open={!!detailsOrderId}
          onOpenChange={(open) => !open && setDetailsOrderId(null)}
          order={orders.find((o) => o.id === detailsOrderId)!}
        />
      )}
      {editingOrderId && (
        <OrderEditDialog
          open={!!editingOrderId}
          onOpenChange={(open) => !open && setEditingOrderId(null)}
          order={orders.find((o) => o.id === editingOrderId)!}
        />
      )}
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
