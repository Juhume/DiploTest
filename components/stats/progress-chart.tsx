"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, parseISO, startOfDay, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import type { ProgressDataPoint } from "@/lib/types"
import { TrendingUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProgressChartProps {
  data: ProgressDataPoint[]
}

type ViewMode = "todos" | "daily" | "weekly"

export function ProgressChart({ data }: ProgressChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Autoseleccionar modo según cantidad de datos
    if (data.length <= 15) return "todos"
    if (data.length <= 40) return "daily"
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
            Progreso temporal
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

  // Agrupar por día y calcular promedios
  const groupByDay = (data: ProgressDataPoint[]) => {
    const groupedByDay = new Map<string, { scores: number[], count: number }>()
    
    data.forEach(point => {
      const date = parseISO(point.date)
      const dayKey = format(startOfDay(date), "yyyy-MM-dd")
      
      if (!groupedByDay.has(dayKey)) {
        groupedByDay.set(dayKey, { scores: [], count: 0 })
      }
      groupedByDay.get(dayKey)!.scores.push(point.score)
      groupedByDay.get(dayKey)!.count++
    })

    return Array.from(groupedByDay.entries())
      .map(([dayKey, { scores, count }]) => {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
        return {
          dateKey: dayKey,
          date: parseISO(dayKey),
          nota: Math.round(avgScore * 100) / 100,
          numTests: count,
          label: format(parseISO(dayKey), "dd MMM", { locale: es })
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Agrupar por semana
  const groupByWeek = (data: ProgressDataPoint[]) => {
    const groupedByWeek = new Map<string, { scores: number[], count: number }>()
    
    data.forEach(point => {
      const date = parseISO(point.date)
      const weekStart = startOfWeek(date, { locale: es })
      const weekKey = format(weekStart, "yyyy-MM-dd")
      
      if (!groupedByWeek.has(weekKey)) {
        groupedByWeek.set(weekKey, { scores: [], count: 0 })
      }
      groupedByWeek.get(weekKey)!.scores.push(point.score)
      groupedByWeek.get(weekKey)!.count++
    })

    return Array.from(groupedByWeek.entries())
      .map(([weekKey, { scores, count }]) => {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
        return {
          dateKey: weekKey,
          date: parseISO(weekKey),
          nota: Math.round(avgScore * 100) / 100,
          numTests: count,
          label: `Semana ${format(parseISO(weekKey), "dd MMM", { locale: es })}`
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Seleccionar datos según modo de vista
  let chartData
  if (viewMode === "daily") {
    chartData = groupByDay(data)
  } else if (viewMode === "weekly") {
    chartData = groupByWeek(data)
  } else {
    // Todos - cada test por separado
    chartData = data.map(point => ({
      dateKey: point.date,
      date: parseISO(point.date),
      nota: Math.round(point.score * 100) / 100,
      numTests: 1,
      label: format(parseISO(point.date), "dd MMM HH:mm", { locale: es })
    })).sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Calcular estadísticas
  const allScores = chartData.map(d => d.nota)
  const currentAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length
  const bestScore = Math.max(...allScores)
  const latestScore = allScores[allScores.length - 1]
  const firstScore = allScores[0]
  const improvement = latestScore - firstScore

  const passScore = 5.8

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Progreso temporal
            </CardTitle>
            <CardDescription className="mt-2">
              {viewMode === "todos" && `Todos tus tests • ${chartData.length} resultados`}
              {viewMode === "daily" && `Promedio por día • ${chartData.length} ${chartData.length === 1 ? 'día' : 'días'}`}
              {viewMode === "weekly" && `Promedio por semana • ${chartData.length} ${chartData.length === 1 ? 'semana' : 'semanas'}`}
            </CardDescription>
          </div>
          
          {/* Selector de vista */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
              <Button
                variant={viewMode === "todos" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("todos")}
                className="h-8 text-xs px-3"
              >
                Todos
              </Button>
              <Button
                variant={viewMode === "daily" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("daily")}
                className="h-8 text-xs px-3"
              >
                Por Día
              </Button>
              <Button
                variant={viewMode === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("weekly")}
                className="h-8 text-xs px-3"
              >
                Por Semana
              </Button>
            </div>
          </div>
        </div>
        
        {/* Métricas con última nota y evolución */}
        <div className="flex items-center gap-3 mt-4">
          {chartData.length > 1 && (
            <>
              <div className="bg-muted/50 p-3 rounded-lg text-center flex-1">
                <div className="text-xs text-muted-foreground mb-1">Última Nota</div>
                <div className={`text-2xl font-bold ${latestScore >= passScore ? 'text-green-600' : 'text-amber-600'}`}>
                  {latestScore.toFixed(2)}
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center flex-1">
                <div className="text-xs text-muted-foreground mb-1">Evolución</div>
                <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Promedio</div>
            <div className="text-xl font-bold text-primary">{currentAvg.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Mejor Nota</div>
            <div className="text-xl font-bold text-green-600">{bestScore.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Objetivo</div>
            <div className="text-xl font-bold text-amber-600">{passScore}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.5}
              vertical={false}
            />
            
            <XAxis 
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              angle={chartData.length > 10 ? -45 : 0}
              textAnchor={chartData.length > 10 ? "end" : "middle"}
              height={chartData.length > 10 ? 60 : 30}
            />
            
            <YAxis 
              domain={[0, 10]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              ticks={[0, 2, 4, 5.8, 6, 8, 10]}
              tickFormatter={(value) => value === 5.8 ? '5.8' : value.toString()}
            />
            
            {/* Línea de aprobado */}
            <ReferenceLine 
              y={passScore} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: '← Mínimo para aprobar: 5.8', 
                position: 'insideTopLeft',
                fill: 'hsl(var(--destructive))',
                fontSize: 12,
                fontWeight: 600,
                offset: 10
              }}
            />
            
            {/* Línea de promedio */}
            {chartData.length > 1 && (
              <ReferenceLine 
                y={currentAvg} 
                stroke="hsl(var(--chart-2))" 
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ 
                  value: `Tu promedio: ${currentAvg.toFixed(2)}`, 
                  position: 'insideBottomLeft',
                  fill: 'hsl(var(--chart-2))',
                  fontSize: 12,
                  fontWeight: 600,
                  offset: 10
                }}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="nota"
              stroke="hsl(var(--primary))"
              strokeWidth={4}
              fill="url(#colorScore)"
              connectNulls
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 3, 
                stroke: 'hsl(var(--background))',
                r: 6
              }}
              activeDot={{ 
                r: 9, 
                strokeWidth: 3,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(var(--primary))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Métricas resumidas */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{currentAvg.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{bestScore.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Mejor Nota</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">{passScore}</div>
            <div className="text-xs text-muted-foreground">Objetivo</div>
          </div>
        </div>
        
        {/* Indicador de progreso hacia el aprobado */}
        {currentAvg < passScore && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-amber-700 dark:text-amber-400">
                Te faltan {(passScore - currentAvg).toFixed(2)} puntos para aprobar
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round((currentAvg / passScore) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentAvg / passScore) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {currentAvg >= passScore && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              ¡Tu promedio supera la nota de aprobado!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-background border-2 border-primary/50 rounded-xl p-4 shadow-2xl">
      <div className="font-semibold text-base mb-3 text-foreground">
        {format(data.date, "dd MMMM yyyy", { locale: es })}
        {data.numTests === 1 && data.date.getHours && (
          <span className="text-muted-foreground font-normal text-sm ml-2">
            a las {format(data.date, "HH:mm", { locale: es })}
          </span>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-8">
          <span className="text-sm text-muted-foreground font-medium">
            {data.numTests > 1 ? '📊 Nota promedio:' : '📝 Nota obtenida:'}
          </span>
          <span className="text-2xl font-bold text-primary">{data.nota.toFixed(2)}</span>
        </div>
        {data.numTests > 1 && (
          <div className="flex items-center justify-between gap-8 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Tests realizados:</span>
            <span className="text-base font-bold text-foreground">{data.numTests}</span>
          </div>
        )}
        <div className="text-xs text-center pt-2 text-muted-foreground">
          {data.nota >= 5.8 ? (
            <span className="text-green-600 font-semibold">✓ Aprobado</span>
          ) : (
            <span className="text-amber-600 font-semibold">Necesitas {(5.8 - data.nota).toFixed(2)} puntos más</span>
          )}
        </div>
      </div>
    </div>
  )
}
