"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type React from "react"

interface ResponsiveTabsProps {
  tabs: {
    id: string
    label: React.ReactNode
    content: React.ReactNode
    icon?: React.ReactNode
  }[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabsListClassName?: string
  tabsContentClassName?: string
  orientation?: "horizontal" | "vertical"
  mobileOrientation?: "horizontal" | "vertical"
  desktopOrientation?: "horizontal" | "vertical"
  showIconsOnMobile?: boolean
  showLabelsOnMobile?: boolean
  fullWidthTabs?: boolean
}

export function ResponsiveTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  tabsListClassName,
  tabsContentClassName,
  orientation = "horizontal",
  mobileOrientation,
  desktopOrientation,
  showIconsOnMobile = true,
  showLabelsOnMobile = true,
  fullWidthTabs = false,
}: ResponsiveTabsProps) {
  const isMobile = useIsMobile()

  const effectiveOrientation = isMobile ? mobileOrientation || orientation : desktopOrientation || orientation

  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.id}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", effectiveOrientation === "vertical" ? "flex flex-row space-x-4" : "", className)}
    >
      <TabsList
        className={cn(
          effectiveOrientation === "vertical" ? "flex-col h-auto space-y-1 space-x-0" : "flex-row",
          fullWidthTabs && effectiveOrientation !== "vertical" ? "w-full grid grid-cols-" + tabs.length : "",
          tabsListClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              effectiveOrientation === "vertical" ? "justify-start" : "",
              fullWidthTabs && effectiveOrientation !== "vertical" ? "flex-1" : "",
            )}
          >
            {tab.icon && (showIconsOnMobile || !isMobile) && (
              <span className={cn("mr-2", !showLabelsOnMobile && isMobile ? "mr-0" : "")}>{tab.icon}</span>
            )}
            {(showLabelsOnMobile || !isMobile) && tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={cn("flex-1", effectiveOrientation === "vertical" ? "w-full" : "", tabsContentClassName)}>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="w-full">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
