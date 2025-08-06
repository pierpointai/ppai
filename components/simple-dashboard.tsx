"use client"
import { Ship, DollarSign, TrendingUp, Users } from "lucide-react"
import { SimpleCard } from "./simple-card"
import { SimpleTable } from "./simple-table"
import { useOffers, useOrders } from "@/lib/store"
import { format } from "@/lib/simple"

export function SimpleDashboard() {
  const offers = useOffers((s) => s.items)
  const orders = useOrders((s) => s.items)

  const stats = [
    { title: "Offers", value: offers.length, icon: <Ship className="h-4 w-4" /> },
    { title: "Orders", value: orders.length, icon: <DollarSign className="h-4 w-4" /> },
    { title: "Revenue", value: format.currency(1250000), icon: <TrendingUp className="h-4 w-4" /> },
    { title: "Clients", value: 45, icon: <Users className="h-4 w-4" /> },
  ]

  const columns = [
    { key: "vesselName", label: "Vessel" },
    { key: "vesselType", label: "Type" },
    { key: "loadPort", label: "Load Port" },
    { key: "freightRate", label: "Rate", render: (item: any) => format.currency(item.freightRate) },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <SimpleCard key={i} {...stat} />
        ))}
      </div>

      <SimpleTable
        data={offers.slice(0, 10)}
        columns={columns}
        onAction={(action, item) => console.log(action, item)}
      />
    </div>
  )
}
