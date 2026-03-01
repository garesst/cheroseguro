"use client"

import { useState, useEffect } from 'react'

interface ExerciseProgress {
  completed: boolean
  score: number | null
  attempts: number
  completedAt?: string
  lastAttempt?: string
}

interface PracticeProgress {
  completed: boolean
  exercises: Record<string, ExerciseProgress>
  totalScore: number | null
  completedAt?: string
  lastAttempt?: string
}

interface OverallProgress {
  totalPractices: number
  completedPractices: number
  averageScore: number
  totalExercises: number
  completedExercises: number
}

const STORAGE_KEY = 'cyberguard_practice_progress'

export function usePracticeProgress() {
  const [progress, setProgress] = useState<Record<string, PracticeProgress>>({})
  const [overall, setOverall] = useState<OverallProgress>({
    totalPractices: 0,
    completedPractices: 0,
    averageScore: 0,
    totalExercises: 0,
    completedExercises: 0
  })

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setProgress(data)
          calculateOverallProgress(data)
        } catch (error) {
          console.warn('Failed to parse progress from localStorage:', error)
        }
      }
    }
  }, [])

  const saveProgress = (newProgress: Record<string, PracticeProgress>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
      setProgress(newProgress)
      calculateOverallProgress(newProgress)
    }
  }

  const calculateOverallProgress = (progressData: Record<string, PracticeProgress>) => {
    const practices = Object.values(progressData)
    const completedPractices = practices.filter(p => p.completed).length
    const totalPractices = practices.length

    let totalScore = 0
    let scoredPractices = 0
    let totalExercises = 0
    let completedExercises = 0

    practices.forEach(practice => {
      const exercises = Object.values(practice.exercises)
      totalExercises += exercises.length
      completedExercises += exercises.filter(e => e.completed).length

      if (practice.totalScore !== null) {
        totalScore += practice.totalScore
        scoredPractices++
      }
    })

    const averageScore = scoredPractices > 0 ? Math.round(totalScore / scoredPractices) : 0

    setOverall({
      totalPractices,
      completedPractices,
      averageScore,
      totalExercises,
      completedExercises
    })
  }

  const completePracticeExercise = (
    practiceSlug: string,
    exerciseId: string,
    score: number,
    isCorrect: boolean = true
  ) => {
    const newProgress = { ...progress }

    if (!newProgress[practiceSlug]) {
      newProgress[practiceSlug] = {
        completed: false,
        exercises: {},
        totalScore: null,
        lastAttempt: new Date().toISOString()
      }
    }

    const practice = newProgress[practiceSlug]
    
    if (!practice.exercises[exerciseId]) {
      practice.exercises[exerciseId] = {
        completed: false,
        score: null,
        attempts: 0
      }
    }

    const exercise = practice.exercises[exerciseId]
    exercise.attempts++
    exercise.lastAttempt = new Date().toISOString()

    if (isCorrect && !exercise.completed) {
      exercise.completed = true
      exercise.score = score
      exercise.completedAt = new Date().toISOString()
    }

    // Update practice completion status
    const exercises = Object.values(practice.exercises)
    if (exercises.length > 0 && exercises.every(ex => ex.completed)) {
      practice.completed = true
      practice.completedAt = new Date().toISOString()
      
      // Calculate average score for the practice
      const scores = exercises.filter(ex => ex.score !== null).map(ex => ex.score!)
      if (scores.length > 0) {
        practice.totalScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      }
    }

    practice.lastAttempt = new Date().toISOString()
    saveProgress(newProgress)
  }

  const getPracticeProgress = (practiceSlug: string): PracticeProgress => {
    return progress[practiceSlug] || {
      completed: false,
      exercises: {},
      totalScore: null
    }
  }

  const getExerciseProgress = (practiceSlug: string, exerciseId: string): ExerciseProgress => {
    const practice = getPracticeProgress(practiceSlug)
    return practice.exercises[exerciseId] || {
      completed: false,
      score: null,
      attempts: 0
    }
  }

  const isPracticeCompleted = (practiceSlug: string): boolean => {
    return getPracticeProgress(practiceSlug).completed
  }

  const isExerciseCompleted = (practiceSlug: string, exerciseId: string): boolean => {
    return getExerciseProgress(practiceSlug, exerciseId).completed
  }

  const resetProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      setProgress({})
      setOverall({
        totalPractices: 0,
        completedPractices: 0,
        averageScore: 0,
        totalExercises: 0,
        completedExercises: 0
      })
    }
  }

  const resetPracticeProgress = (practiceSlug: string) => {
    const newProgress = { ...progress }
    delete newProgress[practiceSlug]
    saveProgress(newProgress)
  }

  return {
    progress,
    overall,
    completePracticeExercise,
    getPracticeProgress,
    getExerciseProgress,
    isPracticeCompleted,
    isExerciseCompleted,
    resetProgress,
    resetPracticeProgress,
    calculateOverallProgress
  }
}