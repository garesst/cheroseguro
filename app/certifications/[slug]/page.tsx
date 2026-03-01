"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CertificationFromAPI } from '@/lib/directus'
import { useCertificationProgress } from '@/hooks/use-certification-progress'
import { Award, Clock, Trophy, Calendar, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

interface CertificationDetailProps {
  params: Promise<{
    slug: string
  }>
}

export default function CertificationDetailPage({ params }: CertificationDetailProps) {
  const { slug } = use(params)
  const router = useRouter()
  const [certification, setCertification] = useState<CertificationFromAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const { getCertificationProgress, isCertificationValid, startCertificationExam } = useCertificationProgress()

  useEffect(() => {
    async function fetchCertification() {
      try {
        const response = await fetch(`/api/certifications/${slug}`)
        
        if (response.ok) {
          const data = await response.json()
          setCertification(data)
        }
      } catch (error) {
        console.error('Error fetching certification:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertification()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando certificación...</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!certification) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Certificación no encontrada</h2>
              <p className="text-muted-foreground mb-6">
                La certificación que buscas no existe o no está disponible.
              </p>
              <Link href="/certifications">
                <Button>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Volver a Certificaciones
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const progress = getCertificationProgress(certification.slug)
  const isValid = isCertificationValid(certification.slug)
  const bestAttempt = progress?.attempts.reduce((best, current) => 
    (current.finalScore || 0) > (best?.finalScore || 0) ? current : best
  , progress.attempts[0])

  const levelLabels: Record<string, string> = {
    level_1: 'Nivel 1 - Básico',
    level_2: 'Nivel 2 - Intermedio',
    level_3: 'Nivel 3 - Avanzado',
    level_4: 'Nivel 4 - Experto'
  }

  const handleStartExam = () => {
    startCertificationExam(certification.slug, certification.time_limit_minutes)
    router.push(`/certifications/${slug}/exam`)
  }

  const hasPrerequisites = (
    certification.prerequisites?.required_practices?.length > 0 ||
    certification.prerequisites?.required_certifications?.length > 0
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Back Button */}
          <Link href="/certifications" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a Certificaciones
          </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-6 w-6 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">
                {certification.certification_code}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3">{certification.title}</h1>
            <Badge variant="default" className="text-sm">
              {levelLabels[certification.certification_level]}
            </Badge>
          </div>
        </div>

        <div 
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: certification.description }}
        />
      </div>

      {/* Status Cards */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className={progress.passed ? 'border-green-500' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {progress.passed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Estado
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    Estado
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.passed ? 'Aprobado' : 'No Aprobado'}
              </div>
              {isValid && (
                <p className="text-xs text-green-600 mt-1">
                  Certificación válida
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Mejor Puntuación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.bestScore !== undefined ? `${progress.bestScore}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {progress.attempts.length} {progress.attempts.length === 1 ? 'intento' : 'intentos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {isValid ? 'Válida hasta' : 'Última Actualización'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {progress.validUntil 
                  ? new Date(progress.validUntil).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : new Date(bestAttempt?.completedAt || '').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duración</p>
                    <p className="text-lg font-bold">{certification.time_limit_minutes} minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Puntuación Mínima</p>
                    <p className="text-lg font-bold">{certification.passing_score}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Preguntas</p>
                    <p className="text-lg font-bold">{certification.total_questions_per_exam || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Validez</p>
                    <p className="text-lg font-bold">{certification.validity_months} meses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Pool Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Temas del Examen</CardTitle>
              <CardDescription>
                Este examen incluye {certification.total_questions_per_exam || 0} preguntas seleccionadas de diferentes temas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certification.question_pool && Object.keys(certification.question_pool).length > 0 ? (
                  Object.entries(certification.question_pool).map(([topic, data], index) => (
                    <div key={topic} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm capitalize">{topic.replace(/_/g, ' ')}</h4>
                          <Badge variant="outline" className="text-xs">
                            {(data as any).questions_to_select || 0} preguntas
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pool disponible: {((data as any).questions || []).length} preguntas
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay información de temas disponible</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start Exam Card */}
          <Card>
            <CardHeader>
              <CardTitle>Comenzar Examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasPrerequisites && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        Prerrequisitos
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        {certification.prerequisites?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleStartExam}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar Examen
              </Button>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                  El examen tiene un límite de tiempo
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                  Puedes hacer múltiples intentos
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                  Se guarda tu mejor puntuación
                </p>
                {certification.renewal_required && (
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                    Requiere renovación periódica
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attempt History */}
          {progress && progress.attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Intentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress.attempts.slice(-5).reverse().map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">Intento #{attempt.attemptNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.completedAt || '').toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={attempt.passed ? "default" : "destructive"}>
                          {attempt.finalScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
