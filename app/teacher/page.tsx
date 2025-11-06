"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useMonitoring } from "@/hooks/useMonitoring"
import { useTeacherClasses } from "@/hooks/useTeacherClasses"
import RoleProtectedRoute from "@/components/RoleProtectedRoute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, AlertTriangle, ChevronDown, Eye, RefreshCw, Filter, Calendar, Download, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function TeacherDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  // Obtener las clases del profesor
  const { classes, loading: classesLoading, error: classesError } = useTeacherClasses();
  
  // Usar el hook de monitoreo con el grupo seleccionado
  const { 
    groupStats, 
    students, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    refreshData,
    exportGroupData
  } = useMonitoring(selectedClass ? parseInt(selectedClass) : undefined);

  // Seleccionar la primera clase disponible automáticamente
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id.toString());
    }
  }, [classes, selectedClass]);

  const handleViewStudentDetails = (studentId: number) => {
    router.push(`/monitor-progress/student/${studentId}`);
  };

  const handleSortChange = (field: 'name' | 'progress' | 'score' | 'lastActivity') => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };

  const handleExportData = async () => {
    if (exportGroupData && selectedClass) {
      await exportGroupData(parseInt(selectedClass));
    }
  };

  const handleStatusFilter = (status: 'active' | 'inactive' | 'at-risk' | 'all') => {
    updateFilters({ status });
  };

  const handleDateFilter = (dateFrom?: string, dateTo?: string) => {
    updateFilters({ dateFrom, dateTo });
  };

  const clearFilters = () => {
    updateFilters({ 
      dateFrom: undefined, 
      dateTo: undefined, 
      moduleId: undefined, 
      status: 'all' 
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getActivityStatus = (activity: string) => {
    if (activity.includes("hora") || activity.includes("minutos")) return "text-green-600"
    if (activity.includes("1 día") || activity.includes("2 días")) return "text-amber-600"
    return "text-red-600"
  }

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'at-risk': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if ((loading && !groupStats) || classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">
            {classesLoading ? "Cargando clases..." : "Cargando datos del grupo..."}
          </p>
        </div>
      </div>
    );
  }

  // Si no hay clases asignadas
  if (!classesLoading && classes.length === 0) {
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
                <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-teal-50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').toUpperCase() : 'PR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.nombre ? user.nombre : 'Profesor'}
                    </p>
                    <p className="text-xs text-gray-500">Docente</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => router.push('/profile')}
                  className="hover:bg-teal-100 hover:text-teal-700 focus:bg-teal-100 focus:text-teal-700 cursor-pointer"
                >
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={logout}
                  className="hover:bg-teal-100 hover:text-teal-700 focus:bg-teal-100 focus:text-teal-700 cursor-pointer"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* No Classes Message */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes clases asignadas</h3>
              <p className="text-gray-600 mb-4">
                Contacta al administrador para que te asigne clases o crea una nueva clase.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
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

          <div className="flex items-center space-x-2">
            <Link href="/help" passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ayuda"
                className="hover:bg-teal-100 group"
              >
                <HelpCircle className="w-6 h-6 text-gray-900 group-hover:text-teal-950 transition-colors" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-teal-50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').toUpperCase() : 'PR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.nombre ? user.nombre : 'Profesor'}
                    </p>
                    <p className="text-xs text-gray-500">Docente</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => router.push('/profile')}
                  className="hover:bg-teal-100 hover:text-teal-700 focus:bg-teal-100 focus:text-teal-700 cursor-pointer"
                >
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={logout}
                  className="hover:bg-teal-100 hover:text-teal-700 focus:bg-teal-100 focus:text-teal-700 cursor-pointer"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Class Selector and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Monitoreo de Estudiantes</h2>
            {classesLoading ? (
              <div className="w-48 h-10 bg-gray-200 animate-pulse rounded"></div>
            ) : classes.length > 0 ? (
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleccionar clase" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-gray-500">No tienes clases asignadas</div>
            )}
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            )}
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={refreshData}
              variant="outline"
              disabled={loading}
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              onClick={handleExportData}
              variant="outline"
              disabled={loading || !students.length}
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {(error || classesError) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error || classesError}</p>
            </CardContent>
          </Card>
        )}

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
                      strokeDasharray={`${groupStats?.averageProgress || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{groupStats?.averageProgress || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{groupStats?.averageProgress || 0}%</p>
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
                {groupStats?.activeStudents || 0} / {groupStats?.totalStudents || 0}
              </div>
              <p className="text-xs text-gray-500">
                {groupStats?.totalStudents ? 
                  Math.round((groupStats.activeStudents / groupStats.totalStudents) * 100) : 0}% de
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
              <div className="text-lg font-bold text-gray-900">
                {groupStats?.mostDifficultModule?.titulo || 'No disponible'}
              </div>
              <p className="text-xs text-gray-500">Requiere atención adicional</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Progress Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg text-gray-900">Progreso de Estudiantes</CardTitle>
                <CardDescription>Monitoreo detallado del progreso de cada estudiante</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros Avanzados
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateFrom">Fecha desde</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={filters.dateFrom || ''}
                          onChange={(e) => handleDateFilter(e.target.value, filters.dateTo)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateTo">Fecha hasta</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={filters.dateTo || ''}
                          onChange={(e) => handleDateFilter(filters.dateFrom, e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearFilters}
                          className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                        >
                          Limpiar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={refreshData}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleStatusFilter(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="at-risk">En Riesgo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron estudiantes para este grupo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSortChange('name')}
                          className="p-0 h-auto font-medium"
                        >
                          Estudiante
                          {filters.sortBy === 'name' && (
                            <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSortChange('lastActivity')}
                          className="p-0 h-auto font-medium"
                        >
                          Última Actividad
                          {filters.sortBy === 'lastActivity' && (
                            <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSortChange('progress')}
                          className="p-0 h-auto font-medium"
                        >
                          Progreso Total
                          {filters.sortBy === 'progress' && (
                            <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSortChange('score')}
                          className="p-0 h-auto font-medium"
                        >
                          Puntaje Total
                          {filters.sortBy === 'score' && (
                            <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Estado</TableHead>
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
                                {getStudentInitials(student.nombre)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{student.nombre}</span>
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
                            {Math.round(student.averageScore)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeColor(student.status)}
                          >
                            {student.status === 'active' ? 'Activo' : 
                             student.status === 'inactive' ? 'Inactivo' : 
                             'En Riesgo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => handleViewStudentDetails(student.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ProtectedTeacherDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={[2, 3]}>
      <TeacherDashboard />
    </RoleProtectedRoute>
  )
}
