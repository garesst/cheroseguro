"use client"

import { useState } from "react"
import { Star, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NetworkNode {
  id: number
  name: string
  protected: boolean
  attacked: boolean
  targetted: boolean
}

const initialNodes: NetworkNode[] = [
  { id: 1, name: "Database Server", protected: false, attacked: false, targetted: false },
  { id: 2, name: "Web Server", protected: false, attacked: false, targetted: false },
  { id: 3, name: "Email Server", protected: false, attacked: false, targetted: false },
  { id: 4, name: "VPN Gateway", protected: false, attacked: false, targetted: false },
  { id: 5, name: "File Storage", protected: false, attacked: false, targetted: false },
]

export function TheAuditor() {
  const [nodes, setNodes] = useState<NetworkNode[]>(initialNodes)
  const [budget, setBudget] = useState(5)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)

  const handlePlaceFirewall = (nodeId: number) => {
    if (budget <= 0 || gameStarted) return

    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, protected: true } : n)))
    setBudget(budget - 1)
  }

  const handleSimulateAttack = () => {
    setGameStarted(true)

    // Randomly target 3 nodes
    const targetCount = 3
    const randomTargets = Math.floor(Math.random() * nodes.length)
    const targettedNodes: number[] = []

    while (targettedNodes.length < targetCount) {
      const randomId = Math.floor(Math.random() * nodes.length) + 1
      if (!targettedNodes.includes(randomId)) {
        targettedNodes.push(randomId)
      }
    }

    const newNodes = nodes.map((n) => ({
      ...n,
      targetted: targettedNodes.includes(n.id),
      attacked: targettedNodes.includes(n.id) && !n.protected,
    }))

    setNodes(newNodes)

    // Check if any unprotected nodes were targeted
    const hasUnprotectedTargets = newNodes.some((n) => n.attacked)

    setTimeout(() => {
      if (hasUnprotectedTargets) {
        setGameOver(true)
        setWon(false)
      } else {
        setWon(true)
        const protectedCount = newNodes.filter((n) => n.protected && n.targetted).length
        setScore(protectedCount * 250)
      }
    }, 1500)
  }

  const handleReset = () => {
    setNodes(initialNodes)
    setBudget(5)
    setGameStarted(false)
    setGameOver(false)
    setWon(false)
    setScore(0)
  }

  if (gameOver && !won) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Attack Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">An unprotected node was breached. Better luck next time!</p>
          <Button onClick={handleReset} size="lg">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (won) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Network Defended!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">Excellent security strategy! All protected nodes survived.</p>
          <Button onClick={handleReset} size="lg">
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="mr-2 h-4 w-4" />
          Budget: {budget} firewalls
        </Badge>
        <div className="text-sm font-semibold">Place firewalls before attacking</div>
      </div>

      {/* Network Map */}
      <div className="bg-muted/30 rounded-lg p-8 space-y-4">
        <div className="text-center text-sm font-semibold text-muted-foreground mb-6">Network Map</div>
        <div className="space-y-3">
          {nodes.map((node) => (
            <div key={node.id} className="flex items-center gap-4">
              <div className="flex-1 h-12 bg-card border-2 border-muted rounded-lg flex items-center px-4 relative overflow-hidden">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{node.name}</div>
                </div>
                {node.protected && <Shield className="h-5 w-5 text-green-600 mr-2" />}
                {node.attacked && <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />}
                {node.targetted && !node.attacked && <div className="text-xs font-bold text-green-600">✓ SAFE</div>}

                {/* Attack animation */}
                {gameStarted && node.targetted && <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />}
              </div>

              {!gameStarted && (
                <Button
                  variant={node.protected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlaceFirewall(node.id)}
                  disabled={budget === 0 || node.protected}
                  className="w-24"
                >
                  {node.protected ? "Protected" : "Place"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button onClick={handleSimulateAttack} disabled={gameStarted} size="lg" className="w-full h-14 text-lg">
        {gameStarted ? "Simulating..." : "Simulate Attack"}
      </Button>
    </div>
  )
}
