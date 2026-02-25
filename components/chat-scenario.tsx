import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChatScenarioProps {
  fakeProfile: {
    name: string
    status: string
    avatar: string
  }
  messages: Array<{
    sender: "attacker" | "user"
    text: string
  }>
}

export function ChatScenario({ fakeProfile, messages }: ChatScenarioProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
            {fakeProfile.avatar}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{fakeProfile.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{fakeProfile.status}</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspicious
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 max-h-96 overflow-y-auto bg-background">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-muted-foreground rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
