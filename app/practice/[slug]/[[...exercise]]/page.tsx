import Link from "next/link"
import { ArrowLeft, Clock, Target, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPracticeBySlug } from "@/lib/directus"
import { notFound } from "next/navigation"
import { MultiExercisePracticeController } from "@/components/multi-exercise-practice-controller"
import { PasswordStrengthPractice } from "@/components/password-strength-practice"
import { EmailAnalysisPractice } from "@/components/email-analysis-practice"
import { SocialEngineeringPractice } from "@/components/social-engineering-practice"
import { SettingsConfigurationPractice } from "@/components/settings-configuration-practice"
import { IncidentResponsePractice } from "@/components/incident-response-practice"
import { QuizKnowledgePractice } from "@/components/quiz-knowledge-practice"
import { DataClassificationPractice } from "@/components/data-classification-practice"
import { NetworkDefensePractice } from "@/components/network-defense-practice"
import { PasswordBuilderPractice } from "@/components/password-builder-practice"
import { SwipeCardsPractice } from "@/components/swipe-cards-practice"

interface PracticePageProps {
  params: Promise<{
    slug: string
    exercise?: string[]
  }>
}

// Practice Type Renderer Component
function PracticeRenderer({ practice, exerciseNumber, totalExercises }: { 
  practice: any, 
  exerciseNumber: number, 
  totalExercises: number 
}) {
  switch (practice.practice_type) {
    case 'email_analysis':
      return (
        <EmailAnalysisPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'url_inspector':
      return (
        <Card className="p-8 text-center">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">URL Inspector Practice</h3>
            <p className="text-muted-foreground">Coming Soon! This practice will help you identify malicious URLs.</p>
          </CardContent>
        </Card>
      )
    case 'password_strength':
      return (
        <PasswordStrengthPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'social_engineering':
      return (
        <SocialEngineeringPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'settings_configuration':
      return (
        <SettingsConfigurationPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'incident_response':
      return (
        <IncidentResponsePractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'quiz_knowledge':
      return (
        <QuizKnowledgePractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'quiz_knowledge':
      return (
        <QuizKnowledgePractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'data_classification':
      return (
        <DataClassificationPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'network_defense':
      return (
        <NetworkDefensePractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'password_builder':
      return (
        <PasswordBuilderPractice 
          practice={practice} 
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    case 'swipe_cards':
      return (
        <SwipeCardsPractice
          practice={practice}
          exerciseNumber={exerciseNumber}
          totalExercises={totalExercises}
        />
      )
    default:
      return (
        <Card className="p-8 text-center">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Tipo de práctica desconocido</h3>
            <p className="text-muted-foreground">Este tipo de práctica aún no está soportado.</p>
          </CardContent>
        </Card>
      )
  }
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { slug, exercise } = await params
  const practice = await getPracticeBySlug(slug)
  
  if (!practice) {
    notFound()
  }

  // Determine exercise number (default to 1 if not specified)
  const exerciseNumber = exercise?.[0] ? parseInt(exercise[0]) : 1
  
  // Check if practice has exercises array (new format) or uses scenario_data (old format)
  const hasMultipleExercises = practice.exercises && Array.isArray(practice.exercises) && practice.exercises.length > 1
  const totalExercises = hasMultipleExercises ? practice.exercises?.length || 1 : 1
  
  // Validate exercise number
  if (exerciseNumber < 1 || exerciseNumber > totalExercises) {
    notFound()
  }
  
  // Get current exercise data
  let currentExercise
  if (hasMultipleExercises) {
    currentExercise = practice.exercises?.[exerciseNumber - 1]
    if (!currentExercise) {
      notFound()
    }
  } else {
    // Backward compatibility: use scenario_data for single exercises
    currentExercise = {
      id: 1,
      title: practice.title,
      difficulty: practice.difficulty,
      estimated_time: practice.estimated_time,
      email: practice.scenario_data?.email,
      options: practice.scenario_data?.options,
      feedback_responses: practice.scenario_data?.feedback_responses,
      red_flags: practice.scenario_data?.red_flags
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="w-full py-8">
          <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
            {/* Back Button */}
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/practice">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a prácticas
              </Link>
            </Button>

            {/* Practice Header */}
            <div className="space-y-6 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{practice.difficulty}</Badge>
                <Badge variant="outline">{practice.practice_type.replace('_', ' ')}</Badge>
                {hasMultipleExercises && (
                  <Badge variant="default">
                    Ejercicio {exerciseNumber} de {totalExercises}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {hasMultipleExercises ? currentExercise.title : practice.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {practice.description}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{hasMultipleExercises ? currentExercise.estimated_time : practice.estimated_time} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{practice.learning_objectives?.length || 0} objetivos</span>
                </div>
                {hasMultipleExercises && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Parte {exerciseNumber} de {totalExercises}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Practice Interactive Component */}
            <div className="space-y-8">
              <PracticeRenderer 
                practice={{...practice, currentExercise}} 
                exerciseNumber={exerciseNumber}
                totalExercises={totalExercises}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}