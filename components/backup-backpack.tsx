"use client"

import { useState, useMemo } from "react"
import { Star, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BackupFile {
  id: number
  name: string
  value: number
  size: number
}

const availableFiles: BackupFile[] = [
  { id: 1, name: "Base de datos de la empresa", value: 500, size: 800 },
  { id: 2, name: "Registros financieros", value: 400, size: 200 },
  { id: 3, name: "Codigo fuente", value: 350, size: 1200 },
  { id: 4, name: "Datos de clientes", value: 300, size: 600 },
  { id: 5, name: "Recursos de diseno", value: 150, size: 400 },
  { id: 6, name: "Videos de marketing", value: 100, size: 2000 },
  { id: 7, name: "Perfiles de usuario", value: 280, size: 300 },
  { id: 8, name: "Archivos de correo", value: 120, size: 1500 },
]

const MAX_CAPACITY = 2000

export function BackupBackpack() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [gameComplete, setGameComplete] = useState(false)
  const [score, setScore] = useState(0)

  const unselectedFiles = availableFiles.filter((f) => !selectedFiles.includes(f.id))
  const backupFiles = availableFiles.filter((f) => selectedFiles.includes(f.id))

  const totalSize = useMemo(() => backupFiles.reduce((sum, f) => sum + f.size, 0), [backupFiles])
  const totalValue = useMemo(() => backupFiles.reduce((sum, f) => sum + f.value, 0), [backupFiles])
  const capacityPercent = (totalSize / MAX_CAPACITY) * 100
  const maxValue = availableFiles.reduce((sum, f) => sum + f.value, 0)
  const efficiency = Math.round((totalValue / maxValue) * 100)

  const handleAddFile = (fileId: number) => {
    const file = availableFiles.find((f) => f.id === fileId)
    if (file && totalSize + file.size <= MAX_CAPACITY) {
      setSelectedFiles([...selectedFiles, fileId])
    }
  }

  const handleRemoveFile = (fileId: number) => {
    setSelectedFiles(selectedFiles.filter((id) => id !== fileId))
  }

  const handleComplete = () => {
    setScore(Math.round((efficiency * totalValue) / 100))
    setGameComplete(true)
  }

  const handleReset = () => {
    setSelectedFiles([])
    setGameComplete(false)
    setScore(0)
  }

  if (gameComplete) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">¡Respaldo completado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Puntos</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-secondary">{efficiency}%</div>
                <div className="text-sm text-muted-foreground">Eficiencia</div>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            {efficiency === 100
              ? "¡Seleccionaste las prioridades perfectas! Todos los datos criticos quedaron a salvo."
              : efficiency >= 75
                ? "¡Muy buena eleccion! La mayor parte de los datos criticos esta protegida."
                : "Buen trabajo. Revisa las prioridades de los archivos para mejorar la proxima vez."}
          </p>
          <Button onClick={handleReset} size="lg">
            Jugar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Star className="mr-2 h-4 w-4" />
          Valor: ${totalValue}
        </Badge>
        <div className={`text-sm font-semibold ${totalSize > MAX_CAPACITY ? "text-red-600" : "text-green-600"}`}>
          {totalSize} / {MAX_CAPACITY} MB
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${totalSize > MAX_CAPACITY ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Files */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Archivos disponibles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unselectedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ${file.value} de valor • {file.size} MB
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddFile(file.id)}
                  disabled={totalSize + file.size > MAX_CAPACITY}
                  className="ml-2 shrink-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Drive */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Unidad de respaldo</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto bg-primary/5 rounded-lg p-4">
            {backupFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>Aun no has seleccionado archivos</div>
              </div>
            ) : (
              backupFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-card rounded-lg p-3 text-sm border border-primary/20"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ${file.value} • {file.size} MB
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFile(file.id)}
                    className="ml-2 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <Button onClick={handleComplete} disabled={selectedFiles.length === 0} size="lg" className="w-full h-14 text-lg">
        Completar respaldo
      </Button>
    </div>
  )
}
