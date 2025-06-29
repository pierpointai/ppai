"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Mail, Users, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useOfferStore } from "@/lib/store/offer-store"

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { offers } = useOfferStore()

  const newOffersCount = offers.filter((offer) => offer.status === "available").length

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      name: "Email Scanner",
      href: "/email-scanner",
      icon: Mail,
      active: pathname === "/email-scanner",
      badge: newOffersCount > 0 ? newOffersCount : null,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
      active: pathname === "/clients",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  // Don't show the navigation on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-safe"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full touch-manipulation",
              "transition-colors duration-200",
              item.active ? "text-primary" : "text-muted-foreground hover:text-foreground active:text-primary",
            )}
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate(5) // Light haptic feedback
              }
              router.push(item.href)
            }}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  )
}
