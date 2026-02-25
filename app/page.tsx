import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPages, getLandingSections } from "@/lib/directus"
import { DynamicIcon } from "@/lib/icons"

export default async function HomePage() {
  // Fetch dynamic content from Directus
  const [pages, sections] = await Promise.all([
    getPages(),
    getLandingSections()
  ])
  
  // Get specific sections
  const heroSection = sections.find(s => s.section_type === 'hero')
  const topicsSection = sections.find(s => s.section_type === 'topics')
  const ctaSection = sections.find(s => s.section_type === 'cta')
  const learningSection = sections.find(s => s.section_type === 'learning_paths')
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              {heroSection?.content_data?.badge_text && (
                <Badge variant="secondary" className="mb-2">
                  {heroSection.content_data.badge_text}
                </Badge>
              )}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                {heroSection?.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
                {heroSection?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {heroSection?.content_data?.buttons?.map((button: { text: string; href: string; variant: string }, index: number) => (
                  <Button 
                    key={index}
                    size="lg" 
                    variant={button.variant === 'primary' ? 'default' : 'outline'} 
                    asChild
                  >
                    <Link href={button.href}>
                      {button.text} {index === 0 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto">
            <div className="mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
                  {learningSection?.title}
                </h2>
                <p className="text-muted-foreground text-lg text-balance">
                  {learningSection?.subtitle}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {pages.map((page) => (
                  <Card key={page.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <DynamicIcon name={page.icon} className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{page.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href={`/${page.slug}`}>
                          {page.cta_text} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
                  {topicsSection?.title}
                </h2>
                <p className="text-muted-foreground text-lg text-balance">
                  {topicsSection?.subtitle}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicsSection?.content_data?.topics?.map((topic: { icon: string; title: string; description: string }, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <DynamicIcon name={topic.icon} className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <CardDescription className="leading-relaxed">{topic.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                {ctaSection?.title}
              </h2>
              <p className="text-lg text-primary-foreground/90 leading-relaxed text-balance">
                {ctaSection?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {ctaSection?.content_data?.buttons?.map((button: { text: string; href: string; variant: string }, index: number) => (
                  <Button 
                    key={index}
                    size="lg" 
                    variant={button.variant === 'primary' ? 'secondary' : 'outline'}
                    className={button.variant === 'outline' ? "bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" : ""}
                    asChild
                  >
                    <Link href={button.href}>{button.text}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
