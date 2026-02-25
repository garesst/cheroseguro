"use client"

import type React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PhishingSwipe } from "@/components/phishing-swipe"
import { PasswordTetris } from "@/components/password-tetris"
import { WifiHunter } from "@/components/wifi-hunter"
import { PhishingDefender } from "@/components/phishing-defender"
import { SpotTheClone } from "@/components/spot-the-clone"
import { RansomwareWarRoom } from "@/components/ransomware-war-room"
import { DataCarrier } from "@/components/data-carrier"
import { TheAuditor } from "@/components/the-auditor"
import { SupplyChainInspector } from "@/components/supply-chain-inspector"
import { BackupBackpack } from "@/components/backup-backpack"
import { InsiderThreat } from "@/components/insider-threat"
import { ComplianceSpeedrun } from "@/components/compliance-speedrun"
import { PatchMaze } from "@/components/patch-maze"
import { BruteForceArena } from "@/components/brute-force-arena"
import { TrackerTerminator } from "@/components/tracker-terminator"
import { ScamSpotter } from "@/components/scam-spotter"
import { useParams } from "next/navigation"

export default function GamePage() {
  const params = useParams()
  const slug = params.slug as string

  const gameData: Record<
    string,
    {
      title: string
      description: string
      component: React.ComponentType<any>
    }
  > = {
    "phishing-defender": {
      title: "Phishing Defender",
      description: "Sort emails into safe or phishing categories against the clock.",
      component: PhishingDefender,
    },
    "phishing-swipe": {
      title: "Phishing Swipe",
      description: "Swipe through email stacks and categorize them as legit or scam.",
      component: PhishingSwipe,
    },
    "password-tetris": {
      title: "Password Tetris",
      description: "Stack security blocks as they fall and clear lines.",
      component: PasswordTetris,
    },
    "wifi-hunter": {
      title: "WiFi Hunter",
      description: "Identify safe networks before time runs out.",
      component: WifiHunter,
    },
    "spot-the-clone": {
      title: "Spot the Clone",
      description: "Find 3 subtle differences between the original and cloned bank website.",
      component: SpotTheClone,
    },
    "ransomware-war-room": {
      title: "Ransomware War Room",
      description: "Make strategic decisions to survive ransomware attack scenarios.",
      component: RansomwareWarRoom,
    },
    "data-carrier": {
      title: "Data Carrier",
      description: "Classify documents into the correct security categories.",
      component: DataCarrier,
    },
    "the-auditor": {
      title: "The Auditor",
      description: "Defend the network by placing firewalls before the attack begins.",
      component: TheAuditor,
    },
    "supply-chain-inspector": {
      title: "Supply Chain Inspector",
      description: "Vet 3rd party vendors. Check ISO certifications and data locations.",
      component: SupplyChainInspector,
    },
    "backup-backpack": {
      title: "Backup Backpack",
      description: "Prioritize which files to save to your limited backup drive during a crisis.",
      component: BackupBackpack,
    },
    "insider-threat": {
      title: "Insider Threat",
      description: "Analyze logs to find the employee stealing data.",
      component: InsiderThreat,
    },
    "compliance-speedrun": {
      title: "Compliance Speed-Run",
      description: "Race against time to verify legal compliance.",
      component: ComplianceSpeedrun,
    },
    "patch-maze": {
      title: "Update Labyrinth",
      description: "Escape the virus by choosing the secure path.",
      component: PatchMaze,
    },
    "brute-force-arena": {
      title: "Brute Force Arena",
      description: "Test your password against a simulated hacker attack.",
      component: BruteForceArena,
    },
    "tracker-terminator": {
      title: "Tracker Terminator",
      description: "Hunt down invisible trackers hiding in a browser interface.",
      component: TrackerTerminator,
    },
    "scam-spotter": {
      title: "Scam Spotter",
      description: "Defend yourself against a live scammer in a high-speed chat.",
      component: ScamSpotter,
    },
  }

  const game = gameData[slug]

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 w-full py-16">
          <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
            <Button asChild>
              <Link href="/play">Back to Games</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const Component = game.component

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="w-full py-8">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/play">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Link>
            </Button>

            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">{game.title}</CardTitle>
                <p className="text-muted-foreground">{game.description}</p>
              </CardHeader>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Component />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
