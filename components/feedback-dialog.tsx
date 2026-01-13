"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Lightbulb, Bug, Sparkles, HelpCircle, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { FeedbackType } from "@/lib/types"

const feedbackTypes: { value: FeedbackType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "feature", label: "Sugerencia", icon: <Lightbulb className="h-4 w-4" />, description: "Nueva funcionalidad" },
  { value: "bug", label: "Problema", icon: <Bug className="h-4 w-4" />, description: "Algo no funciona" },
  { value: "improvement", label: "Mejora", icon: <Sparkles className="h-4 w-4" />, description: "Mejorar lo existente" },
  { value: "other", label: "Otro", icon: <HelpCircle className="h-4 w-4" />, description: "Otro tipo" },
]

interface FeedbackDialogProps {
  children: React.ReactNode
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()

  const resetForm = () => {
    setFeedbackType("feature")
    setMessage("")
    setRating(null)
    setHoveredRating(null)
  }

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      toast.error("El mensaje debe tener al menos 10 caracteres")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_type: feedbackType,
          message: message.trim(),
          rating: rating || undefined,
          page_context: pathname,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar feedback")
      }

      toast.success("Gracias por tu feedback", {
        description: "Tu opinión nos ayuda a mejorar la aplicación.",
      })
      resetForm()
      setOpen(false)
    } catch {
      toast.error("Error al enviar", {
        description: "No se pudo enviar el feedback. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar DiploTest
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tipo de feedback</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFeedbackType(type.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                    feedbackType === type.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {type.icon}
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos tu experiencia, qué echas en falta, qué mejorarías..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Valoración (opcional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? null : star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating ?? rating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating && (
                <span className="text-sm text-muted-foreground ml-2">
                  {rating === 1 && "Muy malo"}
                  {rating === 2 && "Malo"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bueno"}
                  {rating === 5 && "Excelente"}
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || message.trim().length < 10}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
