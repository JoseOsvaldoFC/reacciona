"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface OpcionPaso {
  idOpcion: number
  textoOpcion: string
  esCorrecto: boolean
  feedback: string
}

interface PasoSimulacion {
  idPaso: number
  descripcion: string
  orden: number
  escenario: string
  video: string
  opcionesPaso: OpcionPaso[]
}

interface Contenido {
  id: number
  titulo: string
  tipoContenido: string
  urlRecurso: string
  cuerpo: string
  orden: number
  pasosSimulacion: PasoSimulacion[]
}

interface Modulo {
  id: number
  titulo: string
  descripcion: string
  tipoEmergencia: string
  nivelDificultad: string
  tiempoEstimado: number
  contenidos: Contenido[]
}

export default function SimulationView() {
  const [modulo, setModulo] = useState<Modulo | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  console.log("Token recibido por URL:", token);
  console.log("ID recibido por URL:", id);
  // Cargar datos del módulo
useEffect(() => {
  if (!token) return; // Espera a que el token esté disponible
  fetch(`http://localhost:8080/api/modulos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => setModulo(data))
    .catch(() => setModulo(null))
}, [token])

  // Buscar el primer contenido con pasos de simulación
  const contenidoSimulacion = modulo?.contenidos.find(c => c.pasosSimulacion && c.pasosSimulacion.length > 0)
  const pasos = contenidoSimulacion?.pasosSimulacion || []
  const pasoActual = pasos[currentStep]

  const totalSteps = pasos.length
  const progress = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0

  const handleOptionSelect = (idOpcion: number) => {
    setSelectedOption(idOpcion)
    setShowFeedback(true)
  }

  const handleContinue = () => {
    setShowFeedback(false)
    setSelectedOption(null)
    setCurrentStep((prev) => prev + 1)
  }

  if (!modulo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando simulación...
      </div>
    )
  }

  if (!contenidoSimulacion || pasos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No hay pasos de simulación disponibles para este módulo.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 flex-1">{modulo.titulo}</h1>
          </div>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso de la simulación</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {/* Paso de Simulación */}
            <div className="p-6 sm:p-8 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-gray-800">{contenidoSimulacion.titulo}</h2>
                <p className="text-base text-gray-600">{contenidoSimulacion.cuerpo}</p>
                <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium">{pasoActual.escenario}</p>
              </div>
              {pasoActual.video && (
                <div className="flex justify-center my-4">
                  <video
                    src={`/video/${pasoActual.video.split("\\").pop()}`}
                    controls
                    className="max-w-full rounded-lg shadow"
                    style={{ maxHeight: 360 }}
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>
              )}
              {/* Opciones */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 text-center mb-6">Selecciona tu respuesta:</h3>
                <div className="space-y-3">
                  {pasoActual.opcionesPaso.map((opcion) => (
                    <Button
                      key={opcion.idOpcion}
                      variant={selectedOption === opcion.idOpcion ? "default" : "outline"}
                      className={`w-full p-6 h-auto text-left justify-start transition-all duration-200 ${
                        selectedOption === opcion.idOpcion
                          ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                          : "border-gray-300 hover:border-teal-300 hover:bg-teal-50 text-gray-700"
                      }`}
                      onClick={() => !showFeedback && handleOptionSelect(opcion.idOpcion)}
                      disabled={showFeedback}
                    >
                      <div className="flex items-start space-x-4 w-full">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedOption === opcion.idOpcion ? "bg-white text-teal-600" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + pasoActual.opcionesPaso.indexOf(opcion))}
                        </div>
                        <span className="text-base sm:text-lg leading-relaxed flex-1">{opcion.textoOpcion}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Feedback y Continuar */}
                {showFeedback && selectedOption && (
                  <div className="pt-6 space-y-4">
                    <div className={`p-4 rounded-lg text-base font-medium ${
                      pasoActual.opcionesPaso.find(o => o.idOpcion === selectedOption)?.esCorrecto
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {
                        pasoActual.opcionesPaso.find(o => o.idOpcion === selectedOption)?.feedback
                      }
                    </div>
                    {currentStep < pasos.length - 1 ? (
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg font-semibold"
                      >
                        Continuar
                      </Button>
                    ) : (
                      <div className="text-center text-lg font-semibold text-teal-700">
                        ¡Simulación finalizada!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Tómate tu tiempo para pensar en la mejor respuesta. No hay prisa.</p>
        </div>
      </main>
    </div>
  )
}