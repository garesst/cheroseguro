"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Trophy } from 'lucide-react'
import { usePracticeProgress } from '@/hooks/use-practice-progress'

interface PracticeCardProgressProps {
  practiceSlug: string
  totalExercises: number
  className?: string
}

export function PracticeCardProgress({ 
  practiceSlug, 
  totalExercises,
  className = "" 
}: PracticeCardProgressProps) {
  const { getPracticeProgress } = usePracticeProgress()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  const practiceProgress = getPracticeProgress(practiceSlug)
  const completedExercises = Object.values(practiceProgress.exercises || {}).filter(ex => ex.completed).length
  
  // Don't show anything if no progress
  if (completedExercises === 0) {
    return null
  }

  const isFullyCompleted = practiceProgress.completed && completedExercises === totalExercises
  const progressPercentage = (completedExercises / totalExercises) * 100

  if (isFullyCompleted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          Completado {practiceProgress.totalScore ? `· ${practiceProgress.totalScore}%` : ''}
        </Badge>
      </div>
    )
  }

  // Show partial progress
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {completedExercises}/{totalExercises} ejercicios
        </Badge>
      </div>
      <Progress value={progressPercentage} className="h-1.5" />
    </div>
  )
}
