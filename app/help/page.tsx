"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, BookOpen, HelpCircle, Mail } from "lucide-react"

type Article = {
  id: string
  category: "FAQ" | "Manuales"
  title: string
  content: string
}

const articles: Article[] = [
  {
    id: "faq1",
    category: "FAQ",
    title: "¿Cómo me registro en la plataforma?",
    content: "Haz clic en 'Registrarse' en la página principal y completa el formulario con tus datos.",
  },
  {
    id: "faq2",
    category: "FAQ",
    title: "Olvidé mi contraseña, ¿qué hago?",
    content: "Ve a la página de inicio de sesión y haz clic en '¿Olvidaste tu contraseña?' para restablecerla.",
  },
  {
    id: "faq3",
    category: "FAQ",
    title: "¿Cómo accedo a los módulos?",
    content: "Una vez autenticado, encontrarás los módulos disponibles en la página principal. Haz clic en 'Iniciar' para comenzar.",
  },
  {
    id: "faq4",
    category: "FAQ",
    title: "¿Puedo ver mi progreso?",
    content: "Sí, en el menú de usuario puedes acceder a 'Mi Progreso' para ver tus avances y logros.",
  },
  {
    id: "manual1",
    category: "Manuales",
    title: "Guía paso a paso: Primeros pasos en Reacciona",
    content: "1. Regístrate o inicia sesión.\n2. Explora los módulos disponibles.\n3. Selecciona un módulo y comienza tu aprendizaje.\n4. Consulta tu progreso en el menú de usuario.",
  },
  {
    id: "manual2",
    category: "Manuales",
    title: "¿Cómo reportar un problema?",
    content: "Dirígete a la sección de contacto y completa el formulario. También puedes escribirnos a soporte@reacciona.com.",
  },
]

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<"FAQ" | "Manuales" | "Contacto">("FAQ")
  const [search, setSearch] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })

  // Filtrado de artículos
  const filteredArticles = articles.filter(
    (a) =>
      a.category === selectedCategory &&
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase()))
  )

  // Simulación de envío de formulario de contacto
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactStatus("sending")
    try {
      const res = await fetch("http://localhost:8080/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      })
      if (!res.ok) throw new Error("Error en el envío")
      setContactStatus("success")
      setContactForm({ name: "", email: "", message: "" })
    } catch {
      setContactStatus("error")
    }
    setTimeout(() => setContactStatus("idle"), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center space-x-2">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-teal-500">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Ayuda & FAQ</h1>
          </div>
        </div>
      </header>

      {/* Categorías y buscador */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => { setSelectedCategory("FAQ"); setSelectedArticle(null) }}
              className={
                `flex items-center gap-1 transition-colors
                ${selectedCategory === "FAQ"
                  ? "bg-teal-600 text-white hover:bg-teal-500"
                  : "bg-white text-teal-600 hover:bg-teal-100 border border-teal-600"}`
              }
            >
              <HelpCircle className="w-4 h-4" /> FAQ
            </Button>
            <Button
              onClick={() => { setSelectedCategory("Manuales"); setSelectedArticle(null) }}
              className={
                `flex items-center gap-1 transition-colors
                ${selectedCategory === "Manuales"
                  ? "bg-teal-600 text-white hover:bg-teal-500"
                  : "bg-white text-teal-600 hover:bg-teal-100 border border-teal-600"}`
              }
            >
              <BookOpen className="w-4 h-4" /> Manuales
            </Button>
            <Button
              onClick={() => { setSelectedCategory("Contacto"); setSelectedArticle(null) }}
              className={
                `flex items-center gap-1 transition-colors
                ${selectedCategory === "Contacto"
                  ? "bg-teal-600 text-white hover:bg-teal-500"
                  : "bg-white text-teal-600 hover:bg-teal-100 border border-teal-600"}`
              }
            >
              <Mail className="w-4 h-4" /> Contacto
            </Button>
          </div>
          {selectedCategory !== "Contacto" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          )}
        </div>

        {/* Artículos o formulario */}
        {selectedCategory === "Contacto" ? (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Contáctanos</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <input
                  type="text"
                  required
                  placeholder="Nombre"
                  className="w-full border rounded px-3 py-2"
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  className="w-full border rounded px-3 py-2"
                  value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                />
                <textarea
                  required
                  placeholder="Describe tu consulta o problema"
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                />
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={contactStatus === "sending"}
                >
                  {contactStatus === "sending" ? "Enviando..." : "Enviar"}
                </Button>
                {contactStatus === "success" && (
                  <div className="text-green-600 text-sm mt-2">¡Mensaje enviado! Te responderemos pronto.</div>
                )}
                {contactStatus === "error" && (
                  <div className="text-red-600 text-sm mt-2">Error al enviar. Intenta de nuevo o escribe a <a href="mailto:soporte@reacciona.com" className="underline">soporte@reacciona.com</a></div>
                )}
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredArticles.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-8 text-center text-gray-500">
                  No hay artículos disponibles para tu búsqueda o categoría seleccionada.
                </CardContent>
              </Card>
            ) : selectedArticle ? (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{selectedArticle.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:bg-teal-100 group"
                    onClick={() => setSelectedArticle(null)}
                  >
                    ← Volver a la lista
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-gray-800">{selectedArticle.content}</div>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredArticles.map((article) => (
                  <AccordionItem value={article.id} key={article.id}>
                    <AccordionTrigger onClick={() => setSelectedArticle(article)}>
                      {article.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="whitespace-pre-wrap text-gray-800">{article.content}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </main>
    </div>
  )
}