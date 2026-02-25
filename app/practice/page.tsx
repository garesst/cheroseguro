import Link from "next/link"
import { Target, Mail, Lock, Users, Globe, Shield, AlertTriangle, Brain, ArrowRight, CheckCircle2, Search, Clock, Package, Server, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPractices, getFeaturedPractices, getPages, getPracticeCategories, getFeaturedPracticeCategories } from "@/lib/directus"

const practiceTypeIcons = {
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
}

export default async function PracticePage() {
  // Get dynamic data from Directus
  const [practices, featuredPractices, pages, practiceCategories, featuredCategories] = await Promise.all([
    getPractices(),
    getFeaturedPractices(3),
    getPages(),
    getPracticeCategories(),
    getFeaturedPracticeCategories()
  ])

  const practicePage = pages.find(p => p.slug === 'practice')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                  {practicePage?.title || "Practice Cybersecurity"}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                  {practicePage?.description || "Put your knowledge to the test with interactive simulations and practical exercises designed to reinforce your cybersecurity skills."}
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search practices..." className="pl-9" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Practices */}
        {featuredPractices.length > 0 && (
          <section className="pb-12">
            <div className="container mx-auto">
              <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Featured Practices</h2>
                  <p className="text-muted-foreground">
                    Start with these recommended cybersecurity simulations
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredPractices.map((practice) => {
                    const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                    const hasMultipleExercises = practice.exercises && Array.isArray(practice.exercises) && practice.exercises.length > 1
                    const exerciseCount = hasMultipleExercises ? practice.exercises?.length || 1 : 1

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
                                  {exerciseCount} exercises
                                </Badge>
                              )}
                              {/* Show category badges */}
                              {practice.practice_categories?.slice(0, 2).map((category) => (
                                <Badge 
                                  key={category.id} 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: `${category.color}40` }}
                                >
                                  {category.icon} {category.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
                            {practice.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mb-4">
                            {practice.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {practice.estimated_time}m
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {practice.learning_objectives?.length || 0} objectives
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/practice/${practice.slug}`}>
                                Start
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

        {/* All Practices with Tabs */}
        <section className="py-12">
          <div className="container mx-auto">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">All Practices</h2>
                <p className="text-muted-foreground">
                  Choose from different types of cybersecurity simulations
                </p>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {featuredCategories.slice(0, 5).map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                      <span>{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {practices.map((practice) => {
                      const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                      const hasMultipleExercises = practice.exercises && Array.isArray(practice.exercises) && practice.exercises.length > 1
                      const exerciseCount = hasMultipleExercises ? practice.exercises?.length || 1 : 1
                      
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
                                    {exerciseCount} exercises
                                  </Badge>
                                )}
                                {/* Show category badges */}
                                {practice.practice_categories?.slice(0, 2).map((category) => (
                                  <Badge 
                                    key={category.id} 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}30` }}
                                  >
                                    {category.icon} {category.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <CardTitle className="text-lg mb-2">{practice.title}</CardTitle>
                            <CardDescription className="line-clamp-3 mb-4">
                              {practice.description}
                            </CardDescription>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {practice.estimated_time}m
                                </div>
                                {/* Show first category as type badge */}
                                {practice.practice_categories?.[0] && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ backgroundColor: `${practice.practice_categories[0].color}15`, color: practice.practice_categories[0].color }}
                                  >
                                    {practice.practice_categories[0].icon} {practice.practice_categories[0].name}
                                  </Badge>
                                )}
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/practice/${practice.slug}`}>
                                  Start
                                </Link>
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                {featuredCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span style={{ color: category.color }}>{category.icon}</span>
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {(() => {
                        // Debug: Log practices and filtering logic
                        const filteredPractices = practices.filter((practice) => {
                          const hasCategory = practice.practice_categories?.some(cat => {
                            // Handle both object and string ID cases
                            const categoryId = typeof cat === 'object' ? cat.id : cat
                            return categoryId === category.id
                          })
                          
                          if (hasCategory) {
                            console.log(`Practice "${practice.title}" matches category "${category.name}"`)
                          }
                          
                          return hasCategory
                        })
                        
                        console.log(`Category "${category.name}" has ${filteredPractices.length} practices`)
                        
                        if (filteredPractices.length === 0) {
                          return (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                              <p>No practices found for this category yet.</p>
                              <p className="text-sm mt-2">Check back soon for new content!</p>
                            </div>
                          )
                        }
                        
                        return filteredPractices.map((practice) => {
                          const IconComponent = practiceTypeIcons[practice.practice_type] || Target
                          const hasMultipleExercises = practice.exercises && Array.isArray(practice.exercises) && practice.exercises.length > 1
                          const exerciseCount = hasMultipleExercises ? practice.exercises?.length || 1 : 1
                          
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
                                        {exerciseCount} exercises
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <CardTitle className="text-lg mb-2">{practice.title}</CardTitle>
                                <CardDescription className="line-clamp-3 mb-4">
                                  {practice.description}
                                </CardDescription>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {practice.estimated_time}m
                                  </div>
                                </div>
                                <Button className="w-full" asChild>
                                  <Link href={`/practice/${practice.slug}`}>
                                    Start Practice
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              </CardHeader>
                            </Card>
                          )
                        })
                      })()
                      }
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
