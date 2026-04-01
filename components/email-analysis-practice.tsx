"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Mail, ArrowRight, RotateCcw, AlertTriangle, Clock, Target, Trophy } from "lucide-react"
import { usePracticeProgress } from "@/hooks/use-practice-progress"

interface EmailAnalysisPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function EmailAnalysisPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: EmailAnalysisPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  // Progress tracking
  const { 
    completePracticeExercise, 
    getPracticeProgress, 
    isExerciseCompleted 
  } = usePracticeProgress()

  // Get email data - handle both single exercise and multi-exercise formats
  const emails = practice.exercises && practice.exercises.length > 1 
    ? practice.exercises.map((ex: any) => ex.email).filter(Boolean)
    : [practice.currentExercise?.email || practice.scenario_data?.email].filter(Boolean)

  // Check if this exercise was already completed
  const exerciseId = `exercise_${exerciseNumber}`
  const isAlreadyCompleted = isExerciseCompleted(practice.slug, exerciseId)
  const practiceProgress = getPracticeProgress(practice.slug)
  
  const currentEmail = emails[currentEmailIndex]
  const currentExercise = practice.exercises && practice.exercises.length > 1
    ? practice.exercises[currentEmailIndex]
    : practice.currentExercise

  const progress = ((currentEmailIndex + (showFeedback ? 1 : 0)) / emails.length) * 100

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleAnswer = (optionId: string) => {
    const newAnswers = [...userAnswers, optionId]
    setUserAnswers(newAnswers)
    setShowFeedback(true)
  }

  const handleNextEmail = () => {
    if (currentEmailIndex < emails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1)
      setShowFeedback(false)
    } else {
      // All emails completed - register the final result
      const finalScore = calculateScore()
      const passed = finalScore >= 70
      
      completePracticeExercise(
        practice.slug,
        exerciseId,
        finalScore,
        passed
      )
      
      setIsCompleted(true)
    }
  }

  const handleTryAgain = () => {
    setCurrentEmailIndex(0)
    setUserAnswers([])
    setShowFeedback(false)
    setIsCompleted(false)
  }

  const calculateScore = () => {
    let correct = 0
    userAnswers.forEach((answer, index) => {
      const exerciseData = practice.exercises && practice.exercises.length > 1
        ? practice.exercises[index] 
        : practice.currentExercise
      const feedback = exerciseData?.feedback_responses?.[answer]
      if (feedback && feedback.is_correct) {
        correct++
      }
    })
    return (correct / emails.length) * 100
  }

  const getCurrentFeedback = () => {
    const selectedAnswer = userAnswers[currentEmailIndex]
    const feedback = currentExercise?.feedback_responses?.[selectedAnswer]
    const selectedOption = currentExercise?.options?.find((opt: any) => opt.id === selectedAnswer)
    
    if (!feedback) {
      return {
        isCorrect: false,
        title: "Respuesta Registrada",
        message: `Seleccionaste: "${selectedOption?.text || selectedAnswer}"`,
        explanation: "No se puede proporcionar feedback detallado para esta opción."
      }
    }

    return {
      isCorrect: feedback.is_correct,
      title: feedback.is_correct ? "¡Correcto!" : "Incorrecto",
      message: feedback.message,
      explanation: feedback.explanation
    }
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6">
        {/* Progress indicator if already completed */}
        {isAlreadyCompleted && (
          <Card className="bg-green-50 border-green-200 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Trophy className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900">¡Ya Completado!</h4>
                  <p className="text-sm text-green-700">
                    Has completado esta práctica. Tu puntuación: {practiceProgress.exercises[exerciseId]?.score || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Análisis de Seguridad de Correos</CardTitle>
          </div>
          <CardDescription>
            Aprende a identificar correos de phishing y amenazas de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Lo que aprenderás:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {practice.learning_objectives?.map((objective: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Tiempo Estimado</p>
                <p className="text-xs text-muted-foreground">{practice.estimated_time} minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Correos a Analizar</p>
                <p className="text-xs text-muted-foreground">{emails.length} correo{emails.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Señales de Alerta a Vigilar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {currentExercise?.red_flags?.map((flag: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium capitalize">{flag.type?.replace('_', ' ')}</span>
                    <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                  </div>
                </div>
              )) || (
                <div className="col-span-2 text-center text-muted-foreground">
                  <p>Busca direcciones de remitente sospechosas, lenguaje urgente y solicitudes inesperadas de información personal.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleStartPractice}
            >
              Iniciar Análisis de Correos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    )
  }

  if (isCompleted) {
    const score = calculateScore()
    const passed = score >= 70 // Can be configured from practice data

    return (
      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? "¡Análisis Completado!" : "Sigue Aprendiendo"}
            </CardTitle>
            <CardDescription>
              Obtuviste {score.toFixed(0)}% ({userAnswers.filter((answer, index) => {
                const exerciseData = practice.exercises && practice.exercises.length > 1
                  ? practice.exercises[index] 
                  : practice.currentExercise
                const feedback = exerciseData?.feedback_responses?.[answer]
                return feedback && feedback.is_correct
              }).length} de {emails.length} correctas)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Revisión:</h3>
            {emails.map((email: any, index: number) => {
              const exerciseData = practice.exercises && practice.exercises.length > 1
                ? practice.exercises[index] 
                : practice.currentExercise
              const userAnswer = userAnswers[index]
              const feedback = exerciseData?.feedback_responses?.[userAnswer]
              const isCorrect = feedback && feedback.is_correct
              const selectedOption = exerciseData?.options?.find((opt: any) => opt.id === userAnswer)
              
              return (
                <div key={index} className="flex items-start justify-between p-3 border rounded">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">"{email.subject}"</p>
                      <p className="text-xs text-muted-foreground">De: {email.from}</p>
                      <p className="text-xs text-blue-600 mt-1">{selectedOption?.text}</p>
                    </div>
                  </div>
                  <Badge variant={isCorrect ? "default" : "destructive"}>
                    {isCorrect ? "Correcto" : "Incorrecto"}
                  </Badge>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleTryAgain}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/practice')}
            >
              Continuar Aprendiendo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentEmail) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>No hay datos de correos disponibles para este análisis.</p>
        </CardContent>
      </Card>
    )
  }

  const feedback = showFeedback ? getCurrentFeedback() : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-xl">
            Correo {currentEmailIndex + 1} de {emails.length}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(progress)}% Completado
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Analiza este correo:</h3>
          
          {/* Email Display */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <strong>De:</strong> {currentEmail.from_display || currentEmail.from} &lt;{currentEmail.from}&gt;
                </div>
                <div className="text-muted-foreground text-xs">
                  {currentEmail.timestamp}
                </div>
              </div>
              <div>
                <strong>Asunto:</strong> {currentEmail.subject}
              </div>
              <hr className="border-muted" />
              <div className="whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border">
                {currentEmail.body}
              </div>
            </div>
          </div>

          {!showFeedback && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                ¿Cuál es tu evaluación de este correo?
              </p>
              <div className="grid gap-3">
                {currentExercise?.options?.map((option: any) => (
                  <Button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)} 
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left hover:bg-blue-50 hover:border-blue-300"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {showFeedback && feedback && (
            <div className={`p-4 rounded-lg border ${
              feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">{feedback.title}</span>
              </div>
              
              <p className="text-sm mb-3">{feedback.message}</p>
              
              {feedback.explanation && (
                <div className="bg-white/50 p-3 rounded border text-sm">
                  <p className="font-medium mb-1">Explicación:</p>
                  <p>{feedback.explanation}</p>
                </div>
              )}
              
              <Button 
                className="w-full mt-4"
                onClick={handleNextEmail}
              >
                {currentEmailIndex < emails.length - 1 ? "Siguiente Correo" : "Completar Análisis"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}