"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Shield, ArrowRight, RotateCcw, Clock, Target, Monitor, Smartphone, Chrome } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface SettingsConfigurationPracticeProps {
  practice: any
  exerciseNumber: number
  totalExercises: number
}

export function SettingsConfigurationPractice({ 
  practice, 
  exerciseNumber, 
  totalExercises 
}: SettingsConfigurationPracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [userSettings, setUserSettings] = useState<Record<string, boolean>>({})
  const [submittedSettings, setSubmittedSettings] = useState<Record<string, boolean>[]>([])
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  // Get scenario data
  const scenarioData = practice.scenario_data
  const scenarios = scenarioData?.scenarios || []
  const currentScenario = scenarios[currentScenarioIndex]
  
  const progress = ((currentScenarioIndex + (showScenarioFeedback ? 1 : 0)) / scenarios.length) * 100

  const handleStartPractice = () => {
    setHasStarted(true)
    // Initialize the first scenario settings
    if (currentScenario && currentScenario.settings) {
      const initialSettings: { [key: string]: boolean } = {}
      currentScenario.settings.forEach((setting: any) => {
        initialSettings[setting.id] = false
      })
      setUserSettings(initialSettings)
    }
  }

  const handleSettingToggle = (settingId: string, enabled: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      [settingId]: enabled
    }))
  }

  const handleSubmitScenario = () => {
    const newSubmittedSettings = [...submittedSettings, userSettings]
    setSubmittedSettings(newSubmittedSettings)
    setShowScenarioFeedback(true)
  }

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1)
      // Initialize all settings to false for the new scenario
      const nextScenario = scenarios[currentScenarioIndex + 1]
      const initialSettings: { [key: string]: boolean } = {}
      nextScenario?.settings?.forEach((setting: any) => {
        initialSettings[setting.id] = false
      })
      setUserSettings(initialSettings)
      setShowScenarioFeedback(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleTryAgain = () => {
    setCurrentScenarioIndex(0)
    // Initialize first scenario settings
    const firstScenario = scenarios[0]
    const initialSettings: { [key: string]: boolean } = {}
    firstScenario?.settings?.forEach((setting: any) => {
      initialSettings[setting.id] = false
    })
    setUserSettings(initialSettings)
    setSubmittedSettings([])
    setShowScenarioFeedback(false)
    setIsCompleted(false)
  }

  const calculateScenarioScore = (scenarioSettings: Record<string, boolean>, scenarioData: any) => {
    let correct = 0
    let total = 0
    
    scenarioData.settings?.forEach((setting: any) => {
      const userChoice = scenarioSettings[setting.id]
      if (userChoice === setting.should_enable) {
        correct++
      }
      total++
    })
    
    return { correct, total, percentage: total > 0 ? (correct / total) * 100 : 0 }
  }

  const calculateOverallScore = () => {
    let totalCorrect = 0
    let totalSettings = 0
    
    submittedSettings.forEach((scenarioSettings, index) => {
      const scenario = scenarios[index]
      if (scenario) {
        const score = calculateScenarioScore(scenarioSettings, scenario)
        totalCorrect += score.correct
        totalSettings += score.total
      }
    })
    
    return {
      correct: totalCorrect,
      total: totalSettings,
      percentage: totalSettings > 0 ? (totalCorrect / totalSettings) * 100 : 0
    }
  }

  const getScenarioIcon = (category: string) => {
    switch (category) {
      case 'browser_privacy': return <Chrome className="h-4 w-4" />
      case 'os_security': return <Monitor className="h-4 w-4" />
      case 'social_media_privacy': return <Smartphone className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'privacy': return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'security': return 'bg-green-50 border-green-200 text-green-700' 
      case 'functionality': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Security Settings Configuration</CardTitle>
          </div>
          <CardDescription>
            Learn to configure privacy and security settings across different platforms
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
                <p className="font-medium text-sm">Configuration Scenarios</p>
                <p className="text-xs text-muted-foreground">{scenarios.length} platform{scenarios.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Configuration Scenarios:</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {scenarios.map((scenario: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getScenarioIcon(scenario.category)}
                  <div>
                    <span className="font-medium">{scenario.title}</span>
                    <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                  </div>
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
              Start Configuration Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    const overallScore = calculateOverallScore()
    const passed = overallScore.percentage >= (scenarioData?.scoring?.passing_score || 70)

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
              {passed ? "Configuration Complete!" : "Review and Try Again"}
            </CardTitle>
            <CardDescription>
              You correctly configured {overallScore.correct} out of {overallScore.total} settings ({overallScore.percentage.toFixed(0)}%)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Scenario Results:</h3>
            {scenarios.map((scenario: any, index: number) => {
              const scenarioSettings = submittedSettings[index] || {}
              const score = calculateScenarioScore(scenarioSettings, scenario)
              
              return (
                <div key={index} className="flex items-start justify-between p-3 border rounded">
                  <div className="flex items-start gap-3">
                    {score.percentage >= 70 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getScenarioIcon(scenario.category)}
                        <p className="font-medium text-sm">{scenario.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {score.correct} of {score.total} settings configured correctly
                      </p>
                    </div>
                  </div>
                  <Badge variant={score.percentage >= 70 ? "default" : "destructive"}>
                    {score.percentage.toFixed(0)}%
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

  if (!currentScenario) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>No scenario data available for this configuration practice.</p>
        </CardContent>
      </Card>
    )
  }

  const currentScenarioScore = showScenarioFeedback 
    ? calculateScenarioScore(userSettings, currentScenario)
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-xl">
            Scenario {currentScenarioIndex + 1} of {scenarios.length}
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
            {getScenarioIcon(currentScenario.category)}
            <div>
              <h3 className="font-semibold">{currentScenario.title}</h3>
              <p className="text-sm text-muted-foreground">{currentScenario.context}</p>
            </div>
          </div>

          {!showScenarioFeedback && (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Configure the following settings. Enable or disable each option based on security best practices:
              </p>
              
              <div className="space-y-4">
                {currentScenario.settings?.map((setting: any) => (
                  <div key={setting.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{setting.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(setting.category)}`}
                          >
                            {setting.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={setting.id}
                          checked={userSettings[setting.id] === true}
                          onCheckedChange={(checked) => handleSettingToggle(setting.id, !!checked)}
                        />
                        <label 
                          htmlFor={setting.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Enable
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full mt-6"
                onClick={handleSubmitScenario}
                disabled={!currentScenario.settings?.every((setting: any) => 
                  userSettings.hasOwnProperty(setting.id)
                )}
              >
                Submit Configuration
              </Button>
            </div>
          )}

          {showScenarioFeedback && currentScenarioScore && (
            <div className={`p-4 rounded-lg border ${
              currentScenarioScore.percentage >= 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {currentScenarioScore.percentage >= 70 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold">
                  Scenario Result: {currentScenarioScore.correct}/{currentScenarioScore.total} ({currentScenarioScore.percentage.toFixed(0)}%)
                </span>
              </div>
              
              <div className="space-y-3">
                {currentScenario.settings?.map((setting: any) => {
                  const userChoice = userSettings[setting.id]
                  const isCorrect = userChoice === setting.should_enable
                  
                  return (
                    <div key={setting.id} className={`p-3 rounded border ${
                      isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{setting.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {userChoice ? 'Enabled' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Should be: {setting.should_enable ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <p className="text-xs">{setting.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={handleNextScenario}
              >
                {currentScenarioIndex < scenarios.length - 1 ? "Next Scenario" : "Complete Practice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}