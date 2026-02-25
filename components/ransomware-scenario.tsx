"use client"

import { Lock, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface RansomwareScenarioProps {
  title: string
  message: string
}

export function RansomwareScenario({ title, message }: RansomwareScenarioProps) {
  const [timeLeft, setTimeLeft] = useState(86400) // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  return (
    <Card className="mb-6 border-red-500 border-2 bg-red-50 dark:bg-red-950/20">
      <CardContent className="pt-8 pb-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{title}</h3>
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        </div>

        <div className="space-y-2 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Time Remaining</span>
          </div>
          <div className="text-4xl font-bold text-red-600 dark:text-red-400 font-mono">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg border border-red-300 dark:border-red-700">
          <p className="text-xs font-mono text-red-700 dark:text-red-300 leading-relaxed">
            Your system has been encrypted. Send 5 BTC to recover your files.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
