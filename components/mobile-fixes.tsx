"use client"

import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

// This component applies global fixes for mobile devices
export function MobileFixes() {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) return

    // Fix viewport issues
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      )
    } else {
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      document.head.appendChild(meta)
    }

    // Fix iOS status bar
    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (!statusBarMeta) {
      const meta = document.createElement("meta")
      meta.name = "apple-mobile-web-app-status-bar-style"
      meta.content = "black-translucent"
      document.head.appendChild(meta)
    }

    // Fix iOS web app capable
    const webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
    if (!webAppMeta) {
      const meta = document.createElement("meta")
      meta.name = "apple-mobile-web-app-capable"
      meta.content = "yes"
      document.head.appendChild(meta)
    }

    // Fix overscroll behavior
    document.body.style.overscrollBehavior = "none"

    // Fix touch action
    document.body.style.touchAction = "manipulation"

    // Fix iOS tap highlight
    const style = document.createElement("style")
    style.innerHTML = `
      * {
        -webkit-tap-highlight-color: transparent;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.body.style.overscrollBehavior = ""
      document.body.style.touchAction = ""
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [isMobile])

  return null
}
