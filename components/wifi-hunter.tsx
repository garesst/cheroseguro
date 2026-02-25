"use client"

import { useState, useEffect } from "react"
import { Clock, Star, Wifi, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Network {
  id: string
  name: string
  isTrap: boolean
  signalStrength: number
}

interface WifiHunterProps {
  onGameOver?: (score: number) => void
}

export function WifiHunter({ onGameOver }: WifiHunterProps) {
  const networkPool: Network[] = [
    { id: "1", name: "CoffeeShop_Free", isTrap: true, signalStrength: 60 },
    { id: "2", name: "AirportNet", isTrap: true, signalStrength: 80 },
    { id: "3", name: "CompanyVPN", isTrap: false, signalStrength: 90 },
    { id: "4", name: "FreeWiFi", isTrap: true, signalStrength: 70 },
    { id: "5", name: "HomeNetwork", isTrap: false, signalStrength: 95 },
    { id: "6", name: "PublicHotspot", isTrap: true, signalStrength: 65 },
    { id: "7", name: "PrivateNet_Secure", isTrap: false, signalStrength: 85 },
    { id: "8", name: "GuestWiFi_Open", isTrap: true, signalStrength: 75 },
  ]

  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [networkList, setNetworkList] = useState<Network[]>([])
  const [feedback, setFeedback] = useState<{ id: string; isCorrect: boolean; isConnecting: boolean } | null>(null)
  const [shakeScreen, setShakeScreen] = useState(false)
  const [health, setHealth] = useState(100)

  useEffect(() => {
    const shuffled = [...networkPool].sort(() => Math.random() - 0.5)
    setNetworkList(shuffled)
    setGameStarted(true)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver || health <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          if (onGameOver) onGameOver(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver, health, score])

  useEffect(() => {
    if (health <= 0) {
      setGameOver(true)
      if (onGameOver) onGameOver(score)
    }
  }, [health])

  const handleNetworkClick = (network: Network) => {
    if (feedback) return // Prevent multiple clicks during feedback

    const isCorrect = !network.isTrap // Correct choice is to AVOID traps

    if (isCorrect) {
      // Safe network selected
      setFeedback({ id: network.id, isCorrect: true, isConnecting: true })
      setScore(score + 15)

      setTimeout(() => {
        setFeedback(null)
      }, 1200)
    } else {
      // Trap network selected
      setFeedback({ id: network.id, isCorrect: false, isConnecting: false })
      setHealth(Math.max(0, health - 20))
      setTimeLeft(Math.max(0, timeLeft - 3))
      setShakeScreen(true)

      setTimeout(() => {
        setShakeScreen(false)
        setFeedback(null)
      }, 600)
    }
  }

  const renderSignalStrength = (strength: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-3 w-1 rounded-sm ${strength > i * 25 ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    )
  }

  if (gameOver) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            {score >= 150
              ? "Expert WiFi hunter! You avoided all traps!"
              : score >= 100
                ? "Great job! You caught most unsafe networks."
                : score >= 50
                  ? "Good start! Learn to spot those tricks."
                  : "Keep practicing your WiFi safety skills!"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${shakeScreen ? "animate-pulse" : ""}`}>
      <div className="grid grid-cols-3 gap-2">
        <Badge variant="outline" className="text-lg px-4 py-2 justify-center">
          <Clock className="mr-2 h-4 w-4" />
          {timeLeft}s
        </Badge>
        <Badge variant="secondary" className="text-lg px-4 py-2 justify-center">
          <Star className="mr-2 h-4 w-4" />
          {score}
        </Badge>
        <Badge className={`text-lg px-4 py-2 justify-center ${health <= 30 ? "bg-red-600" : "bg-green-600"}`}>
          Health {health}%
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Available Networks
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal mt-2">
            Select safe networks. Avoid traps to earn points!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {networkList.map((network) => (
              <Button
                key={network.id}
                variant="outline"
                className={`w-full h-auto py-4 px-4 justify-between transition-all ${
                  feedback?.id === network.id
                    ? feedback.isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20 animate-pulse"
                    : ""
                }`}
                onClick={() => handleNetworkClick(network)}
                disabled={!!feedback}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Wifi className="h-4 w-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{network.name}</div>
                    {feedback?.id === network.id && feedback.isConnecting && (
                      <div className="text-xs text-green-600 font-semibold">Connecting...</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {renderSignalStrength(network.signalStrength)}
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Networks can be tricky! Look at the SSID names carefully. Some may seem official but
            are honeypots!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
