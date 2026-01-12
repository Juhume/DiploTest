"use client"

import { useEffect } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "diplotest_feedback_toast_seen"

export function FeedbackToast() {
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (seen) return
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // If storage is unavailable, still show the toast once per mount.
    }

    toast("Queremos tu opinion", {
      description: "Comparte sugerencias desde el menu de usuario para mejorar DiploTest.",
      closeButton: true,
      duration: 12000,
    })
  }, [])

  return null
}
