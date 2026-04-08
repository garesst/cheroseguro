'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Target,
  Mail,
  Lock,
  Users,
  Globe,
  Shield,
  AlertTriangle,
  Brain,
  ArrowRight,
  Search,
  Clock,
  Package,
  Server,
  Key,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PracticeProgressBar } from '@/components/practice-progress-bar'
import { PracticeCardProgress } from '@/components/practice-card-progress'
import type { Page, Practice, PracticeCategory } from '@/lib/directus'

const practiceTypeIcons: Record<string, any> = {
  email_analysis: Mail,
  url_inspector: Globe,
  password_strength: Lock,
  social_engineering: Users,
  settings_configuration: Shield,
  incident_response: AlertTriangle,
  quiz_knowledge: Brain,
  data_classification: Package,
  network_defense: Server,
  password_builder: Key,
  swipe_cards: Layers,
}

interface PracticePageContentProps {
  practices: Practice[]
  featuredPractices: Practice[]
  featuredCategories: PracticeCategory[]
  practicePage?: Page
  page: number
  perPage: number
  total: number
  totalPages: number
  perPageOptions: number[]
}

function getExerciseCount(practice: Practice): number {
  const hasMultipleExercises =
    practice.exercises && Array.isArray(practice.exercises) && practice.exercises.length > 1
  return hasMultipleExercises ? practice.exercises?.length || 1 : 1
}

