"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'
import RoleProtectedRoute from "@/components/RoleProtectedRoute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  ChevronDown, 
  HelpCircle, 
  Users, 
  GraduationCap, 
  BarChart3
} from "lucide-react"
import Link from 'next/link'

function AdminDashboard() {
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [usuariosTotales, setUsuariosTotales] = useState<number | null>(null)
  const [clasesTotales, setClasesTotales] = useState<number | null>(null)
  const [modulosTotales, setModulosTotales] = useState<number | null>(null)
  const [progresoGlobal, setProgresoGlobal] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState<boolean>(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    // Cuando ya tenemos usuario autenticado, cargar métricas
    if (user) {
      fetchStats()
    }
  }, [isLoading, isAuthenticated, router])

  const fetchStats = async () => {
    if (!user) return
    try {
      setLoadingStats(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const token = localStorage.getItem('jwt_token')
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      const [usuariosRes, clasesRes, modulosRes] = await Promise.all([
        fetch(`${apiUrl}/api/usuarios/all/${user.idUsuario}`, { headers }),
        fetch(`${apiUrl}/api/clases`, { headers }),
        fetch(`${apiUrl}/api/modulos`, { headers }),
      ])

      let usuariosData: any[] = []
      if (usuariosRes.ok) {
        usuariosData = await usuariosRes.json()
        const filtrados = Array.isArray(usuariosData) ? usuariosData.filter((u: any) => u.idRol !== 3) : []
        setUsuariosTotales(filtrados.length)
      } else {
        setUsuariosTotales(null)
      }

      if (clasesRes.ok) {
        const clasesData = await clasesRes.json()
        setClasesTotales(Array.isArray(clasesData) ? clasesData.length : 0)
      } else {
        setClasesTotales(null)
      }

      if (modulosRes.ok) {
        const modulosData = await modulosRes.json()
        setModulosTotales(Array.isArray(modulosData) ? modulosData.length : 0)
      } else {
        setModulosTotales(null)
      }

      // Progreso Global: ahora se obtiene directamente desde el endpoint unificado de monitoreo
      // para que coincida exactamente con la fórmula usada en el dashboard de teacher (averageProgress)
      try {
        const globalStatsRes = await fetch(`${apiUrl}/api/monitoring/all-students/statistics`, { headers })
        if (globalStatsRes.ok) {
          const globalStats = await globalStatsRes.json()
          // averageProgress ya viene redondeado en backend
          setProgresoGlobal(typeof globalStats.averageProgress === 'number' ? globalStats.averageProgress : 0)
        } else {
          setProgresoGlobal(null)
        }
      } catch (err) {
        console.warn('No se pudo obtener estadísticas globales', err)
        setProgresoGlobal(null)
      }
    } catch (e) {
      console.error('Error cargando métricas del dashboard', e)
      setUsuariosTotales(null)
      setClasesTotales(null)
      setModulosTotales(null)
      setProgresoGlobal(null)
    } finally {
      setLoadingStats(false)
    }
  }

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/Logo.jpeg" alt="Reacciona" />
              <AvatarFallback className="bg-teal-600 text-white">R</AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900">Reacciona</h1>
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
                <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-teal-100 group">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-teal-100 text-teal-800">
                      {user.nombre.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/profile" passHref>
                  <DropdownMenuItem className="dropdown-menu__item">Mi Perfil</DropdownMenuItem>
                </Link>
                <Link href="/usuarios" passHref>
                  <DropdownMenuItem className="dropdown-menu__item">Modificar Roles</DropdownMenuItem>
                </Link>
                <Link href="/cursos" passHref>
                  <DropdownMenuItem className="dropdown-menu__item">Gestión Cursos</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onSelect={logout} className="dropdown-menu__item">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Panel de Administración</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">Gestiona usuarios, cursos y monitorea el sistema.</p>
        </div>

        {/* Management Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gestión de Usuarios */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base text-gray-900 break-words">Gestión de Usuarios</CardTitle>
                  <CardDescription className="text-sm break-words">Administra roles y permisos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/usuarios" passHref>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Ir a Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gestión de Cursos */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-green-700" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base text-gray-900 break-words">Gestión de Cursos</CardTitle>
                  <CardDescription className="text-sm break-words">Administra clases y asignaciones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/cursos" passHref>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Ir a Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Monitoreo de Progreso */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base text-gray-900 break-words">Monitoreo Global</CardTitle>
                  <CardDescription className="text-sm break-words">Visualiza estadísticas del sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/teacher" passHref>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Ver Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 break-words">Acceso Rápido</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Usuarios Totales (excluye administradores) */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-teal-600 break-words">{usuariosTotales !== null ? usuariosTotales : '-'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Usuarios Totales</p>
                  {loadingStats && <p className="text-xs text-gray-400 mt-1">Cargando...</p>}
                </div>
              </CardContent>
            </Card>
            {/* Clases Totales */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-teal-600 break-words">{clasesTotales !== null ? clasesTotales : '-'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Clases Totales</p>
                  {loadingStats && <p className="text-xs text-gray-400 mt-1">Cargando...</p>}
                </div>
              </CardContent>
            </Card>
            {/* Módulos Totales */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-teal-600 break-words">{modulosTotales !== null ? modulosTotales : '-'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Módulos</p>
                  {loadingStats && <p className="text-xs text-gray-400 mt-1">Cargando...</p>}
                </div>
              </CardContent>
            </Card>
            {/* Progreso Global (promedio porcentaje progreso estudiantes) */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-teal-600 break-words">{progresoGlobal !== null ? `${progresoGlobal}%` : '-'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Progreso Global</p>
                  {loadingStats && <p className="text-xs text-gray-400 mt-1">Cargando...</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProtectedAdminDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={[3]}>
      <AdminDashboard />
    </RoleProtectedRoute>
  )
}
