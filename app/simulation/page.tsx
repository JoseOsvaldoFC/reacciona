"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, RotateCcw } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Link from "next/link"

interface OpcionPaso {
  idOpcion: number
  textoOpcion: string
  esCorrecto: boolean
  feedback: string
  video: string
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
  tipoContenido: "VIDEO" | "TEXTO" | "INFOGRAFIA" | "SIMULACION" | "PEDAGOGICO";
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
  const [viewingContent, setViewingContent] = useState<Contenido | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");
  const [opcionVideo, setOpcionVideo] = useState<string | null>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [resuming, setResuming] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [lockedStepIndex, setLockedStepIndex] = useState<number | null>(null);
  const [lockedOptionId, setLockedOptionId] = useState<number | null>(null);

  console.log("Token recibido por URL:", token);
  console.log("ID recibido por URL:", id);
  // Cargar datos del módulo
useEffect(() => {
  if (!token || !id) return;
  let cancelled = false;
  (async () => {
    try {
      setLoadingState(true);
      const res = await fetch(`http://localhost:8080/api/modulos/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      const data: Modulo = await res.json();
      if (cancelled) return;
      setModulo(data);
      // Obtener contenido de simulación (para estado)
      const contenidoSim = data.contenidos.find(c => c.pasosSimulacion && c.pasosSimulacion.length>0);
      if (contenidoSim) {
        setResuming(true);
        const stateRes = await fetch(`http://localhost:8080/api/progress/simulation/state?contenidoId=${contenidoSim.id}`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (stateRes.ok) {
          const state = await stateRes.json();
          if (typeof state.pasoActualIndex === 'number') {
            setCurrentStep(state.pasoActualIndex);
            if (state.opcionSeleccionadaId) {
              setLockedStepIndex(state.pasoActualIndex);
              setLockedOptionId(state.opcionSeleccionadaId);
              setSelectedOption(state.opcionSeleccionadaId);
              setShowFeedback(true);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error cargando simulación', e);
    } finally {
      if (!cancelled) { setLoadingState(false); setResuming(false);} }
  })();
  return () => { cancelled = true };
}, [token, id])

  // Buscar el primer contenido con pasos de simulación
  const contenidoSimulacion = modulo?.contenidos.find(c => c.pasosSimulacion && c.pasosSimulacion.length > 0)
  const contenidoPedagogico = modulo?.contenidos.filter(c => c.tipoContenido === 'PEDAGOGICO');
  const pasos = contenidoSimulacion?.pasosSimulacion || []
  const pasoActual = pasos[currentStep]

  const totalSteps = pasos.length
  const progress = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0

  const handleOptionSelect = async (idOpcion: number) => {
    setSelectedOption(idOpcion)
    setShowFeedback(true)
    // registrar intento backend
    try {
      const opcion = pasoActual.opcionesPaso.find(o => o.idOpcion === idOpcion);
      const correcto = opcion?.esCorrecto ?? false;
      // puntaje simple: 100 si correcto, 0 si no (podría mejorarse)
      const puntaje = correcto ? 100 : 0;
      await fetch('http://localhost:8080/api/progress/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ pasoId: pasoActual.idPaso, correcto, puntaje, opcionSeleccionadaId: idOpcion })
      });
      setLockedStepIndex(currentStep);
      setLockedOptionId(idOpcion);
    } catch (e) {
      console.error('Error registrando intento de progreso', e);
    }
  }

  const handleContinue = () => {
    setShowFeedback(false)
    setSelectedOption(null)
    setCurrentStep((prev) => prev + 1)
  }

  // Función de renderizado inteligente para contenido pedagógico
  const renderPedagogicalContent = (content: Contenido) => {
    const isVideo = content.urlRecurso && (content.urlRecurso.includes("youtube.com") || content.urlRecurso.includes("vimeo.com"));
    const isImage = content.urlRecurso && !isVideo;

    if (isVideo) {
      return (
        <div className="aspect-video mt-4">
          <iframe
            className="w-full h-full rounded-lg"
            src={content.urlRecurso}
            title={content.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    if (isImage) {
      return <img src={content.urlRecurso} alt={content.titulo} className="w-full rounded-lg mt-4" />;
    }
    if (content.cuerpo) {
      return <div className="prose max-w-none mt-4 text-justify" dangerouslySetInnerHTML={{ __html: content.cuerpo }} />;
    }
    return <p>Formato de contenido no reconocido.</p>;
  }

  if (loadingState) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Cargando simulación...</div>
  }

  if (!modulo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No se pudo cargar el módulo.
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
            <Button variant="outline" onClick={() => setShowRestartConfirm(true)} title="Reiniciar simulación" className="mr-2">
              <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
            </Button>

            {/* Botón para Contenido Pedagógico */}
            {contenidoPedagogico && contenidoPedagogico.length > 0 && (
                <Dialog onOpenChange={(open) => !open && setViewingContent(null)}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Contenido Pedagógico
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] flex flex-col">
                      {!viewingContent ? (
                        <>
                          <DialogHeader>
                              <DialogTitle>Contenido Pedagógico Complementario</DialogTitle>
                              <DialogDescription>
                                  Material adicional para reforzar tu aprendizaje sobre {modulo.titulo}.
                              </DialogDescription>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto">
                            <ul className="space-y-2 mt-2">
                                {contenidoPedagogico.map((contenido) => (
                                    <li key={contenido.id}>
                                        <button onClick={() => setViewingContent(contenido)} className="text-left w-full p-2 rounded-md text-teal-600 hover:bg-gray-100 hover:underline">
                                            {contenido.titulo}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <DialogHeader>
                              <DialogTitle className="flex items-center">
                                <button onClick={() => setViewingContent(null)} className="p-1 mr-2 rounded-full hover:bg-gray-100">
                                  <ArrowLeft className="w-4 h-4"/>
                                </button>
                                {viewingContent.titulo}
                              </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto pr-2">
                            {renderPedagogicalContent(viewingContent)}
                          </div>
                        </>
                      )}
                    </DialogContent>
                </Dialog>
            )}
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
      {showRestartConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Reiniciar simulación</h2>
            <p className="text-sm text-gray-600">Esta acción borrará tu progreso y puntuación de esta simulación. ¿Deseas continuar?</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowRestartConfirm(false)}>Cancelar</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={async () => {
                try {
                  const contenidoSim = modulo.contenidos.find(c => c.pasosSimulacion && c.pasosSimulacion.length>0);
                  if (contenidoSim) {
                    await fetch(`http://localhost:8080/api/progress/simulation/reset?contenidoId=${contenidoSim.id}`, { method:'POST', headers: { 'Authorization': `Bearer ${token}` }});
                  }
                  setCurrentStep(0);
                  setSelectedOption(null);
                  setShowFeedback(false);
                  setLockedStepIndex(null);
                  setLockedOptionId(null);
                } catch(e){ console.error('Error reiniciando simulación', e);} finally { setShowRestartConfirm(false); }
              }}>Reiniciar</Button>
            </div>
          </div>
        </div>
      )}

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
    onClick={() => {
      if (!showFeedback && lockedStepIndex !== currentStep) {
        handleOptionSelect(opcion.idOpcion);
        if (opcion.video) {
          setOpcionVideo(opcion.video);
          setShowVideoPopup(true);
        }
      }
    }}
    disabled={showFeedback || lockedStepIndex === currentStep}
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
<Dialog
  open={showVideoPopup}
  onOpenChange={(open) => {
    setShowVideoPopup(open);
    if (!open) setOpcionVideo(null);
  }}
>
  <DialogContent aria-describedby={undefined}>
    <VisuallyHidden>
      <DialogTitle>Video de opción</DialogTitle>
    </VisuallyHidden>
    {opcionVideo && (
      <video
        src={`/video/${opcionVideo.split("\\").pop()}`}
        controls
        autoPlay
        className="max-w-full rounded-lg shadow"
        style={{ maxHeight: 360 }}
      >
        Tu navegador no soporta la reproducción de video.
      </video>
    )}
  </DialogContent>
</Dialog>
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
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-lg font-semibold"
                        // Permitimos continuar si ya se respondió (lockedStepIndex === currentStep) y se está reanudando
                        disabled={!showFeedback}
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