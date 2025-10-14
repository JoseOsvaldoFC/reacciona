"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Docente {
  id: number;
  nombre: string;
  email: string;
  rol: { idRol: number; nombreRol: string };
}

interface Modulo {
  id: number;
  titulo: string;
  descripcion: string;
  tipoEmergencia: string;
  nivelDificultad?: string;
  tiempoEstimado?: number;
}

interface Clase {
  id: number;
  nombreClase: string;
  descripcion: string;
  idDocenteCreador: number;
  alumnos: any[];
  modulos: any[];
}

interface Estudiante {
  id: number;
  nombre: string;
  email: string;
  rol: { idRol: number; nombreRol: string };
}

export default function GestionCursosPage() {
  const { token, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Paso actual
  const [step, setStep] = useState(1);

  // Paso 1: datos clase
  const [nombreClase, setNombreClase] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<number | null>(null);

  // Paso 2: módulos
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosSeleccionados, setModulosSeleccionados] = useState<number[]>([]);
  const [claseCreada, setClaseCreada] = useState<Clase | null>(null);

  // Paso 3: estudiantes
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);

  // Loader y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: obtener docentes
  useEffect(() => {
    if (!token || !isAuthenticated) return;
    fetch("http://localhost:8080/api/usuarios/rol/docentes", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setDocentes)
      .catch(() => setError("No se pudo cargar la lista de docentes"));
  }, [token, isAuthenticated]);

  // Paso 2: obtener módulos
  useEffect(() => {
    if (step !== 2 || !token) return;
    fetch("http://localhost:8080/api/modulos", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setModulos)
      .catch(() => setError("No se pudo cargar la lista de módulos"));
  }, [step, token]);

  // Paso 3: obtener estudiantes
  useEffect(() => {
    if (step !== 3 || !token) return;
    fetch("http://localhost:8080/api/usuarios/rol/estudiante/clase-empty", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setEstudiantes)
      .catch(() => setError("No se pudo cargar la lista de estudiantes"));
  }, [step, token]);

  // Crear clase (paso 1)
  const handleCrearClase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreClase || !descripcion || !docenteSeleccionado) {
      toast.error("Completa todos los campos y selecciona un docente.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/clases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreClase,
          descripcion,
          idDocenteCreador: docenteSeleccionado
        })
      });
      if (!res.ok) throw new Error("No se pudo crear la clase");
      const clase = await res.json();
      setClaseCreada(clase);
      setStep(2);
      toast.success("Clase creada correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al crear la clase");
    } finally {
      setLoading(false);
    }
  };

  // Asignar módulos (paso 2)
  const handleAsignarModulos = async () => {
    if (!claseCreada || modulosSeleccionados.length === 0) {
      toast.error("Selecciona al menos un módulo.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/clases/${claseCreada.id}/modulos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(modulosSeleccionados)
      });
      if (!res.ok) throw new Error("No se pudieron asignar los módulos");
      setStep(3);
      toast.success("Módulos asignados correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al asignar módulos");
    } finally {
      setLoading(false);
    }
  };

  // Asignar estudiantes (paso 3)
  const handleAsignarEstudiantes = async () => {
    if (!claseCreada || estudiantesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un estudiante.");
      return;
    }
    setLoading(true);
    try {
      // Llama al servicio para asignar estudiantes a la clase
      const res = await fetch(`http://localhost:8080/api/usuarios/${claseCreada.id}/asignar-clase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(estudiantesSeleccionados)
      });
      if (!res.ok) throw new Error("No se pudieron asignar los estudiantes");
      toast.success("Estudiantes asignados correctamente");
      router.push("/?token=" + token);
    } catch (err: any) {
      toast.error(err.message || "Error al asignar estudiantes");
    } finally {
      setLoading(false);
    }
  };

  // Render paso 1
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Gestión de Cursos</CardTitle>
            <CardDescription>Crear nueva clase - Paso 1</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCrearClase}>
              <div>
                <Label htmlFor="nombreClase">Nombre de la clase</Label>
                <Input
                  id="nombreClase"
                  value={nombreClase}
                  onChange={e => setNombreClase(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="docente">Docente</Label>
                <select
                  id="docente"
                  value={docenteSeleccionado ?? ""}
                  onChange={e => setDocenteSeleccionado(Number(e.target.value))}
                  required
                  className="border rounded px-2 py-2 w-full bg-gray-50"
                  disabled={loading}
                >
                  <option value="">Selecciona un docente</option>
                  {docentes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombre} ({doc.email})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading ? "Creando..." : "Crear clase"}
              </Button>
            </form>
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render paso 2
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Gestión de Cursos</CardTitle>
            <CardDescription>Selecciona módulos para la clase - Paso 2</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">Selecciona uno o más módulos:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {modulos.map(modulo => (
                <label key={modulo.id} className="flex items-center gap-2 border rounded p-3 bg-white shadow cursor-pointer">
                  <Checkbox
                    checked={modulosSeleccionados.includes(modulo.id)}
                    onCheckedChange={checked => {
                      setModulosSeleccionados(prev =>
                        checked
                          ? [...prev, modulo.id]
                          : prev.filter(id => id !== modulo.id)
                      );
                    }}
                  />
                  <div>
                    <div className="font-semibold">{modulo.titulo}</div>
                    <div className="text-sm text-gray-600">{modulo.descripcion}</div>
                  </div>
                </label>
              ))}
            </div>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={handleAsignarModulos}
              disabled={loading}
            >
              {loading ? "Asignando..." : "Asignar módulos y continuar"}
            </Button>
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render paso 3
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Gestión de Cursos</CardTitle>
            <CardDescription>Selecciona estudiantes para la clase - Paso 3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">Selecciona uno o más estudiantes:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {estudiantes.map(est => (
                <label key={est.id} className="flex items-center gap-2 border rounded p-3 bg-white shadow cursor-pointer">
                  <Checkbox
                    checked={estudiantesSeleccionados.includes(est.id)}
                    onCheckedChange={checked => {
                      setEstudiantesSeleccionados(prev =>
                        checked
                          ? [...prev, est.id]
                          : prev.filter(id => id !== est.id)
                      );
                    }}
                  />
                  <div>
                    <div className="font-semibold">{est.nombre}</div>
                    <div className="text-sm text-gray-600">{est.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={handleAsignarEstudiantes}
              disabled={loading}
            >
              {loading ? "Asignando..." : "Finalizar"}
            </Button>
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loader global
  return (
    <div className="flex h-screen items-center justify-center">
      <span className="text-gray-600">Cargando...</span>
    </div>
  );
}