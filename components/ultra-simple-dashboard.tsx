"use client"

import { useSimpleOfferStore } from "@/lib/simplified-stores"
import { SimpleLayout, SimpleGrid, SimpleSection } from "@/components/core/simple-layout"
import { DataRow, StatCard } from "@/components/core/data-display"
import { Input } from "@/components/ui/input"
import { calculate } from "@/lib/core/simple-calculations"

export function UltraSimpleDashboard() {
  const { offers, getFilteredOffers, setSearch, searchTerm } = useSimpleOfferStore()
  const filteredOffers = getFilteredOffers()

  const stats = {
    total: offers.length,
    available: offers.filter((o) => o.status === "available").length,
    avgRate: calculate.average(offers.map((o) => o.freightRate || 0)),
    totalValue: calculate.sum(offers.map((o) => (o.freightRate || 0) * (o.vesselSize || 0))),
  }

  return (
    <SimpleLayout title="Dashboard">
      <SimpleGrid cols={4}>
        <StatCard title="Total Offers" value={stats.total} />
        <StatCard title="Available" value={stats.available} />
        <StatCard title="Avg Rate" value={`$${stats.avgRate.toFixed(1)}k`} />
        <StatCard title="Total Value" value={`$${(stats.totalValue / 1000).toFixed(1)}M`} />
      </SimpleGrid>

      <SimpleSection title="Quick Search">
        <Input placeholder="Search offers..." value={searchTerm} onChange={(e) => setSearch(e.target.value)} />
      </SimpleSection>

      <SimpleSection title="Recent Offers">
        <div className="space-y-2">
          {filteredOffers.slice(0, 5).map((offer) => (
            <DataRow
              key={offer.id}
              label={`${offer.vesselType} ${offer.vesselSize}k`}
              value={`${offer.loadPort} → ${offer.dischargePort}`}
              badge={offer.status}
            />
          ))}
        </div>
      </SimpleSection>
    </SimpleLayout>
  )
}
