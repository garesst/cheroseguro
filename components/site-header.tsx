import Link from "next/link"
import { Shield, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  enableLearnMenu,
  enablePracticeMenu,
  enablePlayMenu,
  enableCertificationsMenu,
  enableLoginMenu,
  enableSignupMenu,
  siteName
} from "@/lib/config"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">{siteName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {enableLearnMenu && (
              <Link
                href="/learn"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Aprender
              </Link>
            )}
            {enablePracticeMenu && (
              <Link
                href="/practice"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Practicar
              </Link>
            )}
            {enablePlayMenu && (
              <Link
                href="/play"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Jugar
              </Link>
            )}
            {enableCertificationsMenu && (
              <Link
                href="/certifications"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Certificaciones
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {enableLoginMenu && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            )}
            {enableSignupMenu && (
              <Button size="sm" asChild>
                <Link href="/signup">Registrarse</Link>
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {enableLearnMenu && (
                  <Link href="/learn" className="text-base font-medium text-foreground">
                    Aprender
                  </Link>
                )}
                {enablePracticeMenu && (
                  <Link href="/practice" className="text-base font-medium text-foreground">
                    Practicar
                  </Link>
                )}
                {enablePlayMenu && (
                  <Link href="/play" className="text-base font-medium text-foreground">
                    Jugar
                  </Link>
                )}
                {enableCertificationsMenu && (
                  <Link href="/certifications" className="text-base font-medium text-foreground">
                    Certificaciones
                  </Link>
                )}
                <div className="flex flex-col gap-2 mt-4">
                  {enableLoginMenu && (
                    <Button variant="ghost" asChild>
                      <Link href="/login">Iniciar sesión</Link>
                    </Button>
                  )}
                  {enableSignupMenu && (
                    <Button asChild>
                      <Link href="/signup">Registrarse</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
