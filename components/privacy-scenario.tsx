"use client"

import { Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { useState } from "react"

interface PrivacyScenarioProps {
  settings: Array<{
    id: string
    label: string
    description: string
    enabled: boolean
  }>
}

export function PrivacyScenario({ settings: initialSettings }: PrivacyScenarioProps) {
  const [settings, setSettings] = useState(initialSettings)

  const handleToggle = (id: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Cookie & Privacy Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{setting.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
            </div>
            <Toggle pressed={setting.enabled} onPressedChange={() => handleToggle(setting.id)} className="ml-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
