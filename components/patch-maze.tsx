"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Star, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MazeQuestion {
  id: number
  question: string
  correctAnswer: string
  option1: string
  option2: string
}

const mazeQuestions: MazeQuestion[] = [
  {
    id: 1,
    question: "¿Cual es la mejor forma de protegerte contra ataques de phishing?",
    correctAnswer: "Verificar el correo del remitente y no abrir enlaces sospechosos",
    option1: "Verificar el correo del remitente y no abrir enlaces sospechosos",
    option2: "Abrir todos los adjuntos para comprobar si son seguros",
  },
  {
    id: 2,
    question: "¿Cuando debes actualizar tu software?",
    correctAnswer: "En cuanto haya actualizaciones de seguridad disponibles",
    option1: "En cuanto haya actualizaciones de seguridad disponibles",
    option2: "Solo cuando tengas tiempo libre; las actualizaciones pueden esperar",
  },
  {
    id: 3,
    question: "¿Que debes hacer con una memoria USB que encuentras?",
    correctAnswer: "No la conectes y reportala al equipo de seguridad de TI",
    option1: "No la conectes y reportala al equipo de seguridad de TI",
    option2: "Conectarla para ver que contiene",
  },
  {
    id: 4,
    question: "¿Como debes guardar contrasenas sensibles?",
    correctAnswer: "Usa un gestor de contrasenas con cifrado fuerte",
    option1: "Usa un gestor de contrasenas con cifrado fuerte",
    option2: "Escribirlas en una libreta",
  },
]

interface PatchMazeProps {
  onGameOver?: (score: number) => void
}

export function PatchMaze({ onGameOver }: PatchMazeProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [virusDistance, setVirusDistance] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<"win" | "lose" | null>(null)

  const handleAnswer = (selectedOption: string) => {
    const question = mazeQuestions[currentQuestionIdx]
    const isCorrect = selectedOption === question.correctAnswer

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      const newProgress = Math.min(progress + 25, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        setTimeout(() => {
          setGameOver(true)
          setResult("win")
          if (onGameOver) {
            onGameOver(500)
          }
        }, 1000)
        return
      }
    } else {
      const newDistance = Math.min(virusDistance + 25, 100)
      setVirusDistance(newDistance)

      if (newDistance >= 100) {
        setTimeout(() => {
          setGameOver(true)
          setResult("lose")
          if (onGameOver) {
            onGameOver(0)
          }
        }, 1000)
        return
      }
    }

    setTimeout(() => {
      if (currentQuestionIdx < mazeQuestions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1)
        setFeedback(null)
      } else {
        setGameOver(true)
        setResult(progress >= 100 ? "win" : "lose")
        if (onGameOver) {
          onGameOver(progress >= 75 ? 500 : 200)
        }
      }
    }, 1000)
  }

  if (gameOver) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {result === "win" ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-3xl">{result === "win" ? "¡Escapaste!" : "El virus te alcanzo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result === "win" ? (
            <>
              <p className="text-lg font-semibold text-green-600">¡Llegaste a salvo!</p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600">500</div>
                  <div className="text-sm text-muted-foreground">Puntos obtenidos</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-600">¡El virus te alcanzo!</p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-600">0</div>
                  <div className="text-sm text-muted-foreground">Puntos</div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const question = mazeQuestions[currentQuestionIdx]

  return (
    <div className="space-y-6">
      {/* Chase Scene */}
      <Card className="bg-gradient-to-r from-blue-950/20 to-purple-950/20 border-blue-900/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Jugador</span>
            </div>
            <div className="text-xs text-muted-foreground">{progress}%</div>
          </div>
          <Progress value={progress} className="h-3 bg-blue-100 dark:bg-blue-950" />

          <div className="flex items-center justify-between mt-6 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold">Virus</span>
            </div>
            <div className="text-xs text-muted-foreground">{virusDistance}%</div>
          </div>
          <Progress value={virusDistance} className="h-3 bg-red-100 dark:bg-red-950" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground mb-3">
            Pregunta {currentQuestionIdx + 1} de {mazeQuestions.length}
          </div>
          <p className="text-xl font-semibold leading-relaxed text-balance">{question.question}</p>
        </CardHeader>
        <CardContent>
          {feedback ? (
            <div className="text-center py-6">
              {feedback === "correct" ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-600">¡Camino correcto!</div>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-red-600">¡Camino equivocado!</div>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-16 text-base justify-start px-4 bg-transparent"
                onClick={() => handleAnswer(question.option1)}
              >
                <span className="text-lg font-semibold mr-3">A</span>
                <span className="text-left">{question.option1}</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 text-base justify-start px-4 bg-transparent"
                onClick={() => handleAnswer(question.option2)}
              >
                <span className="text-lg font-semibold mr-3">B</span>
                <span className="text-left">{question.option2}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
