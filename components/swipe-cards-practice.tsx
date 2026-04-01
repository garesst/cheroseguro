"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Trophy, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { usePracticeProgress } from "@/hooks/use-practice-progress"

/**
 * scenario_data shape:
 * {
 *   instruction?: string,
 *   right_label: string,          // e.g. "Legítimo"
 *   left_label: string,           // e.g. "Amenaza / Phishing"
 *   passing_score?: number,       // default 70
 *   cards: Array<{
 *     id: string,
 *     type?: string,              // "email" | "url" | "scenario" | any label
 *     title: string,
 *     subtitle?: string,
 *     body?: string,
 *     tags?: string[],
 *     is_threat: boolean,         // true = left is correct, false = right is correct
 *     feedback_correct: { title: string, explanation: string },
 *     feedback_incorrect: { title: string, explanation: string },
 *   }>
 * }
 */

interface SwipeCard {
  id: string
  type?: string
  title: string
  subtitle?: string
  body?: string
  tags?: string[]
  is_threat: boolean
  feedback_correct: { title: string; explanation: string }
  feedback_incorrect: { title: string; explanation: string }
}

interface ScenarioData {
  instruction?: string
  right_label?: string
  left_label?: string
  passing_score?: number
  cards?: SwipeCard[]
}

interface SwipeCardsPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

interface CardResult {
  cardId: string
  isCorrect: boolean
}

type FeedbackState = {
  show: boolean
  isCorrect: boolean
  title: string
  explanation: string
} | null

