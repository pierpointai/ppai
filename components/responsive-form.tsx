"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Label } from "@/components/ui/label"

interface ResponsiveFormProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  spacing?: "tight" | "normal" | "loose"
  onSubmit?: (e: React.FormEvent) => void
}

export function ResponsiveForm({
  children,
  className,
  mobileClassName,
  desktopClassName,
  spacing = "normal",
  onSubmit,
}: ResponsiveFormProps) {
  const isMobile = useIsMobile()

  const spacingClass = {
    tight: "space-y-3",
    normal: "space-y-4",
    loose: "space-y-6",
  }[spacing]

  return (
    <form
      className={cn("w-full", spacingClass, className, isMobile ? mobileClassName : desktopClassName)}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(e)
      }}
    >
      {children}
    </form>
  )
}

interface ResponsiveFormFieldProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  label?: string
  description?: string
  error?: string
  id?: string
}

export function ResponsiveFormField({
  children,
  className,
  mobileClassName,
  desktopClassName,
  label,
  description,
  error,
  id,
}: ResponsiveFormFieldProps) {
  const isMobile = useIsMobile()
  const fieldId = id || Math.random().toString(36).substring(2, 9)

  return (
    <div className={cn("w-full", className, isMobile ? mobileClassName : desktopClassName)}>
      {label && (
        <Label htmlFor={fieldId} className={cn("block mb-1.5", error && "text-destructive")}>
          {label}
        </Label>
      )}
      {description && <p className="text-sm text-muted-foreground mb-1.5">{description}</p>}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            "aria-invalid": error ? "true" : undefined,
            "aria-describedby": error ? `${fieldId}-error` : undefined,
          })
        : children}
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-destructive mt-1.5">
          {error}
        </p>
      )}
    </div>
  )
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  align?: "left" | "center" | "right" | "between" | "around"
  direction?: "row" | "column"
}

export function ResponsiveFormActions({
  children,
  className,
  mobileClassName,
  desktopClassName,
  align = "right",
  direction = "row",
}: ResponsiveFormActionsProps) {
  const isMobile = useIsMobile()

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
    around: "justify-around",
  }[align]

  const directionClass = {
    row: "flex-row",
    column: "flex-col",
  }[direction]

  return (
    <div
      className={cn(
        "flex gap-3 mt-6",
        alignClass,
        directionClass,
        className,
        isMobile ? mobileClassName : desktopClassName,
      )}
    >
      {children}
    </div>
  )
}
