import Link from "next/link"
import {
  Gamepad2,
  Star,
  Clock,
  Trophy,
  Target,
  Lock,
  Shield,
  Eye,
  Mail,
  Zap,
  Grid3x3,
  Wifi,
  AlertCircle,
  FileText,
  Briefcase,
  HardDrive,
  MessageSquare,
  Cookie,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const games = [
  {
    id: "phishing-defender",
    title: "Phishing Defender",
    description: "Sort emails into safe or phishing categories against the clock. Test your detection speed!",
    icon: Mail,
    difficulty: "beginner",
    playTime: "5-10 min",
    highScore: null,
    locked: false,
    featured: true,
  },
  {
    id: "spot-the-clone",
    title: "Spot the Clone",
    description: "Find 3 subtle differences between the original and cloned bank website. Sharp eye required!",
    icon: Eye,
    difficulty: "beginner",
    playTime: "3-5 min",
    highScore: null,
    locked: false,
    featured: true,
  },
  {
    id: "ransomware-war-room",
    title: "Ransomware War Room",
    description:
      "Make strategic decisions to survive ransomware attack scenarios. Balance budget, reputation, and system health.",
    icon: AlertCircle,
    difficulty: "intermediate",
    playTime: "8-12 min",
    highScore: null,
    locked: false,
    featured: true,
  },
  {
    id: "phishing-swipe",
    title: "Phishing Swipe",
    description: "Swipe through email stacks and categorize them as legit or scam. Fast-paced action gameplay!",
    icon: Zap,
    difficulty: "beginner",
    playTime: "3-5 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "password-tetris",
    title: "Password Tetris",
    description: "Stack security blocks as they fall. Clear lines to earn points in this twist on a classic.",
    icon: Grid3x3,
    difficulty: "intermediate",
    playTime: "5-10 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "wifi-hunter",
    title: "WiFi Hunter",
    description: "Identify safe networks before time runs out. Choose wisely or lose precious seconds!",
    icon: Wifi,
    difficulty: "beginner",
    playTime: "1 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "data-carrier",
    title: "Data Carrier",
    description: "Classify documents into the correct security categories. Test your data handling knowledge!",
    icon: FileText,
    difficulty: "beginner",
    playTime: "5-8 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "url-checker",
    title: "URL Checker Challenge",
    description: "Identify safe and malicious URLs before time runs out. Perfect your link inspection skills.",
    icon: Target,
    difficulty: "beginner",
    playTime: "5-10 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "security-quiz",
    title: "Security Quiz Master",
    description: "Answer rapid-fire questions about cybersecurity concepts and best practices.",
    icon: Gamepad2,
    difficulty: "intermediate",
    playTime: "8-12 min",
    highScore: 15230,
    locked: false,
    featured: false,
  },
  {
    id: "breach-response",
    title: "Breach Response",
    description: "Make critical decisions during a simulated data breach. Every second counts!",
    icon: Shield,
    difficulty: "advanced",
    playTime: "15-20 min",
    highScore: null,
    locked: true,
    featured: false,
  },
  {
    id: "the-auditor",
    title: "The Auditor",
    description: "Defend the network by placing firewalls before the attack begins.",
    icon: Shield,
    difficulty: "intermediate",
    playTime: "5-8 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "supply-chain-inspector",
    title: "Supply Chain Inspector",
    description: "Vet 3rd party vendors. Check ISO certifications and data locations.",
    icon: Briefcase,
    difficulty: "advanced",
    playTime: "4-6 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "backup-backpack",
    title: "Backup Backpack",
    description: "Prioritize which files to save to your limited backup drive during a crisis.",
    icon: HardDrive,
    difficulty: "beginner",
    playTime: "6-10 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "insider-threat",
    title: "Insider Threat",
    description: "Analyze logs to find the employee stealing data.",
    icon: AlertCircle,
    difficulty: "advanced",
    playTime: "4-6 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "compliance-speedrun",
    title: "Compliance Speed-Run",
    description: "Race against time to verify legal compliance.",
    icon: Zap,
    difficulty: "intermediate",
    playTime: "3-5 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "patch-maze",
    title: "Update Labyrinth",
    description: "Escape the virus by choosing the secure path.",
    icon: Shield,
    difficulty: "beginner",
    playTime: "5-8 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "social-engineering-defense",
    title: "Social Engineering Chat",
    description: "Identify manipulation tactics in a simulated chat with a scammer.",
    icon: MessageSquare,
    difficulty: "intermediate",
    playTime: "5-8 min",
    highScore: null,
    locked: false,
    featured: false,
    simulationType: "chat",
  },
  {
    id: "cookie-detective",
    title: "Cookie Detective",
    description: "Find and disable hidden tracking cookies in a confusing privacy menu.",
    icon: Cookie,
    difficulty: "beginner",
    playTime: "4-6 min",
    highScore: null,
    locked: false,
    featured: false,
    simulationType: "privacy",
  },
  {
    id: "brute-force-arena",
    title: "Brute Force Arena",
    description: "Test your password against a simulated hacker attack. Can your key survive the brute force?",
    icon: Shield,
    difficulty: "beginner",
    playTime: "5-10 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "tracker-terminator",
    title: "Tracker Terminator",
    description: "Hunt down invisible trackers hiding in a browser interface.",
    icon: Eye,
    difficulty: "beginner",
    playTime: "4-6 min",
    highScore: null,
    locked: false,
    featured: false,
  },
  {
    id: "scam-spotter",
    title: "Scam Spotter",
    description: "Defend yourself against a live scammer in a high-speed chat.",
    icon: MessageSquare,
    difficulty: "intermediate",
    playTime: "3-5 min",
    highScore: null,
    locked: false,
    featured: false,
  },
]

export default function PlayPage() {
  const featuredGames = games.filter((game) => game.featured)
  const allGames = games.filter((game) => !game.featured)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Header Section */}
        <section className="w-full py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">\n            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">Learn Through Play</h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                Master cybersecurity concepts through fun, educational mini-games. Compete for high scores and earn
                achievements as you level up your security knowledge.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Gamepad2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-sm text-muted-foreground">Games Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm text-muted-foreground">Games Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold">15,230</div>
                  <div className="text-sm text-muted-foreground">Top Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="container pb-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6">Featured Games</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredGames.map((game) => (
                <Card
                  key={game.id}
                  className="hover:border-primary/50 transition-all hover:shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <game.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {game.difficulty}
                      </Badge>
                      {game.highScore && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          {game.highScore.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{game.playTime}</span>
                      </div>
                      <Button asChild>
                        <Link href={`/play/${game.id}`}>Play Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Games */}
        <section className="container pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6">More Games</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {allGames.map((game) => (
                <Card
                  key={game.id}
                  className={`hover:border-primary/50 transition-all group ${game.locked ? "opacity-75" : "hover:shadow-md"}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-14 w-14 rounded-lg ${game.locked ? "bg-muted" : "bg-primary/10"} flex items-center justify-center shrink-0`}
                      >
                        {game.locked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <game.icon className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {game.difficulty}
                          </Badge>
                          {game.highScore && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3" />
                              {game.highScore.toLocaleString()}
                            </Badge>
                          )}
                          {game.locked && <Badge variant="destructive">Locked</Badge>}
                        </div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <CardDescription className="leading-relaxed">
                          {game.locked ? "Complete previous games to unlock this challenge" : game.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{game.playTime}</span>
                      </div>
                      <Button variant="outline" disabled={game.locked} asChild={!game.locked}>
                        {game.locked ? (
                          "Locked"
                        ) : game.simulationType ? (
                          <Link href={`/practice/general?simulationType=${game.simulationType}`}>Play</Link>
                        ) : (
                          <Link href={`/play/${game.id}`}>Play</Link>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container pb-16">
          <div className="mx-auto max-w-5xl">
            <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Trophy className="h-12 w-12 text-secondary mx-auto" />
                  <h3 className="text-2xl font-bold">Climb the Leaderboard</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    <Link href="/signup" className="text-primary hover:underline">
                      Create an account
                    </Link>{" "}
                    to save your high scores, earn achievements, and compete with other learners on the global
                    leaderboard.
                  </p>
                  <div className="pt-2">
                    <Button size="lg" asChild>
                      <Link href="/signup">Create Free Account</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
