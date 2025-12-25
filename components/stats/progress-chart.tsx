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
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Progreso Temporal
            </CardTitle>
            <CardDescription className="mt-2">Evolución de tus resultados a lo largo del tiempo</CardDescription>
          </div>
          {data.length > 1 && (
            <div className="text-right bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tendencia</div>
              <div className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trendPercentage).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
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
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
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
          <span className="text-muted-foreground font-medium">Modo:</span>
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
