"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const emailStack = [
  { id: 1, from: "verify@paypa1-confirm.com", subject: "Verifica Tu Cuenta Ahora", isPhishing: true },
  { id: 2, from: "shipping@amazon.com", subject: "Tu Entrega Está en Camino", isPhishing: false },
  { id: 3, from: "security@bankofamerica-secure.net", subject: "Confirma Tu Identidad", isPhishing: true },
  { id: 4, from: "noreply@github.com", subject: "Nueva Actividad de Inicio de Sesión", isPhishing: false },
  { id: 5, from: "alerts@appIe-id.com", subject: "Actividad Inusual Detectada", isPhishing: true },
  { id: 6, from: "support@netflix-account.net", subject: "Actualiza Método de Pago", isPhishing: true },
  { id: 7, from: "notifications@slack.com", subject: "Has Sido Agregado a un Espacio de Trabajo", isPhishing: false },
  { id: 8, from: "no-reply@microsoft-verify.com", subject: "Completa Verificación de Seguridad", isPhishing: true },
]

interface PhishingSwipeProps {
  onGameOver?: (score: number) => void
}

export function PhishingSwipe({ onGameOver }: PhishingSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const handleSwipe = (isLegit: boolean) => {
    const email = emailStack[currentIndex]
    const isCorrect = email.isPhishing ? !isLegit : isLegit

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 100)
    }

    setTimeout(() => {
      setFeedback(null)
      if (currentIndex < emailStack.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setGameOver(true)
        if (onGameOver) {
          onGameOver(isCorrect ? score + 100 : score)
        }
      }
    }, 800)
  }

  if (gameOver) {
    const finalScore = feedback === "correct" ? score + 100 : score
    const percentage = Math.round((finalScore / (emailStack.length * 100)) * 100)

    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">¡Pila Completada!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{finalScore}</div>
                <div className="text-sm text-muted-foreground">Puntos</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-secondary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Precisión</div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            {percentage === 100
              ? "¡Puntuación perfecta! ¡Eres un maestro anti-phishing!"
              : percentage >= 75
                ? "¡Buen trabajo! Sigue practicando para ser impecable."
                : "¡Buen intento! Revisa los indicadores de phishing para mejorar."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const email = emailStack[currentIndex]
  const progress = ((currentIndex + 1) / emailStack.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Star className="mr-2 h-4 w-4" />
          {score}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {emailStack.length}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Email Card Stack */}
      <div className="relative h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center perspective">
          {/* Back cards for stack effect */}
          {[2, 1].map((offset) => (
            <Card
              key={offset}
              className="absolute w-full max-w-sm transform transition-transform"
              style={{
                transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.02})`,
                zIndex: -offset,
              }}
            >
              <CardContent className="pt-4 pb-3">
                <div className="text-xs text-muted-foreground truncate">From: {email.from}</div>
                <div className="text-sm font-semibold truncate">{email.subject}</div>
              </CardContent>
            </Card>
          ))}

          {/* Front card */}
          <Card
            className={`absolute w-full max-w-sm border-2 transition-all ${
              feedback === "correct"
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : feedback === "incorrect"
                  ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                  : "border-primary/30"
            }`}
            style={{ zIndex: 10 }}
          >
            <CardContent className="pt-4 pb-3">
              <div className="text-xs text-muted-foreground truncate">From: {email.from}</div>
              <div className="font-semibold text-balance">{email.subject}</div>

              {feedback && (
                <div className="mt-2 text-center">
                  {feedback === "correct" ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-green-600">¡Correcto!</div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-red-600">Incorrecto</div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      {!feedback ? (
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-20 text-base border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 bg-transparent"
            onClick={() => handleSwipe(true)}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Legítimo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-20 text-base border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent"
            onClick={() => handleSwipe(false)}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Estafa
          </Button>
        </div>
      ) : null}
    </div>
  )
}
