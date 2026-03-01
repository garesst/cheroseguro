"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const trackers = [
  { id: 1, type: "Invisible Pixel", x: 15, y: 20, isTracker: true },
  { id: 2, type: "Article Title", x: 35, y: 15, isTracker: false },
  { id: 3, type: "Flashy Banner Ad", x: 70, y: 10, isTracker: true },
  { id: 4, type: "News Body Text", x: 50, y: 50, isTracker: false },
  { id: 5, type: "Fake Download Button", x: 80, y: 60, isTracker: true },
  { id: 6, type: "Social Media Widget", x: 25, y: 75, isTracker: true },
  { id: 7, type: "Newsletter Signup", x: 65, y: 40, isTracker: false },
  { id: 8, type: "Hidden Tracker Beacon", x: 90, y: 85, isTracker: true },
]

export function TrackerTerminator() {
  const [found, setFound] = useState<number[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; message: string } | null>(null)

  const correctTrackers = trackers.filter((t) => t.isTracker)
  const targetCount = 5

  const handleClick = (trackerId: number) => {
    if (found.includes(trackerId) || gameOver) return

    const tracker = trackers.find((t) => t.id === trackerId)!
    const isCorrect = tracker.isTracker

    setFound([...found, trackerId])

    if (isCorrect) {
      setFeedback({ type: "correct", message: "Tracker found! 🎯" })
      const newScore = score + 20
      setScore(newScore)

      if (found.length + 1 === targetCount) {
        setGameOver(true)
      }
    } else {
      setFeedback({ type: "incorrect", message: "That's legitimate content!" })
      setScore(Math.max(0, score - 10))
    }

    setTimeout(() => setFeedback(null), 2000)
  }

  const resetGame = () => {
    setFound([])
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setFeedback(null)
  }

  if (!gameStarted) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Tracker Terminator</CardTitle>
            <p className="text-muted-foreground mt-2">
              A privacy-invading news site is full of hidden tracking elements. Your mission: identify and click on 5
              hidden trackers without clicking legitimate content.
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
            <p>• Trackers are hidden throughout the website interface</p>
            <p>• Find and click on 5 trackers to complete the level</p>
            <p>• Clicking legitimate content costs 10 points</p>
            <p>• Use your Privacy Scope cursor to hunt down the invisible trackers</p>
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
          <h3 className="text-lg font-semibold">Trackers Found: {found.length}/5</h3>
          <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${(found.length / 5) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{score}</p>
          <p className="text-sm text-muted-foreground">Points</p>
        </div>
      </div>

      {/* Mock Browser Window */}
      <Card className="border-2 border-muted-foreground/20">
        <CardHeader className="pb-2 bg-muted/50 border-b flex-row items-center gap-2">
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <p className="text-xs text-muted-foreground ml-2">news-site-with-ads.com</p>
        </CardHeader>
        <CardContent className="pt-6 relative cursor-crosshair bg-white min-h-96">
          {/* Clickable tracker elements positioned absolutely */}
          <div className="absolute inset-0 p-4 space-y-4">
            {trackers.map((tracker) => (
              <div
                key={tracker.id}
                className="absolute cursor-pointer"
                style={{ left: `${tracker.x}%`, top: `${tracker.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <button
                  onClick={() => handleClick(tracker.id)}
                  disabled={found.includes(tracker.id) || gameOver}
                  className={`relative group transition-all ${
                    found.includes(tracker.id) ? "opacity-50 cursor-default" : "hover:scale-110 hover:brightness-110"
                  }`}
                >
                  {/* Visual representation based on tracker type */}
                  {tracker.isTracker ? (
                    <>
                      <div className="h-6 w-6 bg-red-500/20 rounded-lg border border-red-500/50 flex items-center justify-center group-hover:bg-red-500/40">
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      </div>
                      {found.includes(tracker.id) && (
                        <CheckCircle2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-7 w-7 text-green-500 bg-white rounded-full" />
                      )}
                    </>
                  ) : (
                    <div className="h-6 w-6 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-700 group-hover:bg-blue-200">
                      {tracker.type[0]}
                    </div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {tracker.type}
                  </div>
                </button>
              </div>
            ))}

            {/* News content text areas */}
            <div className="absolute top-6 left-6 right-6 space-y-3">
              <h2 className="text-xl font-bold text-gray-800">Breaking News Today</h2>
              <p className="text-sm text-gray-600 line-clamp-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Check out this article about important
                cybersecurity developments...
              </p>
            </div>
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

      {/* Game Over Screen */}
      {gameOver && (
        <Card className={found.length === targetCount ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {found.length === targetCount ? "🎉 Level Complete!" : "Game Over"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {found.length === targetCount
                ? `Excellent! You found all 5 trackers and scored ${score} points!`
                : `You found ${found.length} of 5 trackers. Score: ${score} points`}
            </p>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button onClick={resetGame}>Jugar de Nuevo</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