function matchesSearch(practice: Practice, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return true

  const categories = (practice.practice_categories || [])
    .map((category) => `${category.name || ''} ${category.slug || ''}`)
    .join(' ')

  const haystack = [
    practice.title,
    practice.description,
    practice.slug,
    practice.practice_type,
    practice.difficulty,
    categories,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

export function PracticePageContent({
  practices,
  featuredPractices,
  featuredCategories,
  practicePage,
  page,
  perPage,
  total,
  totalPages,
  perPageOptions,
}: PracticePageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')

  const buildPageHref = (nextPage: number, nextPerPage: number) => {
    return `/practice?page=${nextPage}&perPage=${nextPerPage}`
  }

  const filteredPractices = useMemo(
    () => practices.filter((practice) => matchesSearch(practice, searchQuery)),
    [practices, searchQuery]
  )

  const filteredFeaturedPractices = useMemo(
    () => featuredPractices.filter((practice) => matchesSearch(practice, searchQuery)),
    [featuredPractices, searchQuery]
  )

  const activeTabPractices = useMemo(() => {
    if (activeTab === 'all') return filteredPractices
    return filteredPractices.filter((practice) =>
      practice.practice_categories?.some((practiceCategory) => practiceCategory.id === activeTab)
    )
  }, [activeTab, filteredPractices])

  const activeTabLabel =
    activeTab === 'all'
      ? 'todas'
      : featuredCategories.find((category) => category.id === activeTab)?.name || 'categoría'
  const showGlobalPagination = activeTab === 'all'
  const canGoPrevious = showGlobalPagination && page > 1
  const canGoNext = showGlobalPagination && page < totalPages

  const hasAnyResults = filteredPractices.length > 0

  return (
    <main className="flex-1">
      <section className="py-12 md:py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                {practicePage?.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                {practicePage?.description}
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar prácticas..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl">
            <PracticeProgressBar availablePractices={practices.length} showDetailedStats={true} />
          </div>
        </div>
      </section>

      {filteredFeaturedPractices.length > 0 && (
        <section className="pb-12">
          <div className="container mx-auto">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Prácticas destacadas</h2>
                <p className="text-muted-foreground">
                  Inicia tu aprendizaje con estas prácticas seleccionadas por su relevancia y calidad.
                  Perfectas para empezar o para profundizar en temas específicos.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFeaturedPractices.map((practice) => {
                  const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                  const exerciseCount = getExerciseCount(practice)
                  const hasMultipleExercises = exerciseCount > 1

                  return (
                    <Card key={practice.id} className="hover:border-primary/50 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {practice.difficulty}
                            </Badge>
                            {hasMultipleExercises && (
                              <Badge variant="secondary" className="text-xs">
                                {exerciseCount} ejercicios
                              </Badge>
                            )}
                            {practice.practice_categories?.slice(0, 2).map((category) => (
                              <Badge
                                key={category.id}
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: `${category.color}20`,
                                  color: category.color,
                                  borderColor: `${category.color}40`,
                                }}
                              >
                                {category.icon} {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
                          {practice.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mb-4">{practice.description}</CardDescription>

                        <PracticeCardProgress
                          practiceSlug={practice.slug}
                          totalExercises={exerciseCount}
                          className="mb-3"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {practice.estimated_time}m
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/practice/${practice.slug}`}>
                              Empezar
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Todas las prácticas</h2>
              <p className="text-muted-foreground">
                Elige entre diferentes tipos de simulaciones de ciberseguridad
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {activeTabPractices.length} resultado(s) en esta página ({activeTabLabel})
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

            {!hasAnyResults && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Sin resultados</CardTitle>
                  <CardDescription>
                    No encontramos prácticas para "{searchQuery}".
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">Todas</TabsTrigger>
                {featuredCategories.slice(0, 5).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPractices.map((practice) => {
                    const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                    const exerciseCount = getExerciseCount(practice)
                    const hasMultipleExercises = exerciseCount > 1

                    return (
                      <Card key={practice.id} className="hover:border-primary/50 transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <IconComponent className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {practice.difficulty}
                              </Badge>
                              {hasMultipleExercises && (
                                <Badge variant="secondary" className="text-xs">
                                  {exerciseCount} ejercicios
                                </Badge>
                              )}
                              {practice.practice_categories?.slice(0, 2).map((category) => (
                                <Badge
                                  key={category.id}
                                  variant="secondary"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color,
                                    borderColor: `${category.color}30`,
                                  }}
                                >
                                  {category.icon} {category.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <CardTitle className="text-lg mb-2">{practice.title}</CardTitle>
                          <CardDescription className="line-clamp-3 mb-4">{practice.description}</CardDescription>

                          <PracticeCardProgress
                            practiceSlug={practice.slug}
                            totalExercises={exerciseCount}
                            className="mb-3"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {practice.estimated_time}m
                              </div>
                              {practice.practice_categories?.[0] && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: `${practice.practice_categories[0].color}15`,
                                    color: practice.practice_categories[0].color,
                                  }}
                                >
                                  {practice.practice_categories[0].icon} {practice.practice_categories[0].name}
                                </Badge>
                              )}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/practice/${practice.slug}`}>Empezar</Link>
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {featuredCategories.map((category) => {
                const categoryPractices = filteredPractices.filter((practice) =>
                  practice.practice_categories?.some((practiceCategory) => practiceCategory.id === category.id)
                )

                return (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span style={{ color: category.color }}>{category.icon}</span>
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {categoryPractices.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          <p>No hay prácticas para esta categoría con tu búsqueda actual.</p>
                        </div>
                      )}

                      {categoryPractices.map((practice) => {
                        const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                        const exerciseCount = getExerciseCount(practice)
                        const hasMultipleExercises = exerciseCount > 1

                        return (
                          <Card key={practice.id} className="hover:border-primary/50 transition-all">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-muted">
                                    <IconComponent className="h-5 w-5" />
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {practice.difficulty}
                                  </Badge>
                                  {hasMultipleExercises && (
                                    <Badge variant="secondary" className="text-xs">
                                      {exerciseCount} ejercicios
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <CardTitle className="text-lg mb-2">{practice.title}</CardTitle>
                              <CardDescription className="line-clamp-3 mb-4">{practice.description}</CardDescription>

                              <PracticeCardProgress
                                practiceSlug={practice.slug}
                                totalExercises={exerciseCount}
                                className="mb-3"
                              />

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {practice.estimated_time}m
                                </div>
                              </div>
                              <Button className="w-full" asChild>
                                <Link href={`/practice/${practice.slug}`}>
                                  Empezar prácticas
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </CardHeader>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                )
              })}
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
  )
}
