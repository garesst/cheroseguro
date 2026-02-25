"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle2, XCircle, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface FileItem {
  id: number
  name: string
  category: "public" | "internal" | "confidential" | "restricted"
}

const fileDatabase: FileItem[] = [
  { id: 1, name: "Q4 Sales Report.pdf", category: "internal" },
  { id: 2, name: "Company Handbook.pdf", category: "public" },
  { id: 3, name: "CEO Salary Information.xlsx", category: "restricted" },
  { id: 4, name: "Press Release.docx", category: "public" },
  { id: 5, name: "Employee Directory.xlsx", category: "confidential" },
  { id: 6, name: "Marketing Strategy.pptx", category: "confidential" },
  { id: 7, name: "Source Code Repository.zip", category: "restricted" },
  { id: 8, name: "Social Media Guidelines.pdf", category: "internal" },
]

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  public: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-500",
  },
  internal: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500",
  },
  confidential: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-500",
  },
  restricted: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-300", border: "border-red-500" },
}

export function DataCarrier() {
  const [gameStarted, setGameStarted] = useState(false)
  const [queue, setQueue] = useState<FileItem[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [flashedCategory, setFlashedCategory] = useState<string | null>(null)

  const initializeGame = () => {
    const shuffled = [...fileDatabase].sort(() => Math.random() - 0.5).slice(0, 5)
    setQueue(shuffled)
    setGameStarted(true)
    setCurrentFileIndex(0)
    setScore(0)
    setHealth(100)
    setGameOver(false)
    setFeedback(null)
  }

  const handleCategoryClick = (selectedCategory: string) => {
    if (gameOver || currentFileIndex >= queue.length) return

    const currentFile = queue[currentFileIndex]
    const isCorrect = currentFile.category === selectedCategory

    setFlashedCategory(selectedCategory)

    if (isCorrect) {
      setFeedback("correct")
      setScore(score + 100)

      setTimeout(() => {
        setFeedback(null)
        setFlashedCategory(null)
        if (currentFileIndex < queue.length - 1) {
          setCurrentFileIndex(currentFileIndex + 1)
        } else {
          setGameOver(true)
        }
      }, 800)
    } else {
      setFeedback("incorrect")
      setHealth(Math.max(0, health - 25))

      setTimeout(() => {
        setFeedback(null)
        setFlashedCategory(null)
      }, 800)
    }
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <div className="font-semibold">5 Files</div>
              <div className="text-sm text-muted-foreground">To classify</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Badge className="mb-2">4 Categories</Badge>
              <div className="font-semibold">Classification</div>
              <div className="text-sm text-muted-foreground">Game</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryColors).map(([category, colors]) => (
            <Card key={category} className={`border-2 ${colors.border}`}>
              <CardContent className="pt-4 text-center">
                <div className={`text-sm font-semibold ${colors.text}`}>{category}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">How to Play</h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>• Review each file name</li>
              <li>• Click the correct bucket: Public, Internal, Confidential, or Restricted</li>
              <li>• Correct answers earn 100 points</li>
              <li>• Wrong answers cost 25% health - you have 4 lives</li>
            </ul>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={initializeGame}>
          Start Game
        </Button>
      </div>
    )
  }

  if (gameOver) {
    const maxScore = queue.length * 100
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Game Complete!</CardTitle>
            <CardDescription className="text-lg">All files processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-1">{score}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-secondary mb-1">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  {percentage === 100
                    ? "Perfect score! You're a data classification expert!"
                    : percentage >= 75
                      ? "Great job! You understand data classification well."
                      : "Good effort! Keep practicing to improve your skills."}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/play">Back to Games</Link>
              </Button>
              <Button className="flex-1" onClick={initializeGame}>
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentFile = queue[currentFileIndex]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {currentFileIndex + 1}/{queue.length}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Score: {score}
        </Badge>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Health</span>
          <span className="text-sm font-semibold">{health}%</span>
        </div>
        <Progress value={health} className="h-3" />
      </div>

      {/* File Card with animation */}
      <motion.div
        key={currentFile.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <div className="text-2xl font-bold text-foreground">{currentFile.name}</div>
            <div className="text-sm text-muted-foreground mt-2">Which category?</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Buckets */}
      <div className="grid grid-cols-2 gap-4">
        {(["public", "internal", "confidential", "restricted"] as const).map((category) => {
          const colors = categoryColors[category]
          const isFlashing = flashedCategory === category
          const isCorrect = feedback === "correct" && currentFile.category === category
          const isIncorrect = feedback === "incorrect" && flashedCategory === category

          return (
            <motion.div
              key={category}
              animate={isFlashing ? { scale: [1, 1.05, 1], backgroundColor: isCorrect ? "#22c55e" : "#ef4444" } : {}}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="outline"
                className={`h-24 w-full text-sm font-semibold uppercase transition ${
                  isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
                    : isIncorrect
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                      : `border-2 ${colors.border} ${colors.bg} ${colors.text} hover:shadow-lg`
                }`}
                onClick={() => handleCategoryClick(category)}
                disabled={feedback !== null}
              >
                <div className="flex flex-col items-center">
                  <div>{category}</div>
                  {isCorrect && <CheckCircle2 className="h-4 w-4 mt-1" />}
                  {isIncorrect && <XCircle className="h-4 w-4 mt-1" />}
                </div>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Feedback */}
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
                <span className="font-semibold text-green-600">Correct! +100 points</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-600">Incorrect - Should be: {currentFile.category}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
