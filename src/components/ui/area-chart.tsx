import React from 'react'

interface DataPoint {
  date: string
  visitors: number
}

interface AreaChartProps {
  data: DataPoint[]
  margin?: {
    top: number
    right: number
    left: number
    bottom: number
  }
}

interface ResponsiveContainerProps {
  width: string
  height: string
  children: React.ReactNode
}

interface TooltipProps {
  content?: ({ active, payload, label }: {
    active?: boolean
    payload?: any[]
    label?: string
  }) => React.ReactNode | null
}

export function ResponsiveContainer({ width, height, children }: ResponsiveContainerProps) {
  return (
    <div style={{ width, height }} className="relative">
      {children}
    </div>
  )
}

export function AreaChart({ data, margin = { top: 10, right: 30, left: 0, bottom: 0 } }: AreaChartProps) {
  const width = 800
  const height = 300
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
  }
  
  const maxValue = Math.max(...data.map(d => d.visitors))
  const minValue = Math.min(...data.map(d => d.visitors))
  const range = maxValue - minValue || 1
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((point.visitors - minValue) / range) * chartHeight
    return { x: x + margin.left, y: y + margin.top, ...point }
  })
  
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')
  
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - margin.bottom} L ${points[0].x} ${height - margin.bottom} Z`
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      <g className="stroke-muted opacity-20">
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`grid-${i}`}
            x1={margin.left}
            y1={margin.top + (i * chartHeight / 4)}
            x2={width - margin.right}
            y2={margin.top + (i * chartHeight / 4)}
            strokeDasharray="3 3"
          />
        ))}
      </g>
      
      {/* Area */}
      <path
        d={areaData}
        fill="url(#colorVisitors)"
        fillOpacity={0.6}
      />
      
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={3}
          fill="hsl(var(--primary))"
          className="opacity-0 hover:opacity-100 transition-opacity"
        />
      ))}
      
      {/* X-axis labels */}
      <g className="text-xs fill-muted-foreground">
        {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0).map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 5}
            textAnchor="middle"
            className="text-xs"
          >
            {point.date}
          </text>
        ))}
      </g>
    </svg>
  )
}

export function CartesianGrid() {
  return null // Grid is handled in AreaChart
}

export function XAxis() {
  return null // Axis is handled in AreaChart
}

export function YAxis() {
  return null // Axis is handled in AreaChart
}

export function Tooltip({ content }: TooltipProps) {
  return null // Tooltip functionality would need more complex implementation
}

export function Area() {
  return null // Area is handled in AreaChart
}