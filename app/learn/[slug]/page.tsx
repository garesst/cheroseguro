import Link from "next/link"
import { ArrowLeft, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShareButton } from "@/components/share-button"
import { ArticleReadTracker } from "@/components/tracking/article-read-tracker"
import { getArticleBySlug, getRelatedArticles } from "@/lib/directus"
import { notFound } from "next/navigation"

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

interface PracticeExercises {
  title?: string
  exercises?: Array<{
    type: string
    title: string
    descrip?: string
    href: string
  }>
}

interface ContentSegment {
  type: 'content' | 'key_takeaways' | 'practice_exercises'
  html?: string
  data?: string[] | PracticeExercises
}

// Content processing function - adds components at logical positions
function processArticleContent(content: string, keyTakeaways: string[], practiceExercises: PracticeExercises): ContentSegment[] {
  const segments: ContentSegment[] = []
  
  // First, check if content contains placeholders and replace them
  let processedContent = content
  
  // Define placeholder patterns (including both singular and plural)
  const keyTakeawaysPatterns = [
    /<p>\s*\[key_takeaways?\]\s*<\/p>/gi,
    /<p>\s*\[key_takeaway\]\s*<\/p>/gi,
    /\[key_takeaways?\]/gi,
    /\[key_takeaway\]/gi
  ]
  
  const practiceExercisesPatterns = [
    /<p>\s*\[practice_exercises?\]\s*<\/p>/gi,
    /<p>\s*\[practice_exercise\]\s*<\/p>/gi,
    /\[practice_exercises?\]/gi,
    /\[practice_exercise\]/gi
  ]
  
  // Track if placeholders were found and replaced
  let keyTakeawaysReplaced = false
  let practiceExercisesReplaced = false
  
  // Replace key takeaways placeholders with a unique marker
  for (const regex of keyTakeawaysPatterns) {
    if (regex.test(processedContent)) {
      processedContent = processedContent.replace(regex, '___KEY_TAKEAWAYS_PLACEHOLDER___')
      keyTakeawaysReplaced = true
      break // Only replace once
    }
  }
  
  // Replace practice exercises placeholders with a unique marker  
  for (const regex of practiceExercisesPatterns) {
    if (regex.test(processedContent)) {
      processedContent = processedContent.replace(regex, '___PRACTICE_EXERCISES_PLACEHOLDER___')
      practiceExercisesReplaced = true
      break // Only replace once
    }
  }
  
  // If placeholders were found, split content around them
  if (keyTakeawaysReplaced || practiceExercisesReplaced) {
    const parts = processedContent.split(/___KEY_TAKEAWAYS_PLACEHOLDER___|___PRACTICE_EXERCISES_PLACEHOLDER___/)
    const placeholders = processedContent.match(/___KEY_TAKEAWAYS_PLACEHOLDER___|___PRACTICE_EXERCISES_PLACEHOLDER___/g) || []
    
    for (let i = 0; i < parts.length; i++) {
      // Add content part if not empty
      if (parts[i].trim()) {
        segments.push({
          type: 'content',
          html: parts[i]
        })
      }
      
      // Add placeholder component if exists
      if (i < placeholders.length) {
        if (placeholders[i] === '___KEY_TAKEAWAYS_PLACEHOLDER___' && keyTakeaways && keyTakeaways.length > 0) {
          segments.push({
            type: 'key_takeaways',
            data: keyTakeaways
          })
        } else if (placeholders[i] === '___PRACTICE_EXERCISES_PLACEHOLDER___' && practiceExercises?.exercises && practiceExercises.exercises.length > 0) {
          segments.push({
            type: 'practice_exercises',
            data: practiceExercises
          })
        }
      }
    }
  } else {
    // No placeholders found, use automatic positioning logic
    if (keyTakeaways && keyTakeaways.length > 0) {
      const firstH2Match = content.match(/<\/h2>/i)
      
      if (firstH2Match && firstH2Match.index !== undefined) {
        const insertPoint = firstH2Match.index + firstH2Match[0].length
        
        // Find the end of the next content block (either next h2 or next section)
        const remainingContent = content.slice(insertPoint)
        const nextSectionMatch = remainingContent.match(/<h[2-6]|<\/article>|<\/div>/i)
        
        let keyTakeawaysInsertPoint = insertPoint
        if (nextSectionMatch && nextSectionMatch.index !== undefined) {
          // Find a good break point (end of paragraph or list)
          const beforeNextSection = remainingContent.slice(0, nextSectionMatch.index)
          const goodBreakPoint = beforeNextSection.lastIndexOf('</p>') || beforeNextSection.lastIndexOf('</ul>') || beforeNextSection.lastIndexOf('</ol>')
          
          if (goodBreakPoint > 0) {
            keyTakeawaysInsertPoint = insertPoint + goodBreakPoint + 4 // +4 for </p> length
          }
        }
        
        // Split content and insert key takeaways
        segments.push({
          type: 'content',
          html: content.slice(0, keyTakeawaysInsertPoint)
        })
        
        segments.push({
          type: 'key_takeaways',
          data: keyTakeaways
        })
        
        segments.push({
          type: 'content',
          html: content.slice(keyTakeawaysInsertPoint)
        })
      } else {
        // No h2 found, just add content first and key takeaways in the middle
        const middlePoint = Math.floor(content.length / 2)
        const goodBreakPoint = content.lastIndexOf('</p>', middlePoint) || content.lastIndexOf('</ul>', middlePoint) || content.lastIndexOf('</ol>', middlePoint)
        
        if (goodBreakPoint > 0) {
          segments.push({
            type: 'content',
            html: content.slice(0, goodBreakPoint + 4)
          })
          
          segments.push({
            type: 'key_takeaways',
            data: keyTakeaways
          })
          
          segments.push({
            type: 'content',
            html: content.slice(goodBreakPoint + 4)
          })
        } else {
          segments.push({
            type: 'content',
            html: content
          })
        }
      }
    } else {
      // No key takeaways, just add content
      segments.push({
        type: 'content',
        html: content
      })
    }
  }
  
  // Always add practice exercises at the end if they exist and weren't already added via placeholder
  if (!practiceExercisesReplaced && practiceExercises?.exercises && practiceExercises.exercises.length > 0) {
    segments.push({
      type: 'practice_exercises',
      data: practiceExercises
    })
  }
  
  return segments
}

