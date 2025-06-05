"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, AlertTriangle, ChevronDown, Plus, BookOpen, Eye } from "lucide-react"

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState("2-ano-b")

  const classes = [
    { id: "2-ano-a", name: "2º Año A" },
    { id: "2-ano-b", name: "2º Año B" },
    { id: "3-ano-a", name: "3º Año A" },
    { id: "1-ano-c", name: "1º Año C" },
  ]

  const classStats = {
    averageProgress: 73,
    activeStudents: { current: 28, total: 32 },
    difficultModule: "Maniobra de Heimlich",
  }

  const students = [
    {
      id: 1,
      name: "Jazmín Rodríguez",
      avatar: "JR",
      lastActivity: "hace 1 día",
      totalProgress: 85,
      averageScore: 92,
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      avatar: "CM",
      lastActivity: "hace 3 días",
      totalProgress: 67,
      averageScore: 78,
    },
    {
      id: 3,
      name: "Ana García",
      avatar: "AG",
      lastActivity: "hace 2 horas",
      totalProgress: 91,
      averageScore: 95,
    },
    {
      id: 4,
      name: "Diego Herrera",
      avatar: "DH",
      lastActivity: "hace 1 semana",
      totalProgress: 45,
      averageScore: 65,
    },
    {
      id: 5,
      name: "María López",
      avatar: "ML",
      lastActivity: "hace 1 día",
      totalProgress: 78,
      averageScore: 88,
    },
    {
      id: 6,
      name: "Pedro Sánchez",
      avatar: "PS",
      lastActivity: "hace 4 días",
      totalProgress: 56,
      averageScore: 72,
    },
    {
      id: 7,
      name: "Sofía Martín",
      avatar: "SM",
      lastActivity: "hace 3 horas",
      totalProgress: 89,
      averageScore: 91,
    },
    {
      id: 8,
      name: "Andrés Torres",
      avatar: "AT",
      lastActivity: "hace 2 días",
      totalProgress: 72,
      averageScore: 81,
    },
  ]

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getActivityStatus = (activity: string) => {
    if (activity.includes("hora")) return "text-green-600"
    if (activity.includes("1 día") || activity.includes("2 días")) return "text-amber-600"
    return "text-red-600"
  }

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
            <span className="text-gray-500 text-sm hidden sm:inline">Panel de Docente</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-teal-100 text-teal-700">JF</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Prof. José Flores</p>
                  <p className="text-xs text-gray-500">Docente</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Gestionar Clases</DropdownMenuItem>
              <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
              <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Class Selector and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Mis Clases</h2>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar clase" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    Clase: {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Crear Grupo
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Asignar Módulo
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Progreso Promedio de la Clase</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2"
                      strokeDasharray={`${classStats.averageProgress}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{classStats.averageProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{classStats.averageProgress}%</p>
                  <p className="text-xs text-gray-500">Completado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Estudiantes Activos</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {classStats.activeStudents.current} / {classStats.activeStudents.total}
              </div>
              <p className="text-xs text-gray-500">
                {Math.round((classStats.activeStudents.current / classStats.activeStudents.total) * 100)}% de
                participación
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Módulo con Mayor Dificultad</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">{classStats.difficultModule}</div>
              <p className="text-xs text-gray-500">Requiere atención adicional</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Progress Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Progreso de Estudiantes</CardTitle>
            <CardDescription>Monitoreo detallado del progreso de cada estudiante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Estudiante</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead className="w-[200px]">Progreso Total</TableHead>
                    <TableHead>Puntaje Promedio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {student.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${getActivityStatus(student.lastActivity)}`}>
                          {student.lastActivity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={getProgressColor(student.totalProgress)}>{student.totalProgress}%</span>
                          </div>
                          <Progress value={student.totalProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            student.averageScore >= 90
                              ? "bg-green-100 text-green-700"
                              : student.averageScore >= 80
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.averageScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
