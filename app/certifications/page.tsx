import { Suspense } from 'react'
import Link from 'next/link'
import { getCertificationsList, CertificationFromAPI } from '@/lib/directus'
import { Award, Clock, Trophy, ChevronRight, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

function CertificationLevelBadge({ level }: { level: string }) {
  const levelLabels: Record<string, { text: string; variant: any }> = {
    level_1: { text: 'Nivel 1 - Básico', variant: 'default' },
    level_2: { text: 'Nivel 2 - Intermedio', variant: 'secondary' },
    level_3: { text: 'Nivel 3 - Avanzado', variant: 'default' },
    level_4: { text: 'Nivel 4 - Experto', variant: 'destructive' }
  }

  const levelData = levelLabels[level] || levelLabels.level_1

  return (
    <Badge variant={levelData.variant} className="font-medium">
      {levelData.text}
    </Badge>
  )
}

function CertificationCard({ cert }: { cert: CertificationFromAPI }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">
                {cert.certification_code}
              </span>
              {cert.featured && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <CardTitle className="text-xl">{cert.title}</CardTitle>
          </div>
        </div>
        <CertificationLevelBadge level={cert.certification_level} />
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: cert.description?.replace(/<[^>]*>/g, ' ').slice(0, 180) + '...' || ''
          }}
        />

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{cert.time_limit_minutes} minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            <span>Mínimo {cert.passing_score}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>{cert.total_questions_per_exam || 0} preguntas</span>
          </div>
        </div>

        {cert.prerequisites?.description && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Prerrequisitos:</strong> {cert.prerequisites.description}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/certifications/${cert.slug}`} className="w-full">
          <Button className="w-full group">
            Ver Detalles
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function CertificationsGrid({ certifications }: { certifications: CertificationFromAPI[] }) {
  if (certifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay certificaciones disponibles</h3>
        <p className="text-muted-foreground">
          Las certificaciones estarán disponibles próximamente.
        </p>
      </div>
    )
  }

  // Group by level
  const byLevel = certifications.reduce((acc, cert) => {
    const level = cert.certification_level
    if (!acc[level]) acc[level] = []
    acc[level].push(cert)
    return acc
  }, {} as Record<string, CertificationFromAPI[]>)

  const levels = ['level_1', 'level_2', 'level_3', 'level_4']
  const levelNames = {
    level_1: 'Nivel 1 - Certificaciones Básicas',
    level_2: 'Nivel 2 - Certificaciones Intermedias',
    level_3: 'Nivel 3 - Certificaciones Avanzadas',
    level_4: 'Nivel 4 - Certificaciones de Experto'
  }

  return (
    <div className="space-y-12">
      {levels.map(level => {
        const certs = byLevel[level]
        if (!certs || certs.length === 0) return null

        return (
          <div key={level}>
            <h2 className="text-2xl font-bold mb-6">
              {levelNames[level as keyof typeof levelNames]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map(cert => (
                <CertificationCard key={cert.id} cert={cert} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function CertificationsPage() {
  const certifications = await getCertificationsList()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Certificaciones</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Valida tus conocimientos en ciberseguridad con nuestras certificaciones profesionales.
              Cada certificación combina múltiples tipos de ejercicios en un examen cronometrado.
            </p>
          </div>

          {/* Stats */}
          {certifications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{certifications.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Destacadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {certifications.filter(c => c.featured).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Niveles Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {new Set(certifications.map(c => c.certification_level)).size}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sin Prerrequisitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {certifications.filter(c => 
                      !c.prerequisites?.required_practices?.length && 
                      !c.prerequisites?.required_certifications?.length
                    ).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Certifications Grid */}
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando certificaciones...</p>
            </div>
          }>
            <CertificationsGrid certifications={certifications} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
