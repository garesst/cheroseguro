"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, Trophy, TrendingUp, Clock, Download, RotateCcw, Home, CheckCircle2, XCircle, Brain, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'  
import { Separator } from '@/components/ui/separator'
import { ExamQuestions, SelectedQuestion } from '@/lib/directus'

interface CertificationResultProps {
  certificationTitle: string
  certificationCode: string
  certificationSlug: string
  finalScore: number
  passingScore: number
  passed: boolean
  examQuestions?: ExamQuestions
  userAnswers?: { [questionId: string]: string | string[] }
  scoreBreakdown?: {
    score: number
    percentage: number
    correctAnswers: number
    totalQuestions: number
    topicScores: { [topicKey: string]: { correct: number; total: number; percentage: number } }
  }
  timeSpent?: number
  certificateId?: string
  validUntil?: string
  onRetry?: () => void
}

export function CertificationResult({
  certificationTitle,
  certificationCode,
  certificationSlug,
  finalScore,
  passingScore,
  passed,
  examQuestions,
  userAnswers = {},
  scoreBreakdown,
  timeSpent,
  certificateId,
  validUntil,
  onRetry
}: CertificationResultProps) {
  const router = useRouter()

  const formatTime = (seconds?: number) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= passingScore) return 'text-blue-600 dark:text-blue-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
    if (score >= passingScore) return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Card */}
      <Card className={`mb-8 ${getScoreBgColor(finalScore)}`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Award className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <XCircle className="h-16 w-16 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl mb-2">
            {passed ? '¡Felicitaciones! 🎉' : 'Examen Completado'}
          </CardTitle>
          
          <CardDescription className="text-lg">
            {passed 
              ? `Has aprobado el examen de ${certificationTitle}`
              : `Necesitas al menos ${passingScore}% para aprobar. ¡Sigue practicando!`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Tu Puntuación</p>
              <div className={`text-7xl font-bold ${getScoreColor(finalScore)}`}>
                {finalScore}%
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                {passed ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Aprobado
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    No Aprobado
                  </Badge>
                )}
                <Badge variant="outline">
                  Mínimo: {passingScore}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          {passed && certificateId && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm mb-1">Certificado Generado</p>
                  <p className="text-xs font-mono text-muted-foreground">{certificateId}</p>
                  {validUntil && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Válido hasta: {new Date(validUntil).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tiempo</p>
              <p className="font-bold">{formatTime(timeSpent)}</p>
            </div>
            <div>
              <Brain className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Preguntas</p>
              <p className="font-bold">
                {scoreBreakdown ? `${scoreBreakdown.correctAnswers}/${scoreBreakdown.totalQuestions}` : '—'}
              </p>
            </div>
            <div>
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rendimiento</p>
              <p className="font-bold">
                {finalScore >= 90 ? 'Excelente' : 
                 finalScore >= passingScore ? 'Bueno' : 
                 finalScore >= 60 ? 'Regular' : 'Bajo'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      {scoreBreakdown && examQuestions && scoreBreakdown.topicScores && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Desglose por Tema</CardTitle>
            <CardDescription>
              Revisa tu rendimiento en cada área de conocimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(scoreBreakdown.topicScores || {}).map(([topicKey, topicScore], index) => {
                const topicInfo = examQuestions.topicBreakdown[topicKey]
                const percentage = topicScore.percentage
                
                return (
                  <div key={topicKey} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{topicInfo?.title || topicKey}</h4>
                        <p className="text-sm text-muted-foreground">
                          {topicScore.correct} de {topicScore.total} preguntas correctas
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                          {percentage}%
                        </div>
                        {percentage >= passingScore && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar for this topic */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          percentage >= 90 ? 'bg-green-500' :
                          percentage >= passingScore ? 'bg-blue-500' :
                          percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall Quiz Stats */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{scoreBreakdown.correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Correctas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {scoreBreakdown.totalQuestions - scoreBreakdown.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrectas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{scoreBreakdown.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {examQuestions ? Object.keys(examQuestions.topicBreakdown).length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Temas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
              </Button>
            </Link>
            
            <Link href={`/certifications/${certificationSlug}`} className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Award className="mr-2 h-4 w-4" />
                Ver Certificación
              </Button>
            </Link>
            
            {onRetry && (
              <Button 
                className="flex-1" 
                size="lg"
                onClick={onRetry}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reintentar Examen
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {passed 
                ? '¡Excelente trabajo! Tu certificación está lista.'
                : 'Revisa los ejercicios y vuelve a intentarlo. ¡Puedes lograrlo!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
