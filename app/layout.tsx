import type React from "react"
import { Inter } from "next/font/google"
import ClientRootLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PierPoint AI",
  description: "AI-powered screening tool for shipping offers",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}


import './globals.css'
