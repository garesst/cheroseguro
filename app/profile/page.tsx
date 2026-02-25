import Link from "next/link"
import { Mail, Calendar, Trophy, Star, Target, BookOpen, Gamepad2, Shield, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const achievements = [
  { id: 1, title: "First Steps", description: "Completed your first article", icon: BookOpen, earned: true },
  { id: 2, title: "Phishing Expert", description: "100% accuracy in Phishing Defender", icon: Shield, earned: true },
  { id: 3, title: "Speed Reader", description: "Read 10 articles", icon: Target, earned: false },
  { id: 4, title: "Simulation Master", description: "Complete all simulations", icon: Target, earned: false },
  { id: 5, title: "High Score", description: "Score 10,000+ in any game", icon: Trophy, earned: true },
  { id: 6, title: "Dedicated Learner", description: "7-day learning streak", icon: Award, earned: false },
]

const recentActivity = [
  {
    type: "game",
    title: "Completed Phishing Defender",
    score: 800,
    date: "2 hours ago",
  },
  {
    type: "article",
    title: "Read: Understanding Phishing Attacks",
    date: "1 day ago",
  },
  {
    type: "simulation",
    title: "Completed Phishing Email Detection",
    score: "6/8 correct",
    date: "2 days ago",
  },
  {
    type: "game",
    title: "Played Password Builder",
    score: 8750,
    date: "3 days ago",
  },
]

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="w-full py-12">
          <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">\n            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">JD</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">John Doe</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>john.doe@example.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined January 2025</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Level 3 Learner
                      </Badge>
                      <Badge variant="outline">3 Achievements</Badge>
                    </div>
                  </div>

                  <Button variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-muted-foreground">Articles Read</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">4/6</div>
                      <div className="text-sm text-muted-foreground">Simulations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Gamepad2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">15,230</div>
                      <div className="text-sm text-muted-foreground">Top Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="mt-6 space-y-6">
                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>Track your progress across all learning areas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Phishing Detection</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Password Security</span>
                        <span className="text-sm text-muted-foreground">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Social Engineering</span>
                        <span className="text-sm text-muted-foreground">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Safe Browsing</span>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Next Steps</CardTitle>
                    <CardDescription>Continue building your security knowledge</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Target className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">Complete Mobile Security Simulation</div>
                          <div className="text-sm text-muted-foreground">Strengthen your mobile safety skills</div>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/practice/mobile-security">Start</Link>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Read About Data Backups</div>
                          <div className="text-sm text-muted-foreground">Learn to protect your important files</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/learn/data-backups">Read</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      {achievements.filter((a) => a.earned).length} of {achievements.length} unlocked
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <Card
                          key={achievement.id}
                          className={achievement.earned ? "border-primary/50 bg-primary/5" : "opacity-60"}
                        >
                          <CardContent className="pt-6 text-center">
                            <div
                              className={`h-12 w-12 rounded-lg ${achievement.earned ? "bg-primary/10" : "bg-muted"} flex items-center justify-center mx-auto mb-3`}
                            >
                              <achievement.icon
                                className={`h-6 w-6 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </div>
                            <div className="font-semibold mb-1">{achievement.title}</div>
                            <div className="text-xs text-muted-foreground">{achievement.description}</div>
                            {achievement.earned && (
                              <Badge variant="secondary" className="mt-3">
                                Unlocked
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest learning actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div
                            className={`h-10 w-10 rounded-lg ${
                              activity.type === "game"
                                ? "bg-accent/10"
                                : activity.type === "article"
                                  ? "bg-primary/10"
                                  : "bg-secondary/10"
                            } flex items-center justify-center shrink-0`}
                          >
                            {activity.type === "game" ? (
                              <Gamepad2
                                className={`h-5 w-5 ${activity.type === "game" ? "text-accent" : "text-primary"}`}
                              />
                            ) : activity.type === "article" ? (
                              <BookOpen className="h-5 w-5 text-primary" />
                            ) : (
                              <Target className="h-5 w-5 text-secondary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            {activity.score && (
                              <div className="text-sm text-muted-foreground">
                                Score:{" "}
                                {typeof activity.score === "number" ? activity.score.toLocaleString() : activity.score}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">{activity.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
