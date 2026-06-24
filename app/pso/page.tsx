'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader, Card, StatCard, ProgressBar } from '@/components/ntg-ui'
import { ConvergenceChart } from '@/components/charts'
import { useToast } from '@/components/toast'
import { psoStats, psoTimingComparison } from '@/lib/mock-data'
import { Play, RotateCw } from 'lucide-react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  pbx: number
  pby: number
  pbFit: number
}

const W = 360
const H = 260

export default function PSOPage() {
  const toast = useToast()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const gBestRef = useRef({ x: 180, y: 130, fitness: 0 })
  const iterRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const runningRef = useRef(false)

  const [iteration, setIteration] = useState(0)
  const [fitness, setFitness] = useState(0)
  const [gain, setGain] = useState(0)
  const [conv, setConv] = useState<{ iter: number; fitness: number }[]>([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const gBest = gBestRef.current
    ctx.clearRect(0, 0, W, H)
    for (let x = 0; x < W; x += 20)
      for (let y = 0; y < H; y += 20) {
        const d = Math.sqrt((x - gBest.x) ** 2 + (y - gBest.y) ** 2)
        const alpha = Math.max(0, 0.12 - d / 600)
        ctx.fillStyle = `rgba(0,229,255,${alpha})`
        ctx.fillRect(x, y, 20, 20)
      }
    particlesRef.current.forEach((p) => {
      if (p.pbFit > 0) {
        ctx.beginPath()
        ctx.arc(p.pbx, p.pby, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,201,60,0.5)'
        ctx.fill()
      }
    })
    particlesRef.current.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#00E5FF'
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.vx * 5, p.y + p.vy * 5)
      ctx.strokeStyle = 'rgba(0,229,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    })
    ctx.beginPath()
    ctx.arc(gBest.x, gBest.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#00FF88'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(gBest.x, gBest.y, 14, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,255,136,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#00FF88'
    ctx.font = '10px sans-serif'
    ctx.fillText('Global Best', gBest.x + 10, gBest.y - 8)
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    runningRef.current = false
    iterRef.current = 0
    particlesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * 320 + 20,
      y: Math.random() * 220 + 20,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      pbx: 0,
      pby: 0,
      pbFit: 0,
    }))
    gBestRef.current = { x: 180, y: 130, fitness: 0 }
    setIteration(0)
    setFitness(0)
    setGain(0)
    setConv([])
    draw()
  }, [draw])

  useEffect(() => {
    reset()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [reset])

  const step = useCallback(() => {
    const w = 0.729,
      c1 = 1.494,
      c2 = 1.494
    const it = iterRef.current
    const target = { x: 160 + Math.sin(it * 0.1) * 30, y: 120 + Math.cos(it * 0.08) * 25 }
    const gBest = gBestRef.current
    particlesRef.current.forEach((p) => {
      const fit = 1 / (1 + Math.sqrt((p.x - target.x) ** 2 + (p.y - target.y) ** 2) / 50)
      if (fit > p.pbFit) {
        p.pbFit = fit
        p.pbx = p.x
        p.pby = p.y
      }
      if (fit > gBest.fitness) {
        gBest.fitness = fit
        gBest.x = p.x
        gBest.y = p.y
      }
      p.vx = w * p.vx + c1 * Math.random() * (p.pbx - p.x) + c2 * Math.random() * (gBest.x - p.x)
      p.vy = w * p.vy + c1 * Math.random() * (p.pby - p.y) + c2 * Math.random() * (gBest.y - p.y)
      const vmax = 10
      const vm = Math.sqrt(p.vx ** 2 + p.vy ** 2)
      if (vm > vmax) {
        p.vx *= vmax / vm
        p.vy *= vmax / vm
      }
      p.x = Math.max(5, Math.min(355, p.x + p.vx))
      p.y = Math.max(5, Math.min(255, p.y + p.vy))
    })
    iterRef.current = it + 1
    setIteration(it + 1)
    setFitness(gBest.fitness)
    setGain(Math.round(gBest.fitness * 30))
    setConv((prev) => [...prev, { iter: it + 1, fitness: +gBest.fitness.toFixed(3) }])
    draw()
    if (it + 1 >= 100) {
      if (timerRef.current) clearInterval(timerRef.current)
      runningRef.current = false
      toast('PSO converged ✓')
    }
  }, [draw, toast])

  const start = () => {
    if (runningRef.current) return
    runningRef.current = true
    timerRef.current = setInterval(step, 80)
  }

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="PSO Optimization Center"
        title="Particle Swarm Optimization"
        sub="Swarm intelligence for optimal signal timing allocation"
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Fitness Score" value={fitness ? fitness.toFixed(3) : psoStats.fitness} accent="var(--ncyan)" color="var(--ncyan)" trend="Converging" trendDir="up" />
        <StatCard label="Optimization Gain" value={`${gain || 23.4}%`} accent="var(--green)" color="var(--green)" trend="vs fixed timing" trendDir="up" />
        <StatCard label="Iterations" value={iteration} accent="var(--cyan)" color="var(--cyan)" trend={`of ${psoStats.iterationsTotal} total`} trendDir="neutral" />
        <StatCard label="Particles" value={psoStats.particles} accent="var(--amber)" color="var(--amber)" trend="Swarm size" trendDir="neutral" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Particle Swarm — Search Space">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full rounded-lg"
            style={{ background: 'var(--bg1)', border: '1px solid var(--bdr)' }}
            aria-label="Particle swarm optimization visualization"
            role="img"
          />
          <div className="pso-legend">
            <span>
              <span className="pso-dot" style={{ background: 'var(--cyan)' }} />
              Particles
            </span>
            <span>
              <span className="pso-dot" style={{ background: 'var(--green)' }} />
              Global Best
            </span>
            <span>
              <span className="pso-dot" style={{ background: 'var(--amber)' }} />
              Personal Best
            </span>
          </div>
          <div className="mt-2.5 flex gap-2.5">
            <button className="btn btn-primary inline-flex items-center gap-1.5" onClick={start}>
              <Play size={14} /> Run PSO
            </button>
            <button className="btn btn-secondary inline-flex items-center gap-1.5" onClick={reset}>
              <RotateCw size={14} /> Reset
            </button>
          </div>
        </Card>

        <Card title="Convergence Graph">
          <div className="relative h-[200px]">
            <ConvergenceChart data={conv} />
          </div>
        </Card>
      </div>

      <Card title="Signal Timing Optimization — Current vs Optimized">
        <div className="mt-3">
          {psoTimingComparison.map((row) => (
            <div key={row.dir} className="opt-row">
              <div className="opt-dir">{row.dir}</div>
              <div className="opt-bars">
                <div>
                  <div className="opt-bar-label">Current: {row.current}s</div>
                  <ProgressBar pct={row.current * 2} background="var(--t2)" height={10} />
                </div>
                <div>
                  <div className="opt-bar-label" style={{ color: 'var(--cyan)' }}>
                    Optimized: {row.optimized}s
                  </div>
                  <ProgressBar pct={row.optimized * 2} background="var(--cyan)" height={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
