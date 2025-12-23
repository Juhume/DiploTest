// Question types
export interface QuestionOption {
  id: string // "A", "B", "C", "D", etc.
  text: string
}

export interface Question {
  id: string
  stem: string
  options: QuestionOption[]
  correct: string[] // Array of correct option IDs
  tags?: string[]
  multi?: boolean // If true, multiple answers allowed (only for DEMO mode)
  reserve?: boolean // If true, this is a reserve question (for REAL mode)
}

export type QuestionMode = "demo" | "real"

// Attempt types
export interface Attempt {
  id: string
  user_id: string
  created_at: string
  question_mode: QuestionMode
  selection_mode: SelectionMode
  selection_meta: SelectionMeta
  total_questions: number
  correct_count: number
  wrong_count: number
  blank_count: number
  percentage: number
  duration_seconds: number
  answers: Record<string, string[]> // questionId -> selected option IDs
  grading: Record<string, QuestionGrading> // questionId -> grading details
}

export interface QuestionGrading {
  correct: string[]
  chosen: string[]
  status: "correct" | "wrong" | "blank"
}

export interface SelectionMeta {
  n?: number // For random mode
  tag?: string // For tag mode
}

// Test state types
export type SelectionMode = "all" | "random" | "tag"

export interface TestConfig {
  questionMode: QuestionMode
  selectionMode: SelectionMode
  questionCount?: number
  selectedTag?: string
}

export interface TestState {
  questions: Question[]
  currentIndex: number
  answers: Record<string, string[]>
  startTime: number
}

// Grading types
export interface GradeResult {
  correctCount: number
  wrongCount: number
  blankCount: number
  percentage: number
  score: number // Score out of 10 (for REAL mode: correctCount * 0.10)
  passingScore: number // Minimum passing score (5.8 for REAL mode)
  passed: boolean // Whether the candidate passed
  details: QuestionResult[]
  grading: Record<string, QuestionGrading>
}

export interface QuestionResult {
  questionId: string
  userAnswer: string[]
  correctAnswer: string[]
  isCorrect: boolean
  isBlank: boolean
}

export interface User {
  id: string
  email: string
}
