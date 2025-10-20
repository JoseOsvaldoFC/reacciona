"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UsuarioBrief {
  id: number
  nombre: string
  email: string
}

interface ModuloBrief {
  id: number
  titulo: string
}

interface Clase {
  id: number
  nombreClase: string
  descripcion: string
  idDocenteCreador: number
  nombreDocente: string
  alumnos: UsuarioBrief[]
  modulos: ModuloBrief[]
}

export default function CursosPage() {
  const { token, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [clases, setClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("http://localhost:8080/api/clases", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data: Clase[] = await res.json()
        setClases(data)
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "No se pudo cargar las clases")
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [token, isAuthenticated, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-600">Cargando clases...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">Gestión de Cursos</CardTitle>
            </div>
            <div>
              <Link href="/cursos/nuevo" passHref>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Crear Curso</Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700">Nombre de la Clase</th>
                    <th className="px-4 py-2 text-left text-gray-700">Descripción</th>
                    <th className="px-4 py-2 text-left text-gray-700">Docente</th>
                    <th className="px-4 py-2 text-left text-gray-700">Alumnos</th>
                    <th className="px-4 py-2 text-left text-gray-700">Módulos</th>
                    <th className="px-4 py-2 text-left text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clases.map((clase) => (
                    <tr key={clase.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{clase.nombreClase}</td>
                      <td className="px-4 py-2">{clase.descripcion}</td>
                      <td className="px-4 py-2">{clase.nombreDocente}</td>
                      <td className="px-4 py-2">{clase.alumnos?.length ?? 0}</td>
                      <td className="px-4 py-2">{clase.modulos?.length ?? 0}</td>
                      <td className="px-4 py-2">
                        <Link href={`/cursos/${clase.id}`} passHref>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Ver Detalles
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}