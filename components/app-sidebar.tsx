"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Settings,
  HelpCircle,
  ChevronRight,
  Home,
  ChevronLeft,
  LogOut,
  User,
  BarChart3,
  Package,
  Calculator,
  TrendingUp,
} from "lucide-react"
import { useOfferStore } from "@/lib/offer-store"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  vesselTypeFilter: string | null
  setVesselTypeFilter: (filter: string | null) => void
  cargoTypeFilter: string | null
  setCargoTypeFilter: (filter: string | null) => void
  contractTypeFilter: string | null
  setContractTypeFilter: (filter: string | null) => void
  handleAddSampleOffer: () => void
  isLoading: boolean
}

export function AppSidebar({
  className,
  isOpen = true,
  onToggle,
  viewMode,
  setViewMode,
  vesselTypeFilter,
  setVesselTypeFilter,
  cargoTypeFilter,
  setCargoTypeFilter,
  contractTypeFilter,
  setContractTypeFilter,
  handleAddSampleOffer,
  isLoading,
}: SidebarProps) {
  const pathname = usePathname()
  const { offers } = useOfferStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, signOut } = useAuth()

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  const newOffersCount = offers.filter((offer) => offer.status === "available").length

  // Don't show the sidebar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  return (
    <div
      className={cn(
        "sidebar-wrapper border-r border-border bg-background transition-all duration-300",
        isCollapsed && "collapsed",
        className,
      )}
      style={{ width: isCollapsed ? "70px" : "280px" }}
    >
      <div className="sidebar-content h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <div className="h-8 w-8 relative">
                <Image
                  src="/images/pierpoint-ai-logo.png"
                  alt="PierPoint AI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-8 relative">
                <Image
                  src="/images/pierpoint-ai-logo.png"
                  alt="PierPoint AI"
                  width={140}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {user && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user.name.charAt(0)}
              </div>
              <div className="sidebar-text overflow-hidden">
                <div className="font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto py-2">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Main</div>
            </div>
          )}
          <nav className="grid gap-1 px-2 mb-4">
            <Link
              href="/"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/"}
            >
              <Home className="h-4 w-4" />
              <span className="sidebar-text">Dashboard</span>
            </Link>

            <Link
              href="/orders"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/orders" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/orders"}
            >
              <Package className="h-4 w-4" />
              <span className="sidebar-text">Orders</span>
            </Link>
          </nav>

          {!isCollapsed && (
            <div className="px-3 mb-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Analysis</div>
            </div>
          )}
          <nav className="grid gap-1 px-2 mb-4">
            <Link
              href="/comparison"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/comparison"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/comparison"}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="sidebar-text">Comparison</span>
            </Link>

            <Link
              href="/voyage-calculator"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/voyage-calculator"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/voyage-calculator"}
            >
              <Calculator className="h-4 w-4" />
              <span className="sidebar-text">Voyage Calculator</span>
            </Link>

            <Link
              href="/voyage-estimation"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/voyage-estimation"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/voyage-estimation"}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="sidebar-text">Voyage Estimation</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto border-t border-border p-2">
          <nav className="grid gap-1">
            <Link
              href="/profile"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/profile"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/profile"}
            >
              <User className="h-4 w-4" />
              <span className="sidebar-text">Profile</span>
            </Link>

            <Link
              href="/settings"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/settings"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/settings"}
            >
              <Settings className="h-4 w-4" />
              <span className="sidebar-text">Settings</span>
            </Link>

            <Link
              href="/help"
              className={cn(
                "sidebar-menu-button flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/help" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              data-active={pathname === "/help"}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="sidebar-text">Help & Support</span>
            </Link>

            {user && (
              <Button
                variant="ghost"
                className="sidebar-menu-button flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="sidebar-text">Sign Out</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
