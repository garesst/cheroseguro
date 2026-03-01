"use client"

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Brain, Clock, Target, Eye } from "lucide-react"
import { SelectedQuestion } from '@/lib/directus'

interface CertQuizEnhancedProps {
  questions: SelectedQuestion[]
  initialAnswers?: { [questionId: string]: string | string[] }
  onAnswerChange: (questionId: string, answer: string | string[]) => void
  onComplete: (answers: { [questionId: string]: string | string[] }) => void
}

export function CertQuizEnhanced({ 
  questions, 
  initialAnswers = {}, 
  onAnswerChange, 
  onComplete 
}: CertQuizEnhancedProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string | string[] }>(initialAnswers)
  const [reviewMode, setReviewMode] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Complete exam handler
  const handleComplete = useCallback(() => {
    setReviewMode(true)
    onComplete(userAnswers)
  }, [userAnswers, onComplete])

  // Get current answer for the question
  const getCurrentAnswer = useCallback(() => {
    const answer = userAnswers[currentQuestion.id]
    return answer || (currentQuestion.type === 'multiple_choice' ? [] : '')
  }, [userAnswers, currentQuestion.id, currentQuestion.type])

  // Handle answer change
  const handleAnswerChange = useCallback((answer: string | string[]) => {
    const newAnswers = { ...userAnswers, [currentQuestion.id]: answer }
    setUserAnswers(newAnswers)
    onAnswerChange(currentQuestion.id, answer)
  }, [userAnswers, currentQuestion.id, onAnswerChange])

  // Navigation
  const goToNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, questions.length])

  const goToPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  // Jump to specific question
  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index)
  }, [])

  // Check if user can proceed (has answered current question)
  const canProceed = useCallback(() => {
    const answer = userAnswers[currentQuestion.id]
    if (!answer) return false
    if (Array.isArray(answer)) return answer.length > 0
    return answer !== ''
  }, [userAnswers, currentQuestion.id])

  // Calculate completion status
  const getCompletionStats = useCallback(() => {
    const answered = questions.filter(q => {
      const answer = userAnswers[q.id]
      if (Array.isArray(answer)) return answer.length > 0
      return answer && answer !== ''
    }).length
    
    const unanswered = questions.length - answered
    const percentage = Math.round((answered / questions.length) * 100)
    
    return { answered, unanswered, percentage }
  }, [questions, userAnswers])

  // Handle exam completion
  const handleFinish = useCallback(() => {
    const stats = getCompletionStats()
    
    if (stats.unanswered > 0) {
      const confirmMessage = `Tienes ${stats.unanswered} preguntas sin responder. ¿Estás seguro de que quieres enviar el examen?`
      if (!confirm(confirmMessage)) return
    }
    
    onComplete(userAnswers)
  }, [userAnswers, onComplete, getCompletionStats])

  // Enter review mode
  const enterReviewMode = useCallback(() => {
    setReviewMode(true)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTopicColor = (topic: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-emerald-100 text-emerald-800'
    ]
    const index = Math.abs(topic.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
    return colors[index]
  }

  // Render question based on type
  const renderQuestion = () => {
    const currentAnswer = getCurrentAnswer()

    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="space-y-4">
          {/* Question Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty}
            </Badge>
            <Badge className={getTopicColor(currentQuestion.topic)}>
              {currentQuestion.topic}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'punto' : 'puntos'}
            </Badge>
          </div>

          {/* Question Text */}
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-medium mb-2">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </h3>
            <p className="text-base leading-relaxed">{currentQuestion.text}</p>
          </div>

          {/* Image if available - appeared after question text */}
          {currentQuestion.image && (
            <div className="relative">
              <div 
                className="relative rounded-lg border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-slate-50"
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={currentQuestion.image}
                  alt={currentQuestion.image_alt || 'Imagen de la pregunta'}
                  width={800}
                  height={400}
                  className="w-full h-auto max-h-80 object-contain"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Ampliar
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                🔍 Haz clic en la imagen para verla más grande
              </p>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <Card>
          <CardContent className="pt-6">
            {currentQuestion.type === 'single_choice' && (
              <RadioGroup
                value={currentAnswer as string}
                onValueChange={(value) => handleAnswerChange(value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'multiple_choice' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona todas las opciones correctas:
                </p>
                {currentQuestion.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={option.id}
                      checked={(currentAnswer as string[]).includes(option.id)}
                      onCheckedChange={(checked) => {
                        const current = currentAnswer as string[]
                        const newAnswer = checked
                          ? [...current, option.id]
                          : current.filter(id => id !== option.id)
                        handleAnswerChange(newAnswer)
                      }}
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true_false' && (
              <RadioGroup
                value={currentAnswer as string}
                onValueChange={(value) => handleAnswerChange(value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">
                    Verdadero
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">
                    Falso
                  </Label>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Review Mode
  if (reviewMode) {
    const stats = getCompletionStats()
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Revisión Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.answered}</div>
                <div className="text-sm text-muted-foreground">Respondidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unanswered}</div>
                <div className="text-sm text-muted-foreground">Sin Responder</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                <div className="text-sm text-muted-foreground">Completado</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso Total</span>
                <span>{stats.answered}/{questions.length}</span>
              </div>
              <Progress value={stats.percentage} />
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
              {questions.map((q, index) => {
                const hasAnswer = userAnswers[q.id] && 
                  (Array.isArray(userAnswers[q.id]) 
                    ? (userAnswers[q.id] as string[]).length > 0 
                    : userAnswers[q.id] !== '')
                
                return (
                  <Button
                    key={q.id}
                    variant={hasAnswer ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setReviewMode(false)
                      goToQuestion(index)
                    }}
                    className={`aspect-square ${hasAnswer ? 'bg-green-600 hover:bg-green-700' : 'border-orange-300'}`}
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setReviewMode(false)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuar Respondiendo
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Enviar Examen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% completado
              </span>
            </div>
            {!reviewMode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setReviewMode(true)}
              >
                Revisar Respuestas
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Content */}
      {renderQuestion()}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            
            {/* Navigation button */}
            <div className="flex justify-center">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button 
                  onClick={handleFinish} 
                  className="w-full max-w-md"
                  disabled={!canProceed()}
                >
                  Finalizar Examen
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={goToNext} 
                  className="w-full max-w-md"
                  disabled={!canProceed()}
                >
                  Siguiente Pregunta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            
            {!canProceed() && (
              <p className="text-center text-sm text-muted-foreground">
                📝 Selecciona una respuesta para continuar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {showImageModal && currentQuestion.image && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl max-h-full">
            <Image
              src={currentQuestion.image}
              alt={currentQuestion.image_alt || 'Imagen de la pregunta'}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}