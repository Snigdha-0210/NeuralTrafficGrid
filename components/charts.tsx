'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const grid = 'rgba(255,255,255,0.05)'
const axisTick = { fill: '#94A3B8', fontSize: 10 }

const tooltipStyle = {
  background: '#0E1621',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  fontSize: 12,
  color: '#F8FAFC',
}

// ───── Congestion trend (dashboard) ─────
export function CongestionChart({ data }: { data: { hour: string; congestion: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="congFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4D6D" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#FF4D6D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} />
        <XAxis dataKey="hour" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 1]} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="congestion"
          stroke="#FF4D6D"
          strokeWidth={2}
          fill="url(#congFill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ───── Density + wait (dashboard) ─────
export function DensityWaitChart({
  data,
}: {
  data: { hour: string; vehicles: number; wait: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={grid} />
        <XAxis dataKey="hour" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" tick={{ fill: '#4CC9F0', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#FFC93C', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Line yAxisId="left" type="monotone" dataKey="vehicles" stroke="#4CC9F0" strokeWidth={2} dot={false} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="wait"
          stroke="#FFC93C"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ───── Neural: predicted vs actual ─────
export function PredictionChart({
  data,
}: {
  data: { interval: number; predicted: number; actual: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={grid} />
        <XAxis dataKey="interval" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis domain={[0.5, 1]} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="predicted" stroke="#00E5FF" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} />
        <Line type="monotone" dataKey="actual" stroke="#00FF88" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ───── PSO convergence ─────
export function ConvergenceChart({ data }: { data: { iter: number; fitness: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="convFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#00F5D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} />
        <XAxis dataKey="iter" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 1]} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="fitness" stroke="#00F5D4" strokeWidth={2} fill="url(#convFill)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ───── Reports: monthly performance ─────
export function PerformanceChart({
  data,
}: {
  data: { month: string; efficiency: number; wait: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" domain={[60, 100]} tick={{ fill: '#00E5FF', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} tick={{ fill: '#FFC93C', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar yAxisId="left" dataKey="efficiency" fill="rgba(0,229,255,0.6)" radius={[3, 3, 0, 0]} />
        <Bar yAxisId="right" dataKey="wait" fill="rgba(255,201,60,0.6)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