export function SwipeCardsPractice({ practice, exerciseNumber, totalExercises }: SwipeCardsPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const router = useRouter()

  const { completePracticeExercise, isExerciseCompleted, getPracticeProgress } = usePracticeProgress()

  const scenarioData: ScenarioData = practice.scenario_data || {}
  const cards: SwipeCard[] = scenarioData.cards || []
  const rightLabel = scenarioData.right_label || "Legítimo"
  const leftLabel = scenarioData.left_label || "Amenaza"
  const passingScore = scenarioData.passing_score ?? 70
  const instruction = scenarioData.instruction || `Clasifica cada elemento: "${leftLabel}" o "${rightLabel}"`

  const exerciseId = `exercise_${exerciseNumber}`
  const alreadyCompleted = isExerciseCompleted(practice.slug, exerciseId)
  const existingProgress = getPracticeProgress(practice.slug)

  const progress = cards.length > 0
    ? Math.round(((currentIndex) / cards.length) * 100)
    : 0

  const calculateScore = useCallback((res: CardResult[]) => {
    if (res.length === 0) return 0
    const correct = res.filter(r => r.isCorrect).length
    return Math.round((correct / res.length) * 100)
  }, [])

  const handleSwipe = (swipedLeft: boolean) => {
    if (feedback?.show || currentIndex >= cards.length) return

    const card = cards[currentIndex]
    // Left = threat, Right = safe/legit
    // is_threat: true → correct answer is swipe left
    const isCorrect = card.is_threat ? swipedLeft : !swipedLeft

    const feedbackData = isCorrect ? card.feedback_correct : card.feedback_incorrect
    const newResults = [...results, { cardId: card.id, isCorrect }]

    setSwipeDirection(swipedLeft ? "left" : "right")
    setResults(newResults)
    setFeedback({
      show: true,
      isCorrect,
      title: feedbackData?.title || (isCorrect ? "¡Correcto!" : "Incorrecto"),
      explanation: feedbackData?.explanation || "",
    })

    setTimeout(() => {
      setFeedback(null)
      setSwipeDirection(null)

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        const finalScore = calculateScore(newResults)
        const passed = finalScore >= passingScore
        completePracticeExercise(practice.slug, exerciseId, finalScore, passed)
        setIsCompleted(true)
      }
    }, 1400)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setResults([])
    setFeedback(null)
    setSwipeDirection(null)
    setIsCompleted(false)
    setHasStarted(true)
  }

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🃏</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900 mb-2">
                {practice.title}
              </CardTitle>
              <CardDescription className="text-base text-blue-700">
                {practice.description}
              </CardDescription>
            </div>
            <div className="grid gap-4 grid-cols-3 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">{practice.estimated_time} min</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">{passingScore}% para pasar</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-blue-700">{cards.length} tarjetas</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {alreadyCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 text-sm">¡Ya completaste esta práctica!</p>
                  <p className="text-sm text-green-700">
                    Puntuación: {existingProgress.exercises[exerciseId]?.score ?? 0}%
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">¿Cómo funciona?</h3>
              <p className="text-sm text-blue-700">{instruction}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <ArrowLeft className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="text-sm font-medium text-red-700">{leftLabel}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-sm font-medium text-green-700">{rightLabel}</span>
                  <ArrowRight className="h-4 w-4 text-green-600 shrink-0" />
                </div>
              </div>
            </div>

            {practice.learning_objectives?.length > 0 && (
              <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-2">
                <h3 className="font-semibold text-blue-900">Objetivos de aprendizaje</h3>
                <ul className="space-y-1.5">
                  {practice.learning_objectives.map((obj: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={() => setHasStarted(true)}
              disabled={cards.length === 0}
            >
              {cards.length === 0 ? "Sin tarjetas configuradas" : "Comenzar práctica"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (isCompleted) {
    const finalScore = calculateScore(results)
    const correctCount = results.filter(r => r.isCorrect).length
    const passed = finalScore >= passingScore

    return (
      <div className="container mx-auto max-w-2xl py-8 space-y-6">
        <Card className={`border-2 ${passed ? "border-green-500 bg-green-50" : "border-orange-400 bg-orange-50"}`}>
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm">
              {passed
                ? <Trophy className="h-8 w-8 text-green-600" />
                : <Target className="h-8 w-8 text-orange-500" />}
            </div>
            <CardTitle className={`text-3xl ${passed ? "text-green-900" : "text-orange-900"}`}>
              {passed ? "¡Práctica Completada!" : "¡Buen Intento!"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{finalScore}%</div>
                <div className="text-xs text-slate-500 mt-1">Puntuación</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-slate-500 mt-1">Correctas</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-slate-600">{cards.length}</div>
                <div className="text-xs text-slate-500 mt-1">Total</div>
              </div>
            </div>

            <p className={`text-sm text-center font-medium ${passed ? "text-green-800" : "text-orange-800"}`}>
              {passed
                ? finalScore === 100
                  ? "¡Puntuación perfecta! Eres un experto."
                  : "¡Superaste el umbral mínimo! Sigue practicando."
                : `Necesitas ${passingScore}% para pasar. ¡Inténtalo de nuevo!`}
            </p>

            {/* Per-card breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Resumen por tarjeta</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {results.map((res, i) => {
                  const card = cards.find(c => c.id === res.cardId) || cards[i]
                  return (
                    <div
                      key={res.cardId}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                        res.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {res.isCorrect
                        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                        : <XCircle className="h-4 w-4 shrink-0" />}
                      <span className="flex-1 truncate">{card?.title}</span>
                      {card?.type && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {card.type}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
              {totalExercises > 1 && exerciseNumber < totalExercises ? (
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/practice/${practice.slug}/${exerciseNumber + 1}`)}
                >
                  Siguiente ejercicio
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => router.push("/practice")}>
                  Ver más prácticas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Active swipe screen ───────────────────────────────────────────────────
  const card = cards[currentIndex]

  return (
    <div className="container mx-auto max-w-2xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{currentIndex + 1} / {cards.length}</div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          {results.filter(r => r.isCorrect).length} correctas
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Card stack */}
      <div className="relative flex justify-center" style={{ minHeight: "260px" }}>
        {/* Shadow cards underneath */}
        {[2, 1].map(offset => (
          <Card
            key={offset}
            className="absolute w-full max-w-md border border-slate-200"
            style={{
              transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.03})`,
              zIndex: 4 - offset,
              opacity: 0.6,
            }}
          >
            <CardContent className="pt-5 pb-4">
              <div className="h-16" />
            </CardContent>
          </Card>
        ))}

        {/* Front card */}
        <Card
          className={`absolute w-full max-w-md border-2 transition-all duration-300 ${
            feedback?.show
              ? feedback.isCorrect
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
              : swipeDirection === "left"
                ? "border-red-400"
                : swipeDirection === "right"
                  ? "border-green-400"
                  : "border-blue-300 bg-white"
          }`}
          style={{ zIndex: 5 }}
        >
          <CardContent className="pt-5 pb-4 space-y-3">
            {card.type && (
              <Badge variant="secondary" className="text-xs">{card.type}</Badge>
            )}

            <div>
              <p className="font-semibold text-slate-900 leading-snug">{card.title}</p>
              {card.subtitle && (
                <p className="text-sm text-slate-500 mt-1">{card.subtitle}</p>
              )}
            </div>

            {card.body && (
              <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                {card.body}
              </p>
            )}

            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                {card.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Feedback overlay */}
            {feedback?.show && (
              <div
                className={`rounded-lg p-3 mt-2 ${
                  feedback.isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {feedback.isCorrect
                    ? <CheckCircle2 className="h-4 w-4 text-green-700 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-700 shrink-0" />}
                  <span className={`text-sm font-semibold ${feedback.isCorrect ? "text-green-800" : "text-red-800"}`}>
                    {feedback.title}
                  </span>
                </div>
                {feedback.explanation && (
                  <p className={`text-xs leading-relaxed ${feedback.isCorrect ? "text-green-700" : "text-red-700"}`}>
                    {feedback.explanation}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Swipe buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button
          size="lg"
          variant="outline"
          disabled={!!feedback?.show}
          className="h-16 text-base border-2 hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-colors"
          onClick={() => handleSwipe(true)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          {leftLabel}
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={!!feedback?.show}
          className="h-16 text-base border-2 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-colors"
          onClick={() => handleSwipe(false)}
        >
          {rightLabel}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">{instruction}</p>
    </div>
  )
}
