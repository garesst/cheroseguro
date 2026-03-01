'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { CheckCircle2, ChevronRight, ChevronLeft, Clock, RotateCcw } from 'lucide-react'
import { CertQuizEnhanced } from './cert-quiz-enhanced'
import { CertificationFromAPI, ExamQuestions, SelectedQuestion } from '@/lib/directus'
import { selectQuestionsForExam, calculateExamScore } from '@/lib/directus'
import { useCertificationProgress } from '@/hooks/use-certification-progress'
import { CertificationResult } from './certification-result'

interface CertificationControllerProps {
  certification: CertificationFromAPI
}

export function CertificationController({ certification }: CertificationControllerProps) {
  const { completeCertificationExam } = useCertificationProgress()
  
  // Estados principales del examen
  const [examQuestions, setExamQuestions] = useState<ExamQuestions | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [isExamCompleted, setIsExamCompleted] = useState(false)
  const [examResult, setExamResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Initialize timer when exam starts
  useEffect(() => {
    if (examQuestions && !timeRemaining) {
      setTimeRemaining(certification.time_limit_minutes * 60) // Convert to seconds
    }
  }, [examQuestions, certification.time_limit_minutes, timeRemaining])

  // Countdown timer  
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          if (examQuestions && userAnswers) {
            handleQuizComplete(userAnswers)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, examQuestions, userAnswers])

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Función para generar nuevo examen
  const generateNewExam = async () => {
    try {
      setIsLoading(true)
      
      const questions = await selectQuestionsForExam(certification)
      setExamQuestions(questions)
      setUserAnswers({})
      setIsExamCompleted(false)
      setExamResult(null)
      
      // Guardar en localStorage
      localStorage.setItem(`exam-${certification.slug}`, JSON.stringify({
        questions,
        answers: {},
        startTime: Date.now()
      }))
      
    } catch (error) {
      console.error('Error generating exam:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar examen desde localStorage al montar
  useEffect(() => {
    const storedExam = localStorage.getItem(`exam-${certification.slug}`)
    if (storedExam) {
      try {
        const { questions, answers } = JSON.parse(storedExam)
        setExamQuestions(questions)
        setUserAnswers(answers || {})
      } catch (error) {
        console.error('Error loading stored exam:', error)
      }
    }
  }, [certification.slug])

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (examQuestions && Object.keys(userAnswers).length > 0) {
      const storedExam = localStorage.getItem(`exam-${certification.slug}`)
      if (storedExam) {
        try {
          const examData = JSON.parse(storedExam)
          examData.answers = userAnswers
          localStorage.setItem(`exam-${certification.slug}`, JSON.stringify(examData))
        } catch (error) {
          console.error('Error saving answers:', error)
        }
      }
    }
  }, [userAnswers, examQuestions, certification.slug])

  // Función para completar el examen
  const handleQuizComplete = (finalAnswers: Record<string, any>) => {
    if (!examQuestions) return

    try {
      // Calcular puntuación
      const score = calculateExamScore(examQuestions, finalAnswers)
      
      // Crear resultado completo
      const result = {
        finalScore: score.percentage,
        scoreBreakdown: {
          score: score.score,
          percentage: score.percentage,
          correctAnswers: score.correctAnswers,
          totalQuestions: score.totalQuestions,
          topicScores: score.topicScores || {}
        },
        examQuestions,
        userAnswers: finalAnswers,
        completedAt: new Date().toISOString(),
        passed: score.percentage >= (certification.passing_score || 70)
      }

      setExamResult(result)
      setIsExamCompleted(true)

      // Guardar progreso
      completeCertificationExam(score.percentage, [])
      
      // Limpiar localStorage
      localStorage.removeItem(`exam-${certification.slug}`)
      
    } catch (error) {
      console.error('Error completing exam:', error)
    }
  }

  // Función para reiniciar examen
  const handleRestartExam = () => {
    setExamQuestions(null)
    setUserAnswers({})
    setIsExamCompleted(false)
    setExamResult(null)
    localStorage.removeItem(`exam-${certification.slug}`)
  }

  // Calcular estadísticas del examen
  const examStats = useMemo(() => {
    if (!examQuestions) return null
    
    return {
      totalQuestions: examQuestions.questions.length,
      topicBreakdown: examQuestions.topicBreakdown,
      estimatedDuration: Math.ceil(examQuestions.questions.length * 1.5) // 1.5 min por pregunta
    }
  }, [examQuestions])

  // Mostrar resultado si está completado
  if (isExamCompleted && examResult) {
    return (
      <CertificationResult
        certificationTitle={certification.title}
        certificationCode={certification.certification_code}
        certificationSlug={certification.slug}
        finalScore={examResult.finalScore}
        passingScore={certification.passing_score || 70}
        passed={examResult.passed}
        examQuestions={examResult.examQuestions}
        userAnswers={examResult.userAnswers}
        scoreBreakdown={examResult.scoreBreakdown}
        onRetry={handleRestartExam}
      />
    )
  }

  // Mostrar examen si está generado
  if (examQuestions) {
    return (
      <div className="space-y-6">
        {/* Header del examen con timer */}
        <Card className={timeRemaining !== null && timeRemaining < 300 ? 'border-destructive' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold">{certification.title}</CardTitle>
                <CardDescription className="mt-2">
                  Examen de certificación • {examStats?.totalQuestions} preguntas • {certification.time_limit_minutes} minutos
                </CardDescription>
              </div>
              {timeRemaining !== null && (
                <div className="text-right">
                  <div className={`flex items-center gap-2 ${timeRemaining < 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Clock className="h-5 w-5" />
                    <span className="font-mono text-lg font-bold">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  {timeRemaining < 300 && (
                    <p className="text-destructive text-sm mt-1 font-medium">
                      ¡Menos de 5 minutos!
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Breakdown por temas */}
            <div>
              <p className="text-sm font-medium mb-2">Distribución de preguntas por tema:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(examStats?.topicBreakdown || {}).map(([topic, data]) => (
                  <Badge key={topic} variant="secondary" className="justify-between">
                    <span className="truncate">{data.title}</span>
                    <span className="ml-2 font-medium">{data.count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componente del Quiz */}
        <CertQuizEnhanced
          questions={examQuestions.questions}
          initialAnswers={userAnswers}
          onAnswerChange={(questionId, answer) => {
            setUserAnswers(prev => ({ ...prev, [questionId]: answer }))
          }}
          onComplete={handleQuizComplete}
        />
      </div>
    )
  }

  // Pantalla inicial - generar examen
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{certification.title}</CardTitle>
          <div 
            className="prose prose-sm max-w-none mt-2 text-muted-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: certification.description }}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del examen */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {certification.total_questions_per_exam || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Preguntas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {certification.passing_score || 70}%
              </div>
              <div className="text-sm text-muted-foreground">Puntuación mínima</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.ceil((certification.total_questions_per_exam || 20) * 1.5)}
              </div>
              <div className="text-sm text-muted-foreground">Minutos estimados</div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Versión:</strong> {certification.version || 'v1.0'}
            </p>
            {certification.randomize_questions && (
              <p className="text-sm text-muted-foreground">
                * Las preguntas serán seleccionadas aleatoriamente de diferentes temas
              </p>
            )}
          </div>

          {/* Botón para comenzar */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={generateNewExam}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Generando examen...
                </>
              ) : (
                <>
                  Comenzar Examen
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}