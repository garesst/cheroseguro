"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Eye, EyeOff, Lock, ArrowRight, RotateCcw } from "lucide-react"

interface PasswordStrengthPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function PasswordStrengthPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: PasswordStrengthPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentPasswordIndex, setCurrentPasswordIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  // Get password data from scenario_data
  const scenarioData = practice.scenario_data
  const testPasswords = scenarioData?.test_passwords || []
  const currentPassword = testPasswords[currentPasswordIndex]
  
  const progress = ((currentPasswordIndex + (showFeedback ? 1 : 0)) / testPasswords.length) * 100

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleAnswer = (isSecure: boolean) => {
    const newAnswers = [...userAnswers, isSecure]
    setUserAnswers(newAnswers)
    setShowFeedback(true)
  }

  const handleNextPassword = () => {
    if (currentPasswordIndex < testPasswords.length - 1) {
      setCurrentPasswordIndex(currentPasswordIndex + 1)
      setShowFeedback(false)
      setShowPassword(false)
    } else {
      // Practice completed
      setIsCompleted(true)
    }
  }

  const handleTryAgain = () => {
    setCurrentPasswordIndex(0)
    setUserAnswers([])
    setShowFeedback(false)
    setShowPassword(false)
    setIsCompleted(false)
  }

  const calculateScore = () => {
    let correct = 0
    testPasswords.forEach((password: any, index: number) => {
      if (userAnswers[index] === password.is_secure) {
        correct++
      }
    })
    return (correct / testPasswords.length) * 100
  }

  const getCurrentFeedback = () => {
    const userAnswer = userAnswers[currentPasswordIndex]
    const correctAnswer = currentPassword.is_secure
    const isCorrect = userAnswer === correctAnswer
    
    return {
      isCorrect,
      title: isCorrect ? "¡Correcto!" : "Incorrecto",
      explanation: currentPassword.explanation,
      details: currentPassword.is_secure ? currentPassword.strengths : currentPassword.issues
    }
  }

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Password Strength Analysis</CardTitle>
          </div>
          <CardDescription>
            Evaluate password security based on established criteria
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
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Security Criteria:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {scenarioData?.criteria && Object.entries(scenarioData.criteria).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="capitalize">{key.replace('_', ' ')}: {String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleStartPractice}
            >
              Start Password Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    const score = calculateScore()
    const passed = score >= (scenarioData?.scoring?.passing_score || 70)

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
              {passed ? "Practice Completed!" : "Keep Practicing"}
            </CardTitle>
            <CardDescription>
              You scored {score.toFixed(0)}% ({userAnswers.filter((answer, index) => answer === testPasswords[index].is_secure).length} out of {testPasswords.length} correct)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Review:</h3>
            {testPasswords.map((password: any, index: number) => {
              const userAnswer = userAnswers[index]
              const isCorrect = userAnswer === password.is_secure
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {password.password}
                    </code>
                  </div>
                  <Badge variant={password.is_secure ? "default" : "destructive"}>
                    {password.is_secure ? "Secure" : "Not Secure"}
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

  if (!currentPassword) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>No password data available for this practice.</p>
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
            Password {currentPasswordIndex + 1} of {testPasswords.length}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Evaluate this password:</h3>
          
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <code className="text-lg font-mono flex-1">
              {showPassword ? currentPassword.password : '•'.repeat(currentPassword.password.length)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {!showFeedback && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Is this password secure according to the established criteria?
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAnswer(true)} 
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Secure
                </Button>
                <Button 
                  onClick={() => handleAnswer(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Not Secure
                </Button>
              </div>
            </div>
          )}

          {showFeedback && feedback && (
            <div className={`p-4 rounded-lg border ${
              feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">{feedback.title}</span>
              </div>
              
              <p className="text-sm mb-3">{feedback.explanation}</p>
              
              {feedback.details && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {currentPassword.is_secure ? "Strengths:" : "Issues:"}
                  </p>
                  <ul className="text-xs space-y-1">
                    {feedback.details.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                className="w-full mt-4"
                onClick={handleNextPassword}
              >
                {currentPasswordIndex < testPasswords.length - 1 ? "Next Password" : "Complete Practice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}