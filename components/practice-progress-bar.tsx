"use client"

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Target, TrendingUp, BookOpen } from 'lucide-react'
import { usePracticeProgress } from '@/hooks/use-practice-progress'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PracticeProgressBarProps {
  availablePractices?: number
  showDetailedStats?: boolean
  className?: string
}

export function PracticeProgressBar({ 
  availablePractices = 0, 
  showDetailedStats = true,
  className = ""
}: PracticeProgressBarProps) {
  const { overall, progress } = usePracticeProgress()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tu progreso</h3>
              <p className="text-sm text-gray-600">Completa simulaciones para mejorar tu conciencia de seguridad</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">0/{availablePractices || 0}</div>
              <div className="text-xs text-gray-500">Completadas</div>
            </div>
          </div>
          <Progress value={0} className="mb-4" />
        </CardContent>
      </Card>
    )
  }

  const completedPractices = overall.completedPractices
  const totalPractices = availablePractices || overall.totalPractices
  const progressPercentage = totalPractices > 0 ? (completedPractices / totalPractices) * 100 : 0

  const hasAnyProgress = Object.keys(progress).length > 0
  const hasPartialProgress = hasAnyProgress && !Object.values(progress).every(p => p.completed)

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tu progreso</h3>
            <p className="text-sm text-gray-600">
              {hasAnyProgress 
                ? hasPartialProgress 
                  ? "¡Estás haciendo progreso! Completa todos los ejercicios para finalizar cada práctica."
                  : "Completa simulaciones para mejorar tu conciencia de seguridad"
                : "Comienza a practicar para rastrear tu progreso!"
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedPractices}/{totalPractices}
            </div>
            <div className="text-xs text-gray-500">Completadas</div>
          </div>
        </div>

        <div className="space-y-3">
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          {!hasAnyProgress && (
            <div className="text-center py-2">
              <Button variant="outline" size="sm" asChild className="text-blue-600 border-blue-300 hover:bg-blue-100">
                <Link href="#available-simulations">
                  Comienza tu primera práctica →
                </Link>
              </Button>
            </div>
          )}
        </div>

        {showDetailedStats && hasAnyProgress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{overall.averageScore}%</div>
              <div className="text-xs text-gray-600">Promedio de puntuación</div>
            </div>
            
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {overall.completedExercises}/{overall.totalExercises}
              </div>
              <div className="text-xs text-gray-600">Ejercicios completados</div>
            </div>
            
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
              <div className="text-xs text-gray-600">Practicas</div>
            </div>
            
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{completedPractices}</div>
              <div className="text-xs text-gray-600">Completadas</div>
            </div>
          </div>
        )}

        {hasAnyProgress && completedPractices < totalPractices && (
          <div className="mt-4 p-3 bg-white/70 rounded-lg text-center">
            <p className="text-sm text-gray-700 mb-2">
              ¡Sigue adelante! Estás {Math.round(progressPercentage)}% de camino.
            </p>
            <div className="flex items-center justify-center gap-2">
              {progressPercentage >= 25 && <Badge variant="secondary" className="text-xs">🎯 Empezando</Badge>}
              {progressPercentage >= 50 && <Badge variant="secondary" className="text-xs">🔥 On Fire</Badge>}
              {progressPercentage >= 75 && <Badge variant="secondary" className="text-xs">⭐ Nivel Experto</Badge>}
              {progressPercentage >= 90 && <Badge variant="secondary" className="text-xs">🏆 Casi Finalizado</Badge>}
              {progressPercentage === 100 && <Badge className="text-xs bg-green-600">🎉 Completado!</Badge>}
            </div>
          </div>
        )}

        {hasAnyProgress && completedPractices === totalPractices && totalPractices > 0 && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <div className="text-lg font-bold text-green-800 mb-2">
              🎉 Felicidades! Todas las prácticas completadas!
            </div>
            <p className="text-sm text-green-700">
              Has dominado todas las simulaciones de ciberseguridad disponibles con un promedio de puntuación del {overall.averageScore}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}