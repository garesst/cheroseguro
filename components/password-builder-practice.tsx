"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, Target, Key, Plus, Trash2 } from "lucide-react"
import { usePracticeProgress } from "@/hooks/use-practice-progress"

interface PasswordBuilderPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

interface BuildingBlock {
  id: string
  value: string
  strength: number
  type: 'word' | 'number' | 'symbol'
}

interface Modifier {
  id: string
  name: string
  strength_multiplier: number
  applies_to: string[]
}

interface Requirement {
  id: string
  name: string
  description: string
  check: string
  points: number
  required: boolean
  met?: boolean
}

interface PasswordComponent {
  id: string
  block: BuildingBlock
  modifier?: Modifier
  finalValue: string
  strength: number
}

export function PasswordBuilderPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: PasswordBuilderPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [passwordComponents, setPasswordComponents] = useState<PasswordComponent[]>([])
  const [availableBlocks, setAvailableBlocks] = useState<BuildingBlock[]>([])
  const [availableModifiers, setAvailableModifiers] = useState<Modifier[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(null)
  const [selectedModifier, setSelectedModifier] = useState<Modifier | undefined>(undefined)
  const router = useRouter()
  const { completePracticeExercise } = usePracticeProgress()

  // Get game data from practice
  const gameConfig = practice.currentExercise?.scenario_data?.game_config || practice.scenario_data?.game_config
  const buildingBlocks = gameConfig?.building_blocks
  const timeLimit = gameConfig?.time_limit || 240
  const minScoreToPass = gameConfig?.min_score_to_pass || 80
  const targetStrength = gameConfig?.target_strength || 100
  const exerciseId = `exercise_${exerciseNumber}`

  const savePracticeResult = () => {
    if (resultSaved) return
    const finalScore = calculateFinalScore()
    const passed = finalScore >= minScoreToPass

    completePracticeExercise(practice.slug, exerciseId, finalScore, passed)
    setResultSaved(true)
  }

  useEffect(() => {
    if (hasStarted) {
      updatePassword()
    }
  }, [passwordComponents])

  const handleStartPractice = () => {
    setHasStarted(true)
    
    // Initialize available blocks and modifiers
    setAvailableBlocks([
      ...(buildingBlocks?.words || []),
      ...(buildingBlocks?.numbers || []),
      ...(buildingBlocks?.symbols || [])
    ])
    setAvailableModifiers(buildingBlocks?.modifiers || [])
    setRequirements((gameConfig?.requirements || []).map((req: any) => ({ ...req, met: false })))
    setTimeLeft(timeLimit)
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTimeUp = () => {
    savePracticeResult()
    setIsCompleted(true)
    calculateFinalScore()
  }

  const addComponent = () => {
    if (!selectedBlock) return

    const componentId = `component-${Date.now()}`
    let finalValue = selectedBlock.value
    let strength = selectedBlock.strength

    // Apply modifier if selected
    if (selectedModifier && selectedModifier.applies_to.includes(selectedBlock.type)) {
      strength = Math.round(strength * selectedModifier.strength_multiplier)
      
      // Apply modifier transformations
      switch (selectedModifier.id) {
        case 'uppercase':
          finalValue = finalValue.toUpperCase()
          break
        case 'reverse':
          finalValue = finalValue.split('').reverse().join('')
          break
        case 'leet_speak':
          finalValue = finalValue.replace(/a/gi, '@').replace(/e/gi, '3').replace(/o/gi, '0').replace(/i/gi, '1')
          break
      }
    }

    const newComponent: PasswordComponent = {
      id: componentId,
      block: selectedBlock,
      modifier: selectedModifier,
      finalValue,
      strength
    }

    setPasswordComponents(prev => [...prev, newComponent])
    setSelectedBlock(null)
    setSelectedModifier(undefined)
  }

  const removeComponent = (componentId: string) => {
    setPasswordComponents(prev => prev.filter(comp => comp.id !== componentId))
  }

  const moveComponentUp = (index: number) => {
    if (index > 0) {
      const newComponents = [...passwordComponents]
      const temp = newComponents[index]
      newComponents[index] = newComponents[index - 1]
      newComponents[index - 1] = temp
      setPasswordComponents(newComponents)
    }
  }

  const moveComponentDown = (index: number) => {
    if (index < passwordComponents.length - 1) {
      const newComponents = [...passwordComponents]
      const temp = newComponents[index]
      newComponents[index] = newComponents[index + 1]
      newComponents[index + 1] = temp
      setPasswordComponents(newComponents)
    }
  }

  const updatePassword = () => {
    const password = passwordComponents.map(comp => comp.finalValue).join('')
    setCurrentPassword(password)

    // Calculate total strength
    const totalStrength = passwordComponents.reduce((sum, comp) => sum + comp.strength, 0)
    setPasswordStrength(totalStrength)

    // Check requirements
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: checkRequirement(password, req)
    }))
    setRequirements(updatedRequirements)

    // Calculate score
    const metRequiredCount = updatedRequirements.filter(req => req.required && req.met).length
    const metOptionalCount = updatedRequirements.filter(req => !req.required && req.met).length
    const requiredRequirements = updatedRequirements.filter(req => req.required).length
    
    let newScore = 0
    
    // Base score from meeting required requirements
    if (metRequiredCount === requiredRequirements) {
      newScore += gameConfig?.scoring?.base_points || 50
    }

    // Bonus for password length
    newScore += password.length * (gameConfig?.scoring?.length_bonus || 5)

    // Bonus for complexity (strength)
    if (totalStrength >= targetStrength) {
      newScore += (gameConfig?.scoring?.complexity_multiplier || 1.5) * 20
    }

    // Bonus for optional requirements
    newScore += metOptionalCount * 10

    setScore(Math.round(newScore))

    // Check if all required requirements are met
    if (metRequiredCount === requiredRequirements && totalStrength >= targetStrength) {
      setTimeout(() => {
        savePracticeResult()
        setIsCompleted(true)
        calculateFinalScore()
      }, 1000)
    }
  }

  const checkRequirement = (password: string, requirement: Requirement) => {
    switch (requirement.check) {
      case 'length >= 8':
        return password.length >= 8
      case 'has_uppercase':
        return /[A-Z]/.test(password)
      case 'has_number':
        return /\d/.test(password)
      case 'has_symbol':
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      case 'not_in_dictionary':
        return !containsDictionaryWords(password)
      case 'no_sequences':
        return !containsSequences(password)
      default:
        return false
    }
  }

  const containsDictionaryWords = (password: string) => {
    const commonWords = ['password', 'admin', 'user', 'login', '123456', 'qwerty']
    return commonWords.some(word => password.toLowerCase().includes(word.toLowerCase()))
  }

  const containsSequences = (password: string) => {
    const sequences = ['123', '234', '345', '456', '789', 'abc', 'bcd', 'cde', 'qwe', 'wer', 'ert']
    return sequences.some(seq => password.toLowerCase().includes(seq))
  }

  const calculateFinalScore = () => {
    const maxScore = 150 // Approximate max based on scoring system
    const finalScore = Math.min((score / maxScore) * 100, 100)
    return Math.round(finalScore)
  }

  const handleNextExercise = () => {
    if (exerciseNumber < totalExercises) {
      router.push(`/practice/${practice.slug}/${exerciseNumber + 1}`)
    } else {
      router.push('/practice')
    }
  }

  const handleTryAgain = () => {
    setHasStarted(false)
    setPasswordComponents([])
    setCurrentPassword("")
    setPasswordStrength(0)
    setScore(0)
    setTimeLeft(0)
    setIsCompleted(false)
    setSelectedBlock(null)
    setSelectedModifier(undefined)
    setResultSaved(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return 'text-red-600'
    if (strength < 60) return 'text-yellow-600'
    if (strength < 90) return 'text-blue-600'
    return 'text-green-600'
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return 'Débil'
    if (strength < 60) return 'Moderada'
    if (strength < 90) return 'Fuerte'
    return 'Muy Fuerte'
  }

  // Render practice introduction
  if (!hasStarted) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Key className="h-6 w-6 text-purple-600" />
                  {practice.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {practice.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {exerciseNumber}/{totalExercises}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Instrucciones:</h4>
                <p className="text-muted-foreground">
                  {practice.currentExercise?.scenario_data?.instructions || practice.scenario_data?.instructions}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivos de Aprendizaje:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(practice.learning_objectives || []).map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Detalles del Ejercicio:
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>⏱️ Tiempo límite: {Math.floor(timeLimit / 60)} minutos</div>
                    <div>📊 Puntuación mínima: {minScoreToPass}%</div>
                    <div>🎯 Fortaleza objetivo: {targetStrength} pts</div>
                    <div>🧩 Bloques disponibles: {(buildingBlocks?.words || []).length + (buildingBlocks?.numbers || []).length + (buildingBlocks?.symbols || []).length}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Requisitos de Contraseña:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(gameConfig?.requirements || []).map((req: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-3 ${
                        req.required ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {req.required ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="font-semibold text-sm">{req.name}</span>
                        <Badge variant={req.required ? "destructive" : "secondary"} className="ml-auto text-xs">
                          {req.required ? 'Obligatorio' : 'Opcional'} - {req.points}pts
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleStartPractice} className="w-full mt-6" size="lg">
                Construir Contraseña Segura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render completed state
  if (isCompleted) {
    const finalScore = calculateFinalScore()
    const passed = finalScore >= minScoreToPass
    const requiredMet = requirements.filter(r => r.required && r.met).length
    const totalRequired = requirements.filter(r => r.required).length

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {passed ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              {passed ? "¡Contraseña Segura!" : "Mejora la Contraseña"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold mb-2">{finalScore}%</div>
                <p className="text-muted-foreground">
                  {passed 
                    ? "Has creado una contraseña que cumple con los estándares de seguridad."
                    : `Necesitas al menos ${minScoreToPass}% para aprobar. Mejora tu contraseña.`
                  }
                </p>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="text-lg font-mono mb-2">Contraseña Final:</div>
                  <div className="text-2xl font-bold font-mono border rounded p-3 bg-white">
                    {currentPassword || '(vacía)'}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Fortaleza: </span>
                      <span className={`font-bold ${getStrengthColor(passwordStrength)}`}>
                        {passwordStrength} - {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Longitud: </span>
                      <span className="font-bold">{currentPassword.length} caracteres</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                  <div className="text-sm text-muted-foreground">Puntos Totales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{requiredMet}</div>
                  <div className="text-sm text-muted-foreground">Requeridos Cumplidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{passwordComponents.length}</div>
                  <div className="text-sm text-muted-foreground">Componentes</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getStrengthColor(passwordStrength)}`}>
                    {passwordStrength}
                  </div>
                  <div className="text-sm text-muted-foreground">Fortaleza</div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold mb-3">Análisis de Requisitos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requirements.map((req, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-3 ${
                        req.met 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">{req.name}</span>
                        <Badge 
                          variant={req.met ? "default" : "destructive"} 
                          className="ml-auto text-xs"
                        >
                          {req.met ? '✓' : '✗'} {req.points}pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="outline" onClick={handleTryAgain}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Intentar de Nuevo
                </Button>
                
                {exerciseNumber < totalExercises ? (
                  <Button onClick={handleNextExercise}>
                    Siguiente Ejercicio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/practice')}>
                    Volver a Prácticas
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render main builder interface
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with progress and timer */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{exerciseNumber}/{totalExercises}</Badge>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Puntuación</div>
                <div className="font-bold">{score} pts</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Fortaleza</div>
                <div className={`font-bold ${getStrengthColor(passwordStrength)}`}>
                  {passwordStrength}/{targetStrength}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Password Builder */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Constructor de Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Current Password Display */}
              <Card className="mb-6 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Contraseña Actual:</span>
                    <span className={`text-sm font-semibold ${getStrengthColor(passwordStrength)}`}>
                      {getStrengthLabel(passwordStrength)} ({passwordStrength})
                    </span>
                  </div>
                  <div className="text-xl font-mono border rounded p-3 bg-white min-h-[60px] break-all">
                    {currentPassword || 'Comienza agregando componentes...'}
                  </div>
                  <Progress 
                    value={(passwordStrength / targetStrength) * 100} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              {/* Component Builder */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">1. Selecciona un Bloque:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableBlocks.map((block) => (
                      <Button
                        key={block.id}
                        variant={selectedBlock?.id === block.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedBlock(block)}
                        className="text-xs"
                      >
                        <div className="text-center">
                          <div className="font-mono">{block.value}</div>
                          <div className="text-xs opacity-75">{block.strength} pts</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">2. Aplica Modificador (Opcional):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant={!selectedModifier ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedModifier(undefined)}
                      className="text-xs"
                    >
                      Ninguno
                    </Button>
                    {availableModifiers.map((modifier) => (
                      <Button
                        key={modifier.id}
                        variant={selectedModifier?.id === modifier.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedModifier(modifier)}
                        disabled={!selectedBlock || !modifier.applies_to.includes(selectedBlock.type)}
                        className="text-xs"
                      >
                        <div className="text-center">
                          <div>{modifier.name}</div>
                          <div className="text-xs opacity-75">×{modifier.strength_multiplier}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={addComponent}
                    disabled={!selectedBlock}
                    className="w-full max-w-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Componente
                  </Button>
                </div>
              </div>

              {/* Password Components */}
              {passwordComponents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Componentes de la Contraseña:</h4>
                  <div className="space-y-2">
                    {passwordComponents.map((component, index) => (
                      <Card key={component.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveComponentUp(index)}
                              disabled={index === 0}
                              className="text-xs p-1 rounded disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveComponentDown(index)}
                              disabled={index === passwordComponents.length - 1}
                              className="text-xs p-1 rounded disabled:opacity-50"
                            >
                              ↓
                            </button>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg">{component.finalValue}</span>
                              <Badge variant="secondary">{component.strength} pts</Badge>
                              {component.modifier && (
                                <Badge variant="outline" className="text-xs">
                                  {component.modifier.name}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Original: {component.block.value} ({component.block.type})
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(component.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requirements Panel */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <Card 
                    key={index}
                    className={`p-3 ${
                      req.met 
                        ? 'border-green-200 bg-green-50' 
                        : req.required 
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{req.name}</span>
                          <Badge 
                            variant={req.required ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            {req.points}pts
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {req.description}
                        </div>
                        {req.required && (
                          <div className="text-xs text-red-600 mt-1">Obligatorio</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-sm text-center">
                  <div className="text-muted-foreground">Progreso General</div>
                  <div className="text-lg font-bold">
                    {requirements.filter(r => r.met && r.required).length}/
                    {requirements.filter(r => r.required).length} Obligatorios
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +{requirements.filter(r => r.met && !r.required).length} Opcionales
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}