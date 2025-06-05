"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HeartPulse, Users, Leaf, Star, Trophy, Award, Target, Shield, ChevronDown, Play } from "lucide-react"

export default function StudentDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const categories = [
    { name: "Todos", color: "bg-gray-100 text-gray-700" },
    { name: "Médicas", color: "bg-red-100 text-red-700" },
    { name: "Sociales", color: "bg-blue-100 text-blue-700" },
    { name: "Ambientales", color: "bg-green-100 text-green-700" },
  ]

  const modules = [
    {
      id: 1,
      title: "Acoso Escolar: ¿Qué hacer?",
      description: "Aprende a identificar y actuar ante situaciones de bullying",
      category: "Sociales",
      icon: Users,
      categoryColor: "bg-blue-100 text-blue-700",
    },
    {
      id: 2,
      title: "Primeros Auxilios Básicos",
      description: "Técnicas esenciales para emergencias médicas",
      category: "Médicas",
      icon: HeartPulse,
      categoryColor: "bg-red-100 text-red-700",
    },
    {
      id: 3,
      title: "Reciclaje y Medio Ambiente",
      description: "Cómo cuidar nuestro planeta desde casa",
      category: "Ambientales",
      icon: Leaf,
      categoryColor: "bg-green-100 text-green-700",
    },
    {
      id: 4,
      title: "Seguridad en Internet",
      description: "Navega de forma segura en el mundo digital",
      category: "Sociales",
      icon: Shield,
      categoryColor: "bg-blue-100 text-blue-700",
    },
  ]

  const achievements = [
    { icon: Trophy, name: "Primera Lección" },
    { icon: Star, name: "Nivel 5" },
    { icon: Award, name: "Experto en RCP" },
    { icon: Target, name: "Meta Semanal" },
    { icon: HeartPulse, name: "Héroe Médico" },
  ]

  const filteredModules =
    selectedCategory === "Todos" ? modules : modules.filter((module) => module.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Reacciona</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-teal-100 text-teal-700">J</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Hola, Jazmín</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    Nivel 5 <Star className="w-3 h-3 ml-1 text-amber-500" /> • 1,250 Pts
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Mi Progreso</DropdownMenuItem>
              <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
              <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Continue Learning Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">Continuar tu última lección:</CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">
              Primeros Auxilios: RCP Básico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </CardContent>
        </Card>

        {/* Explore Modules Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Explorar Módulos</h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={
                  selectedCategory === category.name
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => {
              const IconComponent = module.icon
              return (
                <Card key={module.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-gray-700" />
                      </div>
                      <Badge className={`${module.categoryColor} border-0`}>{module.category}</Badge>
                    </div>
                    <CardTitle className="text-base text-gray-900 leading-tight">{module.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-medium"
                    >
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Últimos Logros</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon
              return (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <IconComponent className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-xs text-gray-600 max-w-[64px] leading-tight">{achievement.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
