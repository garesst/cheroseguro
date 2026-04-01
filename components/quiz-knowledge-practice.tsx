"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, Target, Brain, Trophy, BookOpen } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { usePracticeProgress } from "@/hooks/use-practice-progress"

interface QuizKnowledgePracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function QuizKnowledgePractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: QuizKnowledgePracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()
  const { completePracticeExercise } = usePracticeProgress()

  // Get quiz data
  const quizData = practice.scenario_data
  const questions = quizData.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const exerciseId = `exercise_${exerciseNumber}`
  const passingScore = quizData?.passing_score ?? 70
  
  const progress = ((currentQuestionIndex + (showFeedback ? 1 : 0)) / questions.length) * 100

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleAnswerSelect = (answerId: string) => {
    setCurrentAnswer(answerId)
  }

  const handleSubmitAnswer = () => {
    const newAnswers = [...userAnswers, currentAnswer]
    setUserAnswers(newAnswers)
    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
      setShowFeedback(false)
    } else {
      const finalResults = calculateScore()
      const passed = finalResults.percentage >= passingScore

      completePracticeExercise(practice.slug, exerciseId, finalResults.percentage, passed)
      setIsCompleted(true)
    }
  }

  const handleTryAgain = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setCurrentAnswer("")
    setShowFeedback(false)
    setIsCompleted(false)
  }

  const calculateScore = () => {
    let correct = 0
    let totalPoints = 0
    let maxPoints = 0
    
    userAnswers.forEach((answer, index) => {
      const question = questions[index]
      maxPoints += question.points
      if (answer === question.correct_answer) {
        correct++
        totalPoints += question.points
      }
    })
    
    return {
      correctAnswers: correct,
      totalQuestions: questions.length,
      points: totalPoints,
      maxPoints: maxPoints,
      percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
    }
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return quizData.scoring_criteria.excellent
    if (percentage >= 80) return quizData.scoring_criteria.good
    if (percentage >= 70) return quizData.scoring_criteria.passing
    return quizData.scoring_criteria.needs_improvement
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600' 
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security Basics': return Brain
      case 'Best Practices': return Target
      case 'Incident Response': return Trophy
      case 'Compliance & Regulations': return BookOpen
      default: return Brain
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Intro Screen
  if (!hasStarted) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900 mb-2">
                🧠 Evaluacion de Conocimientos
              </CardTitle>
              <CardDescription className="text-base text-blue-700">
                Pon a prueba tus conocimientos de ciberseguridad con {quizData.total_questions} preguntas completas
              </CardDescription>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">{practice.estimated_time} minutos</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">{passingScore}% para aprobar</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Multiples niveles de dificultad</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">Categorias del Quiz</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {quizData.categories?.map((category: string, index: number) => {
                  const IconComponent = getCategoryIcon(category)
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">{category}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Como funciona</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">1</span>
                  Responde {quizData.total_questions} preguntas de opcion multiple y verdadero/falso
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">2</span>
                  Recibe retroalimentacion inmediata despues de cada pregunta con explicaciones
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">3</span>
                  Las preguntas varian en dificultad y valor de puntos (1-3 puntos cada una)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">4</span>
                  Obtiene {passingScore}% o mas para aprobar la evaluacion
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleStartPractice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                Iniciar Evaluacion
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Question Screen
  if (!showFeedback) {
    const IconComponent = getCategoryIcon(currentQuestion.category)
    
    return (
      <div className="container mx-auto max-w-4xl py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'punto' : 'puntos'}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RadioGroup value={currentAnswer} onValueChange={handleAnswerSelect}>
              <div className="space-y-3">
                {currentQuestion.options?.map((option: any) => (
                  <div key={option.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <Label 
                      htmlFor={option.id} 
                      className="text-base leading-relaxed cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium mr-2">
                        {option.id.toUpperCase()}.
                      </span>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer}
                className="w-full"
              >
                Enviar respuesta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Feedback Screen
  if (!isCompleted) {
    const isCorrect = currentAnswer === currentQuestion.correct_answer
    
    return (
      <div className="container mx-auto max-w-4xl py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Feedback Card */}
        <Card className={isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}>
          <CardHeader>
            <div className="flex items-center gap-4">
              {isCorrect ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <CardTitle className={isCorrect ? "text-green-900" : "text-red-900"}>
                  {isCorrect ? "Correcto" : "Incorrecto"}
                </CardTitle>
                <CardDescription>
                  +{isCorrect ? currentQuestion.points : 0} {isCorrect && currentQuestion.points === 1 ? 'punto' : 'puntos'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Pregunta:</h4>
              <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
              
              <h4 className="font-semibold mb-2">Tu respuesta:</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-medium">
                  {currentAnswer.toUpperCase()}.
                </span>
                <span>
                  {currentQuestion.options?.find((opt: any) => opt.id === currentAnswer)?.text}
                </span>
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              {!isCorrect && (
                <>
                  <h4 className="font-semibold mb-2 text-green-700">Respuesta correcta:</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-medium">
                      {currentQuestion.correct_answer.toUpperCase()}.
                    </span>
                    <span>
                      {currentQuestion.options?.find((opt: any) => opt.id === currentQuestion.correct_answer)?.text}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold mb-2">Explicacion:</h4>
                <div className="text-blue-800 text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleNextQuestion} size="lg">
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results Screen
  const results = calculateScore()
  const scoreMessage = getScoreMessage(results.percentage)
  const passed = results.percentage >= quizData.passing_score

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <Trophy className="h-10 w-10 text-green-600" />
            ) : (
              <Brain className="h-10 w-10 text-red-600" />
            )}
          </div>
          <div>
            <CardTitle className="text-3xl font-bold mb-2">
              {passed ? 'Evaluacion superada' : 'Evaluacion completada'}
            </CardTitle>
            <CardDescription className="text-lg">
              {practice.title}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(results.percentage)}`}>
              {results.percentage}%
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {scoreMessage.message}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4 py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{results.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Respuestas correctas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{results.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total de preguntas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.points}</div>
              <div className="text-sm text-muted-foreground">Puntos obtenidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{results.maxPoints}</div>
              <div className="text-sm text-muted-foreground">Puntos posibles</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <Button onClick={handleTryAgain} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button onClick={() => router.push('/practice')} variant="default">
              Mas practicas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}