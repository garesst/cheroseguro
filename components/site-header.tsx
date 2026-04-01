'use client'

import Link from "next/link"
import { Shield, Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { 
  enableLearnMenu,
  enablePracticeMenu,
  enableCertificationsMenu,
  enableLoginMenu,
  enableSignupMenu,
  siteName
} from "@/lib/config"

export function SiteHeader() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const navLinks = (
    <>
      {enableLearnMenu && (
        <Link href="/learn" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Aprender
        </Link>
      )}
      {enablePracticeMenu && (
        <Link href="/practice" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Practicar
        </Link>
      )}
      {enableCertificationsMenu && (
        <Link href="/certifications" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Certificaciones
        </Link>
      )}
    </>
  )

  const userDisplayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : ''

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">{siteName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop auth section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : isAuthenticated && user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[140px] truncate">{userDisplayName}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {enableLearnMenu && (
                  <Link href="/learn" className="text-base font-medium text-foreground">Aprender</Link>
                )}
                {enablePracticeMenu && (
                  <Link href="/practice" className="text-base font-medium text-foreground">Practicar</Link>
                )}
                {enableCertificationsMenu && (
                  <Link href="/certifications" className="text-base font-medium text-foreground">Certificaciones</Link>
                )}
                <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                  {isAuthenticated && user ? (
                    <>
                      <p className="text-sm font-medium text-foreground px-1">{userDisplayName}</p>
                      <p className="text-xs text-muted-foreground px-1 truncate">{user.email}</p>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/profile">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Mi perfil
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={logout}
                        className="justify-start text-red-600 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
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
