"use client"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import type React from "react"

interface ResponsiveDialogProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  contentClassName?: string
  forceDialog?: boolean
  forceDrawer?: boolean
  drawerSnapPoints?: number[]
  drawerDefaultSnapPoint?: number
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  footer,
  open,
  onOpenChange,
  className,
  contentClassName,
  forceDialog = false,
  forceDrawer = false,
  drawerSnapPoints,
  drawerDefaultSnapPoint,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  // Determine whether to use Dialog or Drawer
  const useDrawer = forceDrawer || (isMobile && !forceDialog)
  const useDialog = !useDrawer

  if (useDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn("sm:max-w-[425px]", contentClassName)}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={drawerSnapPoints}
      defaultSnapPoint={drawerDefaultSnapPoint}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={contentClassName}>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        <div className="px-4">{children}</div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  )
}
