"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionCard } from "@/components/question-card"
import type { Question } from "@/lib/types"
import {
  BookmarkX,
  Bookmark,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Bookmark {
  id: string
  question_id: string
  question_mode: string
  notes: string | null
  created_at: string
  question: Question | null
}

export function FlashcardsView() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState(false)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  async function fetchBookmarks() {
    try {
      const res = await fetch("/api/bookmarks")
      const data = await res.json()
      if (Array.isArray(data)) {
        setBookmarks(data.filter((b: Bookmark) => b.question !== null))
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  async function removeBookmark(questionId: string) {
    try {
      await fetch(`/api/bookmarks?question_id=${questionId}`, {
        method: "DELETE",
      })
      setBookmarks((prev) => prev.filter((b) => b.question_id !== questionId))
      if (currentIndex >= bookmarks.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1))
      }
    } catch (error) {
      console.error("Failed to remove bookmark:", error)
    }
  }

  function shuffleCards() {
    const shuffled = [...bookmarks].sort(() => Math.random() - 0.5)
    setBookmarks(shuffled)
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  function nextCard() {
    if (currentIndex < bookmarks.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  function prevCard() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Cargando flashcards...</p>
        </CardContent>
      </Card>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">No tienes flashcards guardadas</p>
              <p className="text-muted-foreground">
                Cuando revises un test, puedes marcar preguntas para repasar después.
              </p>
            </div>
            <Button asChild>
              <Link href="/app">
                <BookOpen className="mr-2 h-4 w-4" />
                Ir a practicar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBookmark = bookmarks[currentIndex]
  const currentQuestion = currentBookmark?.question

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {bookmarks.length} flashcards
              </Badge>
              <Button
                variant={studyMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStudyMode(!studyMode)
                  setShowAnswer(false)
                }}
              >
                {studyMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {studyMode ? "Modo Lista" : "Modo Estudio"}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <Shuffle className="mr-2 h-4 w-4" />
              Mezclar
            </Button>
          </div>
        </CardContent>
      </Card>

      {studyMode ? (
        /* Study Mode - One card at a time */
        <div className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Pregunta {currentIndex + 1} de {bookmarks.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentBookmark.question_mode.toUpperCase()}</Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar flashcard?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta pregunta se eliminará de tus flashcards. Podrás volver a guardarla
                          después si lo deseas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeBookmark(currentBookmark.question_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  selectedOptions={[]}
                  onAnswerChange={() => {}}
                  showCorrect={showAnswer}
                  correctOptions={currentQuestion.correct}
                />
              )}

              {!showAnswer && (
                <Button
                  className="w-full mt-4"
                  variant="secondary"
                  onClick={() => setShowAnswer(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Mostrar Respuesta
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevCard} disabled={currentIndex === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {bookmarks.length}
            </span>
            <Button
              variant="outline"
              onClick={nextCard}
              disabled={currentIndex === bookmarks.length - 1}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* List Mode - All cards */
        <div className="space-y-4">
          {bookmarks.map((bookmark, index) => (
            <Card key={bookmark.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">
                    Pregunta {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{bookmark.question_mode.toUpperCase()}</Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar flashcard?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta pregunta se eliminará de tus flashcards.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeBookmark(bookmark.question_id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookmark.question && (
                  <QuestionCard
                    question={bookmark.question}
                    selectedOptions={[]}
                    onAnswerChange={() => {}}
                    showCorrect={true}
                    correctOptions={bookmark.question.correct}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
