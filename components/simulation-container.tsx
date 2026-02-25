import { PhishingScenario } from "./phishing-scenario"
import { PasswordScenario } from "./password-scenario"
import { ChatScenario } from "./chat-scenario"
import { PrivacyScenario } from "./privacy-scenario"
import { RansomwareScenario } from "./ransomware-scenario"

export interface Scenario {
  id: number
  type: "phishing" | "password" | "chat" | "privacy" | "ransomware"
  question: string
  options: Array<{ id: string; label: string }>
  correctAnswer: string
  explanation: string
  // Phishing specific
  subject?: string
  from?: string
  content?: string
  // Password specific
  passwordTitle?: string
  // Chat specific
  fakeProfile?: {
    name: string
    status: string
    avatar: string
  }
  messages?: Array<{
    sender: "attacker" | "user"
    text: string
  }>
  // Privacy specific
  privacySettings?: Array<{
    id: string
    label: string
    description: string
    enabled: boolean
  }>
  // Ransomware specific
  ransomwareTitle?: string
  ransomwareMessage?: string
}

interface SimulationContainerProps {
  scenario: Scenario
}

export function SimulationContainer({ scenario }: SimulationContainerProps) {
  switch (scenario.type) {
    case "phishing":
      return (
        <PhishingScenario
          subject={scenario.subject || ""}
          from={scenario.from || ""}
          content={scenario.content || ""}
        />
      )
    case "password":
      return <PasswordScenario title={scenario.passwordTitle || "Password Strength Builder"} />
    case "chat":
      return (
        <ChatScenario
          fakeProfile={scenario.fakeProfile || { name: "Unknown", status: "online", avatar: "?" }}
          messages={scenario.messages || []}
        />
      )
    case "privacy":
      return <PrivacyScenario settings={scenario.privacySettings || []} />
    case "ransomware":
      return (
        <RansomwareScenario
          title={scenario.ransomwareTitle || "⚠️ SYSTEM ALERT"}
          message={scenario.ransomwareMessage || "Your system has been compromised"}
        />
      )
    default:
      return null
  }
}
