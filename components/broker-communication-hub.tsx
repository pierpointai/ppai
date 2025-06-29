"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Paperclip,
  Mic,
  Video,
  MoreHorizontal,
  Search,
  Star,
  Archive,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Globe,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: "text" | "voice" | "document" | "vessel_offer"
  status: "sent" | "delivered" | "read"
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  vesselOffer?: {
    vesselName: string
    vesselType: string
    route: string
    rate: string
  }
}

interface Contact {
  id: string
  name: string
  company: string
  role: "charterer" | "owner" | "broker" | "operator"
  avatar?: string
  status: "online" | "offline" | "away"
  lastSeen?: Date
  unreadCount: number
  lastMessage?: string
  priority: "high" | "medium" | "low"
  tags: string[]
}

interface BrokerCommunicationHubProps {
  className?: string
}

export function BrokerCommunicationHub({ className }: BrokerCommunicationHubProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Mock contacts data
  const [contacts] = useState<Contact[]>([
    {
      id: "1",
      name: "John Chen",
      company: "COSCO Shipping",
      role: "charterer",
      status: "online",
      unreadCount: 3,
      lastMessage: "What's your best rate for Panamax grain USG-China?",
      priority: "high",
      tags: ["grain", "regular_client"],
    },
    {
      id: "2",
      name: "Maria Santos",
      company: "Vale Trading",
      role: "charterer",
      status: "online",
      unreadCount: 1,
      lastMessage: "Need Capesize for iron ore Brazil-China",
      priority: "high",
      tags: ["iron_ore", "premium_client"],
    },
    {
      id: "3",
      name: "David Kim",
      company: "Pacific Basin",
      role: "owner",
      status: "away",
      unreadCount: 0,
      lastMessage: "MV Ocean Star available June 15",
      priority: "medium",
      tags: ["handysize", "reliable"],
    },
    {
      id: "4",
      name: "Sarah Johnson",
      company: "Oldendorff Carriers",
      role: "operator",
      status: "offline",
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      lastMessage: "Thanks for the quick response",
      priority: "medium",
      tags: ["bulk_carrier", "frequent"],
    },
    {
      id: "5",
      name: "Ahmed Al-Rashid",
      company: "Emirates Shipping",
      role: "broker",
      status: "online",
      unreadCount: 2,
      lastMessage: "Can you cover Middle East-India route?",
      priority: "medium",
      tags: ["middle_east", "new_contact"],
    },
  ])

  // Mock messages for selected contact
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: selectedContact.id,
          senderName: selectedContact.name,
          content: selectedContact.lastMessage || "Hello",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: "text",
          status: "read",
        },
        {
          id: "2",
          senderId: "me",
          senderName: "You",
          content: "Let me check our available vessels and get back to you.",
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: "text",
          status: "read",
        },
        {
          id: "3",
          senderId: "me",
          senderName: "You",
          content: "I have a perfect match for your requirement.",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          type: "vessel_offer",
          status: "delivered",
          vesselOffer: {
            vesselName: "MV Ocean Pioneer",
            vesselType: "Panamax 76k DWT",
            route: "US Gulf → China",
            rate: "$19.5k/day",
          },
        },
        {
          id: "4",
          senderId: selectedContact.id,
          senderName: selectedContact.name,
          content: "Looks interesting. Can you send more details?",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: "text",
          status: "read",
        },
      ]
      setMessages(mockMessages)
    }
  }, [selectedContact])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && contact.unreadCount > 0) ||
      (activeTab === "priority" && contact.priority === "high") ||
      (activeTab === "charterers" && contact.role === "charterer") ||
      (activeTab === "owners" && contact.role === "owner")

    return matchesSearch && matchesTab
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      type: "text",
      status: "sent",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)

    toast({
      title: "Message sent",
      description: `Message sent to ${selectedContact.name}`,
    })
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Tap again to stop and send voice message",
      })
    } else {
      toast({
        title: "Voice message sent",
        description: "Voice message has been sent",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "charterer":
        return <Users className="h-3 w-3" />
      case "owner":
        return <Star className="h-3 w-3" />
      case "broker":
        return <MessageSquare className="h-3 w-3" />
      case "operator":
        return <Globe className="h-3 w-3" />
      default:
        return <Users className="h-3 w-3" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Hub
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {contacts.filter((c) => c.status === "online").length} online
            </Badge>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Contacts Sidebar */}
        <div className="w-80 flex flex-col border-r pr-4">
          {/* Search and Tabs */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                  {contacts.filter((c) => c.unreadCount > 0).length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                      {contacts.filter((c) => c.unreadCount > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="priority" className="text-xs">
                  Priority
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted",
                    selectedContact?.id === contact.id && "bg-primary/10 border border-primary/20",
                  )}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                          getStatusColor(contact.status),
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">{contact.name}</span>
                          {getRoleIcon(contact.role)}
                        </div>
                        {contact.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mb-1">{contact.company}</div>

                      <div className="text-xs text-muted-foreground truncate">{contact.lastMessage}</div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {contact.status === "offline" && contact.lastSeen ? formatTime(contact.lastSeen) : "online"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedContact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                        getStatusColor(selectedContact.status),
                      )}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{selectedContact.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedContact.company} • {selectedContact.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Report Issue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-3", message.senderId === "me" ? "justify-end" : "justify-start")}
                    >
                      {message.senderId !== "me" && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {selectedContact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn("max-w-[70%] space-y-1", message.senderId === "me" ? "items-end" : "items-start")}
                      >
                        {message.type === "vessel_offer" && message.vesselOffer ? (
                          <div
                            className={cn(
                              "p-3 rounded-lg border",
                              message.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4" />
                              <span className="font-medium text-sm">Vessel Offer</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <strong>{message.vesselOffer.vesselName}</strong>
                              </div>
                              <div>{message.vesselOffer.vesselType}</div>
                              <div>{message.vesselOffer.route}</div>
                              <div className="font-medium">{message.vesselOffer.rate}</div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "p-3 rounded-lg",
                              message.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            <div className="text-sm">{message.content}</div>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === "me" && (
                            <div className="flex items-center">
                              {message.status === "sent" && <Clock className="h-3 w-3" />}
                              {message.status === "delivered" && <CheckCircle2 className="h-3 w-3" />}
                              {message.status === "read" && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {message.senderId === "me" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="min-h-[40px] max-h-[120px] resize-none"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceRecord}
                    className={cn(isRecording && "bg-red-100 text-red-600")}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>

                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a contact from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
