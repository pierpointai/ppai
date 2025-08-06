import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CardConfig } from "@/lib/micro/types"

export function MicroCard({ title, value, change, icon }: CardConfig) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? "+" : ""}
            {change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
