"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: number[] // Array de roles permitidos (1=Estudiante, 2=Docente, 3=Admin)
  redirectTo?: string // Ruta a donde redirigir si no tiene el rol correcto
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo 
}: RoleProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si está cargando, no hacer nada todavía
    if (isLoading) return

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // Obtener el rol del usuario
    const userRole = user.idRol || (user as any).rol?.idRol

    // Si el usuario no tiene un rol permitido
    if (!allowedRoles.includes(userRole)) {
      // Redirigir según el rol del usuario
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        // Redirección automática según rol
        if (userRole === 1) {
          // Estudiante -> Dashboard de estudiante
          router.push('/')
        } else if (userRole === 2) {
          // Docente -> Dashboard de profesor
          router.push('/teacher')
        } else if (userRole === 3) {
          // Administrador -> Dashboard de admin (o principal)
          router.push('/')
        } else {
          // Rol desconocido -> Login
          router.push('/login')
        }
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo, router])

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado o no tiene el rol correcto, no mostrar nada
  // (el useEffect ya está manejando la redirección)
  if (!isAuthenticated || !user) {
    return null
  }

  const userRole = user.idRol || (user as any).rol?.idRol
  if (!allowedRoles.includes(userRole)) {
    return null
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}
