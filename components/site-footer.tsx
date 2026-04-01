import Link from "next/link"
import { Shield } from "lucide-react"
import { siteName } from "@/lib/config"

export function SiteFooter() {
  const sponsorLogoUrl = process.env.NEXT_PUBLIC_SPONSOR_LOGO_URL?.trim()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="space-y-3 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proyecto educativo de concienciación en ciberseguridad para aprender, practicar y fortalecer hábitos digitales seguros.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-foreground mb-3">Navegación</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/learn" className="hover:text-foreground transition-colors">
                  Aprender
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-foreground transition-colors">
                  Practicar
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-foreground mb-3">Información</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/acerca" className="hover:text-foreground transition-colors">
                  Acerca del proyecto
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-foreground transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-foreground transition-colors">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            {sponsorLogoUrl ? (
              <div>
                <img
                  src={sponsorLogoUrl}
                  alt="Logo de patrocinador"
                  className="w-auto max-w-[440px] object-contain mx-auto md:mx-0"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">© 2026 {siteName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
