"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CertificationFromAPI } from '@/lib/directus'
import { CertificationController } from '@/components/certification-controller'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, XCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteName } from '@/lib/config'

interface ExamPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CertificationExamPage({ params }: ExamPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const [certification, setCertification] = useState<CertificationFromAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCertification() {
      try {
        const response = await fetch(`/api/certifications/${slug}`)
        
        if (response.ok) {
          const cert = await response.json()
          
          // Validate certification has question pool
          if (!cert.question_pool || Object.keys(cert.question_pool).length === 0) {
            setError('Esta certificación no tiene preguntas configuradas.')
            return
          }

          // Validate total questions per exam is set
          if (!cert.total_questions_per_exam || cert.total_questions_per_exam <= 0) {
            setError('Esta certificación no tiene configurado el número de preguntas por examen.')
            return
          }

          setCertification(cert)
        } else {
          setError('Certificación no encontrada.')
        }
      } catch (err) {
        console.error('Error fetching certification:', err)
        setError('Error al cargar la certificación. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchCertification()
  }, [slug])

  // Prevent accidental navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '¿Estás seguro de que quieres salir? Perderás tu progreso en el examen.'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">{siteName}</span>
            </Link>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Cargando examen...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Preparando tu examen de certificación</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !certification) {
    return (
      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">{siteName}</span>
            </Link>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-6 w-6" />
                Error al Cargar Examen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {error || 'No se pudo cargar el examen de certificación.'}
                </p>
                <Link href={`/certifications/${slug}`}>
                  <Button variant="outline">
                    Volver a la Certificación
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header durante el examen */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">{siteName}</span>
          </Link>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">Examen en Progreso</span>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <p>
              <strong>Importante:</strong> El examen tiene un límite de tiempo. 
              Si sales de esta página, perderás tu progreso actual.
            </p>
          </div>
        </div>
      </div>

      {/* Exam Controller */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CertificationController certification={certification} />
      </div>
    </div>
  )
}
