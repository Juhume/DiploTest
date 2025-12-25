"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { TopicStats } from "@/lib/types"
import { Target, TrendingDown } from "lucide-react"

interface TopicPerformanceProps {
  data: TopicStats[]
  limit?: number
}

export function TopicPerformance({ data, limit = 10 }: TopicPerformanceProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Rendimiento por Tema
          </CardTitle>
          <CardDescription>Tus mejores y peores áreas de conocimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Completa tests por tema para ver tu rendimiento
          </div>
        </CardContent>
      </Card>
    )
  }

  // Limitar número de temas mostrados
  const limitedData = data.slice(0, limit)

  // Preparar datos para el gráfico
  const chartData = limitedData.map(topic => ({
    tema: topic.topic.length > 25 ? topic.topic.substring(0, 22) + '...' : topic.topic,
    temaCompleto: topic.topic,
    tasa: Math.round(topic.correctRate * 10) / 10,
    intentos: topic.attempts,
    correctas: topic.correctAnswers,
    incorrectas: topic.wrongAnswers
  }))

  // Función para determinar color según rendimiento
  const getColor = (value: number) => {
    if (value >= 80) return 'hsl(var(--chart-1))' // Verde
    if (value >= 60) return 'hsl(var(--chart-3))' // Amarillo
    return 'hsl(var(--destructive))' // Rojo
  }

  // Identificar tema más débil
  const weakestTopic = limitedData[0]

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Rendimiento por Tema
            </CardTitle>
            <CardDescription className="mt-2">Tus mejores y peores áreas de conocimiento</CardDescription>
          </div>
          {weakestTopic && (
            <div className="text-right bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-1 uppercase tracking-wide">
                <TrendingDown className="h-3.5 w-3.5" />
                Área a mejorar
              </div>
              <div className="text-sm font-bold text-destructive">
                {weakestTopic.topic}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {weakestTopic.correctRate.toFixed(1)}% aciertos
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
            layout="horizontal"
          >
            <defs>
              <linearGradient id="colorExcelente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="colorBueno" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="colorMejorable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="tema" 
              angle={-45}
              textAnchor="end"
              height={110}
              interval={0}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              label={{ value: '% Aciertos', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
            />
            <Bar 
              dataKey="tasa" 
              name="% Aciertos"
              radius={[10, 10, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.tasa >= 80 ? 'url(#colorExcelente)' : entry.tasa >= 60 ? 'url(#colorBueno)' : 'url(#colorMejorable)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda de colores */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to bottom, hsl(var(--chart-1)), hsl(var(--chart-1) / 0.7))' }}></div>
            <span className="text-muted-foreground font-medium">Excelente (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to bottom, hsl(var(--chart-3)), hsl(var(--chart-3) / 0.7))' }}></div>
            <span className="text-muted-foreground font-medium">Bueno (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to bottom, hsl(var(--destructive)), hsl(var(--destructive) / 0.7))' }}></div>
            <span className="text-muted-foreground font-medium">Mejorable (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-card border-2 border-border rounded-xl p-4 shadow-2xl backdrop-blur-sm min-w-[200px]">
      <p className="font-semibold text-base mb-3 border-b border-border pb-2 text-foreground">{data.temaCompleto}</p>
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground font-medium">Tasa de aciertos:</span>
          <span className="font-bold text-primary text-lg">{data.tasa}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground font-medium">Intentos:</span>
          <span className="font-bold text-foreground">{data.intentos}</span>
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
      </div>
    </div>
  )
}
