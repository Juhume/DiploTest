"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, parseISO, startOfDay, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import type { ProgressDataPoint } from "@/lib/types"
import { TrendingUp, Calendar } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProgressChartProps {
  data: ProgressDataPoint[]
  showScore?: boolean
  showPercentage?: boolean
}

type ViewMode = "all" | "daily" | "weekly"

export function ProgressChart({ data, showScore = true, showPercentage = true }: ProgressChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Autoseleccionar modo según cantidad de intentos
    if (data.length <= 10) return "all"
    if (data.length <= 30) return "daily"
    return "weekly"
  })
  
  if (data.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Progreso Temporal
          </CardTitle>
          <CardDescription className="mt-2">Evolución de tus resultados a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Completa tests para ver tu progreso
          </div>
        </CardContent>
      </Card>
    )
  }

  // Función para agrupar datos por día (promedio diario)
  const groupByDay = (data: ProgressDataPoint[]) => {
    const grouped = new Map<string, ProgressDataPoint[]>()
    
    data.forEach(point => {
      const day = format(startOfDay(parseISO(point.date)), "yyyy-MM-dd")
      if (!grouped.has(day)) {
        grouped.set(day, [])
      }
      grouped.get(day)!.push(point)
    })

    return Array.from(grouped.entries())
      .map(([day, points]) => {
        const avgScore = points.reduce((sum, p) => sum + p.score, 0) / points.length
        const avgPercentage = points.reduce((sum, p) => sum + p.percentage, 0) / points.length
        
        return {
          fecha: format(parseISO(day), "dd MMM", { locale: es }),
          fechaCompleta: format(parseISO(day), "dd MMMM yyyy", { locale: es }),
          nota: Math.round(avgScore * 100) / 100,
          porcentaje: Math.round(avgPercentage * 100) / 100,
          correctas: points.reduce((sum, p) => sum + p.correct, 0),
          incorrectas: points.reduce((sum, p) => sum + p.wrong, 0),
          blancas: points.reduce((sum, p) => sum + p.blank, 0),
          intentos: points.length,
          modo: `${points.length} test${points.length > 1 ? 's' : ''}`
        }
      })
      .sort((a, b) => parseISO(a.fechaCompleta).getTime() - parseISO(b.fechaCompleta).getTime())
  }

  // Función para agrupar datos por semana
  const groupByWeek = (data: ProgressDataPoint[]) => {
    const grouped = new Map<string, ProgressDataPoint[]>()
    
    data.forEach(point => {
      const week = format(startOfWeek(parseISO(point.date), { locale: es }), "yyyy-MM-dd")
      if (!grouped.has(week)) {
        grouped.set(week, [])
      }
      grouped.get(week)!.push(point)
    })

    return Array.from(grouped.entries())
      .map(([week, points]) => {
        const avgScore = points.reduce((sum, p) => sum + p.score, 0) / points.length
        const avgPercentage = points.reduce((sum, p) => sum + p.percentage, 0) / points.length
        
        return {
          fecha: format(parseISO(week), "dd MMM", { locale: es }),
          fechaCompleta: `Semana del ${format(parseISO(week), "dd MMMM yyyy", { locale: es })}`,
          nota: Math.round(avgScore * 100) / 100,
          porcentaje: Math.round(avgPercentage * 100) / 100,
          correctas: points.reduce((sum, p) => sum + p.correct, 0),
          incorrectas: points.reduce((sum, p) => sum + p.wrong, 0),
          blancas: points.reduce((sum, p) => sum + p.blank, 0),
          intentos: points.length,
          modo: `${points.length} test${points.length > 1 ? 's' : ''}`
        }
      })
      .sort((a, b) => parseISO(a.fechaCompleta.split('del ')[1]).getTime() - parseISO(b.fechaCompleta.split('del ')[1]).getTime())
  }

  // Seleccionar datos según el modo de vista
  let chartData
  if (viewMode === "daily") {
    chartData = groupByDay(data)
  } else if (viewMode === "weekly") {
    chartData = groupByWeek(data)
  } else {
    // Modo "all" - mostrar cada intento individual
    chartData = data.map(point => ({
      fecha: format(parseISO(point.date), "dd/MM HH:mm", { locale: es }),
      fechaCompleta: format(parseISO(point.date), "dd MMM yyyy, HH:mm", { locale: es }),
      nota: Math.round(point.score * 100) / 100,
      porcentaje: Math.round(point.percentage * 100) / 100,
      correctas: point.correct,
      incorrectas: point.wrong,
      blancas: point.blank,
      modo: point.questionMode === "real" ? "Real" : "Demo",
      intentos: 1
    }))
  }

  // Calcular tendencia
  const firstScore = chartData[0].nota
  const lastScore = chartData[chartData.length - 1].nota
  const trend = lastScore - firstScore
  const trendPercentage = firstScore > 0 ? (trend / firstScore) * 100 : 0

  // Calcular nota objetivo (aprobar = 5.8)
  const passScore = 5.8
  const currentAvg = chartData.reduce((sum, d) => sum + d.nota, 0) / chartData.length

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Progreso Temporal
            </CardTitle>
            <CardDescription className="mt-2">
              {viewMode === "all" && "Cada punto representa un test individual"}
              {viewMode === "daily" && "Promedio de tests realizados por día"}
              {viewMode === "weekly" && "Promedio de tests realizados por semana"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de vista */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("all")}
                className="h-8 text-xs"
              >
                Individual
              </Button>
              <Button
                variant={viewMode === "daily" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("daily")}
                className="h-8 text-xs"
              >
                Diario
              </Button>
              <Button
                variant={viewMode === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("weekly")}
                className="h-8 text-xs"
              >
                Semanal
              </Button>
            </div>
            
            {/* Indicador de tendencia */}
            {chartData.length > 1 && (
              <div className="text-right bg-muted/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tendencia</div>
                <div className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trendPercentage).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Promedio Actual</div>
            <div className="text-xl font-bold text-primary">{currentAvg.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Mejor Resultado</div>
            <div className="text-xl font-bold text-green-600">{Math.max(...chartData.map(d => d.nota)).toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Nota para Aprobar</div>
            <div className="text-xl font-bold text-amber-600">{passScore.toFixed(1)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPorcentaje" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="fecha" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              angle={chartData.length > 15 ? -45 : 0}
              textAnchor={chartData.length > 15 ? "end" : "middle"}
              height={chartData.length > 15 ? 80 : 30}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 10]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Nota (0-10)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              label={{ value: '% Aciertos', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
            />
            
            {/* Línea de referencia para nota de aprobado */}
            <ReferenceLine 
              yAxisId="left" 
              y={passScore} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: 'Nota mínima (5.8)', 
                position: 'right',
                fill: 'hsl(var(--destructive))',
                fontSize: 11,
                fontWeight: 600
              }}
            />
            
            {/* Línea de promedio */}
            <ReferenceLine 
              yAxisId="left" 
              y={currentAvg} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{ 
                value: `Promedio: ${currentAvg.toFixed(2)}`, 
                position: 'left',
                fill: 'hsl(var(--primary))',
                fontSize: 11,
                fontWeight: 600
              }}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            {showScore && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="nota" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 2 }}
                name="Nota"
                fill="url(#colorNota)"
              />
            )}
            {showPercentage && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="porcentaje" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-2))', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 2 }}
                name="% Aciertos"
                fill="url(#colorPorcentaje)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-card border-2 border-border rounded-xl p-4 shadow-2xl backdrop-blur-sm">
      <p className="font-semibold text-base mb-3 border-b border-border pb-2">{data.fechaCompleta}</p>
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground font-medium">
            {data.intentos > 1 ? `Promedio (${data.intentos} tests)` : 'Modo'}:
          </span>
          <span className="font-bold text-foreground">{data.modo}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
            <span className="text-muted-foreground font-medium">Nota:</span>
          </div>
          <span className="font-bold text-primary">{data.nota.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-muted-foreground font-medium">Aciertos:</span>
          </div>
          <span className="font-bold text-foreground">{data.porcentaje.toFixed(1)}%</span>
        </div>
        <div className="border-t-2 border-border my-2"></div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-green-600 font-medium">Correctas:</span>
          <span className="font-bold text-green-600">{data.correctas}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-red-600 font-medium">Incorrectas:</span>
          <span className="font-bold text-red-600">{data.incorrectas}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-amber-600 font-medium">Sin responder:</span>
          <span className="font-bold text-amber-600">{data.blancas}</span>
        </div>
      </div>
    </div>
  )
}
