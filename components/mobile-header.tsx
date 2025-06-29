"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Menu, Search, Bell, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Input } from "@/components/ui/input"

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  showSearch?: boolean
  showFilter?: boolean
  showMenu?: boolean
  showNotifications?: boolean
  onSearchClick?: () => void
  onFilterClick?: () => void
  onSearchChange?: (value: string) => void
  searchValue?: string
  searchPlaceholder?: string
  showSearchInHeader?: boolean
}

export function MobileHeader({
  title,
  showBack = false,
  showSearch = false,
  showFilter = false,
  showMenu = true,
  showNotifications = false,
  onSearchClick,
  onFilterClick,
  onSearchChange,
  searchValue = "",
  searchPlaceholder = "Search...",
  showSearchInHeader = false,
}: MobileHeaderProps) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add haptic feedback
  const handleButtonClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(5) // Light haptic feedback
    }
  }

  return (
    <motion.header
      className={cn("fixed top-0 left-0 right-0 z-40 bg-background border-b pt-safe", isScrolled ? "shadow-sm" : "")}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => {
                handleButtonClick()
                router.back()
              }}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          ) : showMenu ? (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2" onClick={handleButtonClick}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <AppSidebar
                  viewMode="grid"
                  setViewMode={() => {}}
                  vesselTypeFilter={null}
                  setVesselTypeFilter={() => {}}
                  cargoTypeFilter={null}
                  setCargoTypeFilter={() => {}}
                  contractTypeFilter={null}
                  setContractTypeFilter={() => {}}
                  handleAddSampleOffer={() => {}}
                  isLoading={false}
                  onClose={() => setSidebarOpen(false)}
                />
              </SheetContent>
            </Sheet>
          ) : null}

          <div className="flex items-center">
            <div className="relative h-8 w-32">
              <Image
                src="/images/pierpoint-ai-logo.png"
                alt="PierPoint AI"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            {title !== "Dashboard" && (
              <div className="ml-2">
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {showSearchInHeader && (
            <div className="relative w-full max-w-[200px] mr-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => onSearchChange?.("")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
          )}

          {showSearch && !showSearchInHeader && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleButtonClick()
                if (onSearchClick) {
                  onSearchClick()
                } else {
                  setSearchOpen(true)
                }
              }}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {showFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleButtonClick()
                onFilterClick?.()
              }}
            >
              <Filter className="h-5 w-5" />
              <span className="sr-only">Filter</span>
            </Button>
          )}

          {showNotifications && (
            <Button variant="ghost" size="icon" onClick={handleButtonClick}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="px-4 pb-2 pt-1 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 pr-9"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex">
              {searchValue && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSearchChange?.("")}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSearchOpen(false)}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  )
}
