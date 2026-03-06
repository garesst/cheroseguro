import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { GlobalTracker } from "@/components/tracking/global-tracker"
import { siteName } from "@/lib/config"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${siteName} - Aprende Concienciación en Ciberseguridad`,
  description:
    "Una plataforma educativa enfocada en alfabetización en ciberseguridad a través de contenido interactivo, simulaciones y juegos. Aprende a protegerte en línea.",
  generator: "chero seguro",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <GlobalTracker />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
