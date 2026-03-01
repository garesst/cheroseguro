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
  { id: 1, title: "Primeros Pasos", description: "Completaste tu primer artículo", icon: BookOpen, earned: true },
  { id: 2, title: "Experto en Phishing", description: "100% de precisión en Defensor de Phishing", icon: Shield, earned: true },
  { id: 3, title: "Lector Veloz", description: "Leíste 10 artículos", icon: Target, earned: false },
  { id: 4, title: "Maestro de Simulaciones", description: "Completa todas las simulaciones", icon: Target, earned: false },
  { id: 5, title: "Puntuación Alta", description: "Obtén 10,000+ puntos en cualquier juego", icon: Trophy, earned: true },
  { id: 6, title: "Estudiante Dedicado", description: "Racha de aprendizaje de 7 días", icon: Award, earned: false },
]

const recentActivity = [
  {
    type: "game",
    title: "Completado Defensor de Phishing",
    score: 800,
    date: "hace 2 horas",
  },
  {
    type: "article",
    title: "Leído: Entendiendo Ataques de Phishing",
    date: "hace 1 día",
  },
  {
    type: "simulation",
    title: "Completada Detección de Emails de Phishing",
    score: "6/8 correctos",
    date: "hace 2 días",
  },
  {
    type: "game",
    title: "Jugado Constructor de Contraseñas",
    score: 8750,
    date: "hace 3 días",
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
                        <span>juan.perez@ejemplo.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Se unió en Enero 2025</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Nivel 3 Estudiante
                      </Badge>
                      <Badge variant="outline">3 Logros</Badge>
                    </div>
                  </div>

                  <Button variant="outline">Editar Perfil</Button>
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
                      <div className="text-sm text-muted-foreground">Artículos Leídos</div>
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
                      <div className="text-sm text-muted-foreground">Simulaciones</div>
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
                      <div className="text-sm text-muted-foreground">Juegos Jugados</div>
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
                      <div className="text-sm text-muted-foreground">Mejor Puntaje</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="progress">Progreso</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="mt-6 space-y-6">
                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso de Aprendizaje</CardTitle>
                    <CardDescription>Rastrea tu progreso en todas las áreas de aprendizaje</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Detección de Phishing</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Seguridad de Contraseñas</span>
                        <span className="text-sm text-muted-foreground">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Ingeniería Social</span>
                        <span className="text-sm text-muted-foreground">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Navegación Segura</span>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Pasos Recomendados</CardTitle>
                    <CardDescription>Continúa construyendo tu conocimiento en seguridad</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Target className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">Completa Simulación de Seguridad Móvil</div>
                          <div className="text-sm text-muted-foreground">Fortalece tus habilidades de seguridad móvil</div>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/practice/mobile-security">Iniciar</Link>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Lee Sobre Respaldos de Datos</div>
                          <div className="text-sm text-muted-foreground">Aprende a proteger tus archivos importantes</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/learn/data-backups">Leer</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logros</CardTitle>
                    <CardDescription>
                      {achievements.filter((a) => a.earned).length} de {achievements.length} desbloqueados
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
                                Desbloqueado
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
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Tus últimas acciones de aprendizaje</CardDescription>
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
                                Puntuación:{" "}
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
