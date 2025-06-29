"use client"

import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Menu, X, Settings, HelpCircle, User, LogOut, ChevronDown, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useOfferStore } from "@/lib/offer-store"
import Image from "next/image"

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onOpenSidebar?: () => void
  isSidebarOpen?: boolean
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Manage and analyze vessel offers",
  onOpenSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { offers } = useOfferStore()
  const newOffersCount = offers.filter((offer) => offer.status === "available").length

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-screen-2xl">
        <div className="flex items-center gap-2 md:gap-4">
          {onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onOpenSidebar}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Image
                src="/images/pierpoint-ai-logo.png"
                alt="PierPoint AI"
                width={140}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="md:ml-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn("transition-all duration-200 ease-in-out", isSearchOpen ? "w-full md:w-72" : "w-0 md:w-72")}
          >
            {(isSearchOpen || window.innerWidth >= 768) && (
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search offers..."
                  className="w-full rounded-full bg-secondary pl-8 focus-visible:ring-primary"
                />
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {newOffersCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground"
                    variant="default"
                  >
                    {newOffersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {newOffersCount > 0 ? (
                  <div className="p-2">
                    <div className="mb-2 rounded-md bg-secondary p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Mail className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">New Vessel Offers</p>
                            <p className="text-xs text-muted-foreground">
                              You have {newOffersCount} new vessel offers to review
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          New
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Bell className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No new notifications</p>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="px-1 py-4">
                <h3 className="mb-4 text-lg font-medium">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Display</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Theme</span>
                        <ModeToggle />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <span className="hidden md:inline-block text-sm font-medium">John Doe</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
