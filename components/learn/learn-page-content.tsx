'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Clock, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Article, Page } from '@/lib/directus'

interface LearnPageContentProps {
  articles: Article[]
  learnPage?: Page
  page: number
  perPage: number
  total: number
  totalPages: number
  perPageOptions: number[]
}

function normalizeText(value?: string | null): string {
  return (value || '').toLowerCase().trim()
}

export function LearnPageContent({
  articles,
  learnPage,
  page,
  perPage,
  total,
  totalPages,
  perPageOptions,
}: LearnPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const buildPageHref = (nextPage: number, nextPerPage: number) => {
    return `/learn?page=${nextPage}&perPage=${nextPerPage}`
  }

  const filteredArticles = useMemo(() => {
    const query = normalizeText(searchQuery)
    if (!query) return articles

    return articles.filter((article) => {
      const haystack = [
        article.title,
        article.description,
        article.slug,
        article.category?.name,
        article.difficulty,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [articles, searchQuery])

  const featuredArticles = filteredArticles.filter((article) => article.featured)
  const beginnerArticles = filteredArticles.filter((article) => article.difficulty === 'beginner')
  const intermediateArticles = filteredArticles.filter((article) => article.difficulty === 'intermediate')
  const advancedArticles = filteredArticles.filter((article) => article.difficulty === 'advanced')

  const activeTabArticles =
    activeTab === 'beginner'
      ? beginnerArticles
      : activeTab === 'intermediate'
        ? intermediateArticles
        : activeTab === 'advanced'
          ? advancedArticles
          : filteredArticles

  const showGlobalPagination = activeTab === 'all'
  const canGoPrevious = showGlobalPagination && page > 1
  const canGoNext = showGlobalPagination && page < totalPages

  return (
    <>
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                  {learnPage?.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                  {learnPage?.description}
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar artículos..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {featuredArticles.length > 0 && (
          <section className="pb-12">
            <div className="container mx-auto">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">Artículos destacados</h2>
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
                            <span>{article.reading_time} min</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/learn/${article.slug}`}>
                              Leer más <ArrowRight className="ml-2 h-4 w-4" />
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
        )}

        <section className="pb-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {activeTabArticles.length} resultado(s) en esta página {activeTab !== 'all' ? `(${activeTab})` : ''}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Ver:</span>
                  {perPageOptions.map((option) => (
                    <Button
                      key={option}
                      asChild
                      size="sm"
                      variant={option === perPage ? 'default' : 'outline'}
                    >
                      <Link href={buildPageHref(1, option)}>{option}</Link>
                    </Button>
                  ))}
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'beginner' | 'intermediate' | 'advanced')} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="beginner">Principiante</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
                  <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                  {filteredArticles.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sin resultados</CardTitle>
                        <CardDescription>
                          No encontramos artículos para "{searchQuery}".
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {filteredArticles.map((article) => (
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
                                Leer más <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="beginner" className="mt-6 space-y-4">
                  {beginnerArticles.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sin resultados</CardTitle>
                        <CardDescription>
                          No encontramos artículos de nivel principiante para "{searchQuery}".
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

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
                                Leer más <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="intermediate" className="mt-6 space-y-4">
                  {intermediateArticles.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sin resultados</CardTitle>
                        <CardDescription>
                          No encontramos artículos de nivel intermedio para "{searchQuery}".
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

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
                                Leer más <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="advanced" className="mt-6 space-y-4">
                  {advancedArticles.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sin resultados</CardTitle>
                        <CardDescription>
                          No encontramos artículos de nivel avanzado para "{searchQuery}".
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {advancedArticles.map((article) => (
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
                                Leer más <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex items-center justify-between">
                {canGoPrevious ? (
                  <Button asChild variant="outline">
                    <Link href={buildPageHref(page - 1, perPage)}>Anterior</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Anterior
                  </Button>
                )}

                {showGlobalPagination ? (
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} · Total global: {total}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    
                  </p>
                )}

                {canGoNext ? (
                  <Button asChild variant="outline">
                    <Link href={buildPageHref(page + 1, perPage)}>Siguiente</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
