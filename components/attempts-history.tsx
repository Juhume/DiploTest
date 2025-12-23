"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Attempt } from "@/lib/types"
import { Home, CheckCircle, XCircle, MinusCircle, Clock, Eye, Filter, X } from "lucide-react"

interface AttemptsHistoryProps {
  attempts: Attempt[]
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatDateInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split("T")[0]
}

function getScoreColor(percentage: number): string {
  if (percentage >= 70) return "text-green-600"
  if (percentage >= 50) return "text-amber-600"
  return "text-red-600"
}

function getModeLabel(mode: string): string {
  if (mode === "demo") return "Demo"
  if (mode === "real") return "Real"
  return mode
}

export function AttemptsHistory({ attempts }: AttemptsHistoryProps) {
  const [modeFilter, setModeFilter] = useState<"all" | "demo" | "real">("all")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")

  // Filter attempts based on selected filters
  const filteredAttempts = useMemo(() => {
    let filtered = attempts

    // Filter by mode
    if (modeFilter !== "all") {
      filtered = filtered.filter((a) => a.question_mode === modeFilter)
    }

    // Filter by date range
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((a) => new Date(a.created_at) >= fromDate)
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((a) => new Date(a.created_at) <= toDate)
    }

    return filtered
  }, [attempts, modeFilter, dateFromFilter, dateToFilter])

  const hasActiveFilters = modeFilter !== "all" || dateFromFilter !== "" || dateToFilter !== ""

  const clearFilters = () => {
    setModeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filtros</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode Filter */}
            <div className="space-y-2">
              <Label htmlFor="mode-filter">Modo</Label>
              <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as "all" | "demo" | "real")}>
                <SelectTrigger id="mode-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="real">Real</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-from">Desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-to">Hasta</Label>
              <Input id="date-to" type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredAttempts.length} de {attempts.length} intentos
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/app">
            <Home className="mr-2 h-4 w-4" />
            Nuevo Test
          </Link>
        </Button>
      </div>

      {filteredAttempts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin resultados</CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? "No se encontraron intentos con los filtros aplicados."
                : "Aún no has realizado ningún test. ¡Comienza ahora!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button asChild>
                <Link href="/app">Comenzar Test</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile view - cards */}
          <div className="lg:hidden space-y-4">
            {filteredAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{formatDate(attempt.created_at)}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{getModeLabel(attempt.question_mode)}</Badge>
                        <Badge variant="secondary">{attempt.selection_mode}</Badge>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                      {attempt.percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-sm mb-4">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="font-medium">{attempt.correct_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Aciertos</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="font-medium">{attempt.wrong_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Fallos</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <MinusCircle className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{attempt.blank_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Blanco</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{formatDuration(attempt.duration_seconds)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Tiempo</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/results/${attempt.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop view - table */}
          <Card className="hidden lg:block">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Modo</TableHead>
                    <TableHead>Selección</TableHead>
                    <TableHead className="text-center">Preguntas</TableHead>
                    <TableHead className="text-center text-green-600">Aciertos</TableHead>
                    <TableHead className="text-center text-red-600">Fallos</TableHead>
                    <TableHead className="text-center">Blanco</TableHead>
                    <TableHead className="text-center">Tiempo</TableHead>
                    <TableHead className="text-right">Puntuación</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(attempt.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getModeLabel(attempt.question_mode)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{attempt.selection_mode}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{attempt.total_questions}</TableCell>
                      <TableCell className="text-center text-green-600">{attempt.correct_count}</TableCell>
                      <TableCell className="text-center text-red-600">{attempt.wrong_count}</TableCell>
                      <TableCell className="text-center">{attempt.blank_count}</TableCell>
                      <TableCell className="text-center">{formatDuration(attempt.duration_seconds)}</TableCell>
                      <TableCell className={`text-right font-bold ${getScoreColor(attempt.percentage)}`}>
                        {attempt.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/results/${attempt.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
