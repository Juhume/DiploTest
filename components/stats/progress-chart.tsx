"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { ProgressDataPoint } from "@/lib/types"
import { TrendingUp } from "lucide-react"

interface ProgressChartProps {
  data: ProgressDataPoint[]
  showScore?: boolean
  showPercentage?: boolean
}

export function ProgressChart({ data, showScore = true, showPercentage = true }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progreso Temporal
          </CardTitle>
          <CardDescription>Evolución de tus resultados a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No hay datos suficientes para mostrar el gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar datos para el gráfico
  const chartData = data.map(point => ({
    fecha: format(parseISO(point.date), "dd/MM", { locale: es }),
    fechaCompleta: format(parseISO(point.date), "dd MMM yyyy, HH:mm", { locale: es }),
    nota: point.score,
    porcentaje: point.percentage,
    correctas: point.correct,
    incorrectas: point.wrong,
    blancas: point.blank,
    modo: point.questionMode === "real" ? "Real" : "Demo"
  }))

  // Calcular tendencia
  const firstScore = data[0].score
  const lastScore = data[data.length - 1].score
  const trend = lastScore - firstScore
  const trendPercentage = firstScore > 0 ? (trend / firstScore) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progreso Temporal
            </CardTitle>
            <CardDescription>Evolución de tus resultados a lo largo del tiempo</CardDescription>
          </div>
          {data.length > 1 && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Tendencia</div>
              <div className={`text-lg font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trendPercentage).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="fecha" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 10]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Nota (0-10)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: '%', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--muted-foreground))' } }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                padding: '0.75rem'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {showScore && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="nota" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                name="Nota"
              />
            )}
            {showPercentage && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="porcentaje" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                activeDot={{ r: 6 }}
                name="% Aciertos"
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
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-sm mb-2">{data.fechaCompleta}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Modo:</span>
          <span className="font-medium">{data.modo}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Nota:</span>
          <span className="font-medium text-primary">{data.nota.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Aciertos:</span>
          <span className="font-medium">{data.porcentaje.toFixed(1)}%</span>
        </div>
        <div className="border-t border-border my-1"></div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-green-600">Correctas:</span>
          <span className="font-medium">{data.correctas}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-red-600">Incorrectas:</span>
          <span className="font-medium">{data.incorrectas}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-amber-600">Sin responder:</span>
          <span className="font-medium">{data.blancas}</span>
        </div>
      </div>
    </div>
  )
}
