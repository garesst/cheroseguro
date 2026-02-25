"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, Clock, Target, ArrowRight } from "lucide-react"

interface PracticeControllerProps {
  practice: any
}

export function PracticeController({ practice }: PracticeControllerProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleStartPractice = () => {
    setHasStarted(true)
  }

  const handleOptionSelect = (optionId: string) => {
    console.log('==== DEBUG INFO ====');
    console.log('Selected option ID:', optionId);
    console.log('Full practice object:', practice);
    console.log('Scenario data:', practice.scenario_data);
    console.log('Options available:', practice.scenario_data?.options);
    console.log('Feedback responses structure:', practice.scenario_data?.feedback_responses);
    
    // Try multiple possible locations for feedback
    const possibleFeedback = [
      practice.scenario_data?.feedback_responses?.[optionId],
      practice.feedback_responses?.[optionId],
      practice.scenario_data?.feedback?.[optionId]
    ].filter(Boolean);
    
    console.log('Possible feedback found:', possibleFeedback);
    console.log('==================');
    
    setSelectedOption(optionId);
    setShowFeedback(true);
  }

  const handleTryAgain = () => {
    setSelectedOption(null)
    setShowFeedback(false)
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6">
        {/* Learning Objectives */}
        {practice.learning_objectives && practice.learning_objectives.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Learning Objectives</CardTitle>
              </div>
              <CardDescription>
                What you'll learn from this practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {practice.learning_objectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{objective}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4 border-t">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleStartPractice}
                >
                  Start Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Render the actual practice
  const { scenario_data } = practice
  const email = scenario_data?.email

  if (!email) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground">No email data available for this practice.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze this Email</CardTitle>
          <CardDescription>
            Carefully examine the email below and determine if it's legitimate or a phishing attempt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <strong>From:</strong> {email.from_display} &lt;{email.from}&gt;
                </div>
                <div className="text-muted-foreground">
                  {email.timestamp}
                </div>
              </div>
              <div>
                <strong>Subject:</strong> {email.subject}
              </div>
              <hr />
              <div className="whitespace-pre-wrap font-mono text-sm">
                {email.body}
              </div>
            </div>
          </div>

          {/* Analysis Options */}
          {!showFeedback ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Your Analysis:</h3>
              <div className="grid gap-3">
                {scenario_data.options?.map((option: any) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Feedback Display */
            <div className="space-y-4">
              {(() => {
                // Try multiple possible locations for feedback
                let feedback = practice.scenario_data?.feedback_responses?.[selectedOption!] ||
                              practice.feedback_responses?.[selectedOption!] ||
                              practice.scenario_data?.feedback?.[selectedOption!];
                
                // If still no feedback, create a generic one
                if (!feedback) {
                  // Look for the selected option to get its text
                  const selectedOptionData = practice.scenario_data?.options?.find(
                    (opt: any) => opt.id === selectedOption
                  );
                  
                  return (
                    <Card className="bg-blue-50 border-blue-200 border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">Analysis Recorded</h4>
                            <p className="text-sm leading-relaxed">
                              You selected: "{selectedOptionData?.text || selectedOption}"
                            </p>
                            <div className="mt-3 p-3 rounded-md bg-muted/50">
                              <p className="text-xs text-muted-foreground">
                                <strong>Debug Info:</strong> No specific feedback configured for option "{selectedOption}". 
                                Available feedback keys: {Object.keys(practice.scenario_data?.feedback_responses || practice.feedback_responses || {}).join(', ') || 'none'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
                
                const isCorrect = feedback.is_correct
                const IconComponent = isCorrect ? CheckCircle2 : XCircle
                const bgColor = isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                const iconColor = isCorrect ? "text-green-600" : "text-red-600"
                
                return (
                  <Card className={`${bgColor} border-2`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-1`} />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{feedback.title}</h4>
                          <p className="text-sm leading-relaxed">{feedback.message}</p>
                          {feedback.explanation && (
                            <div className="mt-3 p-3 rounded-md bg-muted/50">
                              <p className="text-xs text-muted-foreground">
                                <strong>Explanation:</strong> {feedback.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = "/practice"}>
                  Back to Practices
                </Button>
              </div>
            </div>
          )}

          {/* Red Flags Section */}
          {scenario_data.red_flags && (
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Look for these red flags:</h3>
              <div className="grid gap-2">
                {scenario_data.red_flags.map((flag: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>{flag.type?.replace('_', ' ')}: </strong>
                      {flag.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}