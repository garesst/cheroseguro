"use client"

import { useState, useEffect } from "react"
import { Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function BruteForceArena() {
  const [password, setPassword] = useState("")
  const [timeToCrack, setTimeToCrack] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [hackerLogs, setHackerLogs] = useState<string[]>([])
  const [scrollToBottom, setScrollToBottom] = useState(true)

  // Calculate time to crack based on password strength
  const calculateTimeToCrack = (pwd: string): number => {
    if (pwd.length === 0) return 0

    // Base combinations per character type
    let characterSpace = 0
    const hasLower = /[a-z]/.test(pwd)
    const hasUpper = /[A-Z]/.test(pwd)
    const hasNumbers = /[0-9]/.test(pwd)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)

    characterSpace += hasLower ? 26 : 0
    characterSpace += hasUpper ? 26 : 0
    characterSpace += hasNumbers ? 10 : 0
    characterSpace += hasSpecial ? 32 : 0

    // Exponential calculation: character_space ^ length
    // Assume 1 billion guesses per second
    const totalCombinations = Math.pow(characterSpace, pwd.length)
    const guessesPerSecond = 1000000000
    const secondsToCrack = totalCombinations / guessesPerSecond / 2 // Average is half total time

    // Convert to years (1 year = 31,536,000 seconds)
    const yearsToCrack = secondsToCrack / 31536000

    return Math.round(yearsToCrack)
  }

  // Generate hacker attempt logs
  const generateHackerLog = (pwd: string): string[] => {
    const attempts = [
      "Analizando la estructura de la contrasena...",
      `Espacio de caracteres detectado: ${new Set(pwd.split("")).size} caracteres unicos`,
      `Longitud: ${pwd.length} caracteres`,
    ]

    // Common password attempts
    const commonAttempts = [
      "Probando '123456'...",
      "Probando 'password'...",
      "Probando 'admin'...",
      "Probando 'letmein'...",
      "Probando 'welcome'...",
      "Probando 'monkey'...",
      "Probando palabras del diccionario...",
      "Probando patrones comunes...",
      "Probando secuencias del teclado...",
      "Probando fuerza bruta (todas las combinaciones)...",
    ]

    attempts.push(...commonAttempts.slice(0, Math.min(pwd.length, commonAttempts.length)))

    return attempts
  }

  useEffect(() => {
    if (!gameStarted && password.length > 0) {
      setGameStarted(true)
    }

    if (password.length > 0) {
      const newTimeToCrack = calculateTimeToCrack(password)
      setTimeToCrack(newTimeToCrack)

      // Generate hacker logs
      const logs = generateHackerLog(password)
      setHackerLogs(logs)

      // Check if password is strong enough (> 100 years)
      if (newTimeToCrack > 100) {
        setVaultOpen(true)
        setGameWon(true)
      } else {
        setVaultOpen(false)
        setGameWon(false)
      }

      setScrollToBottom(true)
    } else {
      setGameStarted(false)
      setVaultOpen(false)
      setGameWon(false)
      setHackerLogs([])
      setTimeToCrack(0)
    }
  }, [password])

  const handleReset = () => {
    setPassword("")
    setGameWon(false)
    setGameStarted(false)
    setVaultOpen(false)
    setHackerLogs([])
    setTimeToCrack(0)
  }

  const vaultStatus = password.length === 0 ? "locked" : vaultOpen ? "open" : "cracking"

  return (
    <div className="space-y-6">
      {/* Vault Door Visualization */}
      <div
        className={`relative rounded-lg p-8 text-center transition-all duration-500 ${
          vaultStatus === "open"
            ? "bg-gradient-to-b from-green-500/20 to-green-500/10 border-2 border-green-500"
            : vaultStatus === "cracking"
              ? "bg-gradient-to-b from-red-500/20 to-red-500/10 border-2 border-red-500 animate-pulse"
              : "bg-gradient-to-b from-slate-500/20 to-slate-500/10 border-2 border-slate-400"
        }`}
      >
        <div className="space-y-4">
          <Shield
            className={`h-20 w-20 mx-auto transition-all duration-500 ${
              vaultStatus === "open"
                ? "text-green-500 scale-110"
                : vaultStatus === "cracking"
                  ? "text-red-500 scale-100"
                  : "text-slate-400"
            }`}
          />

          <h2 className="text-2xl font-bold">
            {vaultStatus === "open" ? "Acceso concedido" : vaultStatus === "cracking" ? "Bajo ataque" : "Boveda bloqueada"}
          </h2>

          <div className="text-4xl font-mono font-bold">
            {vaultStatus === "locked" ? (
              <span className="text-slate-400">----- BLOQUEADA -----</span>
            ) : vaultStatus === "open" ? (
              <span className="text-green-500">PUERTA ABIERTA</span>
            ) : (
              <span className="text-red-500 animate-bounce">DESCIFRANDO...</span>
            )}
          </div>

          {gameStarted && (
            <div className="text-lg font-semibold">
              <span className={timeToCrack > 100 ? "text-green-500" : "text-red-500"}>
                Tiempo para descifrar: {timeToCrack.toLocaleString()} anos
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Password Input */}
      <Card>
        <CardHeader>
          <CardTitle>Escribe una contrasena</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="Crea una contrasena segura..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 text-lg p-4 h-12"
            autoFocus
          />

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Fortaleza de la contrasena</p>
              <div className="flex gap-2">
                <div className={`h-2 flex-1 rounded ${password.length >= 8 ? "bg-yellow-500" : "bg-muted"}`} />
                <div
                  className={`h-2 flex-1 rounded ${password.length >= 12 && /[A-Z]/.test(password) ? "bg-orange-500" : "bg-muted"}`}
                />
                <div
                  className={`h-2 flex-1 rounded ${password.length >= 12 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password) ? "bg-red-500" : "bg-muted"}`}
                />
              </div>
            </div>
            {gameWon && <Badge className="bg-green-500">¡Exito!</Badge>}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Objetivo: crea una contrasena que tarde <span className="font-semibold text-green-600">&gt; 100 anos</span> en
            descifrarse
          </p>

          {gameWon && (
            <Button onClick={handleReset} className="w-full">
              Restablecer e intentar otra vez
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Hacker Console */}
      {gameStarted && (
        <Card className="bg-slate-950 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-500 font-mono text-sm">
              <Zap className="inline mr-2 h-4 w-4" />
              CONSOLA DEL ATACANTE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded p-4 h-48 overflow-y-auto font-mono text-sm text-green-500 space-y-1">
              {hackerLogs.map((log, idx) => (
                <div key={idx} className="text-green-500">
                  $ {log}
                </div>
              ))}

              {vaultOpen && <div className="text-red-500 font-bold mt-4">ACCESO DENEGADO: el costo computacional es demasiado alto</div>}

              {!vaultOpen && gameStarted && (
                <div className="text-red-500 animate-pulse">
                  $ Probando combinaciones... {Math.floor(Math.random() * 999999999).toLocaleString()}/
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
