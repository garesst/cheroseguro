"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, Clock, Target, ArrowRight, ArrowLeft, RotateCcw, Trophy } from "lucide-react"
import { usePracticeProgress } from "@/hooks/use-practice-progress"

interface MultiExercisePracticeControllerProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function MultiExercisePracticeController({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: MultiExercisePracticeControllerProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const router = useRouter()

  // Progress tracking
  const { 
    completePracticeExercise, 
    getPracticeProgress, 
    isExerciseCompleted 
  } = usePracticeProgress()

  // Get current exercise data
  const currentExercise = practice.currentExercise
  const hasMultipleExercises = totalExercises > 1

  // Check if this exercise was already completed
  const exerciseId = `exercise_${exerciseNumber}`
  const isCompleted = isExerciseCompleted(practice.slug, exerciseId)
  const practiceProgress = getPracticeProgress(practice.slug)

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleOptionSelect = (optionId: string) => {
    console.log('==== DEBUG INFO ====');
    console.log('Selected option ID:', optionId);
    console.log('Current exercise:', currentExercise);
    console.log('Feedback responses:', currentExercise?.feedback_responses);
    console.log('==================');
    
    setSelectedOption(optionId);
    setShowFeedback(true);
    
    // Track progress
    const feedback = currentExercise?.feedback_responses?.[optionId]
    
    if (feedback) {
      const isCorrect = feedback.is_correct
      const score = isCorrect ? 100 : 50 // Full points for correct, partial for attempt
      
      completePracticeExercise(
        practice.slug,
        exerciseId,
        score,
        isCorrect
      )
    }
  }

  const handleTryAgain = () => {
    setSelectedOption(null)
    setShowFeedback(false)
  }

  const handleNextExercise = () => {
    if (exerciseNumber < totalExercises) {
      router.push(`/practice/${practice.slug}/${exerciseNumber + 1}`)
    }
  }

  const handlePreviousExercise = () => {
    if (exerciseNumber > 1) {
      router.push(`/practice/${practice.slug}/${exerciseNumber - 1}`)
    }
  }

  const handleFinishPractice = () => {
    router.push(`/practice`)
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6">
        {/* Progress indicator if already completed */}
        {isCompleted && (
          <Card className="bg-green-50 border-green-200 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Trophy className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900">¡Ejercicio {exerciseNumber} completado!</h4>
                  <p className="text-sm text-green-700">
                    Tu puntuación: {practiceProgress.exercises[exerciseId]?.score || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Objectives - Only show on first exercise */}
        {exerciseNumber === 1 && practice.learning_objectives && practice.learning_objectives.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Objetivos de Aprendizaje</CardTitle>
              </div>
              <CardDescription>
                Lo que aprenderás en este curso de práctica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {practice.learning_objectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Exercise Overview */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">
                  {hasMultipleExercises ? `Ejercicio ${exerciseNumber}: ${currentExercise.title}` : currentExercise.title}
                </CardTitle>
              </div>
              {hasMultipleExercises && (
                <Badge variant="outline">
                  {exerciseNumber} of {totalExercises}
                </Badge>
              )}
            </div>
            <CardDescription>
              {hasMultipleExercises 
                ? `Dificultad: ${currentExercise.difficulty} • ${currentExercise.estimated_time} minutos`
                : `Dificultad: ${practice.difficulty} • ${practice.estimated_time} minutos`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Navigation for multiple exercises */}
            {hasMultipleExercises && (
              <div className="flex justify-between items-center py-4 border-t border-b">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousExercise}
                  disabled={exerciseNumber === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ejercicio Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Ejercicio {exerciseNumber} de {totalExercises}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextExercise}
                  disabled={exerciseNumber === totalExercises}
                >
                  Siguiente Ejercicio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleStartPractice}
              >
                Start {hasMultipleExercises ? `Ejercicio ${exerciseNumber}` : 'Práctica'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the actual practice
  const email = currentExercise?.email

  if (!email) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground">No hay datos de correo disponibles para este ejercicio.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analiza este Correo</CardTitle>
              <CardDescription>
                Examina cuidadosamente el correo a continuación y determina si es legítimo o un intento de phishing.
              </CardDescription>
            </div>
            {hasMultipleExercises && (
              <Badge variant="secondary">
                Ejercicio {exerciseNumber} de {totalExercises}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <strong>De:</strong> {email.from_display} &lt;{email.from}&gt;
                </div>
                <div className="text-muted-foreground">
                  {email.timestamp}
                </div>
              </div>
              <div>
                <strong>Asunto:</strong> {email.subject}
              </div>
              <hr />
              <div className="whitespace-pre-wrap font-mono text-sm">
                {email.body}
              </div>
            </div>
          </div>

          {/* Analysis Options */}
          {!showFeedback ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Tu análisis:</h3>
              <div className="grid gap-3">
                {currentExercise.options?.map((option: any) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Feedback Display */
            <div className="space-y-4">
              {(() => {
                // Try multiple possible locations for feedback
                let feedback = currentExercise?.feedback_responses?.[selectedOption!]
                
                // If still no feedback, create a generic one
                if (!feedback) {
                  const selectedOptionData = currentExercise?.options?.find(
                    (opt: any) => opt.id === selectedOption
                  );
                  
                  return (
                    <Card className="bg-blue-50 border-blue-200 border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">Respuesta registrada</h4>
                            <p className="text-sm leading-relaxed">
                              Seleccionaste: "{selectedOptionData?.text || selectedOption}"
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
                
                const isCorrect = feedback.is_correct
                const IconComponent = isCorrect ? CheckCircle2 : XCircle
                const bgColor = isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                const iconColor = isCorrect ? "text-green-600" : "text-red-600"
                
                return (
                  <Card className={`${bgColor} border-2`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-1`} />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{feedback.title}</h4>
                          <p className="text-sm leading-relaxed">{feedback.message}</p>
                          {feedback.explanation && (
                            <div className="mt-3 p-3 rounded-md bg-muted/50">
                              <p className="text-xs text-muted-foreground">
                                <strong>Explicación:</strong> {feedback.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleTryAgain}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Intentar de Nuevo
                </Button>
                
                {/* Navigation buttons for multiple exercises */}
                {hasMultipleExercises ? (
                  <>
                    {exerciseNumber < totalExercises ? (
                      <Button onClick={handleNextExercise}>
                        Siguiente Ejercicio ({exerciseNumber + 1}/{totalExercises})
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleFinishPractice}>
                        Completar Curso
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    
                    {exerciseNumber > 1 && (
                      <Button variant="outline" onClick={handlePreviousExercise}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Ejercicio Anterior
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={handleFinishPractice}>
                    Ver más prácticas
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Red Flags Section */}
          {currentExercise.red_flags && (
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Señales de alerta:</h3>
              <div className="grid gap-2">
                {currentExercise.red_flags.map((flag: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>{flag.type?.replace('_', ' ')}: </strong>
                      {flag.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}