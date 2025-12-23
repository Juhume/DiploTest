import { Suspense } from "react"
import { TestRunner } from "@/components/test-runner"

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Cargando test...</p>
        </div>
      }
    >
      <TestRunner />
    </Suspense>
  )
}
