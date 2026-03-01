"use client"

import { useState, useEffect, useCallback } from 'react'
import { CertificationProgress } from '@/lib/directus-queries'

interface CertificationAttempt {
  attemptNumber: number
  startedAt: string
  completedAt?: string
  finalScore?: number
  passed?: boolean
  timeRemaining?: number
  exerciseResults: {
    exerciseId: number
    score: number
    completed: boolean
    answers?: any
  }[]
  certificateId?: string
}

interface StoredCertificationProgress {
  attempts: CertificationAttempt[]
  bestScore?: number
  passed?: boolean
  certificateId?: string
  validUntil?: string
}

interface OverallCertificationStats {
  totalCertifications: number
  passedCertifications: number
  activeCertifications: number
  totalAttempts: number
  averageScore: number
}

const STORAGE_KEY = 'cyberguard_certification_progress'
const ACTIVE_EXAM_KEY = 'cyberguard_active_exam'

export function useCertificationProgress() {
  const [certProgress, setCertProgress] = useState<Record<string, StoredCertificationProgress>>({})
  const [activeExam, setActiveExam] = useState<CertificationProgress | null>(null)
  const [stats, setStats] = useState<OverallCertificationStats>({
    totalCertifications: 0,
    passedCertifications: 0,
    activeCertifications: 0,
    totalAttempts: 0,
    averageScore: 0
  })

  // Load certification progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setCertProgress(data)
          calculateStats(data)
        } catch (error) {
          console.warn('Failed to parse certification progress:', error)
        }
      }

      // Load active exam if exists
      const activeExamData = localStorage.getItem(ACTIVE_EXAM_KEY)
      if (activeExamData) {
        try {
          const exam = JSON.parse(activeExamData)
          // Check if exam is expired
          if (exam.timeRemaining && exam.timeRemaining > 0) {
            setActiveExam(exam)
          } else {
            localStorage.removeItem(ACTIVE_EXAM_KEY)
          }
        } catch (error) {
          console.warn('Failed to parse active exam:', error)
        }
      }
    }
  }, [])

  const saveProgress = (newProgress: Record<string, StoredCertificationProgress>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
      setCertProgress(newProgress)
      calculateStats(newProgress)
    }
  }

  const calculateStats = (progressData: Record<string, StoredCertificationProgress>) => {
    const certifications = Object.values(progressData)
    const totalCertifications = certifications.length
    const passedCertifications = certifications.filter(c => c.passed).length
    
    // Count active (not expired) certifications
    const now = new Date().getTime()
    const activeCertifications = certifications.filter(c => {
      if (!c.validUntil) return false
      return new Date(c.validUntil).getTime() > now
    }).length

    let totalScore = 0
    let totalAttempts = 0

    certifications.forEach(cert => {
      totalAttempts += cert.attempts.length
      cert.attempts.forEach(attempt => {
        if (attempt.finalScore !== undefined) {
          totalScore += attempt.finalScore
        }
      })
    })

    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0

    setStats({
      totalCertifications,
      passedCertifications,
      activeCertifications,
      totalAttempts,
      averageScore
    })
  }

  // Start a new certification exam
  const startCertificationExam = useCallback((
    certificationSlug: string,
    timeLimitMinutes: number
  ) => {
    const currentProgress = certProgress[certificationSlug] || { attempts: [] }
    const attemptNumber = currentProgress.attempts.length + 1

    const newExam: CertificationProgress = {
      certificationSlug,
      attemptNumber,
      startedAt: new Date().toISOString(),
      timeRemaining: timeLimitMinutes * 60, // Convert to seconds
      currentExerciseIndex: 0,
      exerciseResults: []
    }

    setActiveExam(newExam)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(newExam))
    }

    return newExam
  }, [certProgress])

  // Update active exam progress
  const updateExamProgress = useCallback((updates: Partial<CertificationProgress>) => {
    if (!activeExam) return

    const updatedExam = { ...activeExam, ...updates }
    setActiveExam(updatedExam)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(updatedExam))
    }
  }, [activeExam])

  // Complete current exercise in exam
  const completeExercise = useCallback((
    exerciseId: number,
    score: number,
    answers?: any
  ) => {
    if (!activeExam) return

    const exerciseResult = {
      exerciseId,
      score,
      completed: true,
      answers
    }

    const existingIndex = activeExam.exerciseResults.findIndex(
      r => r.exerciseId === exerciseId
    )

    let updatedResults
    if (existingIndex >= 0) {
      updatedResults = [...activeExam.exerciseResults]
      updatedResults[existingIndex] = exerciseResult
    } else {
      updatedResults = [...activeExam.exerciseResults, exerciseResult]
    }

    updateExamProgress({ exerciseResults: updatedResults })
  }, [activeExam, updateExamProgress])

  // Complete the entire certification exam
  const completeCertificationExam = useCallback((
    finalScore: number,
    exerciseResults: { exerciseId: string, score: number, answers: any }[]
  ) => {
    if (!activeExam) return null

    const passed = finalScore >= 0 // We'll check passing threshold in the controller

    // Generate certificate ID if passed
    const certificateId = passed 
      ? `CERT-${activeExam.certificationSlug.toUpperCase()}-${Date.now()}`
      : undefined

    // Calculate validity date if passed (12 months default)
    const validUntil = passed
      ? new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    const completedAttempt: CertificationAttempt = {
      attemptNumber: activeExam.attemptNumber,
      startedAt: activeExam.startedAt,
      completedAt: new Date().toISOString(),
      finalScore,
      passed,
      timeRemaining: activeExam.timeRemaining,
      exerciseResults: exerciseResults.map(r => ({
        exerciseId: r.exerciseId as any, // Convert string to number for compatibility
        score: r.score,
        completed: true,
        answers: r.answers
      })),
      certificateId
    }

    // Update certification progress
    const currentCertProgress = certProgress[activeExam.certificationSlug] || { attempts: [] }
    const updatedAttempts = [...currentCertProgress.attempts, completedAttempt]
    
    // Calculate best score
    const allScores = updatedAttempts
      .map(a => a.finalScore)
      .filter((s): s is number => s !== undefined)
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : undefined

    // Check if any attempt passed
    const everPassed = updatedAttempts.some(a => a.passed)

    const updatedCertProgress: StoredCertificationProgress = {
      attempts: updatedAttempts,
      bestScore,
      passed: everPassed,
      certificateId: certificateId || currentCertProgress.certificateId,
      validUntil: validUntil || currentCertProgress.validUntil
    }

    const newProgress = {
      ...certProgress,
      [activeExam.certificationSlug]: updatedCertProgress
    }

    saveProgress(newProgress)

    // Clear active exam
    setActiveExam(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_EXAM_KEY)
    }

    return {
      finalScore,
      passed,
      certificateId,
      validUntil
    }
  }, [activeExam, certProgress, saveProgress])

  // Get certification progress
  const getCertificationProgress = useCallback((certificationSlug: string) => {
    return certProgress[certificationSlug] || null
  }, [certProgress])

  // Check if certification is valid (not expired)
  const isCertificationValid = useCallback((certificationSlug: string) => {
    const progress = certProgress[certificationSlug]
    if (!progress || !progress.passed || !progress.validUntil) {
      return false
    }

    const now = new Date().getTime()
    const expiryDate = new Date(progress.validUntil).getTime()
    return expiryDate > now
  }, [certProgress])

  // Abandon current exam
  const abandonExam = useCallback(() => {
    setActiveExam(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_EXAM_KEY)
    }
  }, [])

  // Reset all certification progress (for testing)
  const resetAllProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(ACTIVE_EXAM_KEY)
    }
    setCertProgress({})
    setActiveExam(null)
    setStats({
      totalCertifications: 0,
      passedCertifications: 0,
      activeCertifications: 0,
      totalAttempts: 0,
      averageScore: 0
    })
  }, [])

  return {
    certProgress,
    activeExam,
    stats,
    startCertificationExam,
    updateExamProgress,
    completeExercise,
    completeCertificationExam,
    getCertificationProgress,
    isCertificationValid,
    abandonExam,
    resetAllProgress
  }
}
