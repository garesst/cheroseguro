import Link from "next/link"
import { Shield } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">CyberGuard Academy</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering everyone to stay safe online through education and practice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/learn/beginner" className="hover:text-foreground transition-colors">
                  Beginner Guides
                </Link>
              </li>
              <li>
                <Link href="/learn/intermediate" className="hover:text-foreground transition-colors">
                  Intermediate
                </Link>
              </li>
              <li>
                <Link href="/learn/advanced" className="hover:text-foreground transition-colors">
                  Advanced Topics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Practice</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/practice/phishing" className="hover:text-foreground transition-colors">
                  Phishing Detection
                </Link>
              </li>
              <li>
                <Link href="/practice/passwords" className="hover:text-foreground transition-colors">
                  Password Security
                </Link>
              </li>
              <li>
                <Link href="/practice/social" className="hover:text-foreground transition-colors">
                  Social Engineering
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">© 2025 CyberGuard Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
