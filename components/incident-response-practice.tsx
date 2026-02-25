"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, AlertTriangle, Clock, Target, Zap, Shield } from "lucide-react"

interface IncidentResponsePracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function IncidentResponsePractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: IncidentResponsePracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedDecisions, setSelectedDecisions] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  // Get crisis scenario data
  const crisisScenario = practice.scenario_data

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleDecisionSelect = (decisionId: string) => {
    if (selectedDecisions.includes(decisionId)) {
      setSelectedDecisions(selectedDecisions.filter(id => id !== decisionId))
    } else {
      setSelectedDecisions([...selectedDecisions, decisionId])
    }
  }

  const handleSubmitDecisions = () => {
    setShowFeedback(true)
  }

  const handleViewResults = () => {
    setIsCompleted(true)
  }

  const handleTryAgain = () => {
    setSelectedDecisions([])
    setShowFeedback(false)
    setIsCompleted(false)
  }

  const calculateScore = () => {
    if (!crisisScenario?.decisions) return 0
    
    let totalPoints = 0
    let maxPoints = 0
    
    crisisScenario.decisions.forEach((decision: any) => {
      maxPoints += decision.points
      if (selectedDecisions.includes(decision.id)) {
        totalPoints += decision.points
      }
    })
    
    return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
  }

  const getSelectedDecisions = () => {
    if (!crisisScenario?.decisions) return []
    return crisisScenario.decisions.filter((d: any) => selectedDecisions.includes(d.id))
  }

  const getUnselectedDecisions = () => {
    if (!crisisScenario?.decisions) return []
    return crisisScenario.decisions.filter((d: any) => !selectedDecisions.includes(d.id))
  }

  const getConsequenceColor = (consequence: string) => {
    switch (consequence) {
      case 'correct': return 'text-green-600'
      case 'partially_correct': return 'text-yellow-600'
      case 'risky': return 'text-orange-600'
      case 'incorrect': 
      default: return 'text-red-600'
    }
  }

  const getConsequenceIcon = (consequence: string) => {
    switch (consequence) {
      case 'correct': return CheckCircle2
      case 'partially_correct': return AlertTriangle
      case 'risky': return AlertTriangle
      case 'incorrect':
      default: return XCircle
    }
  }

  // Intro Screen
  if (!hasStarted) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-red-900 mb-2">
                🚨 Crisis Response Training
              </CardTitle>
              <CardDescription className="text-base text-red-700">
                You're about to face a real cybersecurity crisis. Your decisions will determine the outcome.
              </CardDescription>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <Zap className="h-4 w-4 text-red-600" />
                <span className="text-red-700">High-pressure decisions</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-red-700">Time-critical scenarios</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Target className="h-4 w-4 text-red-600" />
                <span className="text-red-700">Multiple decisions required</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-3">How This Works</h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 mt-0.5 flex-shrink-0">1</span>
                  You'll face a detailed crisis scenario with real-world context
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 mt-0.5 flex-shrink-0">2</span>
                  Select all appropriate response actions from the available options
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 mt-0.5 flex-shrink-0">3</span>
                  Get detailed feedback on each decision with industry best practices
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 mt-0.5 flex-shrink-0">4</span>
                  Review your incident response score and learn from mistakes
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleStartPractice}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                Enter Crisis Situation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Crisis Scenario Screen
  if (!showFeedback) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        {/* Crisis Alert Header */}
        <Card className="border-red-500 bg-red-50 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-900">
              {crisisScenario.crisis_title}
            </CardTitle>
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg inline-block mt-2">
              ⚡ ACTIVE INCIDENT - IMMEDIATE RESPONSE REQUIRED
            </div>
          </CardHeader>
        </Card>

        {/* Crisis Description */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {crisisScenario.crisis_description}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 mb-3">📋 Crisis Details</h4>
                <ul className="space-y-2">
                  {crisisScenario.crisis_details?.map((detail: string, index: number) => (
                    <li key={index} className="text-gray-700 bg-white p-3 rounded border">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decision Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Select Your Response Actions
            </CardTitle>
            <CardDescription>
              Choose ALL appropriate actions for this crisis. Multiple selections are allowed and often required for proper incident response.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {crisisScenario.decisions?.map((decision: any, index: number) => {
                const isSelected = selectedDecisions.includes(decision.id)
                return (
                  <Card 
                    key={decision.id}
                    className={`cursor-pointer transition-all border-2 ${
                      isSelected 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30'
                    }`}
                    onClick={() => handleDecisionSelect(decision.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'border-red-500 bg-red-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {decision.text}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedDecisions.length} action{selectedDecisions.length !== 1 ? 's' : ''} selected
                </div>
                <Button 
                  onClick={handleSubmitDecisions}
                  disabled={selectedDecisions.length === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Execute Response Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Feedback Screen
  if (!isCompleted) {
    const selectedDecisionData = getSelectedDecisions()
    const unselectedDecisionData = getUnselectedDecisions()

    return (
      <div className="container mx-auto max-w-5xl py-8 space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">
              📊 Response Analysis
            </CardTitle>
            <CardDescription className="text-blue-700">
              Review the consequences of your incident response decisions
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Selected Actions Feedback */}
        {selectedDecisionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Actions You Took ({selectedDecisionData.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDecisionData.map((decision: any) => {
                const IconComponent = getConsequenceIcon(decision.consequence)
                return (
                  <div key={decision.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${getConsequenceColor(decision.consequence)}`} />
                      <div className="flex-1">
                        <p className="font-medium mb-2">{decision.text}</p>
                        <div className={`text-sm font-medium mb-2 ${getConsequenceColor(decision.consequence)}`}>
                          {decision.explanation}
                        </div>
                        <Badge variant={decision.consequence === 'correct' ? 'default' : 'secondary'}>
                          +{decision.points} points
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Missed Actions */}
        {unselectedDecisionData.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Actions Not Taken ({unselectedDecisionData.length})
              </CardTitle>
              <CardDescription>
                These actions were available but not selected in your response plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unselectedDecisionData.map((decision: any) => {
                const IconComponent = getConsequenceIcon(decision.consequence)
                return (
                  <div key={decision.id} className="border rounded-lg p-4 bg-orange-50/50">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${getConsequenceColor(decision.consequence)}`} />
                      <div className="flex-1">
                        <p className="font-medium mb-2 text-gray-700">{decision.text}</p>
                        <div className={`text-sm mb-2 ${getConsequenceColor(decision.consequence)}`}>
                          {decision.explanation}
                        </div>
                        <Badge variant="outline">
                          {decision.points} points available
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button onClick={handleViewResults} size="lg">
            View Final Results
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Results Screen
  const score = calculateScore()
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🏆 Excellent Response! You handled this crisis like a seasoned professional."
    if (score >= 80) return "✅ Great Work! Your response was solid with room for minor improvements."
    if (score >= 60) return "⚠️ Good Effort! You made some correct decisions but missed key response actions."
    if (score >= 40) return "📚 Needs Improvement. Review incident response best practices and try again."
    return "🚨 Critical Gaps. Your response needs significant improvement for real crisis situations."
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold mb-2">Crisis Response Complete</CardTitle>
            <CardDescription className="text-lg">
              {practice.title}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {getScoreMessage(score)}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{selectedDecisions.length}</div>
              <div className="text-sm text-muted-foreground">Actions Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedDecisions.filter(id => {
                  const decision = crisisScenario.decisions?.find((d: any) => d.id === id)
                  return decision?.consequence === 'correct'
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Correct Decisions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {crisisScenario.decisions?.filter((d: any) => 
                  d.consequence === 'correct' && !selectedDecisions.includes(d.id)
                ).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Missed Opportunities</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <Button onClick={handleTryAgain} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => router.push('/practice')} variant="default">
              More Practices
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}