"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, Target, Shield, AlertTriangle, Server } from "lucide-react"

interface NetworkDefensePracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

interface SecurityTool {
  id: string
  name: string
  description: string
  capabilities: string[]
  placement_zones: string[]
  points: number
  isPlaced?: boolean
  placedZone?: string
}

interface PlacementZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  accepts: string[]
}

interface ThreatScenario {
  id: string
  name: string
  description: string
  attack_vector: string
  requires_mitigation: string[]
  points: number
  isMitigated?: boolean
}

export function NetworkDefensePractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: NetworkDefensePracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [tools, setTools] = useState<SecurityTool[]>([])
  const [threats, setThreats] = useState<ThreatScenario[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [draggedTool, setDraggedTool] = useState<SecurityTool | null>(null)
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({})
  const [selectedTool, setSelectedTool] = useState<SecurityTool | null>(null)
  const router = useRouter()

  // Get game data from practice
  const gameConfig = practice.currentExercise?.scenario_data?.game_config || practice.scenario_data?.game_config
  const securityTools: SecurityTool[] = gameConfig?.security_tools || []
  const placementZones: PlacementZone[] = gameConfig?.placement_zones || []
  const threatScenarios: ThreatScenario[] = gameConfig?.threat_scenarios || []
  const timeLimit = gameConfig?.time_limit || 420
  const minScoreToPass = gameConfig?.min_score_to_pass || 75
  const networkDiagram = gameConfig?.network_diagram

  const handleStartPractice = () => {
    setHasStarted(true)
    setTools(securityTools.map(tool => ({ ...tool, isPlaced: false })))
    setThreats(threatScenarios.map(threat => ({ ...threat, isMitigated: false })))
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
    setIsCompleted(true)
    calculateFinalScore()
  }

  const handleDragStart = (tool: SecurityTool) => {
    setDraggedTool(tool)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnZone = (zoneId: string) => {
    if (!draggedTool) return

    const zone = placementZones.find(z => z.id === zoneId)
    if (!zone || !zone.accepts.includes(draggedTool.id)) {
      setFeedback(prev => ({
        ...prev,
        [draggedTool.id]: `${draggedTool.name} no puede ser colocado en ${zone?.name || 'esta zona'}`
      }))
      setDraggedTool(null)
      return
    }

    const updatedTools = tools.map(tool => {
      if (tool.id === draggedTool.id) {
        return { 
          ...tool, 
          isPlaced: true, 
          placedZone: zoneId
        }
      }
      return tool
    })

    setTools(updatedTools)
    setScore(prev => prev + draggedTool.points)
    
    setFeedback(prev => ({
      ...prev,
      [draggedTool.id]: `${draggedTool.name} colocado correctamente en ${zone.name}`
    }))

    // Check threat mitigation
    checkThreatMitigation(updatedTools)
    setDraggedTool(null)
  }

  const checkThreatMitigation = (currentTools: SecurityTool[]) => {
    const updatedThreats = threats.map(threat => {
      const placedTools = currentTools.filter(tool => tool.isPlaced)
      const requiredTools = threat.requires_mitigation
      
      const isMitigated = requiredTools.every(requiredTool => 
        placedTools.some(placedTool => 
          placedTool.id === requiredTool && 
          placedTool.placedZone &&
          isToolEffectiveAgainstThreat(placedTool, threat)
        )
      )

      if (isMitigated && !threat.isMitigated) {
        setScore(prev => prev + threat.points)
      }

      return { ...threat, isMitigated }
    })

    setThreats(updatedThreats)

    // Check if all threats are mitigated
    const allMitigated = updatedThreats.every(threat => threat.isMitigated)
    if (allMitigated) {
      setTimeout(() => {
        setIsCompleted(true)
        calculateFinalScore()
      }, 1000)
    }
  }

  const isToolEffectiveAgainstThreat = (tool: SecurityTool, threat: ThreatScenario) => {
    const zone = placementZones.find(z => z.id === tool.placedZone)
    if (!zone) return false

    // Check if the tool's placement zone is relevant for the threat's attack vector
    switch (threat.attack_vector) {
      case 'perimeter':
        return ['perimeter', 'dmz'].includes(zone.id)
      case 'web_servers':
        return ['web_servers', 'dmz'].includes(zone.id)
      case 'workstations':
        return ['workstations', 'internal_network'].includes(zone.id)
      case 'internal_network':
        return ['internal_network', 'dmz'].includes(zone.id)
      default:
        return true
    }
  }

  const handleRemoveTool = (toolId: string) => {
    const updatedTools = tools.map(tool => {
      if (tool.id === toolId) {
        const oldTool = { ...tool }
        setScore(prev => prev - tool.points)
        return { 
          ...tool, 
          isPlaced: false, 
          placedZone: undefined
        }
      }
      return tool
    })

    setTools(updatedTools)
    checkThreatMitigation(updatedTools)
    
    setFeedback(prev => {
      const newFeedback = { ...prev }
      delete newFeedback[toolId]
      return newFeedback
    })
  }

  const calculateFinalScore = () => {
    const maxToolPoints = securityTools.reduce((sum, tool) => sum + tool.points, 0)
    const maxThreatPoints = threatScenarios.reduce((sum, threat) => sum + threat.points, 0)
    const maxPossibleScore = maxToolPoints + maxThreatPoints
    const finalScore = (score / maxPossibleScore) * 100
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
    setTools([])
    setThreats([])
    setScore(0)
    setTimeLeft(0)
    setIsCompleted(false)
    setFeedback({})
    setSelectedTool(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render practice introduction
  if (!hasStarted) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6 text-blue-600" />
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
                    <div>🛡️ Herramientas disponibles: {securityTools.length}</div>
                    <div>🎯 Amenazas a mitigar: {threatScenarios.length}</div>
                    <div>📍 Zonas de colocación: {placementZones.length}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Herramientas de Seguridad Disponibles:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {securityTools.map((tool) => (
                    <div key={tool.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{tool.name}</span>
                        <Badge variant="secondary" className="ml-auto">{tool.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Capacidades:</strong> {tool.capabilities.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Amenazas a Mitigar:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {threatScenarios.map((threat) => (
                    <div key={threat.id} className="border rounded-lg p-3 border-red-200 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-semibold">{threat.name}</span>
                        <Badge variant="destructive" className="ml-auto">{threat.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{threat.description}</p>
                      <div className="text-xs text-red-600">
                        <strong>Requiere:</strong> {threat.requires_mitigation.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleStartPractice} className="w-full mt-6" size="lg">
                Iniciar Defensa de Red
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
    const mitigatedThreats = threats.filter(t => t.isMitigated).length

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
              {passed ? "¡Red Defendida!" : "Defensa Incompleta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold mb-2">{finalScore}%</div>
                <p className="text-muted-foreground">
                  {passed 
                    ? "Has defendido exitosamente la red contra las amenazas identificadas."
                    : `Necesitas al menos ${minScoreToPass}% para aprobar. Mejora el posicionamiento de las defensas.`
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-muted-foreground">Puntos Totales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tools.filter(t => t.isPlaced).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tools Desplegadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{mitigatedThreats}</div>
                  <div className="text-sm text-muted-foreground">Amenazas Mitigadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {threats.length - mitigatedThreats}
                  </div>
                  <div className="text-sm text-muted-foreground">Amenazas Restantes</div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold mb-3">Estado de Amenazas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {threats.map((threat) => (
                    <div 
                      key={threat.id}
                      className={`border rounded-lg p-3 ${
                        threat.isMitigated 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {threat.isMitigated ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">{threat.name}</span>
                        <span className={`text-xs ml-auto ${
                          threat.isMitigated ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {threat.isMitigated ? 'MITIGADA' : 'ACTIVA'}
                        </span>
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

  // Render main game interface
  return (
    <div className="w-full max-w-none mx-auto p-4 md:p-6 overflow-x-hidden">
      {/* Header with progress and timer - responsive */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{exerciseNumber}/{totalExercises}</Badge>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Puntuación</div>
                <div className="font-bold text-lg">{score} pts</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Amenazas Mitigadas</div>
                <div className="font-bold text-lg">
                  {threats.filter(t => t.isMitigated).length}/{threats.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Herramientas Desplegadas</div>
                <div className="font-bold text-lg">
                  {tools.filter(t => t.isPlaced).length}/{tools.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available tools */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Herramientas
              </CardTitle>
              <CardDescription className="text-sm">
                Arrastra las herramientas a las zonas apropiadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {tools.filter(tool => !tool.isPlaced).map((tool) => (
                  <Card 
                    key={tool.id}
                    className={`cursor-move hover:shadow-md transition-shadow border-2 ${
                      selectedTool?.id === tool.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-dashed border-gray-300'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(tool)}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-sm truncate">{tool.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{tool.description}</div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-xs">{tool.points} pts</Badge>
                        <div className="text-xs text-blue-600">
                          {tool.capabilities.length} caps
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tools.filter(tool => !tool.isPlaced).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">Todas las herramientas están desplegadas</div>
                  </div>
                )}
              </div>

              {selectedTool && (
                <Card className="mt-4 border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {selectedTool.name}
                    </h4>
                    <div className="text-xs space-y-1">
                      <div className="line-clamp-2"><strong>Descripción:</strong> {selectedTool.description}</div>
                      <div><strong>Capacidades:</strong></div>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        {selectedTool.capabilities.slice(0, 3).map((cap, index) => (
                          <li key={index} className="truncate">{cap.replace('_', ' ')}</li>
                        ))}
                        {selectedTool.capabilities.length > 3 && (
                          <li className="text-blue-600">+{selectedTool.capabilities.length - 3} más</li>
                        )}
                      </ul>
                      <div><strong>Compatible con:</strong> {selectedTool.placement_zones.join(', ')}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Network diagram and placement zones */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Red Corporativa - Zonas de Defensa
              </CardTitle>
              <CardDescription>
                Arrastra las herramientas de seguridad a las zonas apropiadas para defender la red
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Network diagram - realistic corporate network layout */}
              <div className="space-y-6">
                {/* Internet/Perimeter Row */}
                <div className="w-full">
                  {placementZones.filter(zone => zone.id === 'perimeter').map((zone) => (
                    <Card
                      key={zone.id}
                      className="w-full border-2 border-dashed border-red-400 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[200px] flex flex-col"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnZone(zone.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-red-800 text-center flex items-center justify-center gap-2">
                          🌐 {zone.name}
                        </CardTitle>
                        <p className="text-sm text-red-600 text-center font-medium">
                          Acepta: {zone.accepts.join(', ')}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 pt-0 px-6 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Show placed tools in this zone */}
                          {tools
                            .filter(tool => tool.isPlaced && tool.placedZone === zone.id)
                            .map((tool) => (
                              <div
                                key={`placed-${tool.id}`}
                                className="bg-white border-2 border-green-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleRemoveTool(tool.id)}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{tool.name}</div>
                                    {feedback[tool.id] && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">Activo</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          
                          {/* Show empty state */}
                          {!tools.some(tool => tool.isPlaced && tool.placedZone === zone.id) && (
                            <div className="md:col-span-2 lg:col-span-3 text-center text-gray-400 py-12">
                              <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <div className="text-lg font-medium">🔥 Zona de Alto Riesgo</div>
                              <div className="text-sm">Arrastra herramientas de seguridad aquí</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* DMZ Row */}
                <div className="w-full">
                  {placementZones.filter(zone => zone.id === 'dmz').map((zone) => (
                    <Card
                      key={zone.id}
                      className="w-full border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer min-h-[200px] flex flex-col"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnZone(zone.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-orange-800 text-center flex items-center justify-center gap-2">
                          🛡️ {zone.name}
                        </CardTitle>
                        <p className="text-sm text-orange-600 text-center font-medium">
                          Acepta: {zone.accepts.join(', ')}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 pt-0 px-6 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Show placed tools in this zone */}
                          {tools
                            .filter(tool => tool.isPlaced && tool.placedZone === zone.id)
                            .map((tool) => (
                              <div
                                key={`placed-${tool.id}`}
                                className="bg-white border-2 border-green-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleRemoveTool(tool.id)}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{tool.name}</div>
                                    {feedback[tool.id] && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">Activo</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          
                          {/* Show empty state */}
                          {!tools.some(tool => tool.isPlaced && tool.placedZone === zone.id) && (
                            <div className="md:col-span-2 lg:col-span-3 text-center text-gray-400 py-12">
                              <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <div className="text-lg font-medium">⚖️ Zona Buffer</div>
                              <div className="text-sm">Arrastra herramientas aquí</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Internal Network Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {placementZones.filter(zone => ['internal', 'servers', 'workstations'].includes(zone.id)).map((zone) => {
                    const allZoneColors = {
                      internal: { border: 'border-blue-400', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-800', desc: 'text-blue-600', icon: '🏢' },
                      servers: { border: 'border-green-400', bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-800', desc: 'text-green-600', icon: '🖥️' },
                      workstations: { border: 'border-purple-400', bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-800', desc: 'text-purple-600', icon: '💻' }
                    };
                    
                    const zoneColors = allZoneColors[zone.id as keyof typeof allZoneColors] || allZoneColors.internal;
                    
                    return (
                      <Card
                        key={zone.id}
                        className={`border-2 border-dashed ${zoneColors.border} ${zoneColors.bg} ${zoneColors.hover} transition-colors cursor-pointer min-h-[220px] flex flex-col`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropOnZone(zone.id)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className={`text-sm ${zoneColors.text} text-center flex items-center justify-center gap-2 font-semibold`}>
                            {zoneColors.icon} {zone.name}
                          </CardTitle>
                          <p className={`text-xs ${zoneColors.desc} text-center font-medium`}>
                            Acepta: {zone.accepts.join(', ')}
                          </p>
                        </CardHeader>
                        <CardContent className="flex-1 pt-0 px-4 pb-4">
                          <div className="space-y-3">
                            {/* Show placed tools in this zone */}
                            {tools
                              .filter(tool => tool.isPlaced && tool.placedZone === zone.id)
                              .map((tool) => (
                                <div
                                  key={`placed-${tool.id}`}
                                  className="bg-white border-2 border-green-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => handleRemoveTool(tool.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold truncate">{tool.name}</div>
                                      {feedback[tool.id] && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                                          <span className="text-xs text-green-600 font-medium">Activo</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            
                            {/* Show empty state */}
                            {!tools.some(tool => tool.isPlaced && tool.placedZone === zone.id) && (
                              <div className="text-center text-gray-400 py-8">
                                <Server className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <div className="text-sm font-medium">🔒 Zona Segura</div>
                                <div className="text-xs">Arrastra herramientas aquí</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Network flow indicators */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Internet/Perimetro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">DMZ Buffer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Red Interna</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Servidores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Estaciones</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed the old zones mapping - all zones are now handled above */}

              {/* Threats status - responsive grid */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Estado de Amenazas:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {threats.map((threat) => (
                    <Card 
                      key={threat.id}
                      className={`${
                        threat.isMitigated 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {threat.isMitigated ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-sm flex-1 min-w-0 truncate">{threat.name}</span>
                        </div>
                        <div className="text-center">
                          <Badge 
                            variant={threat.isMitigated ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {threat.isMitigated ? '✅ MITIGADA' : '⚠️ ACTIVA'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {threat.description}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Progress indicator */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progreso de Mitigación:</span>
                    <span className="text-sm font-bold">
                      {threats.filter(t => t.isMitigated).length}/{threats.length}
                    </span>
                  </div>
                  <Progress 
                    value={(threats.filter(t => t.isMitigated).length / threats.length) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}