// Article Content with automatically placed components
function ArticleContentRenderer({ 
  content, 
  keyTakeaways, 
  practiceExercises 
}: { 
  content: string
  keyTakeaways: string[]
  practiceExercises: PracticeExercises
}) {
  const contentSegments = processArticleContent(content, keyTakeaways, practiceExercises)
  
  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-6 text-foreground">
        {contentSegments.map((segment, index) => {
          if (segment.type === 'content' && segment.html) {
            return (
              <div 
                key={index}
                dangerouslySetInnerHTML={{ __html: segment.html }}
              />
            )
          }
          
          if (segment.type === 'key_takeaways' && segment.data && Array.isArray(segment.data) && segment.data.length > 0) {
            return (
              <div key={index} className="my-8">
                {segment.data.map((takeaway: string, takeawayIndex: number) => (
                  <Card key={takeawayIndex} className="my-6 bg-accent/10 border-accent">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Takeaway</CardTitle>
                      <CardDescription className="text-foreground/80 leading-relaxed">
                        {takeaway}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )
          }
          
          if (segment.type === 'practice_exercises' && segment.data && !Array.isArray(segment.data) && segment.data.exercises && segment.data.exercises.length > 0) {
            return (
              <Card key={index} className="my-8 bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {segment.data.title}
                  </CardTitle>
                  <CardDescription>
                    {segment.data.exercises[0]?.descrip || "Practica lo aprendido con estos ejercicios."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segment.data.exercises.map((exercise: { title: string; href: string }, exerciseIndex: number) => (
                    <Button key={exerciseIndex} variant="outline" className="w-full justify-start" asChild>
                      <Link href={exercise.href}>
                        {exercise.title}
                        <ArrowLeft className="ml-auto h-4 w-4 rotate-180" />
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )
          }
          
          return null
        })}
      </div>
    </div>
  )
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  
  if (!article) {
    notFound()
  }

  // Get related articles
  const relatedArticles = await getRelatedArticles(
    article.id,
    article.category.id,
    3
  )

  // Format date
  const lastUpdated = new Date(article.date_updated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="flex min-h-screen flex-col">
      <ArticleReadTracker articleId={article.slug} articleTitle={article.title} difficulty={article.difficulty} />
      <SiteHeader />

      <main className="flex-1">
        <article className="w-full py-12">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8"> {/* Back Button */}
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/learn">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Aprendizaje
              </Link>
            </Button>

            {/* Article Header */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{article.category.name}</Badge>
                <Badge variant="outline" className="capitalize">{article.difficulty}</Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                {article.title}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time} min de lectura</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Última actualización: {lastUpdated}</span>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Article Content with Dynamic Placeholders */}
            <ArticleContentRenderer 
              content={article.content}
              keyTakeaways={article.key_takeaways}
              practiceExercises={article.practice_exercises}
            />

            {/* Fixed Action Buttons */}
            <div className="flex items-center justify-between py-8 mt-12 border-t border-b bg-muted/20">
              <Button variant="outline" size="lg" asChild>
                <Link href="/learn">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Volver a Aprendizaje
                </Link>
              </Button>
              
              <ShareButton title={article.title} description={article.description} />
            </div>

            <Separator className="my-8" />

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Artículos relacionados</h2>
                <div className="grid gap-4">
                  {relatedArticles.map((relatedArticle) => (
                    <Card key={relatedArticle.id} className="hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {relatedArticle.category.name}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {relatedArticle.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{relatedArticle.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {relatedArticle.description}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/learn/${relatedArticle.slug}`}>
                              Leer más
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
