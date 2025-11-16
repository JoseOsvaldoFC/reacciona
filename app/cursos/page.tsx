"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import RoleProtectedRoute from "@/components/RoleProtectedRoute"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, Trash, ArrowLeft } from "lucide-react"
import { HeartPulse, Users, Leaf } from "lucide-react"

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

// Mapeo para que coincida con los datos del backend ("Médica", "Social", etc.)
const categoryDetails: { [key: string]: { icon: any, color: string, plural: string } } = {
  "MEDICA": { icon: HeartPulse, color: "bg-red-100 text-red-700", plural: "Médicas" },
  "SOCIAL": { icon: Users, color: "bg-blue-100 text-blue-700", plural: "Sociales" },
  "AMBIENTAL": { icon: Leaf, color: "bg-green-100 text-green-700", plural: "Ambientales" },
}
const defaultCategory = { icon: Users, color: "bg-gray-100 text-gray-800", plural: "Otros" }

function CursosPageInner() {
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
  
  const [modulesAddOpen, setModulesAddOpen] = useState(false)
  const [claseForModules, setClaseForModules] = useState<Clase | null>(null)
  const [modulesAvailable, setModulesAvailable] = useState<ModuloBrief[]>([])
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [modulesError, setModulesError] = useState<string | null>(null)

  // Modal para eliminar alumno de una clase
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [claseToRemove, setClaseToRemove] = useState<Clase | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  // Modal para agregar alumnos
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [claseToAdd, setClaseToAdd] = useState<Clase | null>(null)
  const [availableStudents, setAvailableStudents] = useState<UsuarioBrief[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableError, setAvailableError] = useState<string | null>(null)
  
  const openModulosModal = (clase?: Clase) => {
    // abre modal de lectura con los módulos (puede estar vacío)
    setSelectedModulos(clase?.modulos ?? [])
    setClaseForModules(clase ?? null)
    setModulosModalOpen(true)
  }
  const closeModulosModal = () => {
    setModulosModalOpen(false)
    setSelectedModulos(null)
  }


const openModulesAddModal = async (clase: Clase | null) => {
    if (!clase) return
    setClaseForModules(clase)
    setModulesAvailable([])
    setSelectedModuleIds([])
    setModulesError(null)
    setModulesAddOpen(true)
    if (!token) return
    setModulesLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/modulos", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: ModuloBrief[] = await res.json()
      setModulesAvailable(data)
    } catch (err: any) {
      setModulesError(err?.message || "No se pudieron cargar los módulos")
    } finally {
      setModulesLoading(false)
    }
  }
  const closeModulesAddModal = () => {
    setModulesAddOpen(false)
    setClaseForModules(null)
    setModulesAvailable([])
    setSelectedModuleIds([])
    setModulesError(null)
  }
  const toggleSelectModule = (id: number) => {
    setSelectedModuleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const handleAssignModulesToClass = async () => {
    if (!token || !claseForModules) return
    if (selectedModuleIds.length === 0) return closeModulesAddModal()
    setModulesLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/api/clases/${claseForModules.id}/modulos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedModuleIds)
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const added = modulesAvailable.filter(m => selectedModuleIds.includes(m.id))
      setClases(prev => prev.map(c => c.id === claseForModules.id ? { ...c, modulos: [...(c.modulos ?? []), ...added] } : c))
      closeModulesAddModal()
      closeModulosModal()
    } catch (err: any) {
      setModulesError(err?.message || "Error al asignar módulos")
    } finally {
      setModulesLoading(false)
    }
  }


  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    // Sólo administrador
    if ((window as any).CURRENT_USER_ROLE && (window as any).CURRENT_USER_ROLE !== 3) {
      router.push('/admin')
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

  const openAddModal = async (clase: Clase) => {
    setClaseToAdd(clase)
    setAvailableStudents([])
    setSelectedStudentIds([])
    setAvailableError(null)
    setAddModalOpen(true)
    if (!token) return
    setAvailableLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/usuarios/rol/estudiante/clase-empty", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      // map backend response to UsuarioBrief {id,nombre,email}
      const students: UsuarioBrief[] = data.map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.username ?? u.email
      }))
      setAvailableStudents(students)
    } catch (err: any) {
      setAvailableError(err?.message || "No se pudo cargar alumnos disponibles")
    } finally {
      setAvailableLoading(false)
    }
  }
  const closeAddModal = () => {
    setAddModalOpen(false)
    setClaseToAdd(null)
    setAvailableStudents([])
    setSelectedStudentIds([])
    setAvailableError(null)
  }

  const toggleSelectStudent = (id: number) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
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

  const handleAssignStudents = async () => {
    if (!token || !claseToAdd) return
    if (selectedStudentIds.length === 0) return closeAddModal()
    setAddLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${claseToAdd.id}/asignar-clase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedStudentIds)
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)

      // actualizar estado local: agregar alumnos seleccionados a la clase
      const added = availableStudents.filter(s => selectedStudentIds.includes(s.id))
      setClases(prev =>
        prev.map(c => c.id === claseToAdd.id ? { ...c, alumnos: [...c.alumnos, ...added] } : c)
      )
      closeAddModal()
    } catch (err: any) {
      setAvailableError(err?.message || "Error al agregar alumnos")
    } finally {
      setAddLoading(false)
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
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-1 hover:bg-teal-50"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700" />
            <span className="text-sm font-medium text-teal-700">Volver al Panel</span>
          </Button>
        </div>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl text-gray-900 break-words">Gestión de Cursos</CardTitle>
            </div>
            <div>
              <Link href="/cursos/nuevo" passHref>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto text-sm sm:text-base">Crear Curso</Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {error && <div className="text-xs sm:text-sm text-red-600 mb-4 break-words">{error}</div>}

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 min-w-[120px]">Nombre de la Clase</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 min-w-[150px]">Descripción</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 min-w-[120px]">Docente</th>
                    <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm text-gray-700 min-w-[80px]">Alumnos</th>
                    <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm text-gray-700 min-w-[80px]">Módulos</th>
                    <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm text-gray-700 min-w-[140px]">Acciones con los alumnos</th>
                  </tr>
                </thead>
                <tbody>
                  {clases.map((clase) => (
                    <tr key={clase.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">{clase.nombreClase}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words max-w-[200px] truncate">{clase.descripcion}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">{clase.nombreDocente}</td>
                      <td className="px-2 sm:px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openAlumnosModal(clase.alumnos)}
                            className="text-xs sm:text-sm text-teal-600 hover:underline whitespace-nowrap"
                            aria-label={`Ver ${clase.alumnos?.length ?? 0} módulos`}
                          >
                            {clase.alumnos?.length ?? 0}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openModulosModal(clase)}
                            className="text-xs sm:text-sm text-teal-600 hover:underline whitespace-nowrap"
                            aria-label={`Ver ${clase.modulos?.length ?? 0} módulos`}
                          >
                            {clase.modulos?.length ?? 0}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button
                            onClick={() => openAddModal(clase)}
                            className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 focus:outline-none"
                            aria-label="Agregar alumnos"
                          >
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white">
                              <Plus className="w-4 h-4" />
                            </span>
                            <span className="font-medium">Agregar</span>
                          </button>

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
                                {(() => {
                                  const details = categoryDetails[m.tipoEmergencia] ?? defaultCategory
                                  const Icon = details.icon
                                  return (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${details.color}`}>
                                      <Icon className="w-4 h-4 mr-2" />
                                      {m.tipoEmergencia}
                                    </span>
                                  )
                                })()}
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                  Nivel: <span className="ml-1 font-semibold">{m.nivelDificultad ?? "N/A"}</span>
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            // abrir modal de asignación (carga módulos disponibles)
                            closeModulosModal()
                            openModulesAddModal(claseForModules)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none"
                        >
                          <span className="font-medium">0 módulos - Agregar</span>
                        </button>
                      </div>
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

            {/* Modal: agregar alumnos a la clase */}
            {addModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-black/40" onClick={closeAddModal} />
                <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-lg font-medium">Seleccione los alumnos que desea incorporar a la clase</h3>
                    <button onClick={closeAddModal} className="text-gray-600 hover:text-gray-900" aria-label="Cerrar">✕</button>
                  </div>
                  <div className="p-4 max-h-96 overflow-auto">
                    {availableLoading ? (
                      <div className="text-gray-600">Cargando alumnos...</div>
                    ) : availableError ? (
                      <div className="text-red-600">{availableError}</div>
                    ) : availableStudents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableStudents.map(s => {
                          const selected = selectedStudentIds.includes(s.id)
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleSelectStudent(s.id)}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${selected ? "bg-teal-50 border-teal-300" : "bg-white hover:bg-gray-50"}`}
                            >
                              <div className={`w-5 h-5 rounded-full flex-shrink-0 ${selected ? "bg-teal-600" : "bg-gray-200"}`} />
                              <div className="text-left">
                                <div className="font-medium text-sm">{s.nombre}</div>
                                <div className="text-xs text-gray-500">{s.email}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-600">No hay alumnos disponibles.</div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={closeAddModal} disabled={addLoading}>Cancelar</Button>
                    <Button onClick={handleAssignStudents} disabled={addLoading || selectedStudentIds.length === 0}>
                      {addLoading ? "Agregando..." : "Agregar"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: asignar módulos a la clase (UI similar al paso 2 de nuevo/page.tsx) */}
            {modulesAddOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-black/40" onClick={closeModulesAddModal} />
                <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-lg font-medium">Seleccione módulos para la clase</h3>
                    <button onClick={closeModulesAddModal} className="text-gray-600 hover:text-gray-900" aria-label="Cerrar">✕</button>
                  </div>
                  <div className="p-4 max-h-96 overflow-auto">
                    {modulesLoading ? (
                      <div className="text-gray-600">Cargando módulos...</div>
                    ) : modulesError ? (
                      <div className="text-red-600">{modulesError}</div>
                    ) : modulesAvailable.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {modulesAvailable.map(modulo => {
                          const selected = selectedModuleIds.includes(modulo.id)
                          const details = categoryDetails[modulo.tipoEmergencia] ?? defaultCategory
                          const Icon = details.icon
                          return (
                            <label key={modulo.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selected ? "bg-teal-50 border-teal-300" : "bg-white hover:bg-gray-50"}`}>
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="mt-1"
                                onClick={() => toggleSelectModule(modulo.id)}
                              />
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm">{modulo.titulo}</div>
                                <div className="text-xs text-gray-500">{modulo.descripcion}</div>
                                {modulo.tipoEmergencia && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${details.color}`}>
                                      <Icon className="w-4 h-4" />
                                      {modulo.tipoEmergencia}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 ml-2">
                                      Nivel: <span className="ml-1 font-semibold">{modulo.nivelDificultad ?? "N/A"}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-600">No hay módulos disponibles.</div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={closeModulesAddModal} disabled={modulesLoading}>Cancelar</Button>
                    <Button onClick={handleAssignModulesToClass} disabled={modulesLoading || selectedModuleIds.length === 0}>
                      {modulesLoading ? "Agregando..." : "Agregar módulos"}
                    </Button>
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

export default function CursosPage() {
  return (
    <RoleProtectedRoute allowedRoles={[3]}>
      <CursosPageInner />
    </RoleProtectedRoute>
  )
}