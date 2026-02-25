import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PhishingScenarioProps {
  subject: string
  from: string
  content: string
}

export function PhishingScenario({ subject, from, content }: PhishingScenarioProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/30">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1">{subject}</CardTitle>
            <CardDescription className="break-all">From: {from}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-background border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">{content}</div>
      </CardContent>
    </Card>
  )
}
