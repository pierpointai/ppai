import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

interface DataRowProps {
  label: string
  value: ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export const DataRow = ({ label, value, badge, badgeVariant = "default" }: DataRowProps) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-medium">{value}</span>
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
    </div>
  </div>
)

export const DataGrid = ({ data }: { data: Array<{ label: string; value: ReactNode }> }) => (
  <div className="grid grid-cols-2 gap-4">
    {data.map(({ label, value }, index) => (
      <div key={index} className="space-y-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    ))}
  </div>
)

export const StatCard = ({
  title,
  value,
  change,
}: {
  title: string
  value: string | number
  change?: string
}) => (
  <div className="bg-card p-4 rounded-lg border">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
    {change && <div className="text-sm text-green-600">{change}</div>}
  </div>
)
