"use client"

import { useState, useEffect } from 'react'
import { useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'

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

const sanitizeScore = (rawScore: number) => {
  if (!Number.isFinite(rawScore)) return 0
  return Math.max(0, Math.min(100, Math.round(rawScore)))
}

export function usePracticeProgress() {
  const { isAuthenticated, user } = useAuth()
  const syncedUserRef = useRef<string | null>(null)
  const restoredUserRef = useRef<string | null>(null)
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

  // Restaurar progreso desde el backend si localStorage está vacío (p.ej. fue borrado)
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (restoredUserRef.current === user.id) return

    const localData = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (localData) {
      restoredUserRef.current = user.id
      return
    }

    restoredUserRef.current = user.id

    fetch('/api/tracking/practice-progress', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const backendProgress: any[] = data?.practice_progress ?? []
        if (backendProgress.length === 0) return

        const restoredProgress: Record<string, PracticeProgress> = {}
        for (const p of backendProgress) {
          restoredProgress[p.practice_slug] = {
            completed: p.status === 'completed' || p.status === 'mastered',
            exercises: {},
            totalScore: p.best_score ?? null,
            completedAt: p.first_completed_at ?? undefined,
            lastAttempt: p.last_attempt_at ?? undefined,
          }
        }
        saveProgress(restoredProgress)
      })
      .catch(() => {})
  }, [isAuthenticated, user])

  const saveProgress = (newProgress: Record<string, PracticeProgress>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
      setProgress(newProgress)
      calculateOverallProgress(newProgress)
    }
  }

  const syncPracticeToBackend = async (
    practiceSlug: string,
    practiceData: PracticeProgress,
    options?: {
      practiceTitle?: string
      difficultyLevel?: string
      totalExercises?: number
      timeSpentMinutes?: number
    }
  ) => {
    if (!isAuthenticated || !user) return

    const completedExercises = Object.values(practiceData.exercises).filter(ex => ex.completed).length
    const totalExercises = options?.totalExercises || Math.max(Object.keys(practiceData.exercises).length, 1)
    const completionPercentage = Math.min(
      100,
      Math.round((completedExercises / totalExercises) * 100)
    )

    const payload = {
      practice_slug: practiceSlug,
      practice_title: options?.practiceTitle || practiceSlug.replace(/-/g, ' '),
      difficulty_level: options?.difficultyLevel || 'beginner',
      status: practiceData.completed ? 'completed' : 'in_progress',
      completion_percentage: completionPercentage,
      score: practiceData.totalScore ?? undefined,
      time_spent_minutes: options?.timeSpentMinutes || 1,
    }

    try {
      await fetch('/api/tracking/practice-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Error syncing practice progress:', error)
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
    isCorrect: boolean = true,
    options?: {
      practiceTitle?: string
      difficultyLevel?: string
      totalExercises?: number
      timeSpentMinutes?: number
    }
  ) => {
    const normalizedScore = sanitizeScore(score)
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

    // Always persist the latest/best score for visibility, even on non-passing attempts.
    // Completion state is still controlled by isCorrect.
    if (exercise.score === null) {
      exercise.score = normalizedScore
    } else {
      exercise.score = Math.max(exercise.score, normalizedScore)
    }

    if (isCorrect && !exercise.completed) {
      exercise.completed = true
      exercise.completedAt = new Date().toISOString()
    }

    // Update practice completion status
    const exercises = Object.values(practice.exercises)
    if (exercises.length > 0 && exercises.every(ex => ex.completed)) {
      practice.completed = true
      practice.completedAt = new Date().toISOString()
    }

    // Keep a rolling practice score even if not fully completed yet.
    // This guarantees points are reflected for all practice types/attempts.
    const scores = exercises.filter(ex => ex.score !== null).map(ex => ex.score!)
    practice.totalScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null

    practice.lastAttempt = new Date().toISOString()
    saveProgress(newProgress)

    // Para usuarios autenticados, también persistimos en backend.
    void syncPracticeToBackend(practiceSlug, practice, options)
  }

  // Sincroniza una sola vez por sesión de usuario el progreso local acumulado.
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (syncedUserRef.current === user.id) return

    const practiceEntries = Object.entries(progress)
    // Si progress aún no cargó desde localStorage, esperar a que tenga datos
    if (practiceEntries.length === 0) return

    void (async () => {
      for (const [practiceSlug, practiceData] of practiceEntries) {
        await syncPracticeToBackend(practiceSlug, practiceData)
      }
      syncedUserRef.current = user.id
    })()
  }, [isAuthenticated, user, progress])

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