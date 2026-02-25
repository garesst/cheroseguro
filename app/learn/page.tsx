import Link from "next/link"
import { Clock, ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getArticles, getPages } from "@/lib/directus"

export default async function LearnPage() {
  // Get dynamic content from Directus
  const [articles, pages] = await Promise.all([
    getArticles(),
    getPages()
  ])

  const learnPage = pages.find(page => page.slug === 'learn')
  const featuredArticles = articles.filter((article) => article.featured)
  const beginnerArticles = articles.filter((article) => article.difficulty === "beginner")
  const intermediateArticles = articles.filter((article) => article.difficulty === "intermediate")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Header Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                  {learnPage?.title || "Learn Cybersecurity"}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                  {learnPage?.description || "Explore our library of easy-to-understand articles and guides. Start with the basics or dive into specific topics that interest you."}
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search articles..." className="pl-9" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="pb-12">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="hover:border-primary/50 transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{article.category?.name || 'General'}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {article.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription className="leading-relaxed">{article.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{article.reading_time} min read</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/learn/${article.slug}`}>
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Articles by Difficulty */}
        <section className="pb-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="beginner">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                  {articles.map((article) => (
                    <Card key={article.id} className="hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{article.category?.name || 'General'}</Badge>
                              <Badge variant="outline" className="capitalize">
                                {article.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <CardDescription className="leading-relaxed">{article.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                              <Clock className="h-4 w-4" />
                              <span>{article.reading_time} min</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/learn/${article.slug}`}>
                                Read <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="beginner" className="mt-6 space-y-4">
                  {beginnerArticles.map((article) => (
                    <Card key={article.id} className="hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{article.category?.name || 'General'}</Badge>
                            </div>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <CardDescription className="leading-relaxed">{article.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                              <Clock className="h-4 w-4" />
                              <span>{article.reading_time} min</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/learn/${article.slug}`}>
                                Read <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="intermediate" className="mt-6 space-y-4">
                  {intermediateArticles.map((article) => (
                    <Card key={article.id} className="hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{article.category?.name || 'General'}</Badge>
                            </div>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <CardDescription className="leading-relaxed">{article.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                              <Clock className="h-4 w-4" />
                              <span>{article.reading_time} min</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/learn/${article.slug}`}>
                                Read <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}