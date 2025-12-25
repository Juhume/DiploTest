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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Rendimiento por Tema
            </CardTitle>
            <CardDescription>Tus mejores y peores áreas de conocimiento</CardDescription>
          </div>
          {weakestTopic && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Área a mejorar
              </div>
              <div className="text-sm font-semibold text-destructive">
                {weakestTopic.topic}
              </div>
              <div className="text-xs text-muted-foreground">
                {weakestTopic.correctRate.toFixed(1)}% aciertos
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="tema" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: '% Aciertos', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
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
            <Bar 
              dataKey="tasa" 
              name="% Aciertos"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.tasa)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda de colores */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
            <span className="text-muted-foreground">Excelente (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
            <span className="text-muted-foreground">Bueno (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span className="text-muted-foreground">Mejorable (&lt;60%)</span>
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
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-sm mb-2">{data.temaCompleto}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Tasa de aciertos:</span>
          <span className="font-bold text-primary">{data.tasa}%</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Intentos:</span>
          <span className="font-medium">{data.intentos}</span>
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
      </div>
    </div>
  )
}
