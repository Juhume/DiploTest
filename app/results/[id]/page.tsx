import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { ResultsView } from "@/components/results-view"
import demoQuestions from "@/data/questions.demo.json"
import academyQuestions from "@/data/questions.academy.json"
import realExamQuestions from "@/data/examenes_reales.json"
import type { Question, Attempt } from "@/lib/types"

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Start both queries in parallel (RLS uses cookies for auth)
  const userPromise = supabase.auth.getUser()
  const attemptPromise = supabase.from("attempts").select("*").eq("id", id).single()

  const { data: { user } } = await userPromise

  if (!user) {
    redirect("/auth/login")
  }

  const { data: attempt, error } = await attemptPromise

  if (error || !attempt) {
    notFound()
  }

  // Get the attempt data
  const attemptData = attempt as Attempt

  // Load questions based on mode
  let allQuestions: Question[]
  switch (attemptData.question_mode) {
    case "real":
      allQuestions = realExamQuestions as Question[]
      break
    case "academy":
      allQuestions = academyQuestions as Question[]
      break
    case "demo":
    default:
      allQuestions = demoQuestions as Question[]
      break
  }

  // Get the questions that were in this attempt from grading (includes blank answers)
  const attemptQuestionIds = Object.keys(attemptData.grading || {})
  
  // If grading exists, use it; otherwise fall back to answers
  const questionIds = attemptQuestionIds.length > 0 
    ? attemptQuestionIds 
    : Object.keys(attemptData.answers || {})
  
  const questions = questionIds.length > 0 
    ? allQuestions.filter((q) => questionIds.includes(q.id)) 
    : allQuestions

  return (
    <main className="min-h-screen bg-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ResultsView attempt={attemptData} questions={questions} answers={attemptData.answers || {}} />
      </div>
    </main>
  )
}

