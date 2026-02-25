"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Shield, Star } from "lucide-react"
import Link from "next/link"

interface Scenario {
  id: number
  title: string
  description: string
  choices: {
    text: string
    budgetChange: number
    reputationChange: number
    healthChange: number
    timeChange: number
  }[]
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Data Breach Alert",
    description: "Hackers have compromised your customer database. They're demanding $50,000 or they'll leak the data.",
    choices: [
      {
        text: "Pay the ransom",
        budgetChange: -50,
        reputationChange: -30,
        healthChange: 20,
        timeChange: 0,
      },
      {
        text: "Restore from backup",
        budgetChange: -10,
        reputationChange: -50,
        healthChange: 40,
        timeChange: -5,
      },
    ],
  },
  {
    id: 2,
    title: "Encryption Attack",
    description: "Your HR database is encrypted. The attacker wants $100,000 to provide the decryption key.",
    choices: [
      {
        text: "Contact law enforcement",
        budgetChange: 0,
        reputationChange: 20,
        healthChange: 30,
        timeChange: -10,
      },
      {
        text: "Negotiate price down",
        budgetChange: -30,
        reputationChange: -40,
        healthChange: 50,
        timeChange: 0,
      },
    ],
  },
  {
    id: 3,
    title: "System Lockdown",
    description: "Your production servers are down. Attackers claim they'll keep them offline unless you pay $75,000.",
    choices: [
      {
        text: "Isolate and rebuild systems",
        budgetChange: -20,
        reputationChange: -60,
        healthChange: 60,
        timeChange: -15,
      },
      {
        text: "Activate disaster recovery plan",
        budgetChange: -40,
        reputationChange: -10,
        healthChange: 80,
        timeChange: -5,
      },
    ],
  },
]

export function RansomwareWarRoom() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [budget, setBudget] = useState(100)
  const [reputation, setReputation] = useState(100)
  const [health, setHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [totalCost, setTotalCost] = useState(0)

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && timeLeft > 0) {
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
  }, [gameStarted, gameOver, gameWon, timeLeft])

  useEffect(() => {
    if (budget <= 0 || reputation <= 0 || health <= 0) {
      setGameOver(true)
    }
  }, [budget, reputation, health])

  const handleChoice = (choiceIndex: number) => {
    const scenario = scenarios[currentScenario]
    const choice = scenario.choices[choiceIndex]

    const newBudget = Math.max(0, budget + choice.budgetChange)
    const newReputation = Math.max(0, reputation + choice.reputationChange)
    const newHealth = Math.max(0, health + choice.healthChange)
    const newTime = Math.max(0, timeLeft + choice.timeChange)

    setBudget(newBudget)
    setReputation(newReputation)
    setHealth(newHealth)
    setTimeLeft(newTime)
    setTotalCost(totalCost - choice.budgetChange)

    if (newBudget <= 0 || newReputation <= 0 || newHealth <= 0) {
      setGameOver(true)
    } else if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
    } else {
      setGameWon(true)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentScenario(0)
    setTimeLeft(30)
    setBudget(100)
    setReputation(100)
    setHealth(100)
    setGameOver(false)
    setGameWon(false)
    setTotalCost(0)
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <div className="font-semibold">3 Scenarios</div>
              <div className="text-sm text-muted-foreground">To survive</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-secondary mb-2" />
              <div className="font-semibold">Make decisions</div>
              <div className="text-sm text-muted-foreground">Under pressure</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <div className="font-semibold">Manage resources</div>
              <div className="text-sm text-muted-foreground">Budget & reputation</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">How to Play</h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>• Face 3 ransomware attack scenarios</li>
              <li>• Choose actions that balance Budget, Reputation, and System Health</li>
              <li>• Keep all three metrics above 0 to survive</li>
              <li>• Survive all 3 scenarios to win</li>
            </ul>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={startGame}>
          Start Game
        </Button>
      </div>
    )
  }

  if (gameWon) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">You Survived!</CardTitle>
            <CardDescription className="text-lg">All scenarios completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary mb-1">${totalCost}k</div>
                  <div className="text-xs text-muted-foreground">Total spent</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-1">{budget}%</div>
                  <div className="text-xs text-muted-foreground">Budget left</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-1">{reputation}%</div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-green-50 dark:bg-green-950/20 border-green-500">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  Excellent crisis management! You navigated difficult ransomware scenarios and protected your
                  organization's critical assets.
                </p>
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

  if (gameOver) {
    const failedMetric = budget <= 0 ? "Budget" : reputation <= 0 ? "Reputation" : "System Health"

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-3xl">Game Over</CardTitle>
            <CardDescription className="text-lg">{failedMetric} depleted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-500">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  Your organization couldn't handle the ransomware crisis. Next time, try different strategies to
                  balance all three critical metrics.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/play">Back to Games</Link>
              </Button>
              <Button className="flex-1" onClick={startGame}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scenario = scenarios[currentScenario]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Scenario {currentScenario + 1}/3
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 border-red-500">
          {timeLeft}s left
        </Badge>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Budget
            </span>
            <span className="text-sm font-semibold">{budget}%</span>
          </div>
          <Progress value={budget} className="h-3 bg-red-200 dark:bg-red-900/30" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Reputation
            </span>
            <span className="text-sm font-semibold">{reputation}%</span>
          </div>
          <Progress value={reputation} className="h-3 bg-orange-200 dark:bg-orange-900/30" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              System Health
            </span>
            <span className="text-sm font-semibold">{health}%</span>
          </div>
          <Progress value={health} className="h-3 bg-yellow-200 dark:bg-yellow-900/30" />
        </div>
      </div>

      {/* Alert Card */}
      <Card className="border-2 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            INCOMING ALERT
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 font-medium mt-2">{scenario.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{scenario.description}</p>
        </CardContent>
      </Card>

      {/* Choices */}
      <div className="grid gap-4">
        {scenario.choices.map((choice, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="h-auto py-4 px-6 text-left justify-start bg-transparent hover:bg-primary/5 border-2 whitespace-normal"
            onClick={() => handleChoice(idx)}
          >
            <div>
              <div className="font-semibold mb-1">{choice.text}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                {choice.budgetChange !== 0 && (
                  <div>
                    Budget {choice.budgetChange > 0 ? "+" : ""}
                    {choice.budgetChange}%
                  </div>
                )}
                {choice.reputationChange !== 0 && (
                  <div>
                    Reputation {choice.reputationChange > 0 ? "+" : ""}
                    {choice.reputationChange}%
                  </div>
                )}
                {choice.healthChange !== 0 && (
                  <div>
                    Health {choice.healthChange > 0 ? "+" : ""}
                    {choice.healthChange}%
                  </div>
                )}
                {choice.timeChange !== 0 && (
                  <div>
                    Time {choice.timeChange > 0 ? "+" : ""}
                    {choice.timeChange}s
                  </div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
