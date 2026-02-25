"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Users, ArrowRight, RotateCcw, AlertTriangle, Clock, Target, Phone, Mail, MessageSquare, User } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface SocialEngineeringPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function SocialEngineeringPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: SocialEngineeringPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[][]>([])
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  // Get conversation data from scenario_data
  const scenarioData = practice.scenario_data
  const conversations = scenarioData?.conversations || []
  const availableTechniques = scenarioData?.available_techniques || []
  const currentConversation = conversations[currentConversationIndex]
  
  const progress = ((currentConversationIndex + (showFeedback ? 1 : 0)) / conversations.length) * 100

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleTechniqueToggle = (techniqueId: string) => {
    setSelectedTechniques(prev => 
      prev.includes(techniqueId) 
        ? prev.filter(id => id !== techniqueId)
        : [...prev, techniqueId]
    )
  }

  const handleSubmitAnalysis = () => {
    const newAnswers = [...userAnswers, selectedTechniques]
    setUserAnswers(newAnswers)
    setShowFeedback(true)
  }

  const handleNextConversation = () => {
    if (currentConversationIndex < conversations.length - 1) {
      setCurrentConversationIndex(currentConversationIndex + 1)
      setSelectedTechniques([])
      setShowFeedback(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleTryAgain = () => {
    setCurrentConversationIndex(0)
    setUserAnswers([])
    setSelectedTechniques([])
    setShowFeedback(false)
    setIsCompleted(false)
  }

  const calculateScore = () => {
    let totalCorrect = 0
    let totalQuestions = 0
    
    userAnswers.forEach((answer, index) => {
      const conversation = conversations[index]
      if (conversation) {
        const correctTechniques = conversation.techniques_present || []
        const userTechniques = answer
        
        // Calculate how many correct techniques were identified
        const correctIdentified = userTechniques.filter((technique: string) => 
          correctTechniques.includes(technique)
        ).length
        
        // Add to score (partial credit for each correct identification)
        totalCorrect += correctIdentified
        totalQuestions += correctTechniques.length
      }
    })
    
    return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  }

  const getCurrentFeedback = () => {
    const userTechniques = selectedTechniques
    const correctTechniques = currentConversation.techniques_present || []
    
    const correctlyIdentified = userTechniques.filter((technique: string) => 
      correctTechniques.includes(technique)
    )
    const missed = correctTechniques.filter((technique: string) => 
      !userTechniques.includes(technique)
    )
    const incorrectlyIdentified = userTechniques.filter((technique: string) => 
      !correctTechniques.includes(technique)
    )

    const scorePercentage = correctTechniques.length > 0 
      ? (correctlyIdentified.length / correctTechniques.length) * 100 
      : 0

    return {
      correctlyIdentified,
      missed,
      incorrectlyIdentified,
      scorePercentage,
      explanation: currentConversation.explanation,
      correctResponse: currentConversation.correct_response
    }
  }

  const getScenarioIcon = (scenarioType: string) => {
    switch (scenarioType) {
      case 'phone_call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'instant_message': return <MessageSquare className="h-4 w-4" />
      case 'in_person': return <User className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTechniqueByIdInfo = (techniqueId: string) => {
    return availableTechniques.find((tech: any) => tech.id === techniqueId)
  }

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Social Engineering Detection</CardTitle>
          </div>
          <CardDescription>
            Learn to identify manipulation techniques and defend against social engineering attacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What you'll learn:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {practice.learning_objectives?.map((objective: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Estimated Time</p>
                <p className="text-xs text-muted-foreground">{practice.estimated_time} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Scenarios to Analyze</p>
                <p className="text-xs text-muted-foreground">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Common Social Engineering Techniques:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm max-h-64 overflow-y-auto">
              {availableTechniques.slice(0, 8).map((technique: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-lg">{technique.icon}</span>
                  <div>
                    <span className="font-medium">{technique.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">{technique.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              And {availableTechniques.length - 8} more techniques to identify...
            </p>
          </div>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleStartPractice}
            >
              Start Social Engineering Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    const score = calculateScore()
    const passed = score >= (scenarioData?.scoring?.passing_score || 60)

    return (
      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? "Analysis Complete!" : "Keep Learning"}
            </CardTitle>
            <CardDescription>
              You scored {score.toFixed(0)}% in identifying social engineering techniques
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Review:</h3>
            {conversations.map((conversation: any, index: number) => {
              const userTechniques = userAnswers[index] || []
              const correctTechniques = conversation.techniques_present || []
              const correctlyIdentified = userTechniques.filter((t: string) => correctTechniques.includes(t)).length
              const accuracy = correctTechniques.length > 0 ? (correctlyIdentified / correctTechniques.length) * 100 : 0
              
              return (
                <div key={index} className="flex items-start justify-between p-3 border rounded">
                  <div className="flex items-start gap-3">
                    {accuracy >= 70 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getScenarioIcon(conversation.scenario_type)}
                        <p className="font-medium text-sm">"{conversation.title}"</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {correctlyIdentified} of {correctTechniques.length} techniques identified
                      </p>
                    </div>
                  </div>
                  <Badge variant={accuracy >= 70 ? "default" : "destructive"}>
                    {accuracy.toFixed(0)}%
                  </Badge>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleTryAgain}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/practice')}
            >
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentConversation) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>No conversation data available for this analysis.</p>
        </CardContent>
      </Card>
    )
  }

  const feedback = showFeedback ? getCurrentFeedback() : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-xl">
            Scenario {currentConversationIndex + 1} of {conversations.length}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {getScenarioIcon(currentConversation.scenario_type)}
            <div>
              <h3 className="font-semibold">{currentConversation.title}</h3>
              <p className="text-sm text-muted-foreground">{currentConversation.context}</p>
            </div>
          </div>
          
          {/* Conversation Display */}
          <div className="border rounded-lg p-4 bg-muted/20 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {currentConversation.messages?.map((message: any, index: number) => (
                <div key={index} className={`flex gap-3 ${
                  message.speaker === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`max-w-[80%] ${
                    message.speaker === 'user' 
                      ? 'bg-blue-100 border-blue-200' 
                      : message.is_suspicious 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                  } border rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.name}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!showFeedback && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Which social engineering techniques do you identify in this conversation?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all techniques that you think are being used by the attacker:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableTechniques.map((technique: any) => (
                  <div key={technique.id} className="flex items-start gap-2">
                    <Checkbox
                      id={technique.id}
                      checked={selectedTechniques.includes(technique.id)}
                      onCheckedChange={() => handleTechniqueToggle(technique.id)}
                    />
                    <label
                      htmlFor={technique.id}
                      className="text-sm cursor-pointer flex items-start gap-2 flex-1"
                    >
                      <span className="text-base">{technique.icon}</span>
                      <div>
                        <span className="font-medium">{technique.name}</span>
                        <p className="text-xs text-muted-foreground mt-1">{technique.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={handleSubmitAnalysis}
                disabled={selectedTechniques.length === 0}
              >
                Submit Analysis ({selectedTechniques.length} technique{selectedTechniques.length !== 1 ? 's' : ''} selected)
              </Button>
            </div>
          )}

          {showFeedback && feedback && (
            <div className={`p-4 rounded-lg border ${
              feedback.scorePercentage >= 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {feedback.scorePercentage >= 70 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold">
                  Analysis Result: {feedback.scorePercentage.toFixed(0)}%
                </span>
              </div>
              
              {feedback.correctlyIdentified.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-green-700 mb-2">✅ Correctly Identified:</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.correctlyIdentified.map((techniqueId: string) => {
                      const technique = getTechniqueByIdInfo(techniqueId)
                      return (
                        <Badge key={techniqueId} variant="default" className="text-xs">
                          {technique?.icon} {technique?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {feedback.missed.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-red-700 mb-2">❌ Missing:</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.missed.map((techniqueId: string) => {
                      const technique = getTechniqueByIdInfo(techniqueId)
                      return (
                        <Badge key={techniqueId} variant="destructive" className="text-xs">
                          {technique?.icon} {technique?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {feedback.incorrectlyIdentified.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-orange-700 mb-2">⚠️ Incorrectly Identified:</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.incorrectlyIdentified.map((techniqueId: string) => {
                      const technique = getTechniqueByIdInfo(techniqueId)
                      return (
                        <Badge key={techniqueId} variant="outline" className="text-xs border-orange-300">
                          {technique?.icon} {technique?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="bg-white/50 p-3 rounded border text-sm space-y-2">
                <div>
                  <p className="font-medium mb-1">Explanation:</p>
                  <p>{feedback.explanation}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Correct Response:</p>
                  <p>{feedback.correctResponse}</p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={handleNextConversation}
              >
                {currentConversationIndex < conversations.length - 1 ? "Next Scenario" : "Complete Analysis"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}