"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, HelpCircle, Star, ArrowLeft, LayoutDashboard } from "lucide-react"

interface Usuario {
  idUsuario: number
  nombre: string
  email: string
  puntos: number
  idRol: number
}

const roles = [
  { value: 1, label: "Estudiante" },
  { value: 2, label: "Docente" },
  { value: 3, label: "Administrador" }
]

export default function GestionUsuariosPage() {
  const { user, token, isAuthenticated, isLoading, refetchUser } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.idRol !== 3) {
      router.push("/");
      return;
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!token || !user) return;
    setLoading(true);
    fetch(`http://localhost:8080/api/usuarios/all/${user.idUsuario}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la lista de usuarios");
        return res.json();
      })
      .then(data => setUsuarios(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, user]);

  const handleRolChange = async (idUsuario: number, nuevoRol: number) => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ idUsuario, idRol: nuevoRol })
      });
      if (!response.ok) {
        throw new Error("No se pudo actualizar el rol");
      }
      setUsuarios(usuarios =>
        usuarios.map(u =>
          u.idUsuario === idUsuario ? { ...u, idRol: nuevoRol } : u
        )
      );
    } catch (e) {
      alert("No se pudo actualizar el rol");
    }
  };

  // Filtrado dinámico por nombre
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl text-gray-900">Gestión de Usuarios</CardTitle>
              <Button
                variant="outline"
                size="sm"
                aria-label="Ir al dashboard"
                onClick={() => router.push(`/?token=${token}`)}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Ir al dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtro dinámico por nombre */}
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="filtro-nombre" className="text-gray-700 font-medium">Filtrar por nombre:</label>
              <input
                id="filtro-nombre"
                type="text"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                placeholder="Buscar usuario..."
                className="border px-3 py-2 rounded w-64 bg-gray-50 focus:outline-teal-500"
              />
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700">Nombre y Apellido</th>
                    <th className="px-4 py-2 text-left text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-gray-700">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.idUsuario} className="border-b">
                      <td className="px-4 py-2">{usuario.nombre}</td>
                      <td className="px-4 py-2">{usuario.email}</td>
                      <td className="px-4 py-2">
                        <select
                          value={usuario.idRol}
                          onChange={e => handleRolChange(usuario.idUsuario, Number(e.target.value))}
                          className="border rounded px-2 py-1 bg-gray-50"
                        >
                          {roles.map(rol => (
                            <option key={rol.value} value={rol.value}>{rol.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuariosFiltrados.length === 0 && (
                <div className="text-center text-gray-500 py-8">No hay usuarios para mostrar.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}