"use client"

import { useParams, useRouter } from "next/navigation"
import { useStudentDetails } from "@/hooks/useMonitoring"
import RoleProtectedRoute from "@/components/RoleProtectedRoute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Download
} from "lucide-react"

function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = parseInt(params.id as string)

  const { studentDetails, loading, error, refreshDetails } = useStudentDetails(studentId)

  const handleExportStudentReport = () => {
    if (!studentDetails) return;

    // Generar el contenido del reporte en CSV
    const csvContent = generateStudentReportCSV(studentDetails);
    
    // Crear el archivo y descargarlo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${studentDetails.student.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateStudentReportCSV = (details: any) => {
    const lines = [];
    
    // Encabezado del reporte
    lines.push('REPORTE DE PROGRESO INDIVIDUAL');
    lines.push('');
    lines.push(`Estudiante:,${details.student.nombre}`);
    lines.push(`Email:,${details.student.email}`);
    lines.push(`Fecha de generación:,${new Date().toLocaleDateString('es-ES')}`);
    lines.push('');
    
    // Resumen general
    lines.push('RESUMEN GENERAL');
    lines.push(`Progreso Total:,${details.overallProgress.totalProgress}%`);
    lines.push(`Módulos Completados:,${details.overallProgress.completedModules} de ${details.overallProgress.totalModules}`);
    lines.push(`Puntaje Total:,${details.overallProgress.totalScore}`);
    lines.push(`Puntaje Promedio:,${Math.round(details.overallProgress.averageScore)}`);
    lines.push(`Tiempo Invertido (min):,${details.overallProgress.totalTimeSpent}`);
    lines.push(`Logros Obtenidos:,${details.overallProgress.achievementsCount}`);
    lines.push('');
    
    // Progreso por módulo
    lines.push('PROGRESO POR MÓDULO');
    lines.push('Módulo,Tipo,Estado,Progreso (%),Pasos Completados,Pasos Totales,Puntaje,Intentos,Último Acceso');
    details.moduleProgress.forEach((module: any) => {
      const status = module.status === 'COMPLETED' ? 'Completado' : 
                     module.status === 'IN_PROGRESS' ? 'En Progreso' : 'No Iniciado';
      const lastAccess = module.lastAccessed ? new Date(module.lastAccessed).toLocaleDateString('es-ES') : 'Nunca';
      lines.push(`"${module.titulo}","${module.tipoEmergencia}",${status},${module.porcentaje},${module.pasosCompletados},${module.pasosTotales},${module.puntajeTotal},${module.attempts},${lastAccess}`);
    });
    lines.push('');
    
    // Actividad reciente
    lines.push('ACTIVIDAD RECIENTE');
    lines.push('Fecha,Tipo,Descripción,Módulo,Puntaje');
    details.recentActivity.slice(0, 20).forEach((activity: any) => {
      const fecha = new Date(activity.fecha).toLocaleString('es-ES');
      lines.push(`"${fecha}","${activity.tipo}","${activity.descripcion}","${activity.moduloTitulo || 'N/A'}",${activity.puntajeObtenido || 0}`);
    });
    
    return lines.join('\n');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700'
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getModuleStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completado'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'NOT_STARTED': return 'No Iniciado'
      default: return 'Desconocido'
    }
  }

  const getActivityTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'MODULE_START': return <BookOpen className="w-4 h-4" />
      case 'MODULE_COMPLETE': return <Trophy className="w-4 h-4" />
      case 'STEP_COMPLETE': return <Activity className="w-4 h-4" />
      case 'ACHIEVEMENT_EARNED': return <Trophy className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Cargando detalles del estudiante...</p>
        </div>
      </div>
    )
  }

  if (error || !studentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Estudiante no encontrado'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">
              Progreso de {studentDetails.student.nombre}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshDetails}
              variant="outline"
              disabled={loading}
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              onClick={handleExportStudentReport}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              disabled={!studentDetails}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Student Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                  {getStudentInitials(studentDetails.student.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {studentDetails.student.nombre}
                </CardTitle>
                <CardDescription className="text-base">
                  {studentDetails.student.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Progreso General</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {studentDetails.overallProgress.totalProgress}%
              </div>
              <p className="text-xs text-gray-500">
                {studentDetails.overallProgress.completedModules} de {studentDetails.overallProgress.totalModules} módulos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Puntaje Total</CardTitle>
              <Trophy className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {studentDetails.overallProgress.totalScore}
              </div>
              <p className="text-xs text-gray-500">
                Promedio: {Math.round(studentDetails.overallProgress.averageScore)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tiempo Invertido</CardTitle>
              <Clock className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(studentDetails.overallProgress.totalTimeSpent / 60)}h
              </div>
              <p className="text-xs text-gray-500">
                {studentDetails.overallProgress.totalTimeSpent} minutos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Logros</CardTitle>
              <Trophy className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {studentDetails.overallProgress.achievementsCount}
              </div>
              <p className="text-xs text-gray-500">Obtenidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Progress */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Progreso por Módulo</CardTitle>
            <CardDescription>Detalles del avance en cada módulo del curso</CardDescription>
          </CardHeader>
          <CardContent>
            {studentDetails.moduleProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                El estudiante aún no ha comenzado ningún módulo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Intentos</TableHead>
                      <TableHead>Último Acceso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentDetails.moduleProgress.map((module) => (
                      <TableRow key={module.moduleId}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm font-medium">{module.titulo}</div>
                            <div className="text-xs text-gray-500">{module.tipoEmergencia}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getModuleStatusColor(module.status)}
                          >
                            {getModuleStatusText(module.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-sm">
                              <span className={getProgressColor(module.porcentaje)}>
                                {module.porcentaje}%
                              </span>
                              <span className="text-gray-500">
                                {module.pasosCompletados}/{module.pasosTotales}
                              </span>
                            </div>
                            <Progress value={module.porcentaje} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{module.puntajeTotal}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{module.attempts}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {module.lastAccessed ? formatDate(module.lastAccessed) : 'Nunca'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas por el estudiante</CardDescription>
          </CardHeader>
          <CardContent>
            {studentDetails.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay actividad reciente registrada.
              </div>
            ) : (
              <div className="space-y-4">
                {studentDetails.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                      {getActivityTypeIcon(activity.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.descripcion}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.fecha)}
                        </span>
                      </div>
                      {activity.moduloTitulo && (
                        <p className="text-xs text-gray-600">
                          Módulo: {activity.moduloTitulo}
                        </p>
                      )}
                      {activity.puntajeObtenido && (
                        <p className="text-xs text-teal-600">
                          +{activity.puntajeObtenido} puntos
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ProtectedStudentDetailPage() {
  return (
    <RoleProtectedRoute allowedRoles={[2, 3]}>
      <StudentDetailPage />
    </RoleProtectedRoute>
  )
}