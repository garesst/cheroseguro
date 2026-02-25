"use client"

import { useState } from "react"
import { Star, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Vendor {
  id: number
  name: string
  iso27001: boolean
  dataLocation: string
  encryption: boolean
  safe: boolean
}

const vendors: Vendor[] = [
  { id: 1, name: "SecureCloud Inc", iso27001: true, dataLocation: "US", encryption: true, safe: true },
  { id: 2, name: "QuickServices Ltd", iso27001: false, dataLocation: "Unknown", encryption: false, safe: false },
  { id: 3, name: "TrustVendor Corp", iso27001: true, dataLocation: "EU", encryption: true, safe: true },
  { id: 4, name: "BudgetHost Pro", iso27001: false, dataLocation: "China", encryption: false, safe: false },
  { id: 5, name: "GlobalTech Solutions", iso27001: true, dataLocation: "US", encryption: true, safe: true },
]

export function SupplyChainInspector() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const handleVote = (approved: boolean) => {
    const vendor = vendors[currentIndex]
    const isCorrect = approved === vendor.safe

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 200)
    }

    setTimeout(() => {
      setFeedback(null)
      if (currentIndex < vendors.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setGameOver(true)
      }
    }, 1000)
  }

  if (gameOver) {
    const finalScore = score + (feedback === "correct" ? 200 : 0)
    const percentage = Math.round((finalScore / (vendors.length * 200)) * 100)

    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Audit Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{finalScore}</div>
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
            {percentage === 100 ? "Perfect audit! Supply chain secured." : "Good vetting skills demonstrated."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const vendor = vendors[currentIndex]
  const progress = ((currentIndex + 1) / vendors.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Star className="mr-2 h-4 w-4" />
          {score}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {vendors.length}
        </div>
      </div>

      {/* Vendor Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">{vendor.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">ISO 27001</div>
              <div className="text-lg font-bold">{vendor.iso27001 ? "✓ Certified" : "✗ Missing"}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">Data Location</div>
              <div className="text-lg font-bold">{vendor.dataLocation}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 col-span-2">
              <div className="text-xs text-muted-foreground mb-2">Encryption</div>
              <div className="text-lg font-bold">{vendor.encryption ? "✓ Enabled" : "✗ Not enabled"}</div>
            </div>
          </div>

          {feedback && (
            <div
              className={`text-center py-4 rounded-lg ${feedback === "correct" ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}
            >
              {feedback === "correct" ? (
                <>
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold text-green-600">Correct Decision!</div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <div className="font-semibold text-red-600">Wrong Assessment</div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!feedback ? (
        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" className="h-14 text-base bg-green-600 hover:bg-green-700" onClick={() => handleVote(true)}>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Approve
          </Button>
          <Button size="lg" variant="destructive" className="h-14 text-base" onClick={() => handleVote(false)}>
            <XCircle className="mr-2 h-5 w-5" />
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  )
}
