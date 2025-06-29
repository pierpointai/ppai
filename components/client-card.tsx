"use client"

import type { Client } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Building, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientCardProps {
  client: Client
  onClick: () => void
  isActive: boolean
}

export function ClientCard({ client, onClick, isActive }: ClientCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      case "inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
      case "new":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md mobile-p-2 border-border/50",
        isActive ? "ring-1 ring-primary" : "",
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium text-base sm:text-lg">{client.name}</h3>
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                {client.company}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(client.status))}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm truncate">{client.email}</span>
        </div>

        {client.requests && client.requests.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {client.requests.length} request{client.requests.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
