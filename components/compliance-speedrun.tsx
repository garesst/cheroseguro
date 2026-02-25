"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ComplianceQuestion {
  id: number
  statement: string
  isCompliant: boolean
}

const questions: ComplianceQuestion[] = [
  { id: 1, statement: "Sharing passwords is OK for convenience", isCompliant: false },
  { id: 2, statement: "Lock your screen when leaving your desk", isCompliant: true },
  { id: 3, statement: "Use the same password across all accounts", isCompliant: false },
  { id: 4, statement: "Enable multi-factor authentication when available", isCompliant: true },
  { id: 5, statement: "Click on links in unsolicited emails from unknown senders", isCompliant: false },
  { id: 6, statement: "Keep your software and antivirus updated", isCompliant: true },
  { id: 7, statement: "Share sensitive company data on public cloud storage", isCompliant: false },
  { id: 8, statement: "Report suspicious activity to your security team immediately", isCompliant: true },
]

interface ComplianceSpeedrunProps {
  onGameOver?: (score: number) => void
}

export function ComplianceSpeedrun({ onGameOver }: ComplianceSpeedrunProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [score, setScore] = useState(0)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (gameOver || feedback) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          if (onGameOver) {
            onGameOver(score)
          }
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, feedback, score, onGameOver])

  const handleAnswer = (isCompliant: boolean) => {
    const question = questions[currentQuestionIdx]
    const isCorrect = question.isCompliant === isCompliant

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 2)
      setTimeLeft(Math.min(timeLeft + 2, 15))
    } else {
      setTimeLeft(Math.max(timeLeft - 3, 0))
    }

    setTimeout(() => {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1)
        setFeedback(null)
      } else {
        setGameOver(true)
        if (onGameOver) {
          onGameOver(isCorrect ? score + 2 : score)
        }
      }
    }, 1000)
  }

  if (gameOver) {
    const percentage = Math.round((score / (questions.length * 2)) * 100)

    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Time's Up!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-secondary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            {score >= 12
              ? "Excellent compliance knowledge!"
              : score >= 8
                ? "Good understanding of compliance."
                : "Review compliance policies to improve."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestionIdx]
  const progress = ((currentQuestionIdx + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-600" />
          <div className={`text-2xl font-bold ${timeLeft <= 3 ? "text-red-600" : ""}`}>{timeLeft}s</div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Star className="mr-2 h-4 w-4" />
          {score}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIdx + 1} of {questions.length}
            </div>
            <p className="text-xl font-semibold leading-relaxed text-balance">{question.statement}</p>
          </div>
        </CardHeader>
        <CardContent>
          {feedback ? (
            <div className="text-center py-6">
              {feedback === "correct" ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-600">Correct! +2 seconds</div>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-red-600">Incorrect! -3 seconds</div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                className="h-20 text-base bg-green-600 hover:bg-green-700"
                onClick={() => handleAnswer(true)}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Compliant
              </Button>
              <Button
                size="lg"
                className="h-20 text-base bg-red-600 hover:bg-red-700"
                onClick={() => handleAnswer(false)}
              >
                <XCircle className="mr-2 h-5 w-5" />
                Violation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
