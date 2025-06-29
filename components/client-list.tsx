"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Users } from "lucide-react"
import type { Client } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClientCard } from "@/components/client-card"

interface ClientListProps {
  clients: Client[]
  selectedClientId: string | null
  onSelectClient: (clientId: string) => void
}

export function ClientList({ clients, selectedClientId, onSelectClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Clients</h2>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-3">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => onSelectClient(client.id)}
                isActive={selectedClientId === client.id}
              />
            ))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">No clients found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
