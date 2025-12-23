import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { ResultsView } from "@/components/results-view"
import demoQuestions from "@/data/questions.demo.json"
import realQuestions from "@/data/questions.real.json"
import type { Question, Attempt } from "@/lib/types"

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch attempt - RLS ensures user can only see their own
  const { data: attempt, error } = await supabase.from("attempts").select("*").eq("id", id).single()

  if (error || !attempt) {
    notFound()
  }

  // Get the attempt data
  const attemptData = attempt as Attempt

  // Load questions based on mode
  const allQuestions: Question[] =
    attemptData.question_mode === "real" ? (realQuestions as Question[]) : (demoQuestions as Question[])

  // Get the questions that were in this attempt based on the answers
  const answeredQuestionIds = Object.keys(attemptData.answers || {})
  const questions =
    answeredQuestionIds.length > 0 ? allQuestions.filter((q) => answeredQuestionIds.includes(q.id)) : allQuestions

  return (
    <main className="min-h-screen bg-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ResultsView attempt={attemptData} questions={questions} answers={attemptData.answers || {}} />
      </div>
    </main>
  )
}

