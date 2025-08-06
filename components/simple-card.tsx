import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  title: string
  value: string | number
  icon?: React.ReactNode
}

export function SimpleCard({ title, value, icon }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
