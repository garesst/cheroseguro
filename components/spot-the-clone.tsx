"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, AlertCircle, CheckCircle2, Star } from "lucide-react"
import Link from "next/link"

// Define the 3 differences between original and clone
const DIFFERENCES = [
  { x: 220, y: 140, width: 80, height: 40, type: "button-color" }, // Login button color
  { x: 150, y: 200, width: 150, height: 20, type: "typo" }, // "Passwrod" typo
  { x: 280, y: 100, width: 20, height: 20, type: "lock-icon" }, // Missing padlock
]

export function SpotTheClone() {
  const [gameStarted, setGameStarted] = useState(false)
  const [found, setFound] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [shakeEffect, setShakeEffect] = useState(false)
  const [foundDifferences, setFoundDifferences] = useState<number[]>([])

  const handleDifferenceClick = (diffIndex: number, e: React.MouseEvent) => {
    if (gameOver || found === 3 || foundDifferences.includes(diffIndex)) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const diff = DIFFERENCES[diffIndex]
    const isWithinBounds =
      clickX >= diff.x && clickX <= diff.x + diff.width && clickY >= diff.y && clickY <= diff.y + diff.height

    if (isWithinBounds) {
      setFeedback("correct")
      setFoundDifferences([...foundDifferences, diffIndex])
      const newFound = found + 1
      setFound(newFound)

      if (newFound === 3) {
        setTimeout(() => {
          setGameOver(true)
        }, 500)
      }

      setTimeout(() => {
        setFeedback(null)
      }, 1000)
    } else {
      setShakeEffect(true)
      setFeedback("incorrect")
      setTimeout(() => {
        setShakeEffect(false)
        setFeedback(null)
      }, 500)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setFound(0)
    setGameOver(false)
    setFeedback(null)
    setFoundDifferences([])
    setShakeEffect(false)
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-primary mb-2" />
              <div className="font-semibold">3 differences</div>
              <div className="text-sm text-muted-foreground">To find</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Lock className="h-8 w-8 text-secondary mb-2" />
              <div className="font-semibold">Bank Login</div>
              <div className="text-sm text-muted-foreground">Comparison task</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">How to Play</h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>• Compare the Original Site (left) with the Cloned Site (right)</li>
              <li>• Look for 3 subtle differences in the cloned version</li>
              <li>• Click directly on each difference you spot</li>
              <li>• Find all 3 to win the game</li>
            </ul>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={startGame}>
          Start Game
        </Button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">You Won!</CardTitle>
            <CardDescription className="text-lg">Found all 3 differences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">3/3</div>
                  <div className="text-sm text-muted-foreground">Differences found</div>
                  <p className="text-sm leading-relaxed mt-4">
                    Great job! You've successfully identified a phishing clone. These skills will help you spot fake
                    websites in real life.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/play">Back to Games</Link>
              </Button>
              <Button className="flex-1" onClick={startGame}>
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Found: {found}/3
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Site */}
        <div>
          <div className="text-sm font-semibold mb-3 text-center text-muted-foreground">Original Site</div>
          <Card className="border-2 border-green-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-8 pb-8 px-6">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">Bank Login</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">secure.bankexample.com</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900/40 text-blue-900 dark:text-white"
                    placeholder="you@example.com"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900/40 text-blue-900 dark:text-white"
                    placeholder="••••••••"
                    disabled
                  />
                </div>

                <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                  Login
                </button>

                <div className="flex items-center justify-center text-xs text-blue-700 dark:text-blue-400 pt-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Secure Connection
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cloned Site (Interactive) */}
        <div>
          <div className="text-sm font-semibold mb-3 text-center text-muted-foreground">Cloned Site</div>
          <Card
            className={`border-2 border-red-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 cursor-crosshair relative overflow-hidden ${
              shakeEffect ? "animate-shake" : ""
            }`}
            onClick={(e) => {
              // Find which difference was clicked by checking coordinates
              for (let i = 0; i < DIFFERENCES.length; i++) {
                handleDifferenceClick(i, e)
              }
            }}
          >
            <CardContent className="pt-8 pb-8 px-6 relative">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">Bank Login</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">secure.bankexample.com</div>
              </div>

              <div className="space-y-4 relative">
                <div>
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900/40 text-blue-900 dark:text-white"
                    placeholder="you@example.com"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900/40 text-blue-900 dark:text-white"
                    placeholder="••••••••"
                    disabled
                  />
                </div>

                {/* DIFFERENCE 1: Button color changed to red/orange */}
                <button className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
                  Login
                </button>

                {/* DIFFERENCE 2: Typo in text */}
                <div className="flex items-center justify-center text-xs text-blue-700 dark:text-blue-400 pt-2">
                  {!foundDifferences.includes(2) && <Lock className="h-3 w-3 mr-1" />}
                  {foundDifferences.includes(2) ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  Secure Conection
                </div>
              </div>

              {/* Highlight circles for found differences */}
              {foundDifferences.includes(0) && (
                <div
                  className="absolute rounded-full border-4 border-green-500"
                  style={{ left: "45%", top: "35%", width: "80px", height: "40px" }}
                />
              )}
              {foundDifferences.includes(1) && (
                <div
                  className="absolute rounded-full border-4 border-green-500"
                  style={{ left: "25%", top: "50%", width: "150px", height: "20px" }}
                />
              )}
              {foundDifferences.includes(2) && (
                <div
                  className="absolute rounded-full border-4 border-green-500"
                  style={{ left: "70%", top: "26%", width: "25px", height: "25px" }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {feedback && (
        <Card
          className={
            feedback === "correct"
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50 dark:bg-red-950/20"
          }
        >
          <CardContent className="py-4 text-center">
            {feedback === "correct" ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">Difference found!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-600">Try again - not a difference</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
