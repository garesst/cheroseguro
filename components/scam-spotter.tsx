"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const scamMessages = [
  {
    id: 1,
    text: "Send me your verification code NOW!!!",
    safeResponses: ["Block this user", "Report the message", "Close the chat"],
    dangerousResponses: ["Send code", "Ask for details", "Verify account"],
    safeOption: 0,
  },
  {
    id: 2,
    text: "You won $1,000,000!!! Click here to claim your prize 🎁",
    safeResponses: ["Ignore and report", "Delete message", "Block immediately"],
    dangerousResponses: ["Click the link", "Reply with info", "Send payment"],
    safeOption: 0,
  },
  {
    id: 3,
    text: "Your account has been compromised! Confirm password immediately!",
    safeResponses: ["Contact official support", "Don't reply", "Report suspicious"],
    dangerousResponses: ["Send password", "Confirm details", "Click link"],
    safeOption: 0,
  },
  {
    id: 4,
    text: "We need your social security number to update your profile 🔒",
    safeResponses: ["Report to admin", "Leave conversation", "Flag as spam"],
    dangerousResponses: ["Send SSN", "Verify with info", "Confirm account"],
    safeOption: 0,
  },
  {
    id: 5,
    text: "Click here for exclusive banking offer just for you!",
    safeResponses: ["Decline offer", "Block sender", "Report fraud"],
    dangerousResponses: ["Click link", "Reply yes", "Enter details"],
    safeOption: 0,
  },
]

export function ScamSpotter() {
  const [round, setRound] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; message: string } | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [timerExpired, setTimerExpired] = useState(false)

  const currentMessage = scamMessages[round]

  useEffect(() => {
    if (gameStarted && !gameOver && !timerExpired) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver, timerExpired])

  useEffect(() => {
    if (gameStarted && currentMessage) {
      // Shuffle response options
      const allOptions = [...currentMessage.safeResponses, ...currentMessage.dangerousResponses]
      const shuffled = [...allOptions].sort(() => Math.random() - 0.5)
      setShuffledOptions(shuffled)
      setTimeLeft(5)
      setTimerExpired(false)
    }
  }, [gameStarted, round])

  const handleResponse = (response: string) => {
    if (gameOver || timerExpired) return

    const isSafe = currentMessage.safeResponses.includes(response)

    if (isSafe) {
      setFeedback({ type: "correct", message: "Excellent! You avoided the scam! 🛡️" })
      setScore(score + 50)

      setTimeout(() => {
        setFeedback(null)
        if (round < scamMessages.length - 1) {
          setRound(round + 1)
        } else {
          setGameOver(true)
        }
      }, 2000)
    } else {
      setFeedback({ type: "incorrect", message: "Oh no! You fell for the scam! 😱" })
      setTimeout(() => {
        setGameOver(true)
      }, 2000)
    }
  }

  const resetGame = () => {
    setRound(0)
    setTimeLeft(5)
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setFeedback(null)
    setTimerExpired(false)
  }

  if (!gameStarted) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Scam Spotter</CardTitle>
            <p className="text-muted-foreground mt-2">
              A scammer is trying to trick you in a live chat. You have 5 seconds to choose the safe response for each
              message. Survive 5 rounds without falling for the scam!
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => setGameStarted(true)}>
              Start Game
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Read the incoming scam message carefully</p>
            <p>• You have 5 seconds to choose the safe response</p>
            <p>• Choose a safe option to survive and earn points</p>
            <p>• Choosing a dangerous option ends the game immediately</p>
            <p>• Survive all 5 rounds to win!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Round: {round + 1}/5</h3>
          <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${((round + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{score}</p>
          <p className="text-sm text-muted-foreground">Points</p>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="border-2 border-muted-foreground/20 bg-black">
        <CardHeader className="bg-slate-900 border-b border-slate-700 pb-3">
          <p className="text-xs text-slate-400">ScammerBot is typing...</p>
        </CardHeader>
        <CardContent className="pt-6 pb-4 space-y-4 min-h-40">
          {/* Scammer message */}
          <div className="flex justify-start">
            <div className="max-w-xs bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-tl-none">
              <p className="text-sm">{currentMessage.text}</p>
            </div>
          </div>

          {/* Timer display */}
          <div className="flex justify-center mt-6">
            <div
              className={`text-center p-4 rounded-lg ${
                timerExpired
                  ? "bg-red-500/20 border border-red-500"
                  : timeLeft <= 2
                    ? "bg-orange-500/20 border border-orange-500"
                    : "bg-green-500/20 border border-green-500"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">{timeLeft}s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Options - shuffled each round */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Choose your response:</p>
          <div className="grid grid-cols-1 gap-3">
            {shuffledOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3 px-4 hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                onClick={() => handleResponse(option)}
                disabled={gameOver || timerExpired}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Message */}
      {feedback && (
        <Card className={feedback.type === "correct" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              {feedback.type === "correct" ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <p
                className={feedback.type === "correct" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
              >
                {feedback.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Expired Message */}
      {timerExpired && !feedback && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <p className="text-red-600 font-semibold">Time's up! You didn't respond in time.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <Card className={round === scamMessages.length ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{round === scamMessages.length ? "🎉 You Win!" : "Game Over"}</CardTitle>
            <p className="text-muted-foreground mt-2">
              {round === scamMessages.length
                ? `Excellent! You survived all 5 scam attempts! Final Score: ${score}`
                : `You made it through ${round} rounds. Final Score: ${score}`}
            </p>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button onClick={resetGame}>Play Again</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
