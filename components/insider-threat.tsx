"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Suspect {
  id: string
  name: string
  role: string
  logs: string[]
  hasRedFlag: boolean
  redFlag?: string
}

const suspects: Suspect[] = [
  {
    id: "alice",
    name: "Alice Chen",
    role: "Database Administrator",
    logs: ["Login 9:00 AM", "Database Query Executed", "Email Sent to Manager", "Logout 5:30 PM"],
    hasRedFlag: false,
  },
  {
    id: "bob",
    name: "Bob Martinez",
    role: "Junior Developer",
    logs: ["Login 8:45 AM", "Downloaded Database 3:15 AM", "USB Device Connected", "Remote Access from Unknown IP"],
    hasRedFlag: true,
    redFlag: "Suspicious activity detected",
  },
  {
    id: "charlie",
    name: "Charlie Thompson",
    role: "System Administrator",
    logs: ["Login 10:00 AM", "System Maintenance Performed", "Security Patch Applied", "Logout 6:00 PM"],
    hasRedFlag: false,
  },
]

interface InsiderThreatProps {
  onGameOver?: (score: number) => void
}

export function InsiderThreat({ onGameOver }: InsiderThreatProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<"correct" | "incorrect" | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const handleReport = (suspectId: string) => {
    setSelectedSuspect(suspectId)
    const suspect = suspects.find((s) => s.id === suspectId)
    const isCorrect = suspect?.hasRedFlag ?? false

    setGameResult(isCorrect ? "correct" : "incorrect")

    setTimeout(() => {
      setGameOver(true)
      if (onGameOver) {
        onGameOver(isCorrect ? 500 : 0)
      }
    }, 1500)
  }

  if (gameOver) {
    const isCorrect = gameResult === "correct"

    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {isCorrect ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-3xl">{isCorrect ? "Threat Identified!" : "Innocent Accused"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCorrect ? (
            <>
              <p className="text-lg font-semibold text-green-600">You correctly identified the insider!</p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600">500</div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-600">
                You accused an innocent employee. The real threat remains at large.
              </p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-600">0</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-red-950/20 to-orange-950/20 border-red-900/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-600">ALERT: Data Breach Detected</p>
              <p className="text-muted-foreground text-xs mt-1">
                Analyze the activity logs for each employee and identify who stole the data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {suspects.map((suspect) => (
          <Card
            key={suspect.id}
            className={`cursor-pointer transition-all ${
              selectedSuspect === suspect.id ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
            }`}
            onClick={() => !gameResult && handleReport(suspect.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <CardTitle className="text-lg">{suspect.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{suspect.role}</p>
                </div>
                {suspect.hasRedFlag && selectedSuspect === suspect.id && gameResult === "correct" && (
                  <Badge className="bg-red-600">Culprit</Badge>
                )}
              </div>

              <div className="bg-slate-950 rounded-md p-3 font-mono text-xs text-green-400 space-y-1 border border-green-900/30">
                {suspect.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-muted-foreground mr-2">[LOG {idx + 1}]</span>
                    <span
                      className={
                        suspect.hasRedFlag && suspect.logs[idx].includes("Downloaded")
                          ? "text-red-400 font-semibold"
                          : ""
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={selectedSuspect === suspect.id ? "default" : "outline"}
                disabled={gameResult !== null}
                onClick={(e) => {
                  e.stopPropagation()
                  handleReport(suspect.id)
                }}
              >
                {selectedSuspect === suspect.id ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report This Employee
                  </>
                ) : (
                  "Select"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
