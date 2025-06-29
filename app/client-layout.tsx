"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileNavigation } from "@/components/mobile-navigation"
import { MobileHeader } from "@/components/mobile-header"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { MobileFixes } from "@/components/mobile-fixes"

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const pathname = usePathname()

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/clients") return "Clients"
    if (pathname === "/email-scanner") return "Email Scanner"
    if (pathname === "/settings") return "Settings"
    if (pathname === "/comparison") return "Comparison"
    if (pathname === "/profile") return "Profile"
    return "PierPoint AI"
  }

  // Prevent overscroll/bounce effect on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overscrollBehavior = "none"

      // Add viewport meta tag for mobile
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      document.head.appendChild(meta)

      // Add status bar meta tags for iOS
      const metaStatusBar = document.createElement("meta")
      metaStatusBar.name = "apple-mobile-web-app-status-bar-style"
      metaStatusBar.content = "black-translucent"
      document.head.appendChild(metaStatusBar)

      const metaWebApp = document.createElement("meta")
      metaWebApp.name = "apple-mobile-web-app-capable"
      metaWebApp.content = "yes"
      document.head.appendChild(metaWebApp)

      return () => {
        document.body.style.overscrollBehavior = ""
        document.head.removeChild(meta)
        document.head.removeChild(metaStatusBar)
        document.head.removeChild(metaWebApp)
      }
    }
  }, [isMobile])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <MobileFixes />
          <AuthProvider>
            <SidebarProvider>
              {isMobile ? (
                <>
                  <MobileHeader
                    title={getPageTitle()}
                    showBack={pathname !== "/dashboard"}
                    showSearch={pathname === "/dashboard" || pathname === "/clients"}
                    showFilter={pathname === "/dashboard"}
                    showNotifications={true}
                  />
                  <main className="pt-14 pb-16 min-h-screen overflow-x-hidden">{children}</main>
                  <MobileNavigation />
                </>
              ) : (
                <div className="flex h-screen w-full overflow-hidden">
                  <AppSidebar
                    viewMode="grid"
                    setViewMode={(mode) => {
                      const event = new CustomEvent("setViewMode", { detail: mode })
                      window.dispatchEvent(event)
                    }}
                    vesselTypeFilter={null}
                    setVesselTypeFilter={(filter) => {
                      const event = new CustomEvent("setVesselTypeFilter", { detail: filter })
                      window.dispatchEvent(event)
                    }}
                    cargoTypeFilter={null}
                    setCargoTypeFilter={(filter) => {
                      const event = new CustomEvent("setCargoTypeFilter", { detail: filter })
                      window.dispatchEvent(event)
                    }}
                    contractTypeFilter={null}
                    setContractTypeFilter={(filter) => {
                      const event = new CustomEvent("setContractTypeFilter", { detail: filter })
                      window.dispatchEvent(event)
                    }}
                    handleAddSampleOffer={() => {
                      const event = new CustomEvent("addSampleOffer")
                      window.dispatchEvent(event)
                    }}
                    isLoading={false}
                  />
                  <div className="flex flex-col flex-1 w-full overflow-hidden">
                    <main className="flex-1 w-full overflow-auto">{children}</main>
                  </div>
                </div>
              )}
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
