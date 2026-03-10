"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, CheckCircle2, XCircle, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const emails = [
  { id: 1, from: "security@paypa1-verify.com", subject: "Cuenta suspendida", isPhishing: true },
  { id: 2, from: "notifications@amazon.com", subject: "Confirmacion de tu pedido", isPhishing: false },
  { id: 3, from: "admin@bankofamerica-secure.net", subject: "Alerta urgente de seguridad", isPhishing: true },
  { id: 4, from: "support@github.com", subject: "Solicitud de cambio de contrasena", isPhishing: false },
  { id: 5, from: "no-reply@appIe-support.com", subject: "Tu Apple ID", isPhishing: true },
  { id: 6, from: "team@netflix.com", subject: "Fallo en el pago", isPhishing: false },
  { id: 7, from: "security@microsoft-account.net", subject: "Verifica tu cuenta", isPhishing: true },
  { id: 8, from: "notifications@slack.com", subject: "Nuevo mensaje", isPhishing: false },
]

export function PhishingDefender() {
  const [currentEmail, setCurrentEmail] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver, timeLeft])

  const handleAnswer = (isPhishing: boolean) => {
    const email = emails[currentEmail]
    const isCorrect = email.isPhishing === isPhishing

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 100)
    }

    setTimeout(() => {
      setFeedback(null)
      if (currentEmail < emails.length - 1) {
        setCurrentEmail(currentEmail + 1)
      } else {
        setGameOver(true)
      }
    }, 1000)
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentEmail(0)
    setScore(0)
    setTimeLeft(60)
    setGameOver(false)
    setFeedback(null)
  }

  if (!gameStarted) {
    return (
      <div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <div className="font-semibold">60 segundos</div>
                <div className="text-sm text-muted-foreground">Tiempo limite</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <Mail className="h-8 w-8 text-secondary mb-2" />
                <div className="font-semibold">8 correos</div>
                <div className="text-sm text-muted-foreground">Por clasificar</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Como jugar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>• Revisa cada correo rapidamente</li>
                <li>• Decide si es legitimo o phishing</li>
                <li>• Pulsa el boton correcto antes de que se acabe el tiempo</li>
                <li>• Gana 100 puntos por cada respuesta correcta</li>
              </ul>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={startGame}>
            Iniciar juego
          </Button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    const maxScore = emails.length * 100
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">¡Fin del juego!</CardTitle>
            <CardDescription className="text-lg">Asi te fue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-1">{score}</div>
                  <div className="text-sm text-muted-foreground">Puntuacion total</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-secondary mb-1">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Precision</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  {percentage === 100
                    ? "¡Puntuacion perfecta! Eres un experto detectando phishing."
                    : percentage >= 75
                      ? "¡Muy buen trabajo! Cada vez detectas mejor los correos de phishing."
                      : percentage >= 50
                        ? "Buen esfuerzo. Sigue practicando para mejorar tu capacidad de deteccion."
                        : "Sigue practicando. Revisa la seccion Aprender para obtener mas consejos."}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/play">Volver a juegos</Link>
              </Button>
              <Button className="flex-1" onClick={startGame}>
                Jugar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const email = emails[currentEmail]

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Clock className="mr-2 h-4 w-4" />
            {timeLeft}s
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="mr-2 h-4 w-4" />
            {score}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentEmail + 1} / {emails.length}
        </div>
      </div>

      <Progress value={((currentEmail + 1) / emails.length) * 100} className="h-2 mb-4" />

      {/* Email Card */}
      <Card className="mb-6">
        <CardHeader className="bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1">{email.subject}</CardTitle>
              <CardDescription className="break-all">De: {email.from}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      {!feedback ? (
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-24 text-lg border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 bg-transparent"
            onClick={() => handleAnswer(false)}
          >
            <CheckCircle2 className="mr-2 h-6 w-6" />
            Correo seguro
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-24 text-lg border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent"
            onClick={() => handleAnswer(true)}
          >
            <XCircle className="mr-2 h-6 w-6" />
            Phishing
          </Button>
        </div>
      ) : (
        <Card
          className={
            feedback === "correct"
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50 dark:bg-red-950/20"
          }
        >
          <CardContent className="py-8 text-center">
            {feedback === "correct" ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">¡Correcto!</div>
                <div className="text-sm text-muted-foreground mt-1">+100 puntos</div>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">Incorrecto</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Este correo era {email.isPhishing ? "phishing" : "seguro"}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
