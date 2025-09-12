"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HeartPulse, Users, Leaf, Star, Trophy, Award, Target, Shield, ChevronDown, Play, HelpCircle } from "lucide-react"
import Link from 'next/link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"


// Definimos un "tipo" para el Módulo, para que coincida con nuestro backend
interface Module {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  categoryColor: string;
  nivelDificultad?: string;
  tiempoEstimado?: number;
  contenidos?: {
    id: number;
    titulo: string;
    tipoContenido: string;
    urlRecurso: string;
    cuerpo: string;
    orden: number;
  }[];
}


// Mapeo para que coincida con los datos del backend ("Médica", "Social", etc.)
const categoryDetails: { [key: string]: { icon: React.ElementType, color: string, plural: string } } = {
  "MEDICA": { icon: HeartPulse, color: "bg-red-100 text-red-700", plural: "Médicas" },
  "SOCIAL": { icon: Users, color: "bg-blue-100 text-blue-700", plural: "Sociales" },
  "AMBIENTAL": { icon: Leaf, color: "bg-green-100 text-green-700", plural: "Ambientales" },
};



export default function StudentDashboard() {

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const {  isAuthenticated, user, token, isLoading, logout} = useAuth();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("Todos")
  // Creamos un estado para guardar los módulos que vienen de la API
  const [modules, setModules] = useState<Module[]>([])

  // useEffect para manejar la lógica de autenticación y carga de datos
  useEffect(() => {
    // Mientras el contexto está cargando el estado inicial, no hacemos nada.
    if (isLoading) {
      return;
    }

    // Una vez que la carga termina, si el usuario NO está autenticado, lo redirigimos.
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Si está autenticado, procedemos a cargar los módulos
    if (isAuthenticated && token) {
      fetch('http://localhost:8080/api/modulos',{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.status === 403) { // token invalido
          logout(); // se cierra la sesión
          return Promise.reject(new Error('Token inválido o expirado.'));
        }
        if (!response.ok) {
          throw new Error('No se pudieron cargar los módulos.');
        }
        return response.json();
      })
      .then(data => {
        const formattedModules = data.map((mod: any) => ({
          id: mod.id,
          title: mod.titulo,
          description: mod.descripcion,
          category: mod.tipoEmergencia,
          icon: categoryDetails[mod.tipoEmergencia]?.icon || Shield,
          categoryColor: categoryDetails[mod.tipoEmergencia]?.color || "bg-gray-100 text-gray-700",
          nivelDificultad: mod.nivelDificultad,
          tiempoEstimado: mod.tiempoEstimado,
          contenidos: mod.contenidos
        }));
          setModules(formattedModules);
        })
        .catch(error => console.error("Error al cargar los módulos:", error));
      }
  }, [ isLoading, isAuthenticated, token, router, logout]); // Se ejecuta cada vez que cambia el estado de autenticación


  // Se muestra mientras el AuthContext está verificando el token y cargando los datos del usuario.
  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }
  
  // GENERAMOS las categorías para los botones a partir del mapeo
  // Así aseguramos que siempre estén sincronizados.
  const categories = [
    { name: "Todos" },
    ...Object.entries(categoryDetails).map(([key, value]) => ({ name: value.plural, original: key }))
  ];

    // la lógica de filtrado
  const filteredModules = selectedCategory === "Todos" 
    ? modules 
    : modules.filter((module) => {
        const categoryInfo = categories.find(c => c.name === selectedCategory);
        return module.category === categoryInfo?.original;
      });

  const achievements = [
    { icon: Trophy, name: "Primera Lección" },
    { icon: Star, name: "Nivel 5" },
    { icon: Award, name: "Experto en RCP" },
    { icon: Target, name: "Meta Semanal" },
    { icon: HeartPulse, name: "Héroe Médico" },
  ]


  // El JSX de retorno queda casi igual, solo que ahora `modules` y `filteredModules` 
  // contendrán los datos de la API en lugar de los datos de prueba.
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
                    <AvatarFallback className="bg-teal-100 text-teal-800">{user.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">Hola, {user.nombre}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      Nivel 5 <Star className="w-3 h-3 ml-1 text-teal-500" /> • {user.puntos} Pts
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="dropdown-menu__item">Mi Progreso</DropdownMenuItem>
                <Link href="/profile" passHref>
                <DropdownMenuItem className="dropdown-menu__item">Mi Perfil</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onSelect={logout} className="dropdown-menu__item">Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Continue Learning Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">Continuar tu última lección:</CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">
              Primeros Auxilios: RCP Básico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </CardContent>
        </Card>

        {/* Explore Modules Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Explorar Módulos</h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={
                  selectedCategory === category.name
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Module Cards Grid (ahora usa los datos de la API)*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => {
              const IconComponent = module.icon
              return (
                <Card key={module.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-gray-700" />
                      </div>
                      <Badge className={`${module.categoryColor} border-0`}>{module.category}</Badge>
                    </div>
                    <CardTitle className="text-base text-gray-900 leading-tight">{module.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex gap-2">
                  <Button
                    variant="ghost"
                    className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-medium"
                    onClick={() => router.push(`/simulation?id=${module.id}&token=${token}`)}
                  >
                    Iniciar
                  </Button>
                    <Dialog
                      open={showDetails && selectedModule?.id === module.id}
                      onOpenChange={(open) => {
                        setShowDetails(open);
                        if (!open) setSelectedModule(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-medium"
                          onClick={() => { setSelectedModule(module); setShowDetails(true); }}
                        >
                          Ver Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>{selectedModule?.title}</DialogTitle>
                          <div>
                            <div><strong>Categoría:</strong> <span>{selectedModule?.category}</span></div>
                            <div><strong>Descripción:</strong> <span>{selectedModule?.description}</span></div>
                            <div><strong>Dificultad:</strong> <span>{selectedModule?.nivelDificultad}</span></div>
                            <div><strong>Tiempo estimado:</strong> <span>{selectedModule?.tiempoEstimado} min</span></div>
                            <div>
                              <strong>Contenidos:</strong>
                              <ul className="list-disc ml-6">
                                {selectedModule?.contenidos?.map((contenido) => (
                                  <li key={contenido.id}>
                                    {contenido.titulo}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Últimos Logros</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon
              return (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <IconComponent className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-xs text-gray-600 max-w-[64px] leading-tight">{achievement.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
