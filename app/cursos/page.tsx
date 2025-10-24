"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, Trash } from "lucide-react"

interface UsuarioBrief {
  id: number
  nombre: string
  email: string
}

interface ModuloBrief {
  id: number
  titulo: string
  descripcion: string
  tipoEmergencia: string
  nivelDificultad: string
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
  const [selectedAlumnos, setSelectedAlumnos] = useState<UsuarioBrief[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Estado para modal de módulos
  const [selectedModulos, setSelectedModulos] = useState<ModuloBrief[] | null>(null)
  const [modulosModalOpen, setModulosModalOpen] = useState(false)
  
  // Modal para eliminar alumno de una clase
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [claseToRemove, setClaseToRemove] = useState<Clase | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const openModulosModal = (modulos: ModuloBrief[] | undefined) => {
    setSelectedModulos(modulos ?? [])
    setModulosModalOpen(true)
  }
  const closeModulosModal = () => {
    setModulosModalOpen(false)
    setSelectedModulos(null)
  }

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

  const openAlumnosModal = (alumnos: UsuarioBrief[] | undefined) => {
    setSelectedAlumnos(alumnos ?? [])
    setModalOpen(true)
  }
  const closeAlumnosModal = () => {
    setModalOpen(false)
    setSelectedAlumnos(null)
  }

  const openRemoveModal = (clase: Clase) => {
    setClaseToRemove(clase)
    setRemoveError(null)
    setRemoveModalOpen(true)
  }
  const closeRemoveModal = () => {
    setRemoveModalOpen(false)
    setClaseToRemove(null)
    setRemoveError(null)
  }

  const handleRemoveAlumno = async (idAlumno: number) => {
    if (!token) return
    setRemoveLoading(true)
    setRemoveError(null)
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${idAlumno}/remove-clase`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)

      // actualizar estado local para mantener la posición en la UI
      setClases(prev =>
        prev.map(c =>
          c.id === claseToRemove?.id ? { ...c, alumnos: c.alumnos.filter(a => a.id !== idAlumno) } : c
        )
      )

      closeRemoveModal()
    } catch (err: any) {
      setRemoveError(err?.message || "Error al eliminar alumno")
    } finally {
      setRemoveLoading(false)
    }
  }

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
                    <th className="px-4 py-2 text-center text-gray-700">Alumnos</th>
                    <th className="px-4 py-2 text-center text-gray-700">Módulos</th>
                    <th className="px-4 py-2 text-center text-gray-700">Acciones con los Alumnos</th>
                  </tr>
                </thead>
                <tbody>
                  {clases.map((clase) => (
                    <tr key={clase.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{clase.nombreClase}</td>
                      <td className="px-4 py-2">{clase.descripcion}</td>
                      <td className="px-4 py-2">{clase.nombreDocente}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openAlumnosModal(clase.alumnos)}
                            className="text-sm text-teal-600 hover:underline"
                            aria-label={`Ver ${clase.alumnos?.length ?? 0} módulos`}
                          >
                            {clase.alumnos?.length ?? 0}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openModulosModal(clase.modulos)}
                            className="text-sm text-teal-600 hover:underline"
                            aria-label={`Ver ${clase.modulos?.length ?? 0} módulos`}
                          >
                            {clase.modulos?.length ?? 0}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/cursos/${clase.id}/agregar-alumnos`}
                            className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 focus:outline-none"
                            aria-label="Agregar alumnos"
                          >
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white">
                              <Plus className="w-4 h-4" />
                            </span>
                            <span className="font-medium">Agregar</span>
                          </Link>

                          <button
                            onClick={() => openRemoveModal(clase)}
                            aria-label="Quitar alumnos"
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none"
                          >
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white">
                              <Trash className="w-4 h-4" />
                            </span>
                            <span className="font-medium">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Alumnos */}
            {modalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
              >
                <div className="fixed inset-0 bg-black/40" onClick={closeAlumnosModal} />
                <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-lg font-medium">Alumnos</h3>
                    <button
                      onClick={closeAlumnosModal}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 max-h-80 overflow-auto">
                    {selectedAlumnos && selectedAlumnos.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedAlumnos.map(a => (
                          <li key={a.id} className="border rounded p-3 bg-gray-50">
                            <div className="font-medium">{a.nombre}</div>
                            <div className="text-sm text-gray-600">{a.email}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-600">No hay alumnos en esta clase.</div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t flex justify-end">
                    <Button onClick={closeAlumnosModal}>Cerrar</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Módulos */}
            {modulosModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
              >
                <div className="fixed inset-0 bg-black/40" onClick={closeModulosModal} />
                <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-lg font-medium">Módulos</h3>
                    <button
                      onClick={closeModulosModal}
                      className="text-gray-600 hover:text-gray-900"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 max-h-96 overflow-auto space-y-4">
                    {selectedModulos && selectedModulos.length > 0 ? (
                      <ul className="space-y-4">
                        {selectedModulos.map(m => (
                          <li key={m.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="pr-4">
                                <div className="text-base font-semibold text-gray-900">{m.titulo}</div>
                                {m.descripcion && (
                                  <div className="text-sm text-gray-600 mt-1">{m.descripcion}</div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-col items-end gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                  Tipo: <span className="ml-1 font-semibold">{m.tipoEmergencia}</span>
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                  Nivel: <span className="ml-1 font-semibold">{m.nivelDificultad ?? "N/A"}</span>
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-600">No hay módulos en esta clase.</div>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t flex justify-end">
                    <Button onClick={closeModulosModal}>Cerrar</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: eliminar alumno de la clase */}
            {removeModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
              >
                <div className="fixed inset-0 bg-black/40" onClick={closeRemoveModal} />
                <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-lg font-medium">Seleccione al alumno que desea eliminar de la clase</h3>
                    <button onClick={closeRemoveModal} className="text-gray-600 hover:text-gray-900" aria-label="Cerrar">✕</button>
                  </div>

                  <div className="p-4 max-h-80 overflow-auto">
                    {claseToRemove?.alumnos && claseToRemove.alumnos.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {claseToRemove.alumnos.map(a => (
                          <button
                            key={a.id}
                            onClick={() => handleRemoveAlumno(a.id)}
                            disabled={removeLoading}
                            className="inline-flex flex-col items-start gap-1 px-4 py-2 rounded-lg border bg-white hover:bg-red-50 text-left"
                          >
                            <span className="font-medium text-sm text-red-700">{a.nombre}</span>
                            <span className="text-xs text-gray-500">{a.email}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600">No hay alumnos en esta clase.</div>
                    )}
                    {removeError && <div className="text-sm text-red-600 mt-3">{removeError}</div>}
                  </div>

                  <div className="px-4 py-3 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={closeRemoveModal} disabled={removeLoading}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}