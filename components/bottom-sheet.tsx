"use client"

import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type React from "react"

interface BottomSheetProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  contentClassName?: string
  showHandle?: boolean
  snapPoints?: number[]
  defaultSnapPoint?: number
}

export function BottomSheet({
  children,
  trigger,
  title,
  description,
  footer,
  open,
  onOpenChange,
  className,
  contentClassName,
  showHandle = true,
  snapPoints,
  defaultSnapPoint,
}: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={snapPoints} defaultSnapPoint={defaultSnapPoint}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom" className={cn("rounded-t-xl", contentClassName)}>
        {showHandle && (
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />
        )}
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className={cn("py-4", className)}>{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
