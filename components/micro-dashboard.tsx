"use client"

import { Ship, DollarSign, TrendingUp, Users } from "lucide-react"
import { MicroLayout } from "./micro/layout"
import { MicroCard } from "./micro/card"
import { MicroTable } from "./micro/table"
import { useOffers, useOrders } from "@/lib/micro/store"
import { utils } from "@/lib/micro/utils"

export function MicroDashboard() {
  const { items: offers } = useOffers()
  const { items: orders } = useOrders()

  const stats = [
    { title: "Total Offers", value: offers.length, icon: <Ship className="h-4 w-4" /> },
    { title: "Active Orders", value: orders.length, icon: <DollarSign className="h-4 w-4" /> },
    { title: "Revenue", value: utils.currency(1250000), icon: <TrendingUp className="h-4 w-4" /> },
    { title: "Clients", value: 45, icon: <Users className="h-4 w-4" /> },
  ]

  const tableConfig = {
    data: offers.slice(0, 5),
    columns: [
      { key: "vesselName", label: "Vessel" },
      { key: "vesselType", label: "Type" },
      { key: "loadPort", label: "Load Port" },
      { key: "freightRate", label: "Rate", render: (item: any) => utils.currency(item.freightRate || 0) },
    ],
    actions: [
      { label: "View", onClick: () => {} },
      { label: "Edit", onClick: () => {} },
    ],
  }

  return (
    <MicroLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <MicroCard key={i} {...stat} />
        ))}
      </div>
      <MicroTable {...tableConfig} />
    </MicroLayout>
  )
}
