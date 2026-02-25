"use client"

import { useState, useEffect, useRef } from "react"
import { Star, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Tetris pieces (polyominoes)
const PIECES = [
  // I piece
  [[1, 1, 1, 1]],
  // O piece
  [
    [1, 1],
    [1, 1],
  ],
  // T piece
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  // S piece
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  // Z piece
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  // J piece
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  // L piece
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
]

const COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
]

interface Piece {
  shape: number[][]
  x: number
  y: number
  color: string
  colorIndex: number
}

interface TetrisProps {
  onGameOver?: (score: number) => void
}

export function PasswordTetris({ onGameOver }: TetrisProps) {
  const COLS = 10
  const ROWS = 20
  const BLOCK_SIZE = 25

  const [grid, setGrid] = useState<(number | null)[][]>(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null)),
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const createRandomPiece = (): Piece => {
      const shapeIndex = Math.floor(Math.random() * PIECES.length)
      const colorIndex = Math.floor(Math.random() * COLORS.length)
      return {
        shape: PIECES[shapeIndex],
        x: Math.floor(COLS / 2) - 1,
        y: 0,
        color: COLORS[colorIndex],
        colorIndex,
      }
    }

    setCurrentPiece(createRandomPiece())
    setNextPiece(createRandomPiece())

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const canPlacePiece = (piece: Piece, offsetX = 0, offsetY = 0): boolean => {
    if (!piece) return false

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] === 1) {
          const gridX = piece.x + x + offsetX
          const gridY = piece.y + y + offsetY

          if (gridX < 0 || gridX >= COLS || gridY >= ROWS) {
            return false
          }

          if (gridY >= 0 && grid[gridY][gridX] !== null) {
            return false
          }
        }
      }
    }
    return true
  }

  const mergePieceIntoGrid = (piece: Piece, currentGrid: (number | null)[][]): (number | null)[][] => {
    const newGrid = currentGrid.map((row) => [...row])

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] === 1) {
          const gridX = piece.x + x
          const gridY = piece.y + y

          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            newGrid[gridY][gridX] = piece.colorIndex
          }
        }
      }
    }

    return newGrid
  }

  const clearLines = (currentGrid: (number | null)[][]): { grid: (number | null)[][]; clearedLines: number } => {
    let clearedCount = 0
    let newGrid = currentGrid.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        clearedCount++
        return false
      }
      return true
    })

    // Add empty rows at top
    const emptyRows = Array(clearedCount)
      .fill(null)
      .map(() => Array(COLS).fill(null))
    newGrid = [...emptyRows, ...newGrid]

    return { grid: newGrid, clearedLines: clearedCount }
  }

  useEffect(() => {
    if (gameOver || !currentPiece) return

    gameLoopRef.current = setInterval(() => {
      setCurrentPiece((prev) => {
        if (!prev) return null

        // Handle arrow key inputs
        if (keysPressed.current["ArrowLeft"] && canPlacePiece(prev, -1)) {
          prev = { ...prev, x: prev.x - 1 }
        }
        if (keysPressed.current["ArrowRight"] && canPlacePiece(prev, 1)) {
          prev = { ...prev, x: prev.x + 1 }
        }
        if (keysPressed.current["ArrowDown"] && canPlacePiece(prev, 0, 1)) {
          prev = { ...prev, y: prev.y + 1 }
        }

        // Apply gravity
        if (canPlacePiece(prev, 0, 1)) {
          return { ...prev, y: prev.y + 1 }
        }

        // Piece can't move down - merge it
        const newGrid = mergePieceIntoGrid(prev, grid)

        // Clear lines
        const { grid: clearedGrid, clearedLines: clearedCount } = clearLines(newGrid)

        if (clearedCount > 0) {
          setScore((s) => s + clearedCount * 100)
          setLines((l) => l + clearedCount)
        }

        setGrid(clearedGrid)

        // Spawn next piece
        const newPiece = nextPiece!
        setNextPiece(() => {
          const shapeIndex = Math.floor(Math.random() * PIECES.length)
          const colorIndex = Math.floor(Math.random() * COLORS.length)
          return {
            shape: PIECES[shapeIndex],
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            color: COLORS[colorIndex],
            colorIndex,
          }
        })

        // Check game over
        if (!canPlacePiece(newPiece, 0, 0)) {
          setGameOver(true)
          if (onGameOver) onGameOver(score)
          return null
        }

        return newPiece
      })
    }, 800)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameOver, grid, currentPiece, nextPiece])

  if (gameOver) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-primary">{score}</div>
          <div className="text-sm text-muted-foreground">Points Earned • {lines} Lines Cleared</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Star className="mr-2 h-4 w-4" />
          {score}
        </Badge>
        <div className="text-sm font-semibold">Lines: {lines}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Game Board */}
        <div className="md:col-span-2">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div
                className="inline-block border-2 border-primary/30 bg-background relative"
                style={{
                  width: COLS * BLOCK_SIZE,
                  height: ROWS * BLOCK_SIZE,
                }}
              >
                {/* Render grid blocks */}
                {grid.map((row, y) =>
                  row.map((cellColor, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`absolute border border-border/20 ${cellColor !== null ? COLORS[cellColor] : ""}`}
                      style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        left: x * BLOCK_SIZE,
                        top: y * BLOCK_SIZE,
                      }}
                    />
                  )),
                )}

                {/* Current falling piece */}
                {currentPiece &&
                  currentPiece.shape.map((row, y) =>
                    row.map((cell, x) =>
                      cell === 1 ? (
                        <div
                          key={`piece-${x}-${y}`}
                          className={`absolute border border-primary/50 ${currentPiece.color}`}
                          style={{
                            width: BLOCK_SIZE,
                            height: BLOCK_SIZE,
                            left: (currentPiece.x + x) * BLOCK_SIZE,
                            top: (currentPiece.y + y) * BLOCK_SIZE,
                            opacity: 0.9,
                          }}
                        />
                      ) : null,
                    ),
                  )}
              </div>

              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Left (←)
                </Button>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Down (↓)
                </Button>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  Right (→)
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Use arrow keys to move blocks</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Next Piece</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div
                className="inline-block bg-muted/50"
                style={{
                  width: nextPiece ? nextPiece.shape[0].length * 30 : 60,
                  height: nextPiece ? nextPiece.shape.length * 30 : 60,
                }}
              >
                {nextPiece &&
                  nextPiece.shape.map((row, y) =>
                    row.map((cell, x) =>
                      cell === 1 ? (
                        <div
                          key={`next-${x}-${y}`}
                          className={`absolute border border-border ${nextPiece.color}`}
                          style={{
                            width: 30,
                            height: 30,
                            left: x * 30,
                            top: y * 30,
                          }}
                        />
                      ) : null,
                    ),
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground mt-2">+100 per line</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
