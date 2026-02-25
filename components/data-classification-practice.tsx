"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, Target, FolderOpen, Package } from "lucide-react"

interface DataClassificationPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

interface ClassificationItem {
  id: string
  name: string
  description: string
  correct_category: string
  points: number
  isPlaced?: boolean
  placedCategory?: string
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  examples: string[]
}

export function DataClassificationPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: DataClassificationPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [items, setItems] = useState<ClassificationItem[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [draggedItem, setDraggedItem] = useState<ClassificationItem | null>(null)
  const [feedback, setFeedback] = useState<{ [key: string]: { correct: boolean, message: string } }>({})
  const router = useRouter()

  // Get game data from practice
  const gameConfig = practice.currentExercise?.scenario_data?.game_config || practice.scenario_data?.game_config
  const categories: Category[] = gameConfig?.categories || []
  const itemsToClassify: ClassificationItem[] = gameConfig?.items_to_classify || []
  const timeLimit = gameConfig?.time_limit || 300
  const minScoreToPass = gameConfig?.min_score_to_pass || 70

  const handleStartPractice = () => {
    setHasStarted(true)
    setItems(itemsToClassify.map(item => ({ ...item, isPlaced: false })))
    setTimeLeft(timeLimit)
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTimeUp = () => {
    setIsCompleted(true)
    calculateFinalScore()
  }

  const handleDragStart = (item: ClassificationItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return

    const updatedItems = items.map(item => {
      if (item.id === draggedItem.id) {
        return { 
          ...item, 
          isPlaced: true, 
          placedCategory: categoryId 
        }
      }
      return item
    })

    setItems(updatedItems)

    // Check if classification is correct
    const isCorrect = draggedItem.correct_category === categoryId
    const message = isCorrect ? 
      getRandomMessage(practice.feedback_responses?.correct) :
      getRandomMessage(practice.feedback_responses?.incorrect)

    setFeedback(prev => ({
      ...prev,
      [draggedItem.id]: { correct: isCorrect, message }
    }))

    if (isCorrect) {
      setScore(prev => prev + draggedItem.points)
    }

    setDraggedItem(null)

    // Check if all items are placed
    const allPlaced = updatedItems.every(item => item.isPlaced)
    if (allPlaced) {
      setTimeout(() => {
        setIsCompleted(true)
        calculateFinalScore()
      }, 1000)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          isPlaced: false, 
          placedCategory: undefined 
        }
      }
      return item
    })

    setItems(updatedItems)

    // Remove feedback
    setFeedback(prev => {
      const newFeedback = { ...prev }
      delete newFeedback[itemId]
      return newFeedback
    })

    // Recalculate score
    const item = items.find(i => i.id === itemId)
    if (item && feedback[itemId]?.correct) {
      setScore(prev => prev - item.points)
    }
  }

  const calculateFinalScore = () => {
    const totalPossiblePoints = itemsToClassify.reduce((sum, item) => sum + item.points, 0)
    const finalScore = (score / totalPossiblePoints) * 100
    return Math.round(finalScore)
  }

  const getRandomMessage = (messages: string[] = []) => {
    if (!messages || messages.length === 0) return ""
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleNextExercise = () => {
    if (exerciseNumber < totalExercises) {
      router.push(`/practice/${practice.slug}/${exerciseNumber + 1}`)
    } else {
      router.push('/practice')
    }
  }

  const handleTryAgain = () => {
    setHasStarted(false)
    setItems([])
    setScore(0)
    setTimeLeft(0)
    setIsCompleted(false)
    setFeedback({})
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render practice introduction
  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Package className="h-6 w-6 text-blue-600" />
                  {practice.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {practice.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {exerciseNumber}/{totalExercises}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Instrucciones:</h4>
                <p className="text-muted-foreground">
                  {practice.currentExercise?.scenario_data?.instructions || practice.scenario_data?.instructions}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivos de Aprendizaje:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(practice.learning_objectives || []).map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Detalles del Ejercicio:
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>⏱️ Tiempo límite: {Math.floor(timeLimit / 60)} minutos</div>
                    <div>📊 Puntuación mínima: {minScoreToPass}%</div>
                    <div>📝 Elementos a clasificar: {itemsToClassify.length}</div>
                    <div>🗂️ Categorías: {categories.length}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Categorías de Clasificación:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="border rounded-lg p-3"
                      style={{ borderColor: category.color }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-semibold">{category.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Ejemplos:</strong> {category.examples.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleStartPractice} className="w-full mt-6" size="lg">
                Comenzar Clasificación de Datos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render completed state
  if (isCompleted) {
    const finalScore = calculateFinalScore()
    const passed = finalScore >= minScoreToPass

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {passed ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              {passed ? "¡Felicidades!" : "Practica más"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold mb-2">{finalScore}%</div>
                <p className="text-muted-foreground">
                  {passed 
                    ? "Has clasificado correctamente los datos según su nivel de sensibilidad."
                    : `Necesitas al menos ${minScoreToPass}% para aprobar. ¡Sigue practicando!`
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-muted-foreground">Puntos Obtenidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(feedback).filter(f => f.correct).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Correctas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(feedback).filter(f => !f.correct).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrectas</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="outline" onClick={handleTryAgain}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Intentar de Nuevo
                </Button>
                
                {exerciseNumber < totalExercises ? (
                  <Button onClick={handleNextExercise}>
                    Siguiente Ejercicio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/practice')}>
                    Volver a Prácticas
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render main game interface
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with progress and timer */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{exerciseNumber}/{totalExercises}</Badge>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Puntuación</div>
                <div className="font-bold">{score} pts</div>
              </div>
              <Progress 
                value={(items.filter(item => item.isPlaced).length / items.length) * 100} 
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items to classify */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Elementos para Clasificar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.filter(item => !item.isPlaced).map((item) => (
                  <Card 
                    key={item.id}
                    className="cursor-move hover:shadow-md transition-shadow border-2 border-dashed border-gray-300"
                    draggable
                    onDragStart={() => handleDragStart(item)}
                  >
                    <CardContent className="p-3">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      <div className="text-xs text-blue-600 mt-2 font-medium">{item.points} pts</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classification categories */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className="min-h-[200px] border-2 border-dashed"
                style={{ borderColor: category.color }}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {items
                      .filter(item => item.isPlaced && item.placedCategory === category.id)
                      .map((item) => (
                        <Card 
                          key={item.id}
                          className={`cursor-pointer transition-colors ${
                            feedback[item.id]?.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{item.name}</div>
                                {feedback[item.id] && (
                                  <div className={`text-xs mt-1 ${
                                    feedback[item.id].correct ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {feedback[item.id].message}
                                  </div>
                                )}
                              </div>
                              <div className="ml-2">
                                {feedback[item.id]?.correct ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}