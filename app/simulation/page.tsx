"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SimulationView() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [currentProgress] = useState(45) // Current simulation progress

  const scenario = {
    title: "Desastres Naturales: Terremoto",
    image: "/placeholder.svg?height=300&width=500",
    text: "Estás en tu habitación y sientes un fuerte temblor. Los objetos comienzan a caer de los estantes. ¿Qué es lo primero que haces?",
    options: [
      {
        id: "A",
        text: "Salir corriendo a la calle.",
        isCorrect: false,
      },
      {
        id: "B",
        text: "Refugiarme debajo de una mesa resistente.",
        isCorrect: true,
      },
      {
        id: "C",
        text: "Quedarme quieto en el centro de la habitación.",
        isCorrect: false,
      },
    ],
  }

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleContinue = () => {
    // Logic to proceed to next scenario or show feedback
    console.log("Selected option:", selectedOption)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 flex-1">{scenario.title}</h1>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso de la simulación</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {/* Scenario Image */}
            <div className="relative w-full h-64 sm:h-80 bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={scenario.image || "/placeholder.svg"}
                alt="Escenario de simulación"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Scenario Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Scenario Text */}
              <div className="text-center space-y-4">
                <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium">{scenario.text}</p>
              </div>

              {/* Decision Options */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 text-center mb-6">Selecciona tu respuesta:</h3>

                <div className="space-y-3">
                  {scenario.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={selectedOption === option.id ? "default" : "outline"}
                      className={`w-full p-6 h-auto text-left justify-start transition-all duration-200 ${
                        selectedOption === option.id
                          ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                          : "border-gray-300 hover:border-teal-300 hover:bg-teal-50 text-gray-700"
                      }`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <div className="flex items-start space-x-4 w-full">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedOption === option.id ? "bg-white text-teal-600" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {option.id}
                        </div>
                        <span className="text-base sm:text-lg leading-relaxed flex-1">{option.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Continue Button */}
                {selectedOption && (
                  <div className="pt-6">
                    <Button
                      onClick={handleContinue}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg font-semibold"
                    >
                      Continuar
                    </Button>
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
