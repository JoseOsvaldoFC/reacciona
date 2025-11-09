"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RefreshCw, ShieldAlert } from "lucide-react"

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
  const [denied, setDenied] = useState(false)
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
      // Mostrar estado de acceso denegado por 1 segundo antes de redirigir
      setDenied(true)
      const timeout = setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          if (userRole === 1) {
            router.push('/')
          } else if (userRole === 2) {
            router.push('/teacher')
          } else if (userRole === 3) {
            router.push('/admin')
          } else {
            router.push('/login')
          }
        }
      }, 1000)
      return () => clearTimeout(timeout)
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
    return denied ? (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-red-700 mb-1">Acceso denegado</h2>
          <p className="text-sm text-red-600">No tienes permisos para esta sección. Redirigiendo...</p>
        </div>
      </div>
    ) : null
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}
