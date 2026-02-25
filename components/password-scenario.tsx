"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface PasswordScenarioProps {
  title: string
}

export function PasswordScenario({ title }: PasswordScenarioProps) {
  const [password, setPassword] = useState("")

  const checks = [
    { label: "Contains Numbers", valid: /\d/.test(password) },
    { label: "Contains Uppercase", valid: /[A-Z]/.test(password) },
    { label: "Contains Lowercase", valid: /[a-z]/.test(password) },
    { label: "Contains Special Characters", valid: /[!@#$%^&*]/.test(password) },
    { label: "Length > 12", valid: password.length > 12 },
  ]

  const validCount = checks.filter((c) => c.valid).length
  const strength = (validCount / checks.length) * 100
  const strengthColor = strength < 40 ? "bg-red-500" : strength < 70 ? "bg-yellow-500" : "bg-green-500"
  const strengthLabel = strength < 40 ? "Weak" : strength < 70 ? "Fair" : "Strong"

  return (
    <Card className="mb-6">
      <CardContent className="pt-8 pb-8 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Create a Strong Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center text-lg py-6"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Password Strength</span>
            <span className="text-sm font-bold">{strengthLabel}</span>
          </div>
          <Progress value={strength} className="h-3" />
        </div>

        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-3">
              {check.valid ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={check.valid ? "text-green-600 font-medium" : "text-muted-foreground"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